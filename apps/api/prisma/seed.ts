import { PrismaClient, PactStatus, HouseholdRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@pacto.app';
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Demo',
      passwordHash,
    },
  });

  let household = await prisma.household.findFirst({
    where: { name: 'Casa demo' },
  });

  if (!household) {
    household = await prisma.household.create({
      data: {
        name: 'Casa demo',
        members: {
          create: {
            userId: user.id,
            role: HouseholdRole.OWNER,
          },
        },
      },
    });
  }

  const now = new Date();
  const todayDue = new Date();
  todayDue.setHours(20, 0, 0, 0);

  const tomorrowDue = new Date();
  tomorrowDue.setDate(now.getDate() + 1);
  tomorrowDue.setHours(20, 0, 0, 0);

  const overdueDue = new Date();
  overdueDue.setDate(now.getDate() - 1);
  overdueDue.setHours(9, 0, 0, 0);

  const existing = await prisma.pact.findMany({
    where: { householdId: household.id },
  });

  if (existing.length === 0) {
    await prisma.pact.createMany({
      data: [
        {
          householdId: household.id,
          title: 'Sacar basura',
          createdByUserId: user.id,
          assignedToUserId: user.id,
          dueAt: todayDue,
          status: PactStatus.PENDING,
          requiresConfirmation: false,
        },
        {
          householdId: household.id,
          title: 'Comprar pañales',
          createdByUserId: user.id,
          assignedToUserId: user.id,
          dueAt: tomorrowDue,
          status: PactStatus.PENDING,
          requiresConfirmation: true,
        },
        {
          householdId: household.id,
          title: 'Pagar internet',
          createdByUserId: user.id,
          dueAt: overdueDue,
          status: PactStatus.PENDING,
          requiresConfirmation: false,
        },
      ],
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
