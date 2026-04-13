'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRadioStore } from '@/stores/radio-store';
import {
  Bell,
  BellOff,
  BellRing,
  Check,
  Clock,
  Radio,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { urlBase64ToUint8Array, getDeviceId } from '@/lib/notification-helpers';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  icon: string | null;
  type: string;
  stationId: string | null;
  stationName: string | null;
  deepLink: string | null;
  sentAt: Date;
  openedAt: Date | null;
}

interface NotificationPermissionProps {
  showAsCard?: boolean;
  onComplete?: () => void;
  autoRequest?: boolean;
  headerOnly?: boolean;
}

// getDeviceId is now imported from notification-helpers (auto-generates if missing)

// Simple notification status check
function useNotificationSupported() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermissionState>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
      setSupported(isSupported);
      
      if (!isSupported) {
        setChecked(true);
        return;
      }

      const perm = Notification.permission as NotificationPermissionState;
      setPermission(perm);

      // Check if has active push subscription
      if (perm === 'granted') {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          setSubscribed(!!sub);
        } catch {
          setSubscribed(false);
        }
      }
      setChecked(true);
    };
    check();
  }, []);

  // Re-check when permission changes - use render-phase reset pattern
  const latestPermission = checked && typeof Notification !== 'undefined' 
    ? (Notification.permission as NotificationPermissionState)
    : permission;

  const refresh = useCallback(async () => {
    if ('Notification' in window) {
      setPermission(Notification.permission as NotificationPermissionState);
      if (Notification.permission === 'granted') {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.getSubscription();
          setSubscribed(!!sub);
        } catch {
          setSubscribed(false);
        }
      }
    }
  }, []);

  return { supported, permission: latestPermission, subscribed, checked, refresh };
}

type NotificationPermissionState = 'default' | 'granted' | 'denied';

