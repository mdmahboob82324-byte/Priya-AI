const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SQLite database (dev.db)...');

  // 1. Create Default Operator User if not exists
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('stark12345', salt);

  const user = await prisma.user.upsert({
    where: { email: 'stark@starkindustries.com' },
    update: {},
    create: {
      name: 'Tony Stark',
      email: 'stark@starkindustries.com',
      password: hashedPassword,
      role: 'commander'
    }
  });

  console.log('✅ Operator created:', user.email);

  // 2. Create Initial Chat Session
  const session = await prisma.chatSession.create({
    data: {
      userId: user.id,
      title: 'Initial Quantum System Diagnostics'
    }
  });

  // 3. Add Messages
  await prisma.message.createMany({
    data: [
      {
        sessionId: session.id,
        sender: 'user',
        text: 'Jarvis, verify quantum core status and database connectivity.'
      },
      {
        sessionId: session.id,
        sender: 'jarvis',
        text: 'All quantum sub-routines active. SQLite dev.db is online and synchronized via Prisma ORM.'
      }
    ]
  });

  // 4. Add Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'SYSTEM_BOOT',
        details: 'Jarvis Core server initialized with Prisma SQLite database.',
        ipAddress: '127.0.0.1'
      },
      {
        action: 'DATABASE_SEED',
        details: 'SQLite dev.db seeded with initial tables and Commander profile.',
        ipAddress: '127.0.0.1'
      }
    ]
  });

  console.log('✅ SQLite dev.db successfully seeded with real-time tables & logs.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
