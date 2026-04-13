import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { NotificationService } from '@/lib/notification-service';

// POST /api/notifications/track - Track notification engagement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { historyId, event, variantId } = body;

    if (!historyId || !event) {
      return NextResponse.json(
        { error: 'historyId and event required' },
        { status: 400 }
      );
    }

    switch (event) {
      case 'opened':
        await NotificationService.recordNotificationOpened(historyId);
        break;
      case 'clicked':
        await NotificationService.recordNotificationClicked(historyId);
        break;
      case 'converted':
        // User started listening after notification
        await db.notificationHistory.update({
          where: { id: historyId },
          data: { conversionAt: new Date() },
        });
        break;
    }

    // Update variant stats if applicable
    if (variantId) {
      const updateData: Record<string, number> = {};
      switch (event) {
        case 'opened':
          updateData.openCount = 1;
          break;
        case 'clicked':
          updateData.clickCount = 1;
          break;
        case 'converted':
          updateData.conversionCount = 1;
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await db.notificationVariant.update({
          where: { id: variantId },
          data: updateData,
        });
      }
    }

    // Update daily metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const history = await db.notificationHistory.findUnique({
      where: { id: historyId },
    });

    if (history) {
      await db.notificationMetric.upsert({
        where: {
          date_type: {
            date: today,
            type: history.type,
          },
        },
        create: {
          date: today,
          type: history.type,
          totalSent: 0,
          totalOpened: event === 'opened' ? 1 : 0,
          totalClicked: event === 'clicked' ? 1 : 0,
          totalConverted: event === 'converted' ? 1 : 0,
        },
        update: {
          totalOpened: event === 'opened' ? { increment: 1 } : undefined,
          totalClicked: event === 'clicked' ? { increment: 1 } : undefined,
          totalConverted: event === 'converted' ? { increment: 1 } : undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track notification error:', error);
    return NextResponse.json(
      { error: 'Failed to track notification' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/track - Get notification metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const type = searchParams.get('type');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const whereClause: Record<string, unknown> = {
      date: { gte: startDate },
    };

    if (type) {
      whereClause.type = type;
    }

    const metrics = await db.notificationMetric.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    // Calculate aggregated stats
    const aggregated = metrics.reduce(
      (acc, m) => ({
        totalSent: acc.totalSent + m.totalSent,
        totalOpened: acc.totalOpened + m.totalOpened,
        totalClicked: acc.totalClicked + m.totalClicked,
        totalConverted: acc.totalConverted + m.totalConverted,
      }),
      { totalSent: 0, totalOpened: 0, totalClicked: 0, totalConverted: 0 }
    );

    const openRate = aggregated.totalSent > 0 
      ? (aggregated.totalOpened / aggregated.totalSent) * 100 
      : 0;
    const clickRate = aggregated.totalOpened > 0 
      ? (aggregated.totalClicked / aggregated.totalOpened) * 100 
      : 0;
    const conversionRate = aggregated.totalClicked > 0 
      ? (aggregated.totalConverted / aggregated.totalClicked) * 100 
      : 0;

    return NextResponse.json({
      success: true,
      period: { days, startDate },
      aggregated: {
        ...aggregated,
        openRate: openRate.toFixed(2),
        clickRate: clickRate.toFixed(2),
        conversionRate: conversionRate.toFixed(2),
      },
      daily: metrics,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
