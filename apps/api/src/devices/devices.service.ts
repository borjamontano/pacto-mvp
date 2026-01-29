import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/register-device.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async register(userId: string, dto: RegisterDeviceDto) {
    return this.prisma.deviceToken.upsert({
      where: { expoPushToken: dto.expoPushToken },
      update: {
        userId,
        platform: dto.platform,
      },
      create: {
        userId,
        expoPushToken: dto.expoPushToken,
        platform: dto.platform,
      },
    });
  }

  async unregister(userId: string) {
    await this.prisma.deviceToken.deleteMany({
      where: { userId },
    });
    return { success: true };
  }
}
