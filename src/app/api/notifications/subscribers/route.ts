import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) {
  console.error('[SECURITY] ADMIN_API_KEY environment variable is not set! Subscribers endpoint will be disabled.');
}

// التحقق من المصادقة - Support multiple auth methods
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

// GET /api/notifications/subscribers - Get list of subscribers with names
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active subscriptions with their info + User name + Device display name
    const subscriptions = await db.pushSubscription.findMany({
      where: { isActive: true },
      select: {
        id: true,
        userId: true,
        displayName: true,
        deviceId: true,
        platform: true,
        userAgent: true,
        createdAt: true,
        lastUsedAt: true,
        user: {
          select: { name: true },
        },
        device: {
          select: { displayName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by unique display names (users)
    const usersMap = new Map<string, {
      id: string;
      name: string;
      devices: number;
      platforms: string[];
      firstSeen: Date;
      lastActive: Date;
      isNew: boolean;
      subscriptionsCount: number;
    }>();

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const sub of subscriptions) {
      // Name priority: displayName on subscription > Device.displayName > User.name (exclude "Guest User")
      const userName = sub.user?.name;
      const deviceName = sub.device?.displayName;
      const isRealName = sub.displayName || deviceName || (userName && userName !== 'Guest User');
      const name = isRealName || 'زائر';
      const key = sub.userId || name;
      
      if (!usersMap.has(key)) {
        usersMap.set(key, {
          id: sub.userId || sub.id,
          name,
          devices: 0,
          platforms: [],
          firstSeen: sub.createdAt,
          lastActive: sub.lastUsedAt,
          isNew: sub.createdAt > oneWeekAgo,
          subscriptionsCount: 0,
        });
      } else {
        // If we already have this user but the name was 'زائر' and now we found a real name, update it
        const existing = usersMap.get(key)!;
        if (existing.name === 'زائر' && isRealName) {
          existing.name = name;
        }
      }
      
      const user = usersMap.get(key)!;
      user.devices++;
      user.subscriptionsCount++;
      if (sub.platform && !user.platforms.includes(sub.platform)) {
        user.platforms.push(sub.platform);
      }
      if (sub.createdAt < user.firstSeen) {
        user.firstSeen = sub.createdAt;
      }
      if (sub.lastUsedAt > user.lastActive) {
        user.lastActive = sub.lastUsedAt;
      }
    }

    const users = Array.from(usersMap.values()).sort((a, b) => {
      if (a.name !== 'زائر' && b.name === 'زائر') return -1;
      if (a.name === 'زائر' && b.name !== 'زائر') return 1;
      return b.lastActive.getTime() - a.lastActive.getTime();
    });

    // Calculate stats
    const stats = {
      total: subscriptions.length,
      namedUsers: users.filter(u => u.name !== 'زائر').length,
      guestUsers: users.filter(u => u.name === 'زائر').length,
      newThisWeek: users.filter(u => u.isNew).length,
      platforms: {
        web: subscriptions.filter(s => s.platform === 'web').length,
        android: subscriptions.filter(s => s.platform === 'android').length,
        ios: subscriptions.filter(s => s.platform === 'ios').length,
        unknown: subscriptions.filter(s => !s.platform).length,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
      subscribers: users,
      users: users, // Alias for compatibility
      totalDevices: subscriptions.length,
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
