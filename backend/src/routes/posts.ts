import { Router } from 'express'
import prisma from '../prismaClient'
import { authenticateToken } from '../middleware/auth'
import { getAllPlatformLinks } from '../services/musicService'

const router = Router()

router.post('/', authenticateToken, async (req, res) => {
  const { title, artist, link, coverUrl, description } = req.body
  if (!title || !artist) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const uid = req.user!.id

  // Get timezone offset from request body (in minutes), default to UTC
  const timezoneOffset = req.body.timezoneOffset || 0

  // Calculate today's start based on user's timezone
  const now = new Date()
  const userLocalTime = new Date(now.getTime() - (timezoneOffset * 60 * 1000))
  const todayStartInUserTz = new Date(userLocalTime.getFullYear(), userLocalTime.getMonth(), userLocalTime.getDate(), 0, 0, 0, 0)
  const today = new Date(todayStartInUserTz.getTime() + (timezoneOffset * 60 * 1000))

  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: uid }
    })
    if (!user) return res.status(400).json({ error: 'User not found' })

    const existing = await prisma.songPost.findFirst({
      where: { userId: uid, date: { gte: today } }
    })
    if (existing) return res.status(400).json({ error: 'Already posted today' })

    let finalDeezerLink = undefined
    let finalSpotifyLink = undefined
    let finalAppleMusicLink = undefined
    let finalYoutubeLink = undefined
    // Only fetch links if none are provided
    try {
      const platformLinks = await getAllPlatformLinks(artist, title)
      finalDeezerLink = platformLinks.deezerLink
      finalSpotifyLink = platformLinks.spotifyLink
      finalAppleMusicLink = platformLinks.appleMusicLink
      finalYoutubeLink = platformLinks.youtubeLink
    } catch (error) {
      console.error('Error fetching platform links:', error)
      // Continue with empty links if fetching fails
    }

    const post = await prisma.songPost.create({
      data: {
        title,
        artist,
        description,
        link: link || finalDeezerLink || finalSpotifyLink || finalAppleMusicLink || finalYoutubeLink || '', // Fallback for backward compatibility
        deezerLink: finalDeezerLink,
        spotifyLink: finalSpotifyLink,
        appleMusicLink: finalAppleMusicLink,
        youtubeLink: finalYoutubeLink,
        userId: uid,
        coverUrl
      }
    })
    res.json(post)
  } catch (e) {
    console.error('[POST /posts] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/today', authenticateToken, async (req, res) => {
  const uid = req.user!.id

  try {
    const friends = await prisma.friendship.findMany({
      where: { userId: uid },
      select: { friendId: true }
    })
    const friendIds = friends.map((f) => f.friendId)

    if (friendIds.length === 0) return res.json([])

    // Get today's date in UTC to properly compare with database timestamps
    const now = new Date()
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))

    const posts = await prisma.songPost.findMany({
      where: { userId: { in: friendIds }, date: { gte: today } },
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
      isLikedByUser: post.likes.some((like) => like.userId === uid),
      likes: undefined // Remove the likes array from response for cleaner data
    }))

    res.json(postsWithLikes)
  } catch (e) {
    console.error('[GET /posts/today] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/me', authenticateToken, async (req, res) => {
  const uid = req.user!.id

  try {
    // Check if we need to filter for today's posts
    const { today } = req.query
    let whereClause: any = { userId: uid }

    if (today === 'true') {
      // Get timezone offset from query params (in minutes), default to UTC
      const timezoneOffset = req.query.timezoneOffset ? parseInt(req.query.timezoneOffset as string) : 0

      // Calculate today's start based on user's timezone
      const now = new Date()
      const userLocalTime = new Date(now.getTime() - (timezoneOffset * 60 * 1000))
      const todayStartInUserTz = new Date(userLocalTime.getFullYear(), userLocalTime.getMonth(), userLocalTime.getDate(), 0, 0, 0, 0)
      const todayStartUTC = new Date(todayStartInUserTz.getTime() + (timezoneOffset * 60 * 1000))

      whereClause.date = { gte: todayStartUTC }
    }

    const posts = await prisma.songPost.findMany({
      where: whereClause,
      include: {
        likes: {
          select: {
            userId: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Add like count to each post
    const postsWithLikes = posts.map((post) => ({
      ...post,
      likeCount: post.likes.length,
      isLikedByUser: false, // User can't like their own posts, or set to true if you want to allow it
      likes: undefined // Remove the likes array from response for cleaner data
    }))

    res.json(postsWithLikes)
  } catch (e) {
    console.error('[GET /posts/me] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get posts by specific user ID (for friends profiles)
router.get('/friends/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params
  const currentUserId = req.user!.id
  const targetUserId = parseInt(userId, 10)

  if (!Number.isFinite(targetUserId)) {
    return res.status(400).json({ error: 'Invalid userId' })
  }

  try {
    const posts = await prisma.songPost.findMany({
      where: { userId: targetUserId },
      include: {
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
      isLikedByUser: post.likes.some((like) => like.userId === currentUserId),
      likes: undefined // Remove the likes array from response for cleaner data
    }))

    res.json(postsWithLikes)
  } catch (e) {
    console.error('[GET /posts/friends/:userId] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Like a post
router.post('/:postId/like', authenticateToken, async (req, res) => {
  const { postId } = req.params
  const uid = req.user!.id
  const pid = Number(postId)

  if (!Number.isFinite(pid)) {
    return res.status(400).json({ error: 'Invalid postId' })
  }

  try {
    // Check if post exists
    const post = await prisma.songPost.findUnique({
      where: { id: pid }
    })
    if (!post) return res.status(404).json({ error: 'Post not found' })

    // Prevent users from liking their own posts
    if (post.userId === uid) {
      return res.status(400).json({ error: 'You cannot like your own post' })
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_songPostId: {
          userId: uid,
          songPostId: pid
        }
      }
    })

    if (existingLike) {
      // If already liked, return the existing like (idempotent behavior)
      return res.json({ success: true, like: existingLike })
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        userId: uid,
        songPostId: pid
      }
    })

    res.json({ success: true, like })
  } catch (e) {
    console.error('[POST /posts/:postId/like] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Unlike a post
router.delete('/:postId/like', authenticateToken, async (req, res) => {
  const { postId } = req.params
  const uid = req.user!.id
  const pid = Number(postId)

  if (!Number.isFinite(pid)) {
    return res.status(400).json({ error: 'Invalid postId' })
  }

  try {
    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_songPostId: {
          userId: uid,
          songPostId: pid
        }
      }
    })

    if (!existingLike) {
      // If like doesn't exist, treat as idempotent (already unliked)
      return res.json({ success: true })
    }

    // Delete like
    await prisma.like.delete({
      where: {
        userId_songPostId: {
          userId: uid,
          songPostId: pid
        }
      }
    })

    res.json({ success: true })
  } catch (e) {
    console.error('[DELETE /posts/:postId/like] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get liked posts by current user
router.get('/liked', authenticateToken, async (req, res) => {
  const uid = req.user!.id

  try {
    const likedPosts = await prisma.like.findMany({
      where: { userId: uid },
      include: {
        songPost: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                platformPreference: true
              }
            },
            likes: {
              select: {
                userId: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform the data to match the expected format
    const postsWithLikes = likedPosts.map((like) => ({
      ...like.songPost,
      likeDate: like.createdAt, // Add the date when user liked this post
      likeCount: like.songPost.likes.length,
      isLikedByUser: true, // Always true since these are user's liked posts
      likes: undefined // Remove the likes array from response for cleaner data
    }))

    res.json(postsWithLikes)
  } catch (e) {
    console.error('[GET /posts/liked] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get liked posts count for current user
router.get('/liked/count', authenticateToken, async (req, res) => {
  const uid = req.user!.id

  try {
    const count = await prisma.like.count({
      where: { userId: uid }
    })

    res.json({ count })
  } catch (e) {
    console.error('[GET /posts/liked/count] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Explorer endpoint - get all users' posts for today with pagination
router.get('/explore', authenticateToken, async (req, res) => {
  const currentUserId = req.user!.id
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  try {
    // Get timezone offset from query params (in minutes), default to UTC
    const timezoneOffset = req.query.timezoneOffset ? parseInt(req.query.timezoneOffset as string) : 0

    // Calculate today's start based on user's timezone
    const now = new Date()
    const userLocalTime = new Date(now.getTime() - (timezoneOffset * 60 * 1000))
    const todayStartInUserTz = new Date(userLocalTime.getFullYear(), userLocalTime.getMonth(), userLocalTime.getDate(), 0, 0, 0, 0)
    const today = new Date(todayStartInUserTz.getTime() + (timezoneOffset * 60 * 1000))

    // Get total count for pagination
    const totalPosts = await prisma.songPost.count({
      where: {
        date: { gte: today }
      }
    })

    // Get posts with user information and likes
    const posts = await prisma.songPost.findMany({
      where: {
        date: { gte: today }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            platformPreference: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    })

    // Add like information
    const postsWithLikes = posts.map((post) => ({
      ...post,
      likeCount: post.likes.length,
      isLikedByUser: post.likes.some((like) => like.userId === currentUserId),
      likes: undefined // Remove the likes array from response
    }))

    const hasMore = skip + posts.length < totalPosts

    res.json({
      posts: postsWithLikes,
      hasMore,
      total: totalPosts,
      page,
      limit
    })
  } catch (error) {
    console.error('[GET /posts/explore] error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
