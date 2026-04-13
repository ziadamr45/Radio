import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notifications/history - Get notification history for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    const deviceId = searchParams.get('deviceId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // ALWAYS try to resolve userId from deviceId (even if userId was provided)
    let resolvedFromDevice: string | null = null;
    if (deviceId) {
      // Try Device table
      try {
        const device = await db.device.findUnique({
          where: { deviceId },
          select: { userId: true },
        });
        if (device?.userId) {
          resolvedFromDevice = device.userId;
        }
      } catch (e) {
        // ignore
      }
      
      // Fallback to pushSubscription table
      if (!resolvedFromDevice) {
        try {
          const subscription = await db.pushSubscription.findFirst({
            where: { deviceId },
            select: { userId: true },
          });
          if (subscription?.userId) {
            resolvedFromDevice = subscription.userId;
            // Backfill device table
            try {
              await db.device.upsert({
                where: { deviceId },
                create: { deviceId, userId: subscription.userId },
                update: { userId: subscription.userId, lastSeenAt: new Date() },
              });
            } catch (e) {
              // ignore
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }

    // Use deviceId-resolved userId as primary (more reliable than client-provided)
    const effectiveUserId = resolvedFromDevice || userId;

    if (!effectiveUserId) {
      // No user could be resolved - return empty with debug info
      console.log('[Notifications] No userId resolved. deviceId:', deviceId, 'clientUserId:', userId);
      return NextResponse.json({
        success: true,
        notifications: [],
        total: 0,
        unread: 0,
        hasMore: false,
        warning: deviceId ? 'no_user_resolved' : 'no_device_id',
      });
    }

    // If client provided a different userId than what deviceId resolves to,
    // the client's userId is stale. Use the resolved one.
    if (userId && resolvedFromDevice && userId !== resolvedFromDevice) {
      console.log(`[Notifications] userId mismatch: client=${userId}, resolved=${resolvedFromDevice}. Using resolved.`);
    }

    // Get notification history
    const notifications = await db.notificationHistory.findMany({
      where: { userId: effectiveUserId },
      take: limit,
      skip: offset,
      orderBy: { sentAt: 'desc' },
    });

    // Get total count
    const total = await db.notificationHistory.count({
      where: { userId: effectiveUserId },
    });

    // Get unread count (notifications not opened)
    const unread = await db.notificationHistory.count({
      where: {
        userId: effectiveUserId,
        openedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      notifications,
      total,
      unread,
      hasMore: offset + notifications.length < total,
      ...(resolvedFromDevice ? { resolvedUserId: resolvedFromDevice } : {}),
    });
  } catch (error) {
    console.error('Get notification history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get notification history', notifications: [], total: 0, unread: 0 },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/history - Mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, deviceId, markAllRead } = body;

    if (markAllRead) {
      // Resolve userId from deviceId if needed
      let effectiveUserId = userId;
      if (!effectiveUserId && deviceId) {
        try {
          const device = await db.device.findUnique({
            where: { deviceId },
            select: { userId: true },
          });
          effectiveUserId = device?.userId;
        } catch (e) {
          // ignore
        }
        
        // Fallback to pushSubscription table
        if (!effectiveUserId) {
          try {
            const subscription = await db.pushSubscription.findFirst({
              where: { deviceId },
              select: { userId: true },
            });
            effectiveUserId = subscription?.userId;
          } catch (e) {
            // ignore
          }
        }
      }

      if (effectiveUserId) {
        // Mark all as read
        await db.notificationHistory.updateMany({
          where: {
            userId: effectiveUserId,
            openedAt: null,
          },
          data: {
            openedAt: new Date(),
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId required' },
        { status: 400 }
      );
    }

    // Mark single notification as read
    await db.notificationHistory.update({
      where: { id: notificationId },
      data: { openedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
