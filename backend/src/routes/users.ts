import { Router } from 'express'
import prisma from '../prismaClient'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Get user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const userId = parseInt(id, 10)

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        platformPreference: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('[GET /users/:id] error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  const { name, email, platformPreference, profileImage } = req.body
  const userId = parseInt(id, 10)
  const currentUserId = req.user!.id

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' })
  }

  // Check if user is trying to update their own profile
  if (userId !== currentUserId) {
    return res.status(403).json({ error: 'You can only update your own profile' })
  }

  // Validate platform preference if provided (allow empty string or null to clear selection)
  const validPlatforms = ['spotify', 'apple', 'deezer', 'youtube']
  if (platformPreference !== undefined && platformPreference !== null && platformPreference !== '' && !validPlatforms.includes(platformPreference)) {
    return res.status(400).json({
      error: 'Invalid platform preference. Must be one of: spotify, apple, deezer, youtube'
    })
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })
      if (emailExists) {
        return res.status(400).json({ error: 'Email already taken' })
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(platformPreference !== undefined && { platformPreference: platformPreference || null }),
        ...(profileImage !== undefined && { profileImage })
      },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        platformPreference: true,
        createdAt: true
      }
    })

    res.json(updatedUser)
  } catch (error) {
    console.error('[PUT /users/:id] error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Search users by email or name
router.get('/search/:query', async (req, res) => {
  const { query } = req.params
  const { userId } = req.query // Current user ID to exclude from results

  if (!query || query.trim().length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' })
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                email: {
                  contains: query.trim(),
                  mode: 'insensitive'
                }
              },
              {
                name: {
                  contains: query.trim(),
                  mode: 'insensitive'
                }
              }
            ]
          },
          // Exclude current user from results
          userId
            ? {
                id: {
                  not: parseInt(userId as string, 10)
                }
              }
            : {}
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true
      },
      take: 10 // Limit results
    })

    res.json(users)
  } catch (error) {
    console.error('[GET /users/search/:query] error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        platformPreference: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('[GET /users/me] error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
