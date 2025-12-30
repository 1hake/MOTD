import { sendPushNotification } from './src/services/notificationService'

const TEST_TOKEN = process.argv[2]

if (!TEST_TOKEN) {
  console.error('Please provide a device token: npx ts-node testPush.ts YOUR_TOKEN')
  process.exit(1)
}

async function test() {
  console.log('Sending test notification to:', TEST_TOKEN)
  await sendPushNotification([TEST_TOKEN], 'Test Digger 🎵', 'Ceci est une notification de test !', { url: '/feed' })
  console.log('Done.')
}

test()
