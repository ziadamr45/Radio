'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Bell, 
  BellOff, 
  Sun, 
  Moon, 
  Coffee, 
  Star, 
  BookOpen, 
  Heart,
  Settings,
  Volume2,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationPreferences {
  enabled: boolean;
  morningNotifications: boolean;
  afternoonNotifications: boolean;
  eveningNotifications: boolean;
  nightNotifications: boolean;
  islamicNotifications: boolean;
  reEngagementNotifications: boolean;
  behaviorNotifications: boolean;
  maxNotificationsPerDay: number;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

interface NotificationSettingsProps {
  language?: 'ar' | 'en';
  onClose?: () => void;
}

export function NotificationSettings({ language = 'ar', onClose }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    morningNotifications: true,
    afternoonNotifications: true,
    eveningNotifications: true,
    nightNotifications: false,
    islamicNotifications: true,
    reEngagementNotifications: true,
    behaviorNotifications: true,
    maxNotificationsPerDay: 3,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });
  
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  const isArabic = language === 'ar';

  // Check notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    setIsLoading(true);
    
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        setPushEnabled(permission === 'granted');

        if (permission === 'granted') {
          // Subscribe to push notifications
          const registration = await navigator.serviceWorker.ready;
          
          // Get VAPID public key
          const vapidResponse = await fetch('/api/notifications/subscribe');
          const { publicKey } = await vapidResponse.json();
          
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey,
          });

          // Send subscription to server
          await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: subscription.toJSON(),
              platform: 'web',
            }),
          });
        }
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update preference
  const updatePreference = async (key: keyof NotificationPreferences, value: boolean | number | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    setIsSaving(true);
    try {
      // Save to server
      await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Bell className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {isArabic ? 'إعدادات الإشعارات' : 'Notification Settings'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isArabic ? 'خصص إشعاراتك حسب تفضيلاتك' : 'Customize your notifications'}
            </p>
          </div>
        </div>
        {isSaving && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Push Permission */}
      {permissionStatus !== 'granted' && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {permissionStatus === 'denied' ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <BellOff className="h-5 w-5 text-orange-500" />
                )}
                <div>
                  <p className="font-medium text-sm">
                    {permissionStatus === 'denied' 
                      ? (isArabic ? 'الإشعارات مغلقة' : 'Notifications blocked')
                      : (isArabic ? 'فعّل الإشعارات' : 'Enable notifications')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {permissionStatus === 'denied'
                      ? (isArabic ? 'قم بتفعيلها من إعدادات المتصفح' : 'Enable in browser settings')
                      : (isArabic ? 'احصل على إشعارات مخصصة' : 'Get personalized notifications')}
                  </p>
                </div>
              </div>
              {permissionStatus !== 'denied' && (
                <Button 
                  onClick={requestPermission} 
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isArabic ? 'تفعيل' : 'Enable'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {pushEnabled ? (
                <Bell className="h-5 w-5 text-green-500" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">{isArabic ? 'الإشعارات' : 'Notifications'}</p>
                <p className="text-sm text-muted-foreground">
                  {pushEnabled 
                    ? (isArabic ? 'مفعلة' : 'Enabled')
                    : (isArabic ? 'معطلة' : 'Disabled')}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.enabled && pushEnabled}
              onCheckedChange={(checked) => {
                if (checked && !pushEnabled) {
                  requestPermission();
                } else {
                  updatePreference('enabled', checked);
                }
              }}
              disabled={permissionStatus === 'denied'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Time-based Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {isArabic ? 'إشعارات الوقت' : 'Time-based Notifications'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isArabic ? 'استلم إشعارات في أوقات معينة من اليوم' : 'Receive notifications at specific times'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Morning */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Sun className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{isArabic ? 'الصباح' : 'Morning'}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? '5 ص - 12 م' : '5 AM - 12 PM'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.morningNotifications}
              onCheckedChange={(checked) => updatePreference('morningNotifications', checked)}
            />
          </div>

          {/* Afternoon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Coffee className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{isArabic ? 'الظهيرة' : 'Afternoon'}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? '12 م - 5 م' : '12 PM - 5 PM'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.afternoonNotifications}
              onCheckedChange={(checked) => updatePreference('afternoonNotifications', checked)}
            />
          </div>

          {/* Evening */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Star className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{isArabic ? 'المساء' : 'Evening'}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? '5 م - 9 م' : '5 PM - 9 PM'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.eveningNotifications}
              onCheckedChange={(checked) => updatePreference('eveningNotifications', checked)}
            />
          </div>

          {/* Night */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Moon className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{isArabic ? 'الليل' : 'Night'}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? '9 م - 5 ص' : '9 PM - 5 AM'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.nightNotifications}
              onCheckedChange={(checked) => updatePreference('nightNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" />
            {isArabic ? 'إشعارات خاصة' : 'Special Notifications'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Islamic */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{isArabic ? 'إسلامية' : 'Islamic'}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'أذكار وتلاوات قرآنية' : 'Azkar and Quran recitations'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.islamicNotifications}
              onCheckedChange={(checked) => updatePreference('islamicNotifications', checked)}
            />
          </div>

          {/* Behavior-based */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Settings className="h-4 w-4 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{isArabic ? 'مخصصة' : 'Personalized'}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'بناءً على نشاطك' : 'Based on your activity'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.behaviorNotifications}
              onCheckedChange={(checked) => updatePreference('behaviorNotifications', checked)}
            />
          </div>

          {/* Re-engagement */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-teal-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{isArabic ? 'تفاعل' : 'Re-engagement'}</p>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'تذكيرات عند الغياب' : 'Reminders when away'}
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.reEngagementNotifications}
              onCheckedChange={(checked) => updatePreference('reEngagementNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Frequency */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{isArabic ? 'الحد اليومي' : 'Daily Limit'}</CardTitle>
          <CardDescription className="text-xs">
            {isArabic 
              ? `الحد الأقصى للإشعارات في اليوم: ${preferences.maxNotificationsPerDay}`
              : `Maximum notifications per day: ${preferences.maxNotificationsPerDay}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Slider
            value={[preferences.maxNotificationsPerDay]}
            onValueChange={([value]) => updatePreference('maxNotificationsPerDay', value)}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{isArabic ? 'قليل' : 'Less'}</span>
            <span>{isArabic ? 'كثير' : 'More'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="h-4 w-4" />
            {isArabic ? 'ساعات الهدوء' : 'Quiet Hours'}
          </CardTitle>
          <CardDescription className="text-xs">
            {isArabic ? 'لا إشعارات خلال هذه الفترة' : 'No notifications during this period'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">{isArabic ? 'من' : 'From'}</Label>
              <input
                type="time"
                value={preferences.quietHoursStart || '22:00'}
                onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-background"
              />
            </div>
            <div>
              <Label className="text-xs">{isArabic ? 'إلى' : 'To'}</Label>
              <input
                type="time"
                value={preferences.quietHoursEnd || '08:00'}
                onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border bg-background"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Done Button */}
      {onClose && (
        <Button onClick={onClose} className="w-full">
          <CheckCircle className="h-4 w-4 ms-2" />
          {isArabic ? 'تم' : 'Done'}
        </Button>
      )}
    </div>
  );
}
