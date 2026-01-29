import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PactActivityType, PactStatus } from '@prisma/client';
import { endOfDay, startOfDay, addDays } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePactDto } from './dto/create-pact.dto';
import { UpdatePactDto } from './dto/update-pact.dto';

@Injectable()
export class PactsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, householdId: string, dto: CreatePactDto) {
    await this.ensureMember(userId, householdId);
    const pact = await this.prisma.pact.create({
      data: {
        householdId,
        title: dto.title,
        notes: dto.notes ?? null,
        createdByUserId: userId,
        assignedToUserId: dto.assignedToUserId ?? null,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        requiresConfirmation: dto.requiresConfirmation ?? false,
      },
    });

    await this.activityService.logActivity({
      pactId: pact.id,
      householdId,
      byUserId: userId,
      type: PactActivityType.CREATED,
      payload: { title: pact.title },
    });

    if (pact.assignedToUserId) {
      await this.activityService.logActivity({
        pactId: pact.id,
        householdId,
        byUserId: userId,
        type: PactActivityType.ASSIGNED,
        payload: { assignedToUserId: pact.assignedToUserId },
      });
      await this.notificationsService.notifyAssigned(pact.id, pact.assignedToUserId, pact.title);
    }

    return pact;
  }

  async list(userId: string, householdId: string, filter = 'all') {
    await this.ensureMember(userId, householdId);
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const tomorrowStart = startOfDay(addDays(now, 1));
    const tomorrowEnd = endOfDay(addDays(now, 1));

    let where: Record<string, unknown> = { householdId };
    switch (filter) {
      case 'today':
        where = { ...where, dueAt: { gte: todayStart, lte: todayEnd } };
        break;
      case 'tomorrow':
        where = { ...where, dueAt: { gte: tomorrowStart, lte: tomorrowEnd } };
        break;
      case 'overdue':
        where = { ...where, dueAt: { lt: now }, status: { not: PactStatus.DONE } };
        break;
      case 'unassigned':
        where = { ...where, assignedToUserId: null };
        break;
      default:
        break;
    }

    return this.prisma.pact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(userId: string, householdId: string, pactId: string) {
    await this.ensureMember(userId, householdId);
    const pact = await this.prisma.pact.findFirst({
      where: { id: pactId, householdId },
    });

    if (!pact) {
      throw new NotFoundException('Pact not found');
    }

    return pact;
  }

  async update(userId: string, householdId: string, pactId: string, dto: UpdatePactDto) {
    const pact = await this.getById(userId, householdId, pactId);
    const updates: Record<string, unknown> = {
      title: dto.title ?? pact.title,
      notes: dto.notes !== undefined ? dto.notes : pact.notes,
      assignedToUserId:
        dto.assignedToUserId !== undefined ? dto.assignedToUserId : pact.assignedToUserId,
      dueAt: dto.dueAt !== undefined ? (dto.dueAt ? new Date(dto.dueAt) : null) : pact.dueAt,
      requiresConfirmation:
        dto.requiresConfirmation !== undefined ? dto.requiresConfirmation : pact.requiresConfirmation,
    };

    if (dto.status && dto.status !== pact.status) {
      this.assertStatusTransition(pact.status, dto.status);
      updates.status = dto.status;
      if (dto.status === PactStatus.DONE) {
        updates.doneAt = new Date();
      }
    }

    const updated = await this.prisma.pact.update({
      where: { id: pactId },
      data: updates,
    });

    if (dto.status && dto.status !== pact.status) {
      const activityType = dto.status === PactStatus.DONE ? PactActivityType.DONE : PactActivityType.STATUS_CHANGED;
      await this.activityService.logActivity({
        pactId: pact.id,
        householdId,
        byUserId: userId,
        type: activityType,
        payload: { status: dto.status },
      });
    }

    if (dto.assignedToUserId !== undefined && dto.assignedToUserId !== pact.assignedToUserId) {
      await this.activityService.logActivity({
        pactId: pact.id,
        householdId,
        byUserId: userId,
        type: dto.assignedToUserId ? PactActivityType.ASSIGNED : PactActivityType.UNASSIGNED,
        payload: { assignedToUserId: dto.assignedToUserId },
      });
      if (dto.assignedToUserId) {
        await this.notificationsService.notifyAssigned(pact.id, dto.assignedToUserId, updated.title);
      }
    }

    await this.activityService.logActivity({
      pactId: pact.id,
      householdId,
      byUserId: userId,
      type: PactActivityType.UPDATED,
      payload: { fields: Object.keys(dto) },
    });

    return updated;
  }

  async remove(userId: string, householdId: string, pactId: string) {
    await this.getById(userId, householdId, pactId);
    return this.prisma.pact.delete({ where: { id: pactId } });
  }

  async assignToMe(userId: string, householdId: string, pactId: string) {
    const pact = await this.getById(userId, householdId, pactId);
    const updated = await this.prisma.pact.update({
      where: { id: pactId },
      data: { assignedToUserId: userId },
    });

    await this.activityService.logActivity({
      pactId: pact.id,
      householdId,
      byUserId: userId,
      type: PactActivityType.ASSIGNED,
      payload: { assignedToUserId: userId },
    });

    return updated;
  }

  async markDone(userId: string, householdId: string, pactId: string) {
    const pact = await this.getById(userId, householdId, pactId);
    if (pact.status === PactStatus.DONE) {
      throw new BadRequestException('Pact already done');
    }

    const updated = await this.prisma.pact.update({
      where: { id: pactId },
      data: { status: PactStatus.DONE, doneAt: new Date() },
    });

    await this.activityService.logActivity({
      pactId: pact.id,
      householdId,
      byUserId: userId,
      type: PactActivityType.DONE,
      payload: { doneAt: updated.doneAt },
    });

    if (updated.requiresConfirmation) {
      await this.notificationsService.notifyNeedsConfirmation(
        pact.id,
        householdId,
        pact.title,
        userId,
      );
    }

    return updated;
  }

  async confirm(userId: string, householdId: string, pactId: string) {
    const pact = await this.getById(userId, householdId, pactId);

    if (!pact.requiresConfirmation) {
      throw new BadRequestException('Pact does not require confirmation');
    }

    if (pact.status !== PactStatus.DONE) {
      throw new BadRequestException('Pact must be done before confirmation');
    }

    if (pact.assignedToUserId && pact.assignedToUserId === userId) {
      throw new ForbiddenException('Assignee cannot confirm their own pact');
    }

    if (pact.confirmedAt) {
      throw new BadRequestException('Pact already confirmed');
    }

    const updated = await this.prisma.pact.update({
      where: { id: pactId },
      data: { confirmedAt: new Date() },
    });

    await this.activityService.logActivity({
      pactId: pact.id,
      householdId,
      byUserId: userId,
      type: PactActivityType.CONFIRMED,
      payload: { confirmedAt: updated.confirmedAt },
    });

    return updated;
  }

  private async ensureMember(userId: string, householdId: string) {
    const member = await this.prisma.householdMember.findUnique({
      where: { householdId_userId: { householdId, userId } },
    });

    if (!member) {
      throw new ForbiddenException('Not a member of household');
    }
  }

  private assertStatusTransition(current: PactStatus, next: PactStatus) {
    const allowed = new Set([
      `${PactStatus.PENDING}->${PactStatus.DOING}`,
      `${PactStatus.DOING}->${PactStatus.DONE}`,
      `${PactStatus.PENDING}->${PactStatus.DONE}`,
    ]);

    if (!allowed.has(`${current}->${next}`)) {
      throw new BadRequestException('Invalid status transition');
    }
  }
}
