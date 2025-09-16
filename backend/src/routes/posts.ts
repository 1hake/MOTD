import { Router } from 'express'
import prisma from '../prismaClient'
import { authenticateToken } from '../middleware/auth'
import { getAllPlatformLinks } from '../services/musicService'

const router = Router()

router.post('/', authenticateToken, async (req, res) => {
  const { title, artist, link, coverUrl } = req.body
  if (!title || !artist) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const uid = req.user!.id

  // Get today's date in UTC to properly compare with database timestamps
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))

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
    const posts = await prisma.songPost.findMany({
      where: { userId: uid },
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
      return res.status(400).json({ error: 'Already liked this post' })
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
      return res.status(400).json({ error: 'Like not found' })
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

export default router
