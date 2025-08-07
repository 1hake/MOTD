
import { Router } from 'express';
import prisma from '../prismaClient.js';

const router = Router();

router.post('/register-device', async (req, res) => {
  const { userId, fcmToken, platform } = req.body;
  if (!userId || !fcmToken) return res.status(400).json({ error: 'Missing fields' });

  await prisma.deviceToken.upsert({
    where: { token: fcmToken },
    update: { userId, platform },
    create: { userId, token: fcmToken, platform: platform || 'unknown' }
  });

  res.json({ success: true });
});

export default router;
