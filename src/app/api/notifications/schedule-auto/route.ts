import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationService, getTimeOfDay } from '@/lib/notification-service';

const CRON_SECRET = process.env.CRON_SECRET || process.env.ADMIN_API_KEY;
if (!CRON_SECRET) {
  console.error('[SECURITY] CRON_SECRET or ADMIN_API_KEY environment variable is not set! Schedule-auto endpoint will be disabled.');
}

function checkCronAuth(request: NextRequest): boolean {
  if (!CRON_SECRET) return false;
  const authHeader = request.headers.get('authorization');
  const xAdminKey = request.headers.get('x-admin-api-key');
  return authHeader === `Bearer ${CRON_SECRET}` || xAdminKey === CRON_SECRET;
}

// POST /api/notifications/schedule-auto - Auto-schedule notifications for all users
// This should be called by a daily cron job
export async function POST(request: NextRequest) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Initialize templates if not already done
    await NotificationService.initializeTemplates();
    
    // Get all users with active notification preferences
    const usersWithPrefs = await db.notificationPreference.findMany({
      where: {
        enabled: true,
      },
      include: {
        user: {
          include: {
            pushSubscriptions: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    // Filter users with active push subscriptions
    const activeUsers = usersWithPrefs.filter(
      u => u.user.pushSubscriptions.length > 0
    );

    const results = [];
    const timeOfDay = getTimeOfDay();

    for (const userPref of activeUsers) {
      try {
        // Check if user already has pending notifications
        const existingPending = await db.notificationSchedule.count({
          where: {
            userId: userPref.userId,
            status: 'pending',
          },
        });

        // Skip if already has 2+ pending notifications
        if (existingPending >= 2) {
          results.push({ userId: userPref.userId, skipped: true, reason: 'Has pending notifications' });
          continue;
        }

        // Get personalized notification
        const notification = await NotificationService.getPersonalizedNotification(userPref.userId);

        if (!notification) {
          results.push({ userId: userPref.userId, skipped: true, reason: 'No suitable notification' });
          continue;
        }

        // Get optimal time
        const scheduledFor = await NotificationService.getOptimalNotificationTime(userPref.userId);

        // Schedule the notification
        await NotificationService.scheduleNotification(
          userPref.userId,
          notification,
          scheduledFor
        );

        results.push({
          userId: userPref.userId,
          success: true,
          scheduledFor: scheduledFor.toISOString(),
          type: notification.type,
        });
      } catch (error) {
        console.error(`Failed to schedule for user ${userPref.userId}:`, error);
        results.push({ userId: userPref.userId, error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      totalUsers: activeUsers.length,
      scheduled: results.filter(r => r.success).length,
      skipped: results.filter(r => r.skipped).length,
      errors: results.filter(r => r.error).length,
      results,
    });
  } catch (error) {
    console.error('Auto-schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to auto-schedule notifications' },
      { status: 500 }
    );
  }
}

// GET - Get statistics about notification scheduling
export async function GET(request: NextRequest) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const totalUsers = await db.user.count();
  
  const usersWithPrefs = await db.notificationPreference.count({
    where: { enabled: true },
  });

  const activeSubscriptions = await db.pushSubscription.count({
    where: { isActive: true },
  });

  const pendingNotifications = await db.notificationSchedule.count({
    where: { status: 'pending' },
  });

  const todaySent = await db.notificationHistory.count({
    where: {
      sentAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });

  return NextResponse.json({
    totalUsers,
    usersWithNotifications: usersWithPrefs,
    activeSubscriptions,
    pendingNotifications,
    todaySent,
  });
}
