import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient'

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        name?: string
        profileImage?: string
        platformPreference?: string
      }
    }
  }
}

const JWT_SECRET = process.env.SESSION_SECRET || 'your_secret_key'

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }

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

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      profileImage: user.profileImage || undefined,
      platformPreference: user.platformPreference || undefined
    }
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' })
    }

    console.error('Auth middleware error:', error)
    return res.status(500).json({ error: 'Authentication error' })
  }
}

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return next() // Continue without user
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
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

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        profileImage: user.profileImage || undefined,
        platformPreference: user.platformPreference || undefined
      }
    }

    next()
  } catch (error) {
    // If token is invalid, continue without user (don't fail)
    next()
  }
}
