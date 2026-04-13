import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationService } from '@/lib/notification-service';

// VAPID keys - Hardcoded for production reliability (same as broadcast route)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BDcwJegRw6TYrFWBi4QzXkc2kAN8D8Rb1UufyBW5jS8to1MUqnL1S1kcbC3FzoZx5SKgYccyBpn3AWLfwx_odUc';

// Helper: get or create user for a device (same logic as /api/user/route.ts)
async function getOrCreateUser(deviceId: string, userAgent?: string | null, platform?: string | null): Promise<string> {
  // 1. Try Device table with direct userId link
  const existingDevice = await db.device.findUnique({
    where: { deviceId },
    select: { id: true, userId: true },
  });

  if (existingDevice?.userId) {
    await db.device.update({
      where: { id: existingDevice.id },
      data: { lastSeenAt: new Date() },
    });
    return existingDevice.userId;
  }

  // 2. Check legacy pushSubscription
  const subscription = await db.pushSubscription.findFirst({
    where: { deviceId },
    select: { userId: true },
  });

  if (subscription?.userId) {
    if (existingDevice) {
      await db.device.update({
        where: { id: existingDevice.id },
        data: { userId: subscription.userId, lastSeenAt: new Date() },
      });
    } else {
      await db.device.create({
        data: { deviceId, userId: subscription.userId, userAgent, platform },
      });
    }
    return subscription.userId;
  }

  // 3. Create new user + device
  const newUser = await db.user.create({
    data: {
      name: 'Guest User',
      settings: { create: { language: 'ar', theme: 'light', islamicMode: false, selectedCountry: 'EG', contentFilter: 'all', volume: 0.7, lastPage: 'all', replayBufferEnabled: true, replayBufferMaxDuration: 180 } },
      preferences: { create: { totalListeningTime: 0, sessionsCount: 0, averageSessionDuration: 0, preferredBitrate: 128 } },
      devices: { create: { deviceId, userAgent, platform } },
    },
  });
  return newUser.id;
}

// GET /api/notifications/subscribe - Get VAPID public key (optionally resolve userId from deviceId)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('deviceId');
  
  let resolvedUserId: string | null = null;
  
  // If deviceId is provided, try to resolve the userId
  if (deviceId) {
    try {
      // Try Device table
      const device = await db.device.findUnique({
        where: { deviceId },
        select: { userId: true },
      });
      if (device?.userId) {
        resolvedUserId = device.userId;
      }
      
      // Fallback to pushSubscription table
      if (!resolvedUserId) {
        const subscription = await db.pushSubscription.findFirst({
          where: { deviceId },
          select: { userId: true },
        });
        if (subscription?.userId) {
          resolvedUserId = subscription.userId;
        }
      }
    } catch (error) {
      console.error('Error resolving userId from deviceId:', error);
    }
  }
  
  return NextResponse.json({
    publicKey: VAPID_PUBLIC_KEY,
    ...(resolvedUserId ? { userId: resolvedUserId } : {}),
  });
}

// POST /api/notifications/subscribe - Register push subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subscription, userAgent, deviceId, platform, displayName } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    // Generate deviceId if not provided
    const effectiveDeviceId = deviceId || 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

    // Get or create user for this device
    const effectiveUserId = userId || await getOrCreateUser(effectiveDeviceId, userAgent, platform);

    // Check if subscription already exists by endpoint
    const existingByEndpoint = await db.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    // Check if deviceId already exists (for existing users)
    const existingByDevice = await db.pushSubscription.findUnique({
      where: { deviceId: effectiveDeviceId },
    });

    // Check Device table for existing display name
    const existingDevice = await db.device.findUnique({
      where: { deviceId: effectiveDeviceId },
      select: { displayName: true },
    });

    // Determine the best display name to use
    // Priority: provided displayName > existing subscription > Device table
    const effectiveDisplayName = displayName || 
                                   existingByEndpoint?.displayName || 
                                   existingByDevice?.displayName ||
                                   null;

    if (existingByEndpoint) {
      // Update existing subscription
      const updated = await db.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          userId: effectiveUserId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent,
          deviceId: effectiveDeviceId,
          platform: platform || 'web',
          displayName: effectiveDisplayName,
          lastUsedAt: new Date(),
          isActive: true,
        },
      });

      // Also update Device table
      await db.device.upsert({
        where: { deviceId: effectiveDeviceId },
        create: {
          deviceId: effectiveDeviceId,
          userId: effectiveUserId,
          displayName: effectiveDisplayName,
          userAgent,
          platform: platform || 'web',
        },
        update: {
          displayName: effectiveDisplayName,
          userAgent,
          platform: platform || 'web',
          lastSeenAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        subscriptionId: updated.id,
        userId: effectiveUserId,
        deviceId: effectiveDeviceId,
        displayName: updated.displayName,
        hasName: !!updated.displayName,
      });
    }

    if (existingByDevice) {
      // Update existing device with new endpoint
      const updated = await db.pushSubscription.update({
        where: { deviceId: effectiveDeviceId },
        data: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent,
          platform: platform || 'web',
          displayName: effectiveDisplayName,
          lastUsedAt: new Date(),
          isActive: true,
        },
      });

      // Also update Device table
      await db.device.upsert({
        where: { deviceId: effectiveDeviceId },
        create: {
          deviceId: effectiveDeviceId,
          userId: effectiveUserId,
          displayName: effectiveDisplayName,
          userAgent,
          platform: platform || 'web',
        },
        update: {
          displayName: effectiveDisplayName,
          userAgent,
          platform: platform || 'web',
          lastSeenAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        subscriptionId: updated.id,
        userId: effectiveUserId,
        deviceId: effectiveDeviceId,
        displayName: updated.displayName,
        hasName: !!updated.displayName,
      });
    }

    // Create new subscription
    const newSubscription = await db.pushSubscription.create({
      data: {
        userId: effectiveUserId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
        deviceId: effectiveDeviceId,
        platform: platform || 'web',
        displayName: effectiveDisplayName,
      },
    });

    // Create or update Device record
    await db.device.upsert({
      where: { deviceId: effectiveDeviceId },
      create: {
        deviceId: effectiveDeviceId,
        userId: effectiveUserId,
        displayName: effectiveDisplayName,
        userAgent,
        platform: platform || 'web',
        pushSubscription: {
          connect: { id: newSubscription.id },
        },
      },
      update: {
        displayName: effectiveDisplayName,
        userAgent,
        platform: platform || 'web',
        lastSeenAt: new Date(),
        pushSubscription: {
          connect: { id: newSubscription.id },
        },
      },
    });

    // Initialize notification preferences for this user
    await NotificationService.getOrCreatePreferences(effectiveUserId);

    // Create welcome notification in history so the bell dropdown has content
    try {
      await db.notificationHistory.create({
        data: {
          userId: effectiveUserId,
          type: 'welcome',
          title: 'مرحباً بك في إسمع راديو',
          body: 'تم تفعيل الإشعارات بنجاح! ستتلقى إشعارات مخصصة حسب اهتماماتك.',
          icon: '/icons/icon-192x192.png',
        },
      });
    } catch (e) {
      console.error('Failed to create welcome notification:', e);
    }

    return NextResponse.json({
      success: true,
      subscriptionId: newSubscription.id,
      userId: effectiveUserId,
      deviceId: effectiveDeviceId,
      displayName: newSubscription.displayName,
      hasName: !!newSubscription.displayName,
    });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to register subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/subscribe - Unregister push subscription
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    await db.pushSubscription.update({
      where: { endpoint },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to unregister subscription' },
      { status: 500 }
    );
  }
}
