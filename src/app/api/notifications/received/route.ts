import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/notifications/received
// Called by the service worker when a push notification is received
// This ensures notifications sent from external sources (like the admin site)
// are also saved to the notificationHistory so they appear in the bell dropdown
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, title, body: notificationBody, icon, tag, data } = body;

    if (!endpoint || !title) {
      return NextResponse.json(
        { error: 'endpoint and title are required' },
        { status: 400 }
      );
    }

    // Look up the userId by push subscription endpoint
    const subscription = await db.pushSubscription.findUnique({
      where: { endpoint },
      select: { userId: true, deviceId: true },
    });

    if (!subscription?.userId) {
      console.log('[Received] No subscription found for endpoint:', endpoint);
      return NextResponse.json({ success: false, error: 'subscription_not_found' });
    }

    const userId = subscription.userId;

    // Check if this notification was already recorded (avoid duplicates)
    // Use tag or title+body+recent time as dedup key
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const existingNotification = await db.notificationHistory.findFirst({
      where: {
        userId,
        title,
        sentAt: { gte: fiveMinutesAgo },
      },
    });

    if (existingNotification) {
      console.log('[Received] Duplicate notification skipped for user:', userId);
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Save to notification history
    await db.notificationHistory.create({
      data: {
        userId,
        type: tag ? `push_${tag}` : 'push_received',
        title,
        body: notificationBody || '',
        icon: icon || null,
        deepLink: data?.deepLink || data?.url || null,
        stationId: data?.stationId || null,
        stationName: data?.stationName || null,
      },
    });

    console.log('[Received] Notification saved to history for user:', userId, 'title:', title);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Received] Save notification error:', error);
    return NextResponse.json(
      { error: 'Failed to save notification' },
      { status: 500 }
    );
  }
}
