import { Router } from 'express';
import prisma from '../prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Helper function to generate JWT token
const generateToken = (userId: number) => {
  const secret = process.env.SESSION_SECRET || 'your_secret_key';
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
};

// Email-only authentication (simplified - no password hashing for now)
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

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash
      }
    });

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('[POST /auth/signup] error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login with email and password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Check if user has a password hash
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Please sign up first or reset your password' });
    }

    // Compare the provided password with the stored hash
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('[POST /auth/login] error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
