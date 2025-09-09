import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

router.post('/', async (req, res) => {
  const { userId, friendEmail, friendId } = req.body;
  if (!userId || (!friendEmail && !friendId)) return res.status(400).json({ error: 'Missing fields' });

  try {
    let friend;

    if (friendId) {
      // Follow by user ID
      friend = await prisma.user.findUnique({ where: { id: parseInt(friendId, 10) } });
    } else {
      // Follow by email
      friend = await prisma.user.findUnique({ where: { email: friendEmail } });
    }

    if (!friend) return res.status(404).json({ error: 'Friend not found' });

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        userId: parseInt(userId, 10),
        friendId: friend.id
      }
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    await prisma.friendship.create({ data: { userId: parseInt(userId, 10), friendId: friend.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Server error' });
  }
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

  // Get today's date in UTC to properly compare with database timestamps
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

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

// Check if user1 follows user2
router.get('/status', async (req, res) => {
  const { userId, friendId } = req.query;
  if (!userId || !friendId) return res.status(400).json({ error: 'Missing userId or friendId' });

  const userIdNumber = parseInt(userId as string, 10);
  const friendIdNumber = parseInt(friendId as string, 10);

  if (isNaN(userIdNumber) || isNaN(friendIdNumber)) {
    return res.status(400).json({ error: 'Invalid userId or friendId format' });
  }

  try {
    const friendship = await prisma.friendship.findFirst({
      where: {
        userId: userIdNumber,
        friendId: friendIdNumber
      }
    });

    res.json({ isFriend: !!friendship });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unfollow a user
router.delete('/', async (req, res) => {
  const { userId, friendId } = req.body;
  if (!userId || !friendId) return res.status(400).json({ error: 'Missing userId or friendId' });

  try {
    await prisma.friendship.deleteMany({
      where: {
        userId: parseInt(userId, 10),
        friendId: parseInt(friendId, 10)
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
