import { Router } from 'express'
import prisma from '../prismaClient'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.post('/register-device', authenticateToken, async (req, res) => {
  const { fcmToken, platform } = req.body
  const userId = req.user?.id

  if (!userId || !fcmToken) return res.status(400).json({ error: 'Missing fields' })

  try {
    await prisma.deviceToken.upsert({
      where: { token: fcmToken },
      update: { userId, platform: platform || 'unknown' },
      create: { userId, token: fcmToken, platform: platform || 'unknown' }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error registering device:', error)
    res.status(500).json({ error: 'Failed to register device' })
  }
})

router.post('/unregister-device', authenticateToken, async (req, res) => {
  const { fcmToken } = req.body

  if (!fcmToken) return res.status(400).json({ error: 'Missing token' })

  try {
    await prisma.deviceToken.deleteMany({
      where: { token: fcmToken }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Error unregistering device:', error)
    res.status(500).json({ error: 'Failed to unregister device' })
  }
})

export default router
