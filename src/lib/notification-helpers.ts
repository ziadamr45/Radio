// Shared notification helpers for client-side use

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Request notification permission - MUST be called directly from a user gesture (click).
 * Do NOT call this after any await or setState, otherwise the browser will block it.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  // Call requestPermission FIRST - must be in direct user gesture context
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Get device ID from localStorage - auto-generates if missing
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

/**
 * Get display name from localStorage (set by radio-store)
 */
export function getDisplayName(): string | null {
  return localStorage.getItem('displayName');
}

/**
 * Register push subscription with the server after permission is granted
 */
export async function registerPushSubscription(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[Notifications] Push not supported');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key from server
    const vapidResponse = await fetch('/api/notifications/subscribe');
    const { publicKey } = await vapidResponse.json();

    if (!publicKey) {
      console.warn('[Notifications] No VAPID public key available');
      return false;
    }

    // Get device info
    const deviceId = getDeviceId();
    const displayName = getDisplayName();

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      // Update existing subscription with device info
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: existingSubscription.toJSON(),
          platform: 'web',
          deviceId,
          displayName,
        }),
      });
      console.log('[Notifications] Push subscription updated');
      return true;
    }

    // Subscribe to push notifications
    const pushSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Send subscription to server with device info
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: pushSubscription.toJSON(),
        platform: 'web',
        deviceId,
        displayName,
      }),
    });

    console.log('[Notifications] Push subscription registered successfully');
    return true;
  } catch (error) {
    console.error('[Notifications] Push subscription failed:', error);
    return false;
  }
}

/**
 * Show a welcome notification after enabling
 */
export async function showWelcomeNotification(isArabic: boolean): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(
        isArabic ? '🎉 تم تفعيل الإشعارات!' : '🎉 Notifications Enabled!',
        {
          body: isArabic
            ? 'ستتلقى الآن إشعارات مخصصة حسب وقتك واهتماماتك'
            : 'You will now receive personalized notifications',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-monochrome.png',
          dir: 'rtl',
          lang: 'ar',
          tag: 'welcome-notification',
        }
      );
    } catch (error) {
      console.error('[Notifications] Welcome notification failed:', error);
    }
  }
}

/**
 * Complete flow: request permission, register subscription, show welcome
 * IMPORTANT: This should be called from an onClick handler WITHOUT any prior await/setState
 */
export async function enableNotifications(isArabic: boolean): Promise<{ success: boolean; permission: NotificationPermission }> {
  // Step 1: Request permission (MUST be first, in user gesture context)
  const permission = await requestNotificationPermission();

  if (permission !== 'granted') {
    return { success: false, permission };
  }

  // Step 2: Save to localStorage
  localStorage.setItem('notification-enabled', 'true');
  localStorage.removeItem('notification-prompt-dismissed-at');

  // Step 3: Register push subscription (can be async now)
  await registerPushSubscription();

  // Step 4: Show welcome notification
  await showWelcomeNotification(isArabic);

  return { success: true, permission };
}
