import { Router } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Get user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(id, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('[GET /users/:id] error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
