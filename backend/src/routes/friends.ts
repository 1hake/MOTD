
import { Router } from 'express';
import prisma from '../prismaClient.js';

const router = Router();

router.post('/', async (req, res) => {
  const { userId, friendEmail } = req.body;
  if (!userId || !friendEmail) return res.status(400).json({ error: 'Missing fields' });

  const friend = await prisma.user.findUnique({ where: { email: friendEmail } });
  if (!friend) return res.status(404).json({ error: 'Friend not found' });

  await prisma.friendship.create({ data: { userId, friendId: friend.id } });
  res.json({ success: true });
});

router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const friends = await prisma.friendship.findMany({
    where: { userId: Number(userId) },
    include: { friend: true }
  });

  res.json(friends.map(f => f.friend));
});

export default router;
