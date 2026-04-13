import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notifications/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    let preferences = await db.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Create default preferences
      preferences = await db.notificationPreference.create({
        data: { userId },
      });
    }

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/preferences - Update user preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    // Filter valid fields
    const validFields = [
      'enabled',
      'morningNotifications',
      'afternoonNotifications',
      'eveningNotifications',
      'nightNotifications',
      'islamicNotifications',
      'reEngagementNotifications',
      'behaviorNotifications',
      'maxNotificationsPerDay',
      'quietHoursStart',
      'quietHoursEnd',
      'preferredLanguage',
    ];

    const filteredUpdates: Record<string, unknown> = {};
    for (const key of validFields) {
      if (key in updates) {
        filteredUpdates[key] = updates[key];
      }
    }

    const preferences = await db.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...filteredUpdates,
      },
      update: filteredUpdates,
    });

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Failed to update preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
