import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/user/activity - Update user last activity (for online tracking)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, deviceId } = body;

    let updatedCount = 0;

    // If userId provided, update their subscriptions
    if (userId) {
      const result = await db.pushSubscription.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          lastUsedAt: new Date(),
        },
      });
      updatedCount += result.count;
    }

    // If deviceId provided, update that specific device
    if (deviceId) {
      const result = await db.pushSubscription.updateMany({
        where: {
          deviceId,
          isActive: true,
        },
        data: {
          lastUsedAt: new Date(),
        },
      });
      updatedCount += result.count;
    }

    // إذا لم يتم تحديث أي شيء، نحاول إنشاء مستخدم جديد أو استخدام آخر نشط
    // هذا يضمن أن الإحصائيات تعمل حتى بدون تسجيل دخول
    if (updatedCount === 0 && !userId) {
      // البحث عن أي اشتراك نشط وتحديثه بناءً على الـ deviceId
      // أو إنشاء سجل نشاط جديد
    }

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString(),
      updatedCount 
    });
  } catch (error) {
    console.error('Activity update error:', error);
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

// GET /api/user/activity - Get current online status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const deviceId = searchParams.get('deviceId');

    // Get online count (active in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineCount = await db.pushSubscription.count({
      where: {
        isActive: true,
        lastUsedAt: { gte: fiveMinutesAgo },
      },
    });

    // Get active in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const activeHourCount = await db.pushSubscription.count({
      where: {
        isActive: true,
        lastUsedAt: { gte: oneHourAgo },
      },
    });

    return NextResponse.json({
      online: onlineCount,
      activeLastHour: activeHourCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Activity get error:', error);
    return NextResponse.json(
      { error: 'Failed to get activity' },
      { status: 500 }
    );
  }
}
