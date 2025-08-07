
import { Capacitor } from '@capacitor/core';

export async function initPushSafe() {
  // No-op on web; requires native environment + FCM setup
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const perm = await PushNotifications.checkPermissions();
    if (perm.receive !== 'granted') {
      const req = await PushNotifications.requestPermissions();
      if (req.receive !== 'granted') return;
    }
    await PushNotifications.register();

    PushNotifications.addListener('pushNotificationActionPerformed', () => {
      window.location.href = '/post';
    });
  } catch (e) {
    console.warn('Push init skipped:', e);
  }
}
