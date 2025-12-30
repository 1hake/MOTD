import prisma from './prismaClient'
import { sendPushNotification } from './services/notificationService'
import dotenv from 'dotenv'

dotenv.config()

async function notifyAll() {
  console.log('Running daily notification script...')

  try {
    // Get all unique tokens
    const devices = await prisma.deviceToken.findMany({
      select: { token: true }
    })

    const tokens = Array.from(new Set(devices.map((d) => d.token)))

    if (tokens.length === 0) {
      console.log('No registered devices found.')
      return
    }

    console.log(`Sending notifications to ${tokens.length} devices...`)

    await sendPushNotification(
      tokens,
      "C'est l'heure de DIGGER ! 🎶",
      'Partage ta pépite musicale du moment avec tes amis.',
      { url: '/post' }
    )

    console.log('Daily notifications sent successfully.')
  } catch (error) {
    console.error('Error in notifyAll:', error)
  } finally {
    await prisma.$disconnect()
  }
}

notifyAll()
