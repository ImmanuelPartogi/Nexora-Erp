import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const seedEmail = process.env.SEED_ADMIN_EMAIL || 'admin@nexora.id';
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminSecret123!';

  console.log(`Checking superadmin user: ${seedEmail}...`);

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: seedEmail },
  });

  if (existingAdmin) {
    console.log(`Superadmin user ${seedEmail} already exists. Skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(seedPassword, 12);

  const superadmin = await prisma.adminUser.create({
    data: {
      email: seedEmail,
      name: 'Initial Superadmin',
      passwordHash,
      role: AdminRole.SUPERADMIN,
      isActive: true,
    },
  });

  console.log(`Superadmin user created successfully: ID ${superadmin.id}`);
}

main()
  .catch((e) => {
    console.error('Error during admin seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
