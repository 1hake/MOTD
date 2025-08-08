import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();


router.post('/', async (req, res) => {
  const { title, artist, link, userId, coverUrl, deezerLink, spotifyLink, appleMusicLink } = req.body;
  if (!title || !artist || !userId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const uid = Number(userId);
  if (!Number.isFinite(uid)) return res.status(400).json({ error: 'Invalid userId' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: uid }
    });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const existing = await prisma.songPost.findFirst({
      where: { userId: uid, date: { gte: today } }
    });
    if (existing) return res.status(400).json({ error: 'Already posted today' });

    const post = await prisma.songPost.create({
      data: {
        title,
        artist,
        link: link || deezerLink || spotifyLink || appleMusicLink || '', // Fallback for backward compatibility
        deezerLink,
        spotifyLink,
        appleMusicLink,
        userId: uid,
        coverUrl
      }
    });
    res.json(post);
  } catch (e) {
    console.error('[POST /posts] error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/today', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const uid = Number(userId);
  if (!Number.isFinite(uid)) return res.status(400).json({ error: 'Invalid userId' });

  try {
    const friends = await prisma.friendship.findMany({
      where: { userId: uid },
      select: { friendId: true }
    });
    const friendIds = friends.map(f => f.friendId);

    if (friendIds.length === 0) return res.json([]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const posts = await prisma.songPost.findMany({
      where: { userId: { in: friendIds }, date: { gte: today } },
      include: { user: true },
      orderBy: { date: 'desc' }
    });

    res.json(posts);
  } catch (e) {
    console.error('[GET /posts/today] error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const uid = Number(userId);
  if (!Number.isFinite(uid)) return res.status(400).json({ error: 'Invalid userId' });

  try {
    const posts = await prisma.songPost.findMany({
      where: { userId: uid },
      orderBy: { date: 'desc' }
    });
    res.json(posts);
  } catch (e) {
    console.error('[GET /posts/me] error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