export function NotificationPermission({ showAsCard = false, onComplete, autoRequest = false, headerOnly = false }: NotificationPermissionProps) {
  const { language } = useRadioStore();
  const { supported, permission, subscribed, checked, refresh } = useNotificationSupported();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const mountedRef = useRef(false);

  const isArabic = language === 'ar';

  // Track if component is mounted
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Fetch notifications - robust version that always works with deviceId
  // (Defined BEFORE the useEffect that depends on it to avoid TDZ error)
  const fetchNotifications = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setIsLoadingNotifications(true);
    setFetchError(false);
    
    try {
      const deviceId = getDeviceId();
      const params = new URLSearchParams();
      params.set('limit', '20');
      
      // Always include deviceId - this is the most reliable identifier
      if (deviceId) {
        params.set('deviceId', deviceId);
      }
      
      // Also include userId if available (as fallback)
      const storeUserId = useRadioStore.getState().userId;
      if (storeUserId) {
        params.set('userId', storeUserId);
      }
      
      console.log('[Bell] Fetching notifications with deviceId:', deviceId, 'userId:', storeUserId);

      const response = await fetch(`/api/notifications/history?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('[Bell] Response:', { success: data.success, count: data.notifications?.length, unread: data.unread });
      
      if (data.success) {
        // Sync resolved userId back to store
        if (data.resolvedUserId && data.resolvedUserId !== useRadioStore.getState().userId) {
          console.log('[Bell] Syncing userId:', data.resolvedUserId);
          useRadioStore.getState().setUserId(data.resolvedUserId);
        }
        
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread || 0);
        setFetchError(false);
      } else {
        console.error('[Bell] API error:', data.error);
        setFetchError(true);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('[Bell] Fetch error:', error);
      setFetchError(true);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      if (mountedRef.current) {
        setIsLoadingNotifications(false);
      }
    }
  }, []);

  // Track last known unread count in localStorage for cross-tab persistence
  const LAST_UNREAD_KEY = 'notification_unread_count';
  const LAST_UNREAD_TIMESTAMP_KEY = 'notification_unread_timestamp';

  // Listen for service worker messages about new notifications
  useEffect(() => {
    if (!headerOnly) return;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_RECEIVED') {
        console.log('[Bell] New notification received from SW:', event.data.title);
        setUnreadCount(prev => prev + 1);
        // Save to localStorage for cross-tab sync
        try {
          const current = parseInt(localStorage.getItem(LAST_UNREAD_KEY) || '0', 10);
          const newCount = current + 1;
          localStorage.setItem(LAST_UNREAD_KEY, String(newCount));
          localStorage.setItem(LAST_UNREAD_TIMESTAMP_KEY, String(Date.now()));
        } catch {
          // ignore
        }
        if (showNotifications) {
          fetchNotifications();
        }
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleMessage);
  }, [headerOnly, showNotifications, fetchNotifications]);

  // Fetch when dialog opens
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications, fetchNotifications]);

  // Read initial unread count from localStorage (instant, no network needed)
  useEffect(() => {
    if (!headerOnly) return;
    try {
      const savedCount = localStorage.getItem(LAST_UNREAD_KEY);
      const savedTimestamp = localStorage.getItem(LAST_UNREAD_TIMESTAMP_KEY);
      // Only use cached count if it's less than 2 minutes old (avoid stale data)
      if (savedCount && savedTimestamp) {
        const age = Date.now() - parseInt(savedTimestamp, 10);
        if (age < 120000) {
          const count = parseInt(savedCount, 10);
          if (count > 0) setUnreadCount(count);
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, [headerOnly]);

  // Listen for storage events from other tabs (cross-tab sync)
  useEffect(() => {
    if (!headerOnly) return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LAST_UNREAD_KEY && event.newValue !== null) {
        const newCount = parseInt(event.newValue, 10);
        setUnreadCount(prev => Math.max(prev, newCount));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [headerOnly]);

  // Fetch unread count in background after mount + periodic refresh
  useEffect(() => {
    if (!headerOnly || !checked) return;
    
    const fetchUnreadCount = async () => {
      if (!mountedRef.current) return;
      
      try {
        const deviceId = getDeviceId();
        const params = new URLSearchParams();
        params.set('limit', '1');
        if (deviceId) params.set('deviceId', deviceId);
        
        const storeUserId = useRadioStore.getState().userId;
        if (storeUserId) params.set('userId', storeUserId);
        
        const response = await fetch(`/api/notifications/history?${params.toString()}`);
        const data = await response.json();
        if (data.success && typeof data.unread === 'number') {
          setUnreadCount(data.unread);
          // Save to localStorage for instant display on next page load
          if (data.unread > 0) {
            localStorage.setItem(LAST_UNREAD_KEY, String(data.unread));
            localStorage.setItem(LAST_UNREAD_TIMESTAMP_KEY, String(Date.now()));
          } else {
            localStorage.removeItem(LAST_UNREAD_KEY);
            localStorage.removeItem(LAST_UNREAD_TIMESTAMP_KEY);
          }
        }
      } catch {
        // Silent fail for background fetch
      }
    };
    
    // Initial fetch after 1.5 seconds (faster than before)
    const initialTimer = setTimeout(fetchUnreadCount, 1500);
    
    // Then refresh every 15 seconds while tab is visible (much more frequent)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    }, 15000);
    
    // Also refresh when tab becomes visible (focus/switch back)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    
    // Also refresh when tab gains focus (user clicks back to tab)
    const handleFocus = () => {
      fetchUnreadCount();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [headerOnly, checked]);

  // Handle bell click
  const handleBellClick = async () => {
    if (!supported) return;
    
    // If not subscribed and not denied, try to enable
    if (!subscribed && permission === 'default') {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          // Try to subscribe with proper VAPID key
          try {
            const reg = await navigator.serviceWorker.ready;
            
            // Get VAPID public key from server first
            const vapidResponse = await fetch('/api/notifications/subscribe');
            const { publicKey } = await vapidResponse.json();
            
            if (!publicKey) {
              console.error('[Bell] No VAPID public key available');
              refresh();
              return;
            }
            
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
            
            // Send to server
            const response = await fetch('/api/notifications/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subscription: sub.toJSON(),
                deviceId: getDeviceId(),
                userAgent: navigator.userAgent,
                platform: 'web',
              }),
            });
            
            const data = await response.json();
            if (data.success && data.userId) {
              useRadioStore.getState().setUserId(data.userId);
              // Save server-returned deviceId to localStorage if it was generated server-side
              if (data.deviceId) {
                localStorage.setItem('deviceId', data.deviceId);
              }
              console.log('[Bell] Subscribed successfully, userId:', data.userId, 'deviceId:', data.deviceId);
            }
            
            refresh();
          } catch (e) {
            console.error('[Bell] Subscribe error:', e);
            refresh();
          }
        } else {
          refresh();
        }
      } catch (e) {
        console.error('[Bell] Permission error:', e);
        refresh();
      }
    }
    
    // Always open the dialog
    setShowNotifications(true);
  };

  const handleMarkAllRead = async () => {
    try {
      const deviceId = getDeviceId();
      const userId = useRadioStore.getState().userId;
      const body: Record<string, unknown> = { markAllRead: true };
      if (userId) body.userId = userId;
      else if (deviceId) body.deviceId = deviceId;

      await fetch('/api/notifications/history', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, openedAt: n.openedAt || new Date() })));
      setUnreadCount(0);
      // Clear localStorage cache
      try {
        localStorage.removeItem(LAST_UNREAD_KEY);
        localStorage.removeItem(LAST_UNREAD_TIMESTAMP_KEY);
      } catch {
        // ignore
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isArabic ? 'الآن' : 'Now';
    if (diffMins < 60) return isArabic ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isArabic ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    if (diffDays < 7) return isArabic ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US');
  };

  // ===== Header Mode - Bell icon in header =====
  if (headerOnly) {
    // Always show bell once checked, even if not supported (just disabled)
    if (!checked) return null;

    const isDenied = permission === 'denied';
    const isGranted = subscribed;
    
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBellClick}
          className="relative"
          title={isDenied 
            ? (isArabic ? 'الإشعارات محظورة من المتصفح' : 'Notifications blocked by browser')
            : isGranted 
              ? (isArabic ? 'الإشعارات' : 'Notifications')
              : (isArabic ? 'تفعيل الإشعارات' : 'Enable notifications')
          }
          aria-label={isArabic ? 'الإشعارات' : 'Notifications'}
        >
          {isDenied ? (
            <BellOff className="h-5 w-5 text-red-400" />
          ) : isGranted ? (
            <BellRing className="h-5 w-5 text-green-600" />
          ) : (
            <Bell className="h-5 w-5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Notifications Dialog */}
        <Dialog open={showNotifications} onOpenChange={(open) => {
          setShowNotifications(open);
          if (!open) setFetchError(false);
        }}>
          <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader className="shrink-0">
              <DialogTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {isGranted ? (
                    <BellRing className="h-5 w-5 text-green-600" />
                  ) : isDenied ? (
                    <BellOff className="h-5 w-5 text-red-400" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                  {isArabic ? 'الإشعارات' : 'Notifications'}
                </span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {unreadCount} {isArabic ? 'غير مقروء' : 'unread'}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                {isArabic ? 'إشعاراتك الأخيرة' : 'Your recent notifications'}
              </DialogDescription>
            </DialogHeader>
            
            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-2">
              {isLoadingNotifications ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : fetchError ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-yellow-500 opacity-50" />
                  <p className="text-muted-foreground mb-3">
                    {isArabic ? 'فشل في تحميل الإشعارات' : 'Failed to load notifications'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchNotifications}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {isArabic ? 'إعادة المحاولة' : 'Retry'}
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>{isArabic ? 'لا توجد إشعارات بعد' : 'No notifications yet'}</p>
                  <p className="text-xs mt-1 opacity-60">
                    {isArabic 
                      ? 'ستظهر الإشعارات المرسلة إليك هنا' 
                      : 'Notifications sent to you will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => {
                    // Resolve icon URL - handle both relative and absolute
                    let iconSrc: string | null = null;
                    if (notification.icon) {
                      if (notification.icon.startsWith('http') || notification.icon.startsWith('data:')) {
                        iconSrc = notification.icon;
                      } else if (notification.icon.startsWith('/')) {
                        iconSrc = (typeof window !== 'undefined' ? window.location.origin : '') + notification.icon;
                      }
                    }
                    const defaultIcon = (typeof window !== 'undefined' ? window.location.origin : '') + '/icons/icon-192x192.png';
                    
                    return (
                    <div
                      key={notification.id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer",
                        notification.openedAt 
                          ? "bg-muted/30 border-transparent hover:bg-muted/50" 
                          : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                      )}
                      onClick={() => {
                        // Mark as read
                        if (!notification.openedAt) {
                          fetch(`/api/notifications/history`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notificationId: notification.id }),
                          }).catch(() => {});
                          setNotifications(prev => prev.map(n => 
                            n.id === notification.id ? { ...n, openedAt: new Date() } : n
                          ));
                          setUnreadCount(prev => Math.max(0, prev - 1));
                          try {
                            localStorage.setItem(LAST_UNREAD_KEY, String(Math.max(0, unreadCount - 1)));
                            localStorage.setItem(LAST_UNREAD_TIMESTAMP_KEY, String(Date.now()));
                          } catch {}
                          if (unreadCount - 1 <= 0) {
                            try {
                              localStorage.removeItem(LAST_UNREAD_KEY);
                              localStorage.removeItem(LAST_UNREAD_TIMESTAMP_KEY);
                            } catch {}
                          }
                        }
                        // Navigate to deep link (only if it's not homepage)
                        if (notification.deepLink && notification.deepLink !== '/' && notification.deepLink !== '') {
                          setShowNotifications(false);
                          window.location.href = notification.deepLink;
                        }
                      }}
                    >
                      <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-muted">
                        {iconSrc ? (
                          <img
                            src={iconSrc}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.onerror = null;
                              img.src = defaultIcon;
                            }}
                          />
                        ) : (
                          <img
                            src={defaultIcon}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[13px] leading-snug">
                          {notification.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(notification.sentAt)}
                          </span>
                          {notification.stationName && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-[10px] text-primary truncate max-w-[100px]">
                                {notification.stationName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {!notification.openedAt && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {unreadCount > 0 && (
              <>
                <Separator className="shrink-0" />
                <div className="shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllRead}
                    className="w-full"
                  >
                    <Check className="h-4 w-4 me-2" />
                    {isArabic ? 'تحديد الكل كمقروء' : 'Mark all read'}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // ===== Settings Mode =====
  // Already subscribed
  if (subscribed) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-400">
              {isArabic ? 'الإشعارات مفعلة' : 'Notifications enabled'}
            </span>
          </div>
          <Badge variant="default" className="bg-green-600">
            <Check className="h-3 w-3 me-1" />
            {isArabic ? 'نشط' : 'Active'}
          </Badge>
        </div>
      </div>
    );
  }

  // Enable button for settings
  return (
    <div className="space-y-3">
      <Button
        variant="default"
        size="lg"
        onClick={async () => {
          try {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
              // Get VAPID key from server
              const vapidResponse = await fetch('/api/notifications/subscribe');
              const { publicKey } = await vapidResponse.json();
              if (!publicKey) { console.error('No VAPID key'); refresh(); return; }

              const reg = await navigator.serviceWorker.ready;
              const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
              });
              await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subscription: sub.toJSON(),
                  deviceId: getDeviceId(),
                  userAgent: navigator.userAgent,
                  platform: 'web',
                }),
              });
              refresh();
              if (onComplete) onComplete();
            }
          } catch (e) {
            console.error('Subscribe error:', e);
          }
        }}
        className="w-full gap-2"
      >
        <Bell className="h-5 w-5" />
        {isArabic ? 'تفعيل الإشعارات' : 'Enable Notifications'}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        {isArabic 
          ? 'احصل على إشعارات مخصصة حسب وقتك واهتماماتك' 
          : 'Get personalized notifications based on your time and interests'}
      </p>
    </div>
  );
}
