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
  const userLocalTime = new Date(now.getTime() - timezoneOffset * 60 * 1000)
  const todayStartInUserTz = new Date(
    userLocalTime.getFullYear(),
    userLocalTime.getMonth(),
    userLocalTime.getDate(),
    0,
    0,
    0,
    0
  )
  const today = new Date(todayStartInUserTz.getTime() + timezoneOffset * 60 * 1000)

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
    const deezerTrackId = finalDeezerLink
      ? (() => {
        const parts = finalDeezerLink.split('/').filter(Boolean)
        return parts.length > 0 ? parts[parts.length - 1] : undefined
      })()
      : undefined
    console.log("🚀 ~ deezerTrackId:", deezerTrackId)
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
        coverUrl,
        deezerTrackId
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
      isSavedByUser: post.saves.some((save) => save.userId === uid),
      saves: undefined // Remove the saves array from response for cleaner data
    }))

    res.json(postsWithSaves)
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
      const userLocalTime = new Date(now.getTime() - timezoneOffset * 60 * 1000)
      const todayStartInUserTz = new Date(
        userLocalTime.getFullYear(),
        userLocalTime.getMonth(),
        userLocalTime.getDate(),
        0,
        0,
        0,
        0
      )
      const todayStartUTC = new Date(todayStartInUserTz.getTime() + timezoneOffset * 60 * 1000)

      whereClause.date = { gte: todayStartUTC }
    }

    const posts = await prisma.songPost.findMany({
      where: whereClause,
      include: {
        saves: {
          select: {
            userId: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Add save count to each post
    const postsWithSaves = posts.map((post) => ({
      ...post,
      saveCount: post.saves.length,
      isSavedByUser: false, // User can't save their own posts, or set to true if you want to allow it
      saves: undefined // Remove the saves array from response for cleaner data
    }))

    res.json(postsWithSaves)
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
      isSavedByUser: post.saves.some((save) => save.userId === currentUserId),
      saves: undefined // Remove the saves array from response for cleaner data
    }))

    res.json(postsWithSaves)
  } catch (e) {
    console.error('[GET /posts/friends/:userId] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Save a post
router.post('/:postId/save', authenticateToken, async (req, res) => {
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

    // Prevent users from saving their own posts
    if (post.userId === uid) {
      return res.status(400).json({ error: 'You cannot save your own post' })
    }

    // Check if user already saved this post
    const existingSave = await prisma.save.findUnique({
      where: {
        userId_songPostId: {
          userId: uid,
          songPostId: pid
        }
      }
    })

    if (existingSave) {
      // If already saved, return the existing save (idempotent behavior)
      return res.json({ success: true, save: existingSave })
    }

    // Create save
    const save = await prisma.save.create({
      data: {
        userId: uid,
        songPostId: pid
      }
    })

    res.json({ success: true, save })
  } catch (e) {
    console.error('[POST /posts/:postId/save] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Unsave a post
router.delete('/:postId/save', authenticateToken, async (req, res) => {
  const { postId } = req.params
  const uid = req.user!.id
  const pid = Number(postId)

  if (!Number.isFinite(pid)) {
    return res.status(400).json({ error: 'Invalid postId' })
  }

  try {
    // Check if save exists
    const existingSave = await prisma.save.findUnique({
      where: {
        userId_songPostId: {
          userId: uid,
          songPostId: pid
        }
      }
    })

    if (!existingSave) {
      // If save doesn't exist, treat as idempotent (already unsaved)
      return res.json({ success: true })
    }

    // Delete save
    await prisma.save.delete({
      where: {
        userId_songPostId: {
          userId: uid,
          songPostId: pid
        }
      }
    })

    res.json({ success: true })
  } catch (e) {
    console.error('[DELETE /posts/:postId/save] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get saved posts by current user
router.get('/saved', authenticateToken, async (req, res) => {
  const uid = req.user!.id

  try {
    const savedPosts = await prisma.save.findMany({
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
            saves: {
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
    const postsWithSaves = savedPosts.map((save) => ({
      ...save.songPost,
      saveDate: save.createdAt, // Add the date when user saved this post
      saveCount: save.songPost.saves.length,
      isSavedByUser: true, // Always true since these are user's saved posts
      saves: undefined // Remove the saves array from response for cleaner data
    }))

    res.json(postsWithSaves)
  } catch (e) {
    console.error('[GET /posts/saved] error:', e)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get saved posts count for current user
router.get('/saved/count', authenticateToken, async (req, res) => {
  const uid = req.user!.id

  try {
    const count = await prisma.save.count({
      where: { userId: uid }
    })

    res.json({ count })
  } catch (e) {
    console.error('[GET /posts/saved/count] error:', e)
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
    const userLocalTime = new Date(now.getTime() - timezoneOffset * 60 * 1000)
    const todayStartInUserTz = new Date(
      userLocalTime.getFullYear(),
      userLocalTime.getMonth(),
      userLocalTime.getDate(),
      0,
      0,
      0,
      0
    )
    const today = new Date(todayStartInUserTz.getTime() + timezoneOffset * 60 * 1000)

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
        saves: {
          select: {
            userId: true
          }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit
    })

    // Add save information
    const postsWithSaves = posts.map((post) => ({
      ...post,
      saveCount: post.saves.length,
      isSavedByUser: post.saves.some((save) => save.userId === currentUserId),
      saves: undefined // Remove the saves array from response
    }))

    const hasMore = skip + posts.length < totalPosts

    res.json({
      posts: postsWithSaves,
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

// Get Deezer track preview URL
router.get('/deezer-preview/:trackId', async (req, res) => {
  const { trackId } = req.params

  if (!trackId) {
    return res.status(400).json({ error: 'Track ID is required' })
  }

  try {
    const response = await fetch(`https://api.deezer.com/track/${trackId}`)
    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch track data from Deezer' })
    }

    res.json({
      preview: data.preview || null,
      title: data.title || null,
      artist: data.artist?.name || null
    })
  } catch (error) {
    console.error('[GET /posts/deezer-preview] error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
