import { Capacitor } from '@capacitor/core'
import { api } from './lib/api'

let isListenersSetup = false

export async function getPushPermissionStatus() {
  if (!Capacitor.isNativePlatform()) return 'unsupported'
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const perm = await PushNotifications.checkPermissions()
    return perm.receive
  } catch (e) {
    console.warn('Error checking push permissions:', e)
    return 'error'
  }
}

export async function initPushListeners() {
  if (!Capacitor.isNativePlatform() || isListenersSetup) return

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // Listeners
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token:', token.value)
      localStorage.setItem('fcm_token', token.value)
      try {
        await api.post('/devices/register-device', {
          fcmToken: token.value,
          platform: Capacitor.getPlatform()
        })
        console.log('Device registered with backend')
      } catch (err) {
        console.error('Failed to register device with backend:', err)
      }
    })

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error)
    })

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification)
    })

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed:', notification)
      const data = notification.notification.data
      if (data && data.url) {
        window.location.href = data.url
      } else {
        window.location.href = '/'
      }
    })

    isListenersSetup = true
  } catch (e) {
    console.warn('Push listeners setup failed:', e)
  }
}

export async function registerPushNotifications() {
  if (!Capacitor.isNativePlatform()) return

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // Ensure listeners are set up before registering
    await initPushListeners()

    // Request permissions
    const perm = await PushNotifications.checkPermissions()
    if (perm.receive !== 'granted') {
      const req = await PushNotifications.requestPermissions()
      if (req.receive !== 'granted') {
        console.warn('Push notification permissions denied')
        return false
      }
    }

    // Register with FCM
    await PushNotifications.register()
    return true
  } catch (e) {
    console.error('Push registration failed:', e)
    return false
  }
}

// For backward compatibility or easy auto-init
export async function initPushSafe() {
  if (!Capacitor.isNativePlatform()) return

  const status = await getPushPermissionStatus()
  if (status === 'granted') {
    await registerPushNotifications()
  } else {
    await initPushListeners() // Just setup listeners in case they later grant
  }
}

export async function unregisterPush() {
  if (!Capacitor.isNativePlatform()) return

  try {
    const token = localStorage.getItem('fcm_token')
    if (token) {
      await api.post('/devices/unregister-device', { fcmToken: token })
      localStorage.removeItem('fcm_token')
    }

    const { PushNotifications } = await import('@capacitor/push-notifications')
    await PushNotifications.removeAllListeners()
    isListenersSetup = false
  } catch (e) {
    console.error('Error in unregisterPush:', e)
  }
}
