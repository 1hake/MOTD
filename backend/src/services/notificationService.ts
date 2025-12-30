import * as admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

let isInitialized = false

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })
    isInitialized = true
    console.log('Firebase Admin initialized successfully.')
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable not found. Push notifications will be disabled.')
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error)
}

export async function sendPushNotification(tokens: string[], title: string, body: string, data?: any) {
  if (!isInitialized) {
    console.warn('Firebase Admin not initialized. Skipping push notification.')
    return
  }

  if (tokens.length === 0) return

  const message: admin.messaging.MulticastMessage = {
    notification: {
      title,
      body
    },
    tokens,
    data: data || {},
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        priority: 'high'
      }
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1
        }
      }
    }
  }

  try {
    const response = await admin.messaging().sendEachForMulticast(message)
    console.log(`${response.successCount} messages were sent successfully`)

    if (response.failureCount > 0) {
      const failedTokens: string[] = []
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx])
          console.error('Notification failed for token:', tokens[idx], resp.error)
        }
      })
      // Optionally cleanup failed tokens from DB here
    }
  } catch (error) {
    console.error('Error sending push notification:', error)
  }
}

export async function sendToUser(userId: number, title: string, body: string, data?: any) {
  const prisma = (await import('../prismaClient')).default
  const deviceTokens = await prisma.deviceToken.findMany({
    where: { userId },
    select: { token: true }
  })

  const tokens = deviceTokens.map((t) => t.token)
  if (tokens.length > 0) {
    await sendPushNotification(tokens, title, body, data)
  }
}
