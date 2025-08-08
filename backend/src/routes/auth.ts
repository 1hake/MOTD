import { Router } from 'express';
import prisma from '../prismaClient';
import passport from '../passportConfig';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Helper function to generate JWT token
const generateToken = (userId: number) => {
  const secret = process.env.SESSION_SECRET || 'your_secret_key';
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
};

router.post('/email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email } });
  }

  const token = generateToken(user.id);
  res.json({ token, user });
});

// Signup with email and password
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return res.status(400).json({ error: 'User already exists' });

  // In a real app, you would hash the password before storing it
  const user = await prisma.user.create({
    data: {
      email,
      // passwordHash: await bcrypt.hash(password, 10)
    }
  });

  const token = generateToken(user.id);
  res.json({ token, user });
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?token=${token}`);
  }
);

// Apple OAuth routes
router.get('/apple', passport.authenticate('apple'));

router.get(
  '/apple/callback',
  passport.authenticate('apple', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?token=${token}`);
  }
);

// Spotify OAuth routes
router.get('/spotify', passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private'] }));

router.get(
  '/spotify/callback',
  passport.authenticate('spotify', { session: false, failureRedirect: '/' }),
  (req, res) => {
    const user = req.user as any;
    const token = generateToken(user.id);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?token=${token}`);
  }
);

export default router;
