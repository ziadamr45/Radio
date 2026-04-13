import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) {
  console.error('[SECURITY] ADMIN_API_KEY environment variable is not set! Admin stats endpoint will be disabled.');
}

// GET /api/admin/stats - Get notification system stats
export async function GET(request: NextRequest) {
  try {
    // التحقق من المفتاح
    const xAdminKey = request.headers.get('x-admin-api-key');
    const xApiKey = request.headers.get('x-api-key');
    const authHeader = request.headers.get('authorization');
    
    const isValidAuth = ADMIN_API_KEY && (
      xAdminKey === ADMIN_API_KEY ||
      xApiKey === ADMIN_API_KEY ||
      authHeader === `Bearer ${ADMIN_API_KEY}`
    );

    if (!isValidAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // حساب الأوقات (توقيت Africa/Cairo)
    const now = new Date();
    const cairoTimeStr = now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
    const cairoDate = new Date(cairoTimeStr);

    const todayStart = new Date(cairoDate);
    todayStart.setHours(0, 0, 0, 0);

    // بداية الأسبوع الحالي (الأحد)
    const dayOfWeek = cairoDate.getDay();
    const thisWeekStart = new Date(todayStart);
    thisWeekStart.setDate(todayStart.getDate() - dayOfWeek);

    // بداية الأسبوع الماضي
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    // 5 دقائق مضت (online)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // ==================== المستخدمين (لهم اسم حقيقي - مش Guest User) ====================
    // المستخدمين اللي غيروا اسمهم من الافتراضي "Guest User" لاسم حقيقي
    const namedWhere = {
      AND: [
        { name: { not: null as string | null } },
        { name: { not: '' } },
        { name: { not: 'Guest User' } },
      ],
    };

    const totalNamedUsers = await db.user.count({ where: namedWhere });
    const namedUsersToday = await db.user.count({
      where: { ...namedWhere, createdAt: { gte: todayStart } },
    });
    const namedUsersThisWeek = await db.user.count({
      where: { ...namedWhere, createdAt: { gte: thisWeekStart } },
    });
    const namedUsersLastWeek = await db.user.count({
      where: { ...namedWhere, createdAt: { gte: lastWeekStart, lt: thisWeekStart } },
    });

    // ==================== المتصفحين (ما حطوش اسم حقيقي بعد) ====================
    // الزوار اللي لسه اسمهم "Guest User" أو فاضي أو null
    const visitorWhere = {
      OR: [
        { name: null },
        { name: '' },
        { name: 'Guest User' },
      ],
    };

    const totalVisitors = await db.user.count({ where: visitorWhere });
    const visitorsToday = await db.user.count({
      where: { ...visitorWhere, createdAt: { gte: todayStart } },
    });
    const visitorsThisWeek = await db.user.count({
      where: { ...visitorWhere, createdAt: { gte: thisWeekStart } },
    });
    const visitorsLastWeek = await db.user.count({
      where: { ...visitorWhere, createdAt: { gte: lastWeekStart, lt: thisWeekStart } },
    });

    // ==================== المشتركين بالإشعارات (فعلوا الإشعارات) ====================
    const subActiveWhere = { isActive: true };

    const totalSubscribers = await db.pushSubscription.count({ where: subActiveWhere });
    const subscribersToday = await db.pushSubscription.count({
      where: { ...subActiveWhere, createdAt: { gte: todayStart } },
    });
    const subscribersThisWeek = await db.pushSubscription.count({
      where: { ...subActiveWhere, createdAt: { gte: thisWeekStart } },
    });
    const subscribersLastWeek = await db.pushSubscription.count({
      where: { ...subActiveWhere, createdAt: { gte: lastWeekStart, lt: thisWeekStart } },
    });

    // ==================== بيانات إضافية ====================
    // متصلين الآن (آخر 5 دقايق)
    const onlineUsers = await db.pushSubscription.count({
      where: { isActive: true, lastUsedAt: { gte: fiveMinutesAgo } },
    });

    // نشطين آخر ساعة
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const activeLastHour = await db.pushSubscription.count({
      where: { isActive: true, lastUsedAt: { gte: oneHourAgo } },
    });

    // الإشعارات المرسلة اليوم
    const notificationsSentToday = await db.notificationHistory.count({
      where: { sentAt: { gte: todayStart } },
    });

    // الاشتراكات حسب المنصة
    const subscriptionsByPlatform = await db.pushSubscription.groupBy({
      by: ['platform'],
      where: { isActive: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      stats: {
        // المستخدمين (لهم اسم - عملوا حساب)
        namedUsers: {
          total: totalNamedUsers,
          today: namedUsersToday,
          thisWeek: namedUsersThisWeek,
          lastWeek: namedUsersLastWeek,
        },

        // المتصفحين (بدون اسم - زوار)
        visitors: {
          total: totalVisitors,
          today: visitorsToday,
          thisWeek: visitorsThisWeek,
          lastWeek: visitorsLastWeek,
        },

        // المشتركين بالإشعارات
        subscribers: {
          total: totalSubscribers,
          today: subscribersToday,
          thisWeek: subscribersThisWeek,
          lastWeek: subscribersLastWeek,
        },

        // بيانات إضافية
        onlineUsers,
        activeLastHour,
        notificationsSentToday,
        subscriptionsByPlatform: subscriptionsByPlatform.reduce((acc, item) => {
          acc[item.platform || 'unknown'] = item._count;
          return acc;
        }, {} as Record<string, number>),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
