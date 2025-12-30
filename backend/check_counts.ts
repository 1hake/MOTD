import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.count()
  const posts = await prisma.songPost.count()
  const friends = await prisma.friendship.count()
  const devices = await prisma.deviceToken.count()
  const saves = await prisma.save.count()

  console.log({ users, posts, friends, devices, saves })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
