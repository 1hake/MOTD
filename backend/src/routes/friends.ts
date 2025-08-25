import { Router } from 'express';
import prisma from '../prismaClient';

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

  const userIdNumber = parseInt(userId as string, 10);
  if (isNaN(userIdNumber)) return res.status(400).json({ error: 'Invalid userId format' });

  const friends = await prisma.friendship.findMany({
    where: { userId: userIdNumber },
    include: { friend: true }
  });

  res.json(friends.map(f => f.friend));
});

// Get all posts from friends for today
router.get('/posts', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const userIdNumber = parseInt(userId as string, 10);
  if (isNaN(userIdNumber)) return res.status(400).json({ error: 'Invalid userId format' });

  const friends = await prisma.friendship.findMany({
    where: { userId: userIdNumber },
    select: { friendId: true }
  });
  const friendIds = friends.map(f => f.friendId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const posts = await prisma.songPost.findMany({
    where: {
      userId: { in: friendIds },
      date: { gte: today }
    },
    include: {
      user: true,
      likes: {
        select: {
          userId: true
        }
      }
    },
    orderBy: { date: 'desc' }
  });

  // Add like count and user's like status to each post
  const postsWithLikes = posts.map(post => ({
    ...post,
    likeCount: post.likes.length,
    isLikedByUser: post.likes.some(like => like.userId === userIdNumber),
    likes: undefined // Remove the likes array from response for cleaner data
  }));

  res.json(postsWithLikes);
});

export default router;
