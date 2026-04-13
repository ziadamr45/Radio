'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRadioStore } from '@/stores/radio-store';
import { Bell, BellRing, Volume2, Clock, Heart, Sparkles, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
// enableNotifications removed - we call Notification.requestPermission() directly
// to ensure it runs in user gesture context

// Storage keys
const STORAGE_KEYS = {
  PROMPT_SHOWN: 'notification-prompt-shown',
  PROMPT_DISMISSED_AT: 'notification-prompt-dismissed-at',
  PROMPT_COUNT: 'notification-prompt-count',
  NOTIFICATION_ENABLED: 'notification-enabled',
};

// Time to wait before showing prompt again (in milliseconds)
const REPROMPT_INTERVAL = 3 * 24 * 60 * 60 * 1000; // 3 days
const MAX_PROMPT_COUNT = 10; // Max times to show the prompt

export function MandatoryNotificationPrompt() {
  const { language } = useRadioStore();
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [promptCount, setPromptCount] = useState(0);

  const isArabic = language === 'ar';

  // Check if we should show the prompt
  const shouldShowPrompt = useCallback(() => {
    // Don't show if notifications are not supported
    if (!('Notification' in window)) {
      return false;
    }

    // Don't show if permission is already granted
    if (Notification.permission === 'granted') {
      return false;
    }

    // Don't show if permission is permanently denied
    if (Notification.permission === 'denied') {
      return false;
    }

    // Check prompt count
    const count = parseInt(localStorage.getItem(STORAGE_KEYS.PROMPT_COUNT) || '0', 10);
    if (count >= MAX_PROMPT_COUNT) {
      return false;
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEYS.PROMPT_DISMISSED_AT);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      if (now - dismissedTime < REPROMPT_INTERVAL) {
        return false;
      }
    }

    return true;
  }, []);

  // Show prompt initially and set up interval
  useEffect(() => {
    // Initial check after 5 seconds delay
    const initialTimeout = setTimeout(() => {
      if (shouldShowPrompt()) {
        setShowDialog(true);
        const count = parseInt(localStorage.getItem(STORAGE_KEYS.PROMPT_COUNT) || '0', 10);
        setPromptCount(count);
      }
    }, 5000);

    // Set up interval to check periodically
    const interval = setInterval(() => {
      if (shouldShowPrompt()) {
        setShowDialog(true);
        const count = parseInt(localStorage.getItem(STORAGE_KEYS.PROMPT_COUNT) || '0', 10);
        setPromptCount(count);
      }
    }, REPROMPT_INTERVAL);

    // Update permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [shouldShowPrompt]);

  // Handle enabling notifications
  // CRITICAL: requestPermission MUST be the FIRST await in the click handler.
  // Any setState or async operation before it will break the user gesture context
  // in Chrome, causing the browser to auto-deny without showing the prompt.
  const handleEnableNotifications = async () => {
    try {
      // Step 1: Request permission FIRST - must be in direct user gesture context
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        setIsLoading(true);

        // Step 2: Save to localStorage
        localStorage.setItem('notification-enabled', 'true');
        localStorage.removeItem('notification-prompt-dismissed-at');

        // Step 3: Register push subscription (async is OK now since permission granted)
        try {
          const { registerPushSubscription } = await import('@/lib/notification-helpers');
          await registerPushSubscription();
        } catch (pushError) {
          console.error('Push registration failed:', pushError);
        }

        // Step 4: Show welcome notification
        try {
          const { showWelcomeNotification } = await import('@/lib/notification-helpers');
          await showWelcomeNotification(isArabic);
        } catch (notifError) {
          console.error('Welcome notification failed:', notifError);
        }

        setShowDialog(false);
        setIsLoading(false);
      }
      // If permission is 'denied' or 'default' (user dismissed), do nothing
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setIsLoading(false);
    }
  };

  // Handle dismissing the dialog
  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEYS.PROMPT_DISMISSED_AT, Date.now().toString());

    const newCount = promptCount + 1;
    localStorage.setItem(STORAGE_KEYS.PROMPT_COUNT, newCount.toString());
    setPromptCount(newCount);

    setShowDialog(false);
  };

  // Don't render anything if permission is granted
  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={(open) => {
      if (!open) {
        handleDismiss();
      }
    }}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <BellRing className="h-8 w-8 text-white animate-bounce" />
          </div>
          <DialogTitle className="text-xl text-center">
            {isArabic ? '🔔 فعّل الإشعارات' : '🔔 Enable Notifications'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            {isArabic
              ? 'الإشعارات ضرورية للحصول على أفضل تجربة في اسمع راديو'
              : 'Notifications are essential for the best experience on Esmaa Radio'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {isArabic ? 'إشعارات ذكية حسب الوقت' : 'Smart time-based notifications'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'صباحاً ومساءً في الأوقات المناسبة' : 'Morning and evening at the right times'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <Volume2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {isArabic ? 'تذكير بالقرآن والأذكار' : 'Quran and Azkar reminders'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'لا تنسى أذكارك اليومية' : 'Never forget your daily Azkar'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Heart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {isArabic ? 'محطات مفضلة جديدة' : 'New favorite stations'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'اقتراحات مخصصة ليك' : 'Personalized recommendations'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {isArabic ? 'محتوى حصري' : 'Exclusive content'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'عروض ومحتوى خاص للمشتركين' : 'Special offers and content for subscribers'}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className={cn(
                "w-full h-12 text-lg font-bold gap-2",
                "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              )}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  {isArabic ? 'جاري التفعيل...' : 'Enabling...'}
                </>
              ) : (
                <>
                  <Bell className="h-5 w-5" />
                  {isArabic ? 'فعّل الإشعارات الآن' : 'Enable Notifications Now'}
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="w-full text-muted-foreground"
            >
              {isArabic ? 'ليس الآن' : 'Not now'}
            </Button>
          </div>

          {/* Show remaining prompts count */}
          {promptCount > 0 && promptCount < MAX_PROMPT_COUNT && (
            <p className="text-xs text-center text-muted-foreground">
              {isArabic
                ? `سيتم تذكيرك مرة أخرى (${MAX_PROMPT_COUNT - promptCount} مرات متبقية)`
                : `We'll remind you again (${MAX_PROMPT_COUNT - promptCount} reminders left)`}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
