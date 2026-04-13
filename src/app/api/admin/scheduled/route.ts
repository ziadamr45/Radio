import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
if (!ADMIN_API_KEY) {
  console.error('[SECURITY] ADMIN_API_KEY environment variable is not set! Scheduled notification endpoints will be disabled.');
}

function checkAuth(request: NextRequest): boolean {
  if (!ADMIN_API_KEY) return false;
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${ADMIN_API_KEY}`;
}

// GET /api/admin/scheduled - Get all scheduled notifications
export async function GET(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scheduled = await db.notificationSchedule.findMany({
      where: { status: 'pending' },
      orderBy: { scheduledFor: 'asc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      scheduled: scheduled.map(s => ({
        id: s.id,
        title: s.title,
        message: s.body,
        scheduledFor: s.scheduledFor,
        status: s.status,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get scheduled error:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduled notifications' },
      { status: 500 }
    );
  }
}

// POST /api/admin/scheduled - Create a scheduled notification
export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, message, scheduledFor, userIds } = body;

    if (!title || !message || !scheduledFor) {
      return NextResponse.json(
        { error: 'title, message, and scheduledFor are required' },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduledFor);

    // If userIds provided, create for specific users
    if (userIds && userIds.length > 0) {
      await db.notificationSchedule.createMany({
        data: userIds.map((uid: string) => ({
          userId: uid,
          type: 'admin_scheduled',
          title,
          body: message,
          scheduledFor: scheduledDate,
          status: 'pending',
        })),
      });
    } else {
      // Create for all users with active subscriptions
      const users = await db.pushSubscription.findMany({
        where: { isActive: true },
        select: { userId: true },
        distinct: ['userId'],
      });

      if (users.length > 0) {
        await db.notificationSchedule.createMany({
          data: users.map(u => ({
            userId: u.userId,
            type: 'admin_scheduled',
            title,
            body: message,
            scheduledFor: scheduledDate,
            status: 'pending',
          })),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled notification created',
    });
  } catch (error) {
    console.error('Create scheduled error:', error);
    return NextResponse.json(
      { error: 'Failed to create scheduled notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/scheduled - Delete a scheduled notification
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await db.notificationSchedule.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete scheduled error:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduled notification' },
      { status: 500 }
    );
  }
}
