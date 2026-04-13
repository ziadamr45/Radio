import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationService } from '@/lib/notification-service';
import webpush from 'web-push';

// Lazy initialization of web-push to avoid build-time errors
let vapidConfigured = false;

function configureVapid() {
  if (vapidConfigured) return;
  
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  
  if (!publicKey || !privateKey) {
    console.warn('VAPID keys not configured - push notifications will not work');
    vapidConfigured = true;
    return;
  }
  
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:asmae-radio@example.com',
    publicKey,
    privateKey
  );
  vapidConfigured = true;
}

// POST /api/notifications/send - Send notification to user(s)
export async function POST(request: NextRequest) {
  // Configure VAPID at runtime, not build time
  configureVapid();
  
  try {
    const body = await request.json();
    const { userId, notification, scheduled } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    // If no notification provided, generate personalized one
    let effectiveNotification = notification;
    if (!effectiveNotification) {
      effectiveNotification = await NotificationService.getPersonalizedNotification(userId);
    }

    if (!effectiveNotification) {
      return NextResponse.json(
        { error: 'No suitable notification found' },
        { status: 400 }
      );
    }

    // If scheduled, create schedule entry
    if (scheduled) {
      const schedule = await NotificationService.scheduleNotification(
        userId,
        effectiveNotification,
        new Date(scheduled)
      );

      return NextResponse.json({
        success: true,
        scheduled: true,
        scheduleId: schedule.id,
        notification: effectiveNotification,
      });
    }

    // Get active push subscriptions for user
    const subscriptions = await db.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active push subscriptions',
      });
    }

    // Record notification in history
    const history = await NotificationService.recordNotificationSent(
      userId,
      effectiveNotification
    );

    // Build notification payload
    const notificationPayload = JSON.stringify({
      title: effectiveNotification.title,
      body: effectiveNotification.body,
      icon: effectiveNotification.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-monochrome.png',
      tag: `notification-${history.id}`,
      data: {
        historyId: history.id,
        deepLink: effectiveNotification.deepLink,
        stationId: effectiveNotification.stationId,
        stationName: effectiveNotification.stationName,
        actionText: effectiveNotification.actionText,
      },
      actions: effectiveNotification.actionText ? [
        {
          action: 'play',
          title: effectiveNotification.actionText,
        },
        {
          action: 'dismiss',
          title: 'لاحقاً',
        },
      ] : [],
    });

    // Send push notifications using web-push
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
          await webpush.sendNotification(pushSubscription, notificationPayload, {
            TTL: '86400', // 24 hours
          });

          // Update last used
          await db.pushSubscription.update({
            where: { id: sub.id },
            data: { lastUsedAt: new Date() },
          });

          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error('Push send error:', error);
          
          // If subscription is invalid (410 Gone), mark as inactive
          if (error instanceof Error && (error.message.includes('410') || error.message.includes('404'))) {
            await db.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            });
          }
          
          return { success: false, endpoint: sub.endpoint, error: String(error) };
        }
      })
    );

    const successCount = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length;

    return NextResponse.json({
      success: successCount > 0,
      sent: successCount,
      total: subscriptions.length,
      historyId: history.id,
      notification: effectiveNotification,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/send - Get scheduled notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');

    const scheduled = await db.notificationSchedule.findMany({
      where: {
        status,
        scheduledFor: {
          lte: new Date(),
        },
      },
      take: limit,
      orderBy: { scheduledFor: 'asc' },
    });

    return NextResponse.json({
      success: true,
      count: scheduled.length,
      notifications: scheduled,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch scheduled notifications' },
      { status: 500 }
    );
  }
}
