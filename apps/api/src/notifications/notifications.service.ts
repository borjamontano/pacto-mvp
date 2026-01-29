import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

const EXPO_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async notifyAssigned(pactId: string, userId: string, title: string) {
    await this.sendToUsers([userId], {
      title: 'Nuevo pacto asignado',
      body: `Se te asignó: ${title}`,
      data: { pactId },
    });
  }

  async notifyNeedsConfirmation(pactId: string, householdId: string, title: string, excludeUserId: string) {
    const members = await this.prisma.householdMember.findMany({
      where: { householdId, userId: { not: excludeUserId } },
      select: { userId: true },
    });
    const userIds = members.map((m) => m.userId);
    if (userIds.length === 0) return;

    await this.sendToUsers(userIds, {
      title: 'Confirmación requerida',
      body: `Confirma: ${title}`,
      data: { pactId },
    });
  }

  async notifyOverdue(pactId: string, userId: string, title: string) {
    await this.sendToUsers([userId], {
      title: 'Pacto vencido',
      body: `Está vencido: ${title}`,
      data: { pactId },
    });
  }

  @Cron('*/5 * * * *')
  async scanOverduePacts() {
    const overduePacts = await this.prisma.pact.findMany({
      where: {
        dueAt: { lt: new Date() },
        status: { not: 'DONE' },
        overdueNotifiedAt: null,
      },
      include: { assignedTo: true },
    });

    for (const pact of overduePacts) {
      if (pact.assignedToUserId) {
        await this.notifyOverdue(pact.id, pact.assignedToUserId, pact.title);
      }

      await this.prisma.pact.update({
        where: { id: pact.id },
        data: { overdueNotifiedAt: new Date() },
      });
    }
  }

  private async sendToUsers(userIds: string[], message: { title: string; body: string; data?: Record<string, unknown> }) {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId: { in: userIds } },
    });

    if (tokens.length === 0) {
      return;
    }

    const payload = tokens.map((token) => ({
      to: token.expoPushToken,
      title: message.title,
      body: message.body,
      data: message.data ?? {},
    }));

    try {
      await fetch(EXPO_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.warn('Failed to send push notification');
    }
  }
}
