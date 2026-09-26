const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addGanesh() {
  try {
    const defaultDept = await prisma.department.findFirst();
    const passwordHash = await bcrypt.hash('Ganesh@2026', 10);

    // Upsert Ganesh as Super Admin
    const user = await prisma.user.upsert({
      where: { email: 'ganesh@ncrb-demo.gov' },
      update: {
        fullName: 'Director Ganesh Yelchuri',
        badgeNumber: 'GANESH',
        role: 'SUPER_ADMIN',
        passwordHash: passwordHash,
        isActive: true,
        isLocked: false,
        failedLoginAttempts: 0,
      },
      create: {
        email: 'ganesh@ncrb-demo.gov',
        fullName: 'Director Ganesh Yelchuri',
        badgeNumber: 'GANESH',
        role: 'SUPER_ADMIN',
        passwordHash: passwordHash,
        departmentId: defaultDept ? defaultDept.id : null,
      },
    });

    console.log('Successfully created/updated user Ganesh:');
    console.log({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      badgeNumber: user.badgeNumber,
      role: user.role,
    });
  } catch (error) {
    console.error('Error adding user Ganesh:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addGanesh();
