import { Injectable } from '@nestjs/common';
import { PactActivityType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type ActivityPayload = Record<string, unknown>;

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async logActivity(params: {
    pactId: string;
    householdId: string;
    byUserId: string;
    type: PactActivityType;
    payload?: ActivityPayload;
  }) {
    return this.prisma.pactActivity.create({
      data: {
        pactId: params.pactId,
        householdId: params.householdId,
        byUserId: params.byUserId,
        type: params.type,
        payload: (params.payload ?? {}) as Prisma.InputJsonValue,

      },
    });
  }

  async getFeed(userId: string, householdId: string, limit = 50, cursor?: string) {
    const member = await this.prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId, userId } },
    });
    if (!member) {
      return { items: [], nextCursor: null };
    }

    const cursorParts = cursor ? cursor.split('|') : null;
    const cursorCreatedAt = cursorParts ? new Date(cursorParts[0]) : null;
    const cursorId = cursorParts ? cursorParts[1] : null;

    const activities = await this.prisma.pactActivity.findMany({
      where: {
        householdId,
        ...(cursorCreatedAt && cursorId
          ? {
              OR: [
                { createdAt: { lt: cursorCreatedAt } },
                {
                  createdAt: cursorCreatedAt,
                  id: { lt: cursorId },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      include: { pact: true, byUser: true },
    });

    const nextCursor =
      activities.length === limit
        ? `${activities[activities.length - 1].createdAt.toISOString()}|${activities[activities.length - 1].id}`
        : null;

    return { items: activities, nextCursor };
  }
}
