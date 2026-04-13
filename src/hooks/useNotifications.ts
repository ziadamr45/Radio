'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRadioStore } from '@/stores/radio-store';

export type NotificationPermissionState = 'default' | 'granted' | 'denied';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationStatus {
  supported: boolean;
  permission: NotificationPermissionState;
  subscribed: boolean;
  loading: boolean;
  error: string | null;
}

// Generate or get device ID
function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

export function useNotifications() {
  const { userId } = useRadioStore();
  const [status, setStatus] = useState<NotificationStatus>({
    supported: false,
    permission: 'default',
    subscribed: false,
    loading: true,
    error: null,
  });
  const [publicKey, setPublicKey] = useState<string | null>(null);

  // Check notification support and current status
  useEffect(() => {
    const checkStatus = async () => {
      const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      
      if (!supported) {
        setStatus(prev => ({
          ...prev,
          supported: false,
          loading: false,
        }));
        return;
      }

      const permission = Notification.permission as NotificationPermissionState;
      
      // Get public key and try to resolve userId from deviceId
      try {
        const deviceId = localStorage.getItem('deviceId') || '';
        const url = deviceId 
          ? `/api/notifications/subscribe?deviceId=${encodeURIComponent(deviceId)}`
          : '/api/notifications/subscribe';
        const response = await fetch(url);
        const data = await response.json();
        setPublicKey(data.publicKey);
        
        // Restore userId from server if store is empty but server found it
        const storeUserId = useRadioStore.getState().userId;
        if (!storeUserId && data.userId) {
          console.log('Restoring userId from server:', data.userId);
          useRadioStore.getState().setUserId(data.userId);
        }
      } catch (error) {
        console.error('Failed to get VAPID key:', error);
      }

      // Check if already subscribed
      let subscribed = false;
      if (permission === 'granted') {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          subscribed = !!subscription;
        } catch (error) {
          console.error('Failed to check subscription:', error);
        }
      }

      setStatus({
        supported,
        permission,
        subscribed,
        loading: false,
        error: null,
      });
    };

    checkStatus();
  }, []);

  // Request notification permission
  // CRITICAL: Notification.requestPermission() MUST be the FIRST async operation
  // to ensure Chrome shows the dialog instead of auto-denying
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!status.supported) {
      setStatus(prev => ({ ...prev, error: 'المتصفح لا يدعم الإشعارات' }));
      return false;
    }

    try {
      // Request permission FIRST - must be in direct user gesture context
      const permission = await Notification.requestPermission();
      const newPermission = permission as NotificationPermissionState;
      
      setStatus(prev => ({
        ...prev,
        permission: newPermission,
        loading: false,
      }));

      return newPermission === 'granted';
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: 'فشل في طلب الإذن',
      }));
      return false;
    }
  }, [status.supported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!publicKey) {
      setStatus(prev => ({ ...prev, error: 'مفتاح الإشعارات غير متاح' }));
      return false;
    }

    try {
      // Request permission if not granted - called FIRST in user gesture context
      if (status.permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }

      // Set loading AFTER permission is granted (no longer in gesture context needed)
      setStatus(prev => ({ ...prev, loading: true, error: null }));

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        },
      };

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription: subscriptionData,
          userAgent: navigator.userAgent,
          deviceId: getDeviceId(),
          platform: 'web',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // حفظ userId في المتجر إذا تم إرجاعه من السيرفر
        if (data.userId) {
          useRadioStore.getState().setUserId(data.userId);
        }
        // حفظ deviceId في localStorage لاستخدامه في تتبع النشاط
        if (data.deviceId) {
          localStorage.setItem('deviceId', data.deviceId);
        }
        setStatus(prev => ({
          ...prev,
          subscribed: true,
          loading: false,
          permission: 'granted',
        }));
        return true;
      } else {
        throw new Error(data.error || 'فشل في الاشتراك');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'فشل في الاشتراك في الإشعارات',
      }));
      return false;
    }
  }, [publicKey, status.permission, requestPermission, userId]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe();

        // Notify server
        await fetch('/api/notifications/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setStatus(prev => ({
        ...prev,
        subscribed: false,
        loading: false,
      }));

      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus(prev => ({
        ...prev,
        loading: false,
        error: 'فشل في إلغاء الاشتراك',
      }));
      return false;
    }
  }, []);

  // Send test notification (now handled directly by the bell component via /api/notifications/test)
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    try {
      const currentUserId = useRadioStore.getState().userId;
      const currentDeviceId = localStorage.getItem('deviceId');
      
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId || undefined,
          deviceId: currentDeviceId || undefined,
        }),
      });

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Test notification error:', error);
      return false;
    }
  }, []);

  // Show local notification (for testing without push)
  const showLocalNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (status.permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-monochrome.png',
        dir: 'rtl',
        lang: 'ar',
        ...options,
      });
      return true;
    } catch (error) {
      console.error('Local notification error:', error);
      return false;
    }
  }, [status.permission]);

  return {
    status,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    showLocalNotification,
  };
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
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
