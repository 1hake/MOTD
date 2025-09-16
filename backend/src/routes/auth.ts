import { Router } from 'express'
import prisma from '../prismaClient'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()

// Helper function to generate JWT token
const generateToken = (userId: number) => {
  const secret = process.env.SESSION_SECRET || 'your_secret_key'
  return jwt.sign({ userId }, secret, { expiresIn: '15m' }) // Access token expires in 15 minutes
}

// Helper function to generate refresh token
const generateRefreshToken = (userId: number) => {
  const secret = process.env.REFRESH_SECRET || 'your_refresh_secret_key'
  return jwt.sign({ userId }, secret, { expiresIn: '7d' }) // Refresh token expires in 7 days
}

// Email-only authentication (simplified - no password hashing for now)
router.post('/email', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({ data: { email } })
  }

  const token = generateToken(user.id)
  const refreshToken = generateRefreshToken(user.id)
  res.json({ token, refreshToken, user })
})

// Signup with email and password
router.post('/signup', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' })
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return res.status(400).json({ error: 'User already exists' })

    // Hash the password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash
      }
    })

    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    res.json({ token, refreshToken, user: { id: user.id, email: user.email } })
  } catch (error) {
    console.error('[POST /auth/signup] error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Login with email and password
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    // Check if user has a password hash
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'Please sign up first or reset your password' })
    }

    // Compare the provided password with the stored hash
    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' })

    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    res.json({ token, refreshToken, user: { id: user.id, email: user.email } })
  } catch (error) {
    console.error('[POST /auth/login] error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' })

  try {
    const refreshSecret = process.env.REFRESH_SECRET || 'your_refresh_secret_key'
    const decoded = jwt.verify(refreshToken, refreshSecret) as { userId: number }

    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        platformPreference: true
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Generate new tokens
    const newToken = generateToken(user.id)
    const newRefreshToken = generateRefreshToken(user.id)

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        profileImage: user.profileImage || undefined,
        platformPreference: user.platformPreference || undefined
      }
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Refresh token expired' })
    }

    console.error('[POST /auth/refresh] error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Logout endpoint (for future use with token blacklisting)
router.post('/logout', async (req, res) => {
  // In a production app, you might want to blacklist the refresh token
  res.json({ message: 'Logged out successfully' })
})

export default router
