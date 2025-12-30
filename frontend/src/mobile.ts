import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard, KeyboardResize } from '@capacitor/keyboard'
import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { initPushSafe } from './push'

export async function initMobileApp() {
  if (!Capacitor.isNativePlatform()) return

  try {
    // Configure status bar
    await StatusBar.setStyle({ style: Style.Default })
    await StatusBar.setBackgroundColor({ color: '#ffffff' })

    // Configure keyboard behavior
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body })

    // Set up app lifecycle listeners
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Is active?', isActive)
    })

    App.addListener('appUrlOpen', (event) => {
      console.log('App opened with URL:', event.url)
      // Handle deep links if needed
    })

    // Handle back button on Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp()
      } else {
        window.history.back()
      }
    })

    // Initialize push notifications
    await initPushSafe()

    console.log('Mobile app initialized successfully')
  } catch (error) {
    console.error('Error initializing mobile app:', error)
  } finally {
    // Always hide splash screen, even if initialization fails
    try {
      await SplashScreen.hide()
    } catch (e) {
      console.warn('Failed to hide splash screen:', e)
    }
  }
}
