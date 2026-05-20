import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@primetrade.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`admin user ${adminEmail} already exists, skipping`);
    return;
  }

  await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  console.log(`seeded admin: ${adminEmail} / ${adminPassword}`);
  console.log('remember to change this password before deploying anywhere real.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
