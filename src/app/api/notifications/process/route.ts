import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import webpush from 'web-push';

const CRON_SECRET = process.env.CRON_SECRET || process.env.ADMIN_API_KEY;
if (!CRON_SECRET) {
  console.error('[SECURITY] CRON_SECRET or ADMIN_API_KEY environment variable is not set! Process notifications endpoint will be disabled.');
}

function checkCronAuth(request: NextRequest): boolean {
  if (!CRON_SECRET) return false;
  const authHeader = request.headers.get('authorization');
  const xAdminKey = request.headers.get('x-admin-api-key');
  return authHeader === `Bearer ${CRON_SECRET}` || xAdminKey === CRON_SECRET;
}

// Lazy initialization of web-push
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

// POST /api/notifications/process - Process scheduled notifications
// This endpoint should be called by a cron job
export async function POST(request: NextRequest) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  configureVapid();
  
  try {
    // Get pending notifications that are due
    const pendingNotifications = await db.notificationSchedule.findMany({
      where: {
        status: 'pending',
        scheduledFor: {
          lte: new Date(),
        },
      },
      take: 50, // Process max 50 at a time
    });

    if (pendingNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No pending notifications',
      });
    }

    const results = [];

    for (const scheduled of pendingNotifications) {
      try {
        // Get active push subscriptions for this user
        const subscriptions = await db.pushSubscription.findMany({
          where: {
            userId: scheduled.userId,
            isActive: true,
          },
        });

        if (subscriptions.length === 0) {
          // Mark as failed - no subscriptions
          await db.notificationSchedule.update({
            where: { id: scheduled.id },
            data: { status: 'failed' },
          });
          continue;
        }

        // Build notification payload
        const notificationPayload = JSON.stringify({
          title: scheduled.title,
          body: scheduled.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-monochrome.png',
          tag: `scheduled-${scheduled.id}`,
          data: {
            historyId: scheduled.id,
            deepLink: scheduled.deepLink,
            stationId: scheduled.stationId,
            stationName: scheduled.stationName,
            actionText: scheduled.actionText,
          },
          actions: scheduled.actionText ? [
            { action: 'play', title: scheduled.actionText },
            { action: 'dismiss', title: 'لاحقاً' },
          ] : [],
        });

        // Send to all subscriptions
        const sendResults = await Promise.allSettled(
          subscriptions.map(async (sub) => {
            const pushSubscription = {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            };

            await webpush.sendNotification(pushSubscription, notificationPayload, {
              TTL: '86400',
            });

            return { success: true };
          })
        );

        const successCount = sendResults.filter(
          r => r.status === 'fulfilled'
        ).length;

        // ALWAYS record in history (even if push fails, user should see it in bell)
        await db.notificationHistory.create({
          data: {
            userId: scheduled.userId,
            templateId: scheduled.templateId,
            variantId: scheduled.variantId,
            type: scheduled.type,
            title: scheduled.title,
            body: scheduled.body,
            icon: scheduled.icon,
            actionText: scheduled.actionText,
            deepLink: scheduled.deepLink,
            stationId: scheduled.stationId,
            stationName: scheduled.stationName,
          },
        });

        if (successCount > 0) {
          // Mark as sent
          await db.notificationSchedule.update({
            where: { id: scheduled.id },
            data: {
              status: 'sent',
              sentAt: new Date(),
            },
          });
          results.push({ id: scheduled.id, success: true, sent: successCount });
        } else {
          // Mark as failed but history was still saved
          await db.notificationSchedule.update({
            where: { id: scheduled.id },
            data: { status: 'failed' },
          });
          results.push({ id: scheduled.id, success: false });
        }
      } catch (error) {
        console.error(`Failed to process notification ${scheduled.id}:`, error);
        results.push({ id: scheduled.id, success: false, error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    console.error('Process notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to process notifications' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/process - Get scheduled notifications status
export async function GET(request: NextRequest) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pending = await db.notificationSchedule.count({
    where: { status: 'pending' },
  });

  const due = await db.notificationSchedule.count({
    where: {
      status: 'pending',
      scheduledFor: { lte: new Date() },
    },
  });

  const sent = await db.notificationSchedule.count({
    where: { status: 'sent' },
  });

  const failed = await db.notificationSchedule.count({
    where: { status: 'failed' },
  });

  return NextResponse.json({
    pending,
    due,
    sent,
    failed,
  });
}
