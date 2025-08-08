declare module './prismaClient' {
    import { PrismaClient } from '@prisma/client';
    const prisma: PrismaClient;
    export { prisma };
    export default prisma;
}
