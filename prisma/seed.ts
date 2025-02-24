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
      company: 'Chipotle',
      time: '12:30',
      items: 'Burrito Bowl, Chips & Guac',
      subtotal: 38.99,
      tax: 2.50,
      tip: 1.50,
      total: 42.99
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
      company: 'Uber',
      time: '08:45',
      items: 'UberX Ride',
      subtotal: 120.00,
      tax: 5.50,
      tip: 0.00,
      total: 125.50
    },
  });

  // Create a test report
  const report = await prisma.report.create({
    data: {
      userId: user.id,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-29'),
      format: 'pdf',
      status: 'completed',
    },
  });

  // Update the report with its URL using its actual ID
  await prisma.report.update({
    where: { id: report.id },
    data: {
      url: `/api/reports/${user.id}/${report.id}/report.pdf`,
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