import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PactStatus } from '@prisma/client';
import { PactsService } from './pacts.service';

const createService = () => {
  const prisma = {
    pact: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    householdMember: {
      findUnique: jest.fn(),
    },
  } as any;

  const activityService = {
    logActivity: jest.fn(),
  } as any;

  const notificationsService = {
    notifyNeedsConfirmation: jest.fn(),
    notifyAssigned: jest.fn(),
  } as any;

  return { service: new PactsService(prisma, activityService, notificationsService), prisma };
};

describe('PactsService confirmation rules', () => {
  it('throws if pact does not require confirmation', async () => {
    const { service, prisma } = createService();
    prisma.householdMember.findUnique.mockResolvedValue({ id: 'member' });
    prisma.pact.findFirst.mockResolvedValue({
      id: 'p1',
      householdId: 'h1',
      requiresConfirmation: false,
      status: PactStatus.DONE,
      assignedToUserId: 'u2',
    });

    await expect(service.confirm('u1', 'h1', 'p1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws if pact is not done', async () => {
    const { service, prisma } = createService();
    prisma.householdMember.findUnique.mockResolvedValue({ id: 'member' });
    prisma.pact.findFirst.mockResolvedValue({
      id: 'p1',
      householdId: 'h1',
      requiresConfirmation: true,
      status: PactStatus.PENDING,
      assignedToUserId: 'u2',
    });

    await expect(service.confirm('u1', 'h1', 'p1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws if confirmer is assignee', async () => {
    const { service, prisma } = createService();
    prisma.householdMember.findUnique.mockResolvedValue({ id: 'member' });
    prisma.pact.findFirst.mockResolvedValue({
      id: 'p1',
      householdId: 'h1',
      requiresConfirmation: true,
      status: PactStatus.DONE,
      assignedToUserId: 'u1',
    });

    await expect(service.confirm('u1', 'h1', 'p1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('confirms when rules are satisfied', async () => {
    const { service, prisma } = createService();
    prisma.householdMember.findUnique.mockResolvedValue({ id: 'member' });
    prisma.pact.findFirst.mockResolvedValue({
      id: 'p1',
      householdId: 'h1',
      requiresConfirmation: true,
      status: PactStatus.DONE,
      assignedToUserId: 'u2',
      confirmedAt: null,
    });
    prisma.pact.update.mockResolvedValue({
      id: 'p1',
      confirmedAt: new Date(),
    });

    const result = await service.confirm('u1', 'h1', 'p1');
    expect(result).toEqual(expect.objectContaining({ id: 'p1' }));
  });
});
