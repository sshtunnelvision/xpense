import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
    },
  });

  // Create some test receipts
  await prisma.receipt.create({
    data: {
      userId: user.id,
      imageUrl: '/uploads/test/receipt1.jpg',
      amount: 42.99,
      date: new Date('2024-02-20'),
      category: 'Food & Dining',
      notes: 'Lunch with team',
    },
  });

  await prisma.receipt.create({
    data: {
      userId: user.id,
      imageUrl: '/uploads/test/receipt2.jpg',
      amount: 125.50,
      date: new Date('2024-02-22'),
      category: 'Transportation',
      notes: 'Uber to airport',
    },
  });

  // Create a test report
  await prisma.report.create({
    data: {
      userId: user.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-29'),
      format: 'pdf',
      status: 'completed',
      url: '/reports/test/report1.pdf',
    },
  });

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 