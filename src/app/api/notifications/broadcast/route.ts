import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import webpush from 'web-push';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) {
  console.error('[SECURITY] ADMIN_API_KEY environment variable is not set! Broadcast endpoints will be disabled.');
}

// VAPID Keys - Must be set via environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@asmaeradio.com';

// Lazy initialization of web-push
let vapidConfigured = false;

// Base URL for notification icons
const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://esma3radio.vercel.app';

function configureVapid() {
  if (vapidConfigured) return;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured');
    vapidConfigured = true;
    return;
  }

  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  vapidConfigured = true;
}

// التحقق من المصادقة - Support multiple auth methods
function checkAuth(request: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  
  const xAdminKey = request.headers.get('x-admin-api-key');
  const xApiKey = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');
  
  return (
    xAdminKey === ADMIN_API_KEY ||
    xApiKey === ADMIN_API_KEY ||
    authHeader === `Bearer ${ADMIN_API_KEY}`
  );
}

// POST /api/notifications/broadcast - Send notification to ALL subscribers
export async function POST(request: NextRequest) {
  configureVapid();

  try {
    // التحقق من المصادقة
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, body: notificationBody, message, icon, url } = body;

    // Support both 'body' and 'message' fields
    const notificationText = notificationBody || message;

    if (!title || !notificationText) {
      return NextResponse.json(
        { error: 'title and body/message are required' },
        { status: 400 }
      );
    }

    // Get ALL active push subscriptions
    const subscriptions = await db.pushSubscription.findMany({
      where: { isActive: true },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active subscribers',
        sent: 0,
        total: 0,
      });
    }

    const badgeUrl = `${BASE_URL}/icons/badge-monochrome.png`;
    const defaultIcon = `${BASE_URL}/icons/icon-192x192.png`;

    // Use full URL for icon - handle base64 data URLs and regular URLs
    let iconUrl: string = defaultIcon;
    let useCustomIcon = false;

    if (icon) {
      if (icon.startsWith('data:')) {
        const estimatedSize = icon.length + 200 + title.length + notificationText.length;
        if (estimatedSize < 3500) {
          iconUrl = icon;
          useCustomIcon = true;
        } else {
          console.warn('Base64 image too large for web push payload, using default icon');
          console.warn('Image size:', Math.round(icon.length / 1024), 'KB');
        }
      } else if (icon.startsWith('http')) {
        iconUrl = icon;
        useCustomIcon = true;
      } else {
        iconUrl = `${BASE_URL}${icon}`;
        useCustomIcon = true;
      }
    }

    // Build notification payload
    const notificationPayload = JSON.stringify({
      title,
      body: notificationText,
      icon: iconUrl,
      badge: badgeUrl,
      ...(useCustomIcon && !iconUrl.startsWith('data:') && { image: iconUrl }),
      tag: 'broadcast-' + Date.now(),
      data: {
        deepLink: url || '/',
        timestamp: Date.now(),
      },
    });

    // Determine final payload
    let finalPayload = notificationPayload;
    let finalIconUrl = iconUrl;

    const payloadSize = Buffer.byteLength(notificationPayload, 'utf8');
    if (payloadSize > 4096) {
      console.warn('Payload too large:', payloadSize, 'bytes. Using default icon only.');
      finalPayload = JSON.stringify({
        title,
        body: notificationText,
        icon: defaultIcon,
        badge: badgeUrl,
        tag: 'broadcast-' + Date.now(),
        data: {
          deepLink: url || '/',
          timestamp: Date.now(),
        },
      });
      finalIconUrl = defaultIcon;
    }

    // Send to all subscribers
    const failureReasons: string[] = [];
    const staleSubIds: string[] = [];

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, finalPayload, {
            TTL: '86400',
          });

          await db.pushSubscription.update({
            where: { id: sub.id },
            data: { lastUsedAt: new Date() },
          });

          return { success: true, userId: sub.userId };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          if (errMsg.includes('410') || errMsg.includes('404')) {
            // اشتراك منتهي الصلاحية - نشطله
            staleSubIds.push(sub.id);
            failureReasons.push(`اشتراك منتهي: ${sub.displayName || sub.deviceId || 'جهاز غير معروف'}`);
          } else if (errMsg.includes('403') || errMsg.includes('401')) {
            failureReasons.push(`إذن مرفوض: ${sub.displayName || sub.deviceId || 'جهاز غير معروف'}`);
          } else if (errMsg.includes('413')) {
            failureReasons.push('حجم الإشعار كبير جداً');
          } else {
            failureReasons.push(`فشل إرسال: ${errMsg.substring(0, 80)}`);
          }
          return { success: false, userId: sub.userId, error: errMsg };
        }
      })
    );

    // تنظيف الاشتراكات المنتهية دفعة واحدة
    if (staleSubIds.length > 0) {
      await db.pushSubscription.updateMany({
        where: { id: { in: staleSubIds } },
        data: { isActive: false },
      });
    }

    const successCount = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length;

    // Log to notification history for ALL subscribers (not just successful pushes)
    // This ensures the bell dropdown always shows the notification even if push delivery failed
    const allUserIds = subscriptions
      .map(sub => sub.userId)
      .filter(Boolean);

    const uniqueUserIds = [...new Set(allUserIds)];
    if (uniqueUserIds.length > 0) {
      await db.notificationHistory.createMany({
        data: uniqueUserIds.map(uid => ({
          userId: uid!,
          type: 'admin_broadcast',
          title,
          body: notificationText,
          icon: finalIconUrl,
          deepLink: url || '/',
        })),
      });
    }

    const failedCount = subscriptions.length - successCount;

    return NextResponse.json({
      success: successCount > 0,
      sent: successCount,
      total: subscriptions.length,
      failed: failedCount,
      usedCustomIcon: finalIconUrl !== defaultIcon,
      details: {
        activeSubscriptions: subscriptions.length,
        successfulSends: successCount,
        failedSends: failedCount,
        staleCleaned: staleSubIds.length,
        payloadSize: Buffer.byteLength(finalPayload, 'utf8'),
        customImageUsed: finalIconUrl !== defaultIcon && finalIconUrl.startsWith('data:'),
        failureReasons: failureReasons.length > 5 ? failureReasons.slice(0, 5).concat(`... و${failureReasons.length - 5} فشل آخر`) : failureReasons,
      },
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast' },
      { status: 500 }
    );
  }
}
