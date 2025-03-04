import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('smkn2juara', 10);

    await prisma.user.create({
        data: {
            name: 'smkn2bandung',
            email: 'visit.smkn2bandung@gmail.com',
            password: hashedPassword,
            role: 'STAFF_TU',
            createdAt: new Date('2025-03-04T12:14:23.291Z'),
            updatedAt: new Date('2025-03-04T12:13:50.117Z'),
        },
    });

    await prisma.user.create({
        data: {
            name: 'admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'STAFF_TU',
            createdAt: new Date('2025-03-04T12:14:23.291Z'),
            updatedAt: new Date('2025-03-04T12:13:50.117Z'),
        },
    });

    console.log('✅ Database seeding completed!');
}

main()
    .catch((error) => {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
