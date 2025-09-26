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

  // Get timezone offset from query params (in minutes), default to UTC
  const timezoneOffset = req.query.timezoneOffset ? parseInt(req.query.timezoneOffset as string) : 0

  // Calculate today's start based on user's timezone
  const now = new Date()
  const userLocalTime = new Date(now.getTime() - (timezoneOffset * 60 * 1000))
  const todayStartInUserTz = new Date(userLocalTime.getFullYear(), userLocalTime.getMonth(), userLocalTime.getDate(), 0, 0, 0, 0)
  const today = new Date(todayStartInUserTz.getTime() + (timezoneOffset * 60 * 1000))

  const posts = await prisma.songPost.findMany({
    where: {
      userId: { in: friendIds },
      date: { gte: today }
    },
    include: {
      user: true,
      saves: {
        select: {
          userId: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })

  // Add save count and user's save status to each post
  const postsWithSaves = posts.map((post) => ({
    ...post,
    saveCount: post.saves.length,
    isSavedByUser: post.saves.some((save) => save.userId === userIdNumber),
    saves: undefined // Remove the saves array from response for cleaner data
  }))

  res.json(postsWithSaves)
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

// Get friends count for a specific user
router.get('/:userId/count', authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.userId, 10)

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid userId format' })
  }

  try {
    const friendsCount = await prisma.friendship.count({
      where: { userId: userId }
    })

    res.json({ count: friendsCount })
  } catch (error) {
    console.error('Error fetching friends count:', error)
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
