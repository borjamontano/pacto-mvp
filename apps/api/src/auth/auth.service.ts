import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '@pacto/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
      },
    });

    const tokens = await this.issueTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
  }

  async refresh(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const userId = payload.sub;
    const existing = await this.prisma.refreshToken.findFirst({
      where: { userId, revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!existing) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const matches = await bcrypt.compare(refreshToken, existing.tokenHash);
    if (!matches || existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.issueTokens(userId, user.email);
    await this.storeRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(userId: string, email: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: accessSecret, expiresIn: ACCESS_TOKEN_TTL },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: refreshSecret, expiresIn: REFRESH_TOKEN_TTL },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresAt = addDays(new Date(), 30);
    const tokenHash = await bcrypt.hash(token, 10);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }
}
