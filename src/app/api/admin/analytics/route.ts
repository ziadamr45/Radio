import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) {
  console.error('[SECURITY] ADMIN_API_KEY environment variable is not set! Admin analytics endpoint will be disabled.');
}

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

// GET /api/admin/analytics - شامل كل التحليلات
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const cairoTimeStr = now.toLocaleString('en-US', { timeZone: 'Africa/Cairo' });
    const cairoDate = new Date(cairoTimeStr);

    const todayStart = new Date(cairoDate);
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(todayStart.getDate() - 7);

    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(todayStart.getDate() - 30);

    // ==================== 1. تحليلات الإشعارات ====================
    let notifications: Record<string, unknown> = {
      totalSent: 0, totalOpened: 0, totalClicked: 0, totalConverted: 0,
      openRate: '0', clickRate: '0', conversionRate: '0',
      sentToday: 0, openedToday: 0, sentLast7Days: 0, openedLast7Days: 0,
      topNotifications: [], dailyMetrics: [], unreadByUser: [],
      scheduled: { list: [], stats: { pending: 0, sent: 0, failed: 0, cancelled: 0 } },
    };

    try {
      const totalSent = await db.notificationHistory.count();
      const totalOpened = await db.notificationHistory.count({ where: { openedAt: { not: null } } });
      const totalClicked = await db.notificationHistory.count({ where: { clickedAt: { not: null } } });
      const totalConverted = await db.notificationHistory.count({ where: { conversionAt: { not: null } } });

      const sentToday = await db.notificationHistory.count({ where: { sentAt: { gte: todayStart } } });
      const openedToday = await db.notificationHistory.count({ where: { openedAt: { gte: todayStart } } });
      const clickedToday = await db.notificationHistory.count({ where: { clickedAt: { gte: todayStart } } });

      const sentLast7Days = await db.notificationHistory.count({ where: { sentAt: { gte: sevenDaysAgo } } });
      const openedLast7Days = await db.notificationHistory.count({ where: { openedAt: { gte: sevenDaysAgo } } });

      // أفضل 20 إشعار
      const topNotifications = await db.notificationHistory.findMany({
        where: { openedAt: { not: null } },
        select: { title: true, body: true, sentAt: true, openedAt: true, clickedAt: true, conversionAt: true, type: true },
        orderBy: { sentAt: 'desc' },
        take: 20,
      });

      // إحصائيات يومية لآخر 30 يوم
      const dailyMetrics = await db.notificationMetric.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'asc' },
      });

      // المستخدمين الأكثر عدم قراءة
      const unreadStats = await db.notificationHistory.groupBy({
        by: ['userId'],
        where: { openedAt: null },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      });

      const unreadUserIds = unreadStats.map(u => u.userId);
      const unreadUsers = unreadUserIds.length > 0
        ? await db.user.findMany({
            where: { id: { in: unreadUserIds } },
            select: { id: true, name: true },
          })
        : [];
      const userMap = new Map(unreadUsers.map(u => [u.id, u.name || 'زائر']));

      // الإشعارات المجدولة
      const scheduledNotifications = await db.notificationSchedule.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          type: true,
          title: true,
          scheduledFor: true,
          status: true,
          sentAt: true,
          user: { select: { name: true } },
        },
      });

      const scheduledStats = {
        pending: await db.notificationSchedule.count({ where: { status: 'pending' } }),
        sent: await db.notificationSchedule.count({ where: { status: 'sent' } }),
        failed: await db.notificationSchedule.count({ where: { status: 'failed' } }),
        cancelled: await db.notificationSchedule.count({ where: { status: 'cancelled' } }),
      };

      notifications = {
        totalSent, totalOpened, totalClicked, totalConverted,
        openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0',
        clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0',
        conversionRate: totalSent > 0 ? ((totalConverted / totalSent) * 100).toFixed(1) : '0',
        sentToday, openedToday, sentLast7Days, openedLast7Days,
        topNotifications: topNotifications.map(n => ({
          title: n.title, type: n.type, sentAt: n.sentAt,
          opened: n.openedAt !== null, clicked: n.clickedAt !== null, converted: n.conversionAt !== null,
        })),
        dailyMetrics: dailyMetrics.map(m => ({
          date: m.date, type: m.type, sent: m.totalSent, opened: m.totalOpened, clicked: m.totalClicked,
          openRate: m.openRate?.toFixed(1) || '0', clickRate: m.clickRate?.toFixed(1) || '0',
        })),
        unreadByUser: unreadStats.map(u => ({
          userId: u.userId, userName: userMap.get(u.userId) || 'زائر', unreadCount: u._count.id,
        })),
        scheduled: { list: scheduledNotifications, stats: scheduledStats },
      };
    } catch (sectionError) {
      console.error('[Analytics] Notifications section error:', sectionError);
    }

    // ==================== 2. تحليلات الاستماع ====================
    let listening: Record<string, unknown> = {
      totalListeningHours: 0, totalListeningMinutes: 0, totalSessions: 0, avgSessionMinutes: 0,
      topCategories: [], topStations: [], peakHours: [], peakDays: [],
      recentSessions: [], usersWithListeningData: 0,
    };

    try {
      const userPrefs = await db.userPreference.findMany({
        select: {
          totalListeningTime: true,
          sessionsCount: true,
          averageSessionDuration: true,
          favoriteCategories: true,
          topStations: true,
          timePreferences: true,
          dayPreferences: true,
          user: { select: { id: true, name: true } },
        },
      });

      let totalListeningTimeSec = 0;
      let totalSessions = 0;
      const categoryMap: Record<string, number> = {};
      const stationMap: Record<string, number> = {};
      const hourMap: number[] = new Array(24).fill(0);
      const dayMap: Record<string, number> = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };

      for (const pref of userPrefs) {
        totalListeningTimeSec += pref.totalListeningTime || 0;
        totalSessions += pref.sessionsCount || 0;

        try {
          if (pref.favoriteCategories) {
            const cats = typeof pref.favoriteCategories === 'string' ? JSON.parse(pref.favoriteCategories) : pref.favoriteCategories;
            if (Array.isArray(cats)) cats.forEach((c: string) => { categoryMap[c] = (categoryMap[c] || 0) + 1; });
          }
        } catch {}

        try {
          if (pref.topStations) {
            const stations = typeof pref.topStations === 'string' ? JSON.parse(pref.topStations) : pref.topStations;
            if (Array.isArray(stations)) stations.forEach((s: Record<string, unknown>) => {
              const name = typeof s === 'string' ? s : (s.name || s.stationName || 'غير معروف') as string;
              stationMap[name] = (stationMap[name] || 0) + 1;
            });
          }
        } catch {}

        try {
          if (pref.timePreferences) {
            const times = typeof pref.timePreferences === 'string' ? JSON.parse(pref.timePreferences) : pref.timePreferences;
            if (times && typeof times === 'object' && Array.isArray(times.hours)) {
              times.hours.forEach((h: number) => { if (h >= 0 && h < 24) hourMap[h]++; });
            }
          }
        } catch {}

        try {
          if (pref.dayPreferences) {
            const days = typeof pref.dayPreferences === 'string' ? JSON.parse(pref.dayPreferences) : pref.dayPreferences;
            if (days && typeof days === 'object') {
              Object.entries(days).forEach(([day, count]) => {
                if (dayMap[day] !== undefined) dayMap[day] += (count as number) || 0;
              });
            }
          }
        } catch {}
      }

      const totalListeningHours = Math.round(totalListeningTimeSec / 3600);
      const avgSessionMinutes = totalSessions > 0 ? Math.round((totalListeningTimeSec / totalSessions) / 60) : 0;

      const topCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const topStationsList = Object.entries(stationMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

      const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const peakDays = Object.entries(dayMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([d, count]) => ({ day: dayNames[parseInt(d)] || d, count }));

      const peakHours = hourMap.map((count, hour) => ({ hour, count })).sort((a, b) => b.count - a.count).slice(0, 5);

      // آخر جلسات استماع
      const recentSessions = await db.listeningSession.findMany({
        orderBy: { startTime: 'desc' },
        take: 20,
        select: {
          startTime: true, endTime: true, duration: true, mood: true,
          timeOfDay: true, stationName: true, skipped: true, liked: true,
          user: { select: { name: true } },
        },
      });

      listening = {
        totalListeningHours, totalListeningMinutes: Math.round(totalListeningTimeSec / 60),
        totalSessions, avgSessionMinutes, topCategories,
        topStations: topStationsList.map(([name, count]) => ({ name, count })),
        peakHours, peakDays,
        recentSessions: recentSessions.map(s => ({
          user: s.user.name || 'زائر', station: s.stationName || 'غير معروف',
          duration: s.duration || 0, mood: s.mood, liked: s.liked, skipped: s.skipped,
          startTime: s.startTime, endTime: s.endTime,
        })),
        usersWithListeningData: userPrefs.filter(p => p.totalListeningTime > 0).length,
      };
    } catch (sectionError) {
      console.error('[Analytics] Listening section error:', sectionError);
    }

    // ==================== 3. تحليلات المستخدمين ====================
    let users: Record<string, unknown> = {
      total: 0, withActivity: 0,
      topActive: [], topFavorites: [], topSearches: [],
      aiUsage: { totalChats: 0, uniqueUsers: 0, recentChats: [] },
    };

    try {
      const totalUsers = await db.user.count();
      const usersWithActivity = await db.user.count({
        where: {
          OR: [
            { preferences: { sessionsCount: { gt: 0 } } },
            { history: { some: {} } },
            { favorites: { some: {} } },
            { aiChats: { some: {} } },
          ],
        },
      });

      const topActiveUsers = await db.userPreference.findMany({
        where: { sessionsCount: { gt: 0 } },
        orderBy: { sessionsCount: 'desc' },
        take: 10,
        select: {
          totalListeningTime: true, sessionsCount: true, averageSessionDuration: true,
          user: { select: { id: true, name: true, createdAt: true } },
        },
      });

      const topFavoritesUsers = await db.user.findMany({
        orderBy: { favorites: { _count: 'desc' } },
        take: 10,
        select: {
          id: true, name: true, createdAt: true,
          _count: { select: { favorites: true, history: true, aiChats: true } },
        },
      });

      let topSearches: { query: string; count: number }[] = [];
      try {
        const searchGroups = await db.searchHistory.groupBy({
          by: ['query'],
          where: { query: { not: '' } },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 15,
        });
        topSearches = searchGroups.map(s => ({ query: s.query, count: s._count.id }));
      } catch { /* searchHistory might not exist */ }

      let aiUsage = { totalChats: 0, uniqueUsers: 0, recentChats: [] as Record<string, unknown>[] };
      try {
        const aiChatCount = await db.aIChat.count();
        const aiUsersCount = await db.aIChat.groupBy({ by: ['userId'], _count: true });

        const recentAiChats = await db.aIChat.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            content: true, contentAr: true, createdAt: true, action: true,
            user: { select: { name: true } },
          },
        });

        aiUsage = {
          totalChats: aiChatCount,
          uniqueUsers: aiUsersCount.length,
          recentChats: recentAiChats.map(c => ({
            user: c.user.name || 'زائر',
            message: (c.content || c.contentAr || '')?.substring(0, 100),
            response: c.contentAr || c.content || '',
            action: c.action,
            createdAt: c.createdAt,
          })),
        };
      } catch { /* AIChat might not exist */ }

      users = {
        total: totalUsers,
        withActivity: usersWithActivity,
        topActive: topActiveUsers.map(u => ({
          userId: u.user.id, name: u.user.name || 'زائر', sessions: u.sessionsCount,
          listeningHours: Math.round((u.totalListeningTime || 0) / 3600),
          avgMinutes: Math.round((u.averageSessionDuration || 0) / 60), memberSince: u.user.createdAt,
        })),
        topFavorites: topFavoritesUsers.map(u => ({
          userId: u.id, name: u.name || 'زائر',
          favorites: u._count.favorites, history: u._count.history,
          aiChats: u._count.aiChats, memberSince: u.createdAt,
        })),
        topSearches,
        aiUsage,
      };
    } catch (sectionError) {
      console.error('[Analytics] Users section error:', sectionError);
    }

    // ==================== 4. تحليلات الأجهزة ====================
    let devices: Record<string, unknown> = {
      total: 0, activeSubscriptions: 0, inactiveSubscriptions: 0,
      platforms: {}, browsers: {}, operatingSystems: {}, list: [],
    };

    try {
      const allDevices = await db.device.findMany({
        select: {
          deviceId: true, platform: true, userAgent: true, displayName: true,
          lastSeenAt: true, createdAt: true,
          user: { select: { id: true, name: true } },
        },
        orderBy: { lastSeenAt: 'desc' },
      });

      const platformCounts: Record<string, number> = {};
      const browserCounts: Record<string, number> = {};
      const osCounts: Record<string, number> = {};

      for (const device of allDevices) {
        const p = device.platform || 'unknown';
        platformCounts[p] = (platformCounts[p] || 0) + 1;

        const ua = device.userAgent || '';
        if (ua.includes('Chrome') && !ua.includes('Edg')) browserCounts['Chrome'] = (browserCounts['Chrome'] || 0) + 1;
        else if (ua.includes('Firefox')) browserCounts['Firefox'] = (browserCounts['Firefox'] || 0) + 1;
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browserCounts['Safari'] = (browserCounts['Safari'] || 0) + 1;
        else if (ua.includes('Edg')) browserCounts['Edge'] = (browserCounts['Edge'] || 0) + 1;
        else if (ua.includes('Opera') || ua.includes('OPR')) browserCounts['Opera'] = (browserCounts['Opera'] || 0) + 1;
        else browserCounts['أخرى'] = (browserCounts['أخرى'] || 0) + 1;

        if (ua.includes('Android')) osCounts['Android'] = (osCounts['Android'] || 0) + 1;
        else if (ua.includes('iPhone') || ua.includes('iPad')) osCounts['iOS'] = (osCounts['iOS'] || 0) + 1;
        else if (ua.includes('Windows')) osCounts['Windows'] = (osCounts['Windows'] || 0) + 1;
        else if (ua.includes('Mac OS')) osCounts['macOS'] = (osCounts['macOS'] || 0) + 1;
        else if (ua.includes('Linux')) osCounts['Linux'] = (osCounts['Linux'] || 0) + 1;
        else osCounts['أخرى'] = (osCounts['أخرى'] || 0) + 1;
      }

      const inactiveSubscriptions = await db.pushSubscription.count({ where: { isActive: false } });
      const activeSubscriptions = await db.pushSubscription.count({ where: { isActive: true } });

      devices = {
        total: allDevices.length, activeSubscriptions, inactiveSubscriptions,
        platforms: platformCounts, browsers: browserCounts, operatingSystems: osCounts,
        list: allDevices.slice(0, 30).map(d => ({
          deviceId: d.deviceId?.substring(0, 20) + '...', user: d.user?.name || 'غير معروف',
          platform: d.platform, displayName: d.displayName, lastSeen: d.lastSeenAt, firstSeen: d.createdAt,
        })),
      };
    } catch (sectionError) {
      console.error('[Analytics] Devices section error:', sectionError);
    }

    return NextResponse.json({
      success: true,
      analytics: { notifications, listening, users, devices },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 });
  }
}
