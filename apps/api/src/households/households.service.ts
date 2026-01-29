import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { addDays } from 'date-fns';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseholdDto } from './dto/create-household.dto';

@Injectable()
export class HouseholdsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateHouseholdDto) {
    return this.prisma.household.create({
      data: {
        name: dto.name,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: { members: true },
    });
  }

  async list(userId: string) {
    return this.prisma.household.findMany({
      where: { members: { some: { userId } } },
      include: { members: true },
    });
  }

  async getById(userId: string, householdId: string) {
    const household = await this.prisma.household.findUnique({
      where: { id: householdId },
      include: { members: true },
    });

    if (!household) {
      throw new NotFoundException('Household not found');
    }

    const member = household.members.find((m) => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('Not a member of household');
    }

    return household;
  }

  async createInvite(userId: string, householdId: string) {
    const household = await this.getById(userId, householdId);
    const code = randomBytes(6).toString('hex');
    const expiresAt = addDays(new Date(), 7);

    await this.prisma.householdInvite.create({
      data: {
        householdId: household.id,
        code,
        expiresAt,
      },
    });

    return { inviteCode: code };
  }

  async join(userId: string, inviteCode: string) {
    const invite = await this.prisma.householdInvite.findUnique({
      where: { code: inviteCode },
    });

    if (!invite || invite.expiresAt < new Date()) {
      throw new NotFoundException('Invite not found or expired');
    }

    const existing = await this.prisma.householdMember.findUnique({
      where: {
        householdId_userId: {
          householdId: invite.householdId,
          userId,
        },
      },
    });

    if (existing) {
      return { householdId: invite.householdId };
    }

    await this.prisma.householdMember.create({
      data: {
        householdId: invite.householdId,
        userId,
        role: 'MEMBER',
      },
    });

    return { householdId: invite.householdId };
  }
}
