import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import webpush from 'web-push';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) {
  console.error('[SECURITY] ADMIN_API_KEY environment variable is not set! Admin endpoints will be disabled.');
}
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@asmaeradio.com';

// Lazy initialization of web-push
let vapidConfigured = false;

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

// التحقق من المصادقة
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

// POST /api/admin/send - Send notification to specific user(s)
export async function POST(request: NextRequest) {
  configureVapid();

  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, userIds, title, body: notificationBody, icon, url } = body;

    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'title and body are required' },
        { status: 400 }
      );
    }

    // تحديد المستخدمين المستهدفين
    let targetUserIds: string[] = [];

    if (userId) {
      targetUserIds = [userId];
    } else if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else {
      return NextResponse.json(
        { error: 'userId or userIds is required' },
        { status: 400 }
      );
    }

    // جلب اشتراكات المستخدمين المستهدفين
    const subscriptions = await db.pushSubscription.findMany({
      where: {
        userId: { in: targetUserIds },
        isActive: true,
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active subscriptions found for target users',
      });
    }

    const BASE_URL = process.env.NEXT_PUBLIC_URL || 'https://esma3radio.vercel.app';
    const defaultIcon = `${BASE_URL}/icons/icon-192x192.png`;
    const badgeUrl = `${BASE_URL}/icons/badge-monochrome.png`;

    // بناء الإشعار
    const notificationPayload = JSON.stringify({
      title,
      body: notificationBody,
      icon: icon || defaultIcon,
      badge: badgeUrl,
      tag: 'admin-' + Date.now(),
      data: {
        deepLink: url || '/',
        timestamp: Date.now(),
      },
    });

    // إرسال الإشعارات
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
            TTL: '86400',
          });

          await db.pushSubscription.update({
            where: { id: sub.id },
            data: { lastUsedAt: new Date() },
          });

          return { success: true, userId: sub.userId };
        } catch (error) {
          if (error instanceof Error && (error.message.includes('410') || error.message.includes('404'))) {
            await db.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            });
          }
          return { success: false, userId: sub.userId, error: String(error) };
        }
      })
    );

    const successCount = results.filter(
      r => r.status === 'fulfilled' && r.value.success
    ).length;

    // تسجيل الإشعار في السجل لجميع المستخدمين المستهدفين (حتى لو الـ push فشل)
    // عشان الإشعار يظهر في قائمة الإشعارات في الجرس دايماً
    const uniqueUserIds = [...new Set(targetUserIds)];
    if (uniqueUserIds.length > 0) {
      await db.notificationHistory.createMany({
        data: uniqueUserIds.map(uid => ({
          userId: uid!,
          type: 'admin_specific',
          title,
          body: notificationBody,
          icon,
          deepLink: url || '/',
        })),
      });
    }

    return NextResponse.json({
      success: successCount > 0,
      sent: successCount,
      total: subscriptions.length,
      targetUsers: targetUserIds.length,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// GET /api/admin/send/users - Get list of users with subscriptions
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // جلب المستخدمين مع عدد اشتراكاتهم
    const users = await db.user.findMany({
      where: {
        pushSubscriptions: {
          some: { isActive: true },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { pushSubscriptions: { where: { isActive: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        name: u.name || 'مستخدم',
        email: u.email || '-',
        subscriptionsCount: u._count.pushSubscriptions,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
}
