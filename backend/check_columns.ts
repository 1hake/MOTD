import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'User'
    ORDER BY ordinal_position;
  `
  console.log(result)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
