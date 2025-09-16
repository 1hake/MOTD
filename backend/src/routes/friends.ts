import { Router } from 'express'
import prisma from '../prismaClient'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/', authenticateToken, async (req, res) => {
  const { friendEmail, friendId } = req.body
  if (!friendEmail && !friendId) return res.status(400).json({ error: 'Missing fields' })
  const userId = req.user!.id

  try {
    let friend

    if (friendId) {
      // Follow by user ID
      friend = await prisma.user.findUnique({ where: { id: parseInt(friendId, 10) } })
    } else {
      // Follow by email
      friend = await prisma.user.findUnique({ where: { email: friendEmail } })
    }

    if (!friend) return res.status(404).json({ error: 'Friend not found' })

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        userId: userId,
        friendId: friend.id
      }
    })

    if (existingFriendship) {
      return res.status(400).json({ error: 'Already following this user' })
    }

    await prisma.friendship.create({ data: { userId: userId, friendId: friend.id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Error adding friend:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/', authenticateToken, async (req, res) => {
  const userIdNumber = req.user!.id

  const friends = await prisma.friendship.findMany({
    where: { userId: userIdNumber },
    include: { friend: true }
  })

  res.json(friends.map((f) => f.friend))
})

// Get all posts from friends for today
router.get('/posts', authenticateToken, async (req, res) => {
  const userIdNumber = req.user!.id

  const friends = await prisma.friendship.findMany({
    where: { userId: userIdNumber },
    select: { friendId: true }
  })
  const friendIds = friends.map((f) => f.friendId)

  // Get today's date in UTC to properly compare with database timestamps
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))

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
  })

  // Add like count and user's like status to each post
  const postsWithLikes = posts.map((post) => ({
    ...post,
    likeCount: post.likes.length,
    isLikedByUser: post.likes.some((like) => like.userId === userIdNumber),
    likes: undefined // Remove the likes array from response for cleaner data
  }))

  res.json(postsWithLikes)
})

// Check if user1 follows user2
router.get('/status', authenticateToken, async (req, res) => {
  const { friendId } = req.query
  if (!friendId) return res.status(400).json({ error: 'Missing friendId' })

  const userIdNumber = req.user!.id
  const friendIdNumber = parseInt(friendId as string, 10)

  if (isNaN(friendIdNumber)) {
    return res.status(400).json({ error: 'Invalid friendId format' })
  }

  try {
    const friendship = await prisma.friendship.findFirst({
      where: {
        userId: userIdNumber,
        friendId: friendIdNumber
      }
    })

    res.json({ isFriend: !!friendship })
  } catch (error) {
    console.error('Error checking friendship status:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Unfollow a user
router.delete('/', authenticateToken, async (req, res) => {
  const { friendId } = req.body
  if (!friendId) return res.status(400).json({ error: 'Missing friendId' })
  const userId = req.user!.id

  try {
    await prisma.friendship.deleteMany({
      where: {
        userId: userId,
        friendId: parseInt(friendId, 10)
      }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error unfollowing user:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
