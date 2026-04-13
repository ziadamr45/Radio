import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
  // If a Device already exists with this deviceId but no userId, update it instead of creating
  if (existingDevice) {
    const newUser = await db.user.create({
      data: {
        name: 'Guest User',
        settings: { create: { language: 'ar', theme: 'light', islamicMode: false, selectedCountry: 'EG', contentFilter: 'all', volume: 0.7, lastPage: 'all', replayBufferEnabled: true, replayBufferMaxDuration: 180 } },
        preferences: { create: { totalListeningTime: 0, sessionsCount: 0, averageSessionDuration: 0, preferredBitrate: 128 } },
      },
    });
    await db.device.update({
      where: { id: existingDevice.id },
      data: { userId: newUser.id, lastSeenAt: new Date() },
    });
    return newUser.id;
  }

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

// POST /api/notifications/update-name - Update display name for a device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, displayName } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Trim and validate the name
    const trimmedName = displayName.trim().substring(0, 50); // Max 50 characters

    // Get or create user for this device (ensures a valid userId exists)
    const userId = await getOrCreateUser(deviceId);

    // Update the User's name
    await db.user.update({
      where: { id: userId },
      data: { name: trimmedName },
    });

    // Create or update the device record with the name
    const updatedDevice = await db.device.upsert({
      where: { deviceId },
      create: {
        deviceId,
        userId,
        displayName: trimmedName,
      },
      update: {
        displayName: trimmedName,
        lastSeenAt: new Date(),
      },
    });

    // Then, update all push subscriptions for this device (displayName + userId)
    try {
      await db.pushSubscription.updateMany({
        where: { deviceId },
        data: { displayName: trimmedName, userId },
      });
    } catch (e) {
      console.log('No push subscriptions to update for device:', deviceId);
    }

    return NextResponse.json({
      success: true,
      displayName: updatedDevice.displayName,
      message: 'Name saved successfully',
    });
  } catch (error) {
    console.error('Error updating display name:', error);
    return NextResponse.json(
      { error: 'Failed to update display name' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/update-name - Get display name for a device
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Device ID is required' },
        { status: 400 }
      );
    }

    // First check Device table
    const device = await db.device.findUnique({
      where: { deviceId },
      select: { displayName: true, createdAt: true },
    });

    // Also check pushSubscription as fallback
    const subscription = await db.pushSubscription.findFirst({
      where: { deviceId },
      select: { displayName: true, createdAt: true },
    });

    // Return the first available display name
    const displayName = device?.displayName || subscription?.displayName || null;

    return NextResponse.json({
      success: true,
      displayName,
      createdAt: device?.createdAt || subscription?.createdAt || null,
    });
  } catch (error) {
    console.error('Error getting display name:', error);
    return NextResponse.json(
      { error: 'Failed to get display name' },
      { status: 500 }
    );
  }
}
