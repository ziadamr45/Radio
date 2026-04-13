import { db } from '@/lib/db';
import type { 
  NotificationTemplate, 
  NotificationVariant, 
  NotificationPreference,
  NotificationSchedule,
  NotificationHistory,
  PushSubscription,
  ListeningSession
} from '@prisma/client';

// ==================== TYPES ====================
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';
export type NotificationType = 'time_based' | 'behavior' | 're_engagement' | 'islamic' | 'personal';
export type NotificationCategory = 'morning' | 'afternoon' | 'evening' | 'night' | 'quran' | 'focus' | 'relax';

export interface SmartNotification {
  title: string;
  body: string;
  icon?: string;
  actionText?: string;
  deepLink?: string;
  stationId?: string;
  stationName?: string;
  type: NotificationType;
  category: NotificationCategory;
}

export interface UserBehaviorProfile {
  userId: string;
  preferredTimeSlots: TimeOfDay[];
  topCategories: string[];
  topStations: { id: string; name: string; playCount: number }[];
  lastActiveAt: Date | null;
  averageSessionDuration: number;
  totalSessions: number;
  daysSinceLastVisit: number;
  preferredLanguage: 'ar' | 'en';
}

// ==================== NOTIFICATION TEMPLATES (Default) ====================
const DEFAULT_TEMPLATES: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt' | 'variants' | 'sentNotifications'>[] = [
  // Morning notifications
  {
    type: 'time_based',
    category: 'morning',
    titleAr: 'صباح الخير 🌅',
    titleEn: 'Good Morning 🌅',
    bodyAr: 'ابدأ يومك بآيات هادئة من القرآن 🤍',
    bodyEn: 'Start your day with peaceful Quran verses 🤍',
    icon: '🌅',
    actionTextAr: 'شغّل الآن',
    actionTextEn: 'Play Now',
    deepLink: '/?tab=quran',
    priority: 8,
    isActive: true,
    stationId: null,
    stationName: null,
  },
  {
    type: 'time_based',
    category: 'morning',
    titleAr: 'صباح الخير 🌅',
    titleEn: 'Good Morning 🌅',
    bodyAr: 'ابدأ يومك بآيات من القرآن الكريم 🤍',
    bodyEn: 'Start your day with verses from the Holy Quran 🤍',
    icon: '🌅',
    actionTextAr: 'استمع الآن',
    actionTextEn: 'Listen Now',
    deepLink: '/?tab=quran',
    priority: 9,
    isActive: true,
    stationId: null,
    stationName: null,
  },
  // Afternoon notifications
  {
    type: 'time_based',
    category: 'afternoon',
    titleAr: 'وقت الاستراحة ☕',
    titleEn: 'Break Time ☕',
    bodyAr: 'خد استراحة واسمع برنامج خفيف يظبط مودك 🎧',
    bodyEn: 'Take a break and listen to something light 🎧',
    icon: '☕',
    actionTextAr: 'استكشف',
    actionTextEn: 'Explore',
    deepLink: '/?tab=all',
    priority: 6,
    isActive: true,
    stationId: null,
    stationName: null,
  },
  // Evening notifications
  {
    type: 'time_based',
    category: 'evening',
    titleAr: 'مساء الخير 🌙',
    titleEn: 'Good Evening 🌙',
    bodyAr: 'استمع لتلاوات هادئة تريح قلبك وتطمئن فؤادك',
    bodyEn: 'Listen to calming recitations that comfort your heart',
    icon: '🌙',
    actionTextAr: 'استمع الآن',
    actionTextEn: 'Listen Now',
    deepLink: '/?tab=quran',
    priority: 8,
    isActive: true,
    stationId: null,
    stationName: null,
  },
  // Night notifications
  {
    type: 'time_based',
    category: 'night',
    titleAr: 'تصبحون على خير 🌟',
    titleEn: 'Good Night 🌟',
    bodyAr: 'قبل ما تنام، اسمع حاجة هادية تساعدك تهدى',
    bodyEn: 'Before sleeping, listen to something calming',
    icon: '🌟',
    actionTextAr: 'استمع',
    actionTextEn: 'Listen',
    deepLink: '/?tab=quran',
    priority: 5,
    isActive: true,
    stationId: null,
    stationName: null,
  },
  // Islamic notifications
  {
    type: 'islamic',
    category: 'quran',
    titleAr: 'خد دقيقة للقرآن 🤍',
    titleEn: 'Take a minute for Quran 🤍',
    bodyAr: 'آيات هادئة تريح قلبك وتجدد إيمانك',
    bodyEn: 'Peaceful verses to comfort your heart',
    icon: '🤍',
    actionTextAr: 'استمع',
    actionTextEn: 'Listen',
    deepLink: '/?tab=quran',
    priority: 7,
    isActive: true,
    stationId: null,
    stationName: null,
  },

  // Re-engagement notifications
  {
    type: 're_engagement',
    category: 'morning',
    titleAr: 'وحشتنا… ❤️',
    titleEn: 'We miss you… ❤️',
    bodyAr: 'تعالى كمل اللي كنت بتسمعه',
    bodyEn: 'Come back and continue where you left off',
    icon: '❤️',
    actionTextAr: 'افتح التطبيق',
    actionTextEn: 'Open App',
    deepLink: '/',
    priority: 5,
    isActive: true,
    stationId: null,
    stationName: null,
  },
  {
    type: 're_engagement',
    category: 'evening',
    titleAr: 'في محطات جديدة ممكن تعجبك 👀',
    titleEn: 'New stations you might like 👀',
    bodyAr: 'اكتشف محطات جديدة حسب ذوقك',
    bodyEn: 'Discover new stations based on your taste',
    icon: '👀',
    actionTextAr: 'اكتشف',
    actionTextEn: 'Discover',
    deepLink: '/?tab=all',
    priority: 4,
    isActive: true,
    stationId: null,
    stationName: null,
  },
  // Behavior-based notifications
  {
    type: 'behavior',
    category: 'focus',
    titleAr: 'جاهز للتركيز؟ 📚',
    titleEn: 'Ready to focus? 📚',
    bodyAr: 'شغّل حاجة هادية للمذاكرة أو الشغل',
    bodyEn: 'Play something calm for studying or work',
    icon: '📚',
    actionTextAr: 'شغّل',
    actionTextEn: 'Play',
    deepLink: '/?mood=focus',
    priority: 6,
    isActive: true,
    stationId: null,
    stationName: null,
  },
  {
    type: 'behavior',
    category: 'relax',
    titleAr: 'وقت للهدوء 🧘',
    titleEn: 'Time to relax 🧘',
    bodyAr: 'استمع لحاجة تساعدك تسترخي',
    bodyEn: 'Listen to something relaxing',
    icon: '🧘',
    actionTextAr: 'استمع',
    actionTextEn: 'Listen',
    deepLink: '/?mood=calm',
    priority: 6,
    isActive: true,
    stationId: null,
    stationName: null,
  },
];

// ==================== HELPER FUNCTIONS ====================

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  if (hour >= 21 && hour < 24) return 'night';
  return 'late_night';
}

export function getDaysSince(date: Date | null): number {
  if (!date) return 999;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ==================== NOTIFICATION SERVICE ====================

export class NotificationService {
  // Initialize default templates
  static async initializeTemplates(): Promise<void> {
    const existingCount = await db.notificationTemplate.count();
    if (existingCount === 0) {
      await db.notificationTemplate.createMany({
        data: DEFAULT_TEMPLATES,
      });
      console.log('[Notifications] Initialized default templates');
    }
  }

  // Get user behavior profile
  static async getUserBehaviorProfile(userId: string): Promise<UserBehaviorProfile> {
    // Get user preferences
    const preferences = await db.userPreference.findUnique({
      where: { userId },
    });

    // Get recent listening sessions
    const sessions = await db.listeningSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 100,
    });

    // Get history for station info
    const history = await db.history.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: 50,
    });

    // Get notification preferences
    const notifPrefs = await db.notificationPreference.findUnique({
      where: { userId },
    });

    // Calculate behavior metrics
    const lastSession = sessions[0];
    const lastActiveAt = lastSession?.startTime || null;
    const daysSinceLastVisit = getDaysSince(lastActiveAt);

    // Calculate top stations
    const stationPlayCounts = new Map<string, { name: string; count: number }>();
    sessions.forEach(session => {
      const existing = stationPlayCounts.get(session.stationId);
      if (existing) {
        existing.count++;
      } else {
        stationPlayCounts.set(session.stationId, { name: session.stationName, count: 1 });
      }
    });

    const topStations = Array.from(stationPlayCounts.entries())
      .map(([id, data]) => ({ id, name: data.name, playCount: data.count }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5);

    // Calculate top categories
    const categoryCounts = new Map<string, number>();
    sessions.forEach(session => {
      if (session.category) {
        categoryCounts.set(session.category, (categoryCounts.get(session.category) || 0) + 1);
      }
    });
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    // Calculate preferred time slots
    const timeSlotCounts = new Map<TimeOfDay, number>();
    sessions.forEach(session => {
      if (session.timeOfDay) {
        timeSlotCounts.set(session.timeOfDay as TimeOfDay, (timeSlotCounts.get(session.timeOfDay as TimeOfDay) || 0) + 1);
      }
    });
    const preferredTimeSlots = Array.from(timeSlotCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([slot]) => slot);

    // Calculate average session duration
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageSessionDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

    return {
      userId,
      preferredTimeSlots,
      topCategories,
      topStations,
      lastActiveAt,
      averageSessionDuration,
      totalSessions: sessions.length,
      daysSinceLastVisit,
      preferredLanguage: (notifPrefs?.preferredLanguage as 'ar' | 'en') || 'ar',
    };
  }

  // Get personalized notification for user
  static async getPersonalizedNotification(userId: string): Promise<SmartNotification | null> {
    const profile = await this.getUserBehaviorProfile(userId);
    const timeOfDay = getTimeOfDay();
    const prefs = await this.getOrCreatePreferences(userId);

    // Check if notifications are enabled
    if (!prefs.enabled) return null;

    // Check daily limit
    if (prefs.totalSentToday >= prefs.maxNotificationsPerDay) return null;

    // Check quiet hours
    if (this.isInQuietHours(prefs)) return null;

    // Determine notification type based on user behavior
    let notification: SmartNotification | null = null;

    // Priority 1: Re-engagement for inactive users
    if (profile.daysSinceLastVisit >= 1) {
      notification = await this.getReEngagementNotification(profile);
    }
    // Priority 2: Islamic notifications (high engagement)
    else if (prefs.islamicNotifications && Math.random() < 0.3) {
      notification = await this.getIslamicNotification(profile);
    }
    // Priority 3: Behavior-based notifications
    else if (prefs.behaviorNotifications && profile.topStations.length > 0) {
      notification = await this.getBehaviorNotification(profile);
    }
    // Priority 4: Time-based notifications
    else {
      notification = await this.getTimeBasedNotification(profile, timeOfDay, prefs);
    }

    return notification;
  }

  // Get time-based notification
  static async getTimeBasedNotification(
    profile: UserBehaviorProfile,
    timeOfDay: TimeOfDay,
    prefs: NotificationPreference
  ): Promise<SmartNotification | null> {
    // Check if time slot is enabled
    const timeSlotEnabled: Record<TimeOfDay, boolean> = {
      morning: prefs.morningNotifications,
      afternoon: prefs.afternoonNotifications,
      evening: prefs.eveningNotifications,
      night: prefs.nightNotifications,
      late_night: prefs.nightNotifications,
    };

    if (!timeSlotEnabled[timeOfDay]) return null;

    // Get template for this time
    const template = await db.notificationTemplate.findFirst({
      where: {
        type: 'time_based',
        category: timeOfDay,
        isActive: true,
      },
      include: {
        variants: true,
      },
    });

    if (!template) return null;

    // Select variant using A/B testing
    const variant = await this.selectVariant(template.variants, template);

    const lang = profile.preferredLanguage;
    return {
      title: variant ? (lang === 'ar' ? (variant.titleAr || template.titleAr) : (variant.titleEn || template.titleEn)) : (lang === 'ar' ? template.titleAr : template.titleEn),
      body: variant ? (lang === 'ar' ? variant.bodyAr : variant.bodyEn) : (lang === 'ar' ? template.bodyAr : template.bodyEn),
      icon: template.icon || undefined,
      actionText: lang === 'ar' ? (template.actionTextAr || 'شغّل') : (template.actionTextEn || 'Play'),
      deepLink: template.deepLink || undefined,
      type: 'time_based',
      category: timeOfDay as NotificationCategory,
    };
  }

  // Get re-engagement notification
  static async getReEngagementNotification(profile: UserBehaviorProfile): Promise<SmartNotification | null> {
    let template;
    
    if (profile.daysSinceLastVisit >= 3) {
      // Stronger re-engagement after 3 days
      template = await db.notificationTemplate.findFirst({
        where: {
          type: 're_engagement',
          isActive: true,
        },
        orderBy: { priority: 'desc' },
      });
    } else {
      // Gentle reminder after 1 day
      template = await db.notificationTemplate.findFirst({
        where: {
          type: 're_engagement',
          isActive: true,
        },
        orderBy: { priority: 'asc' },
      });
    }

    if (!template) return null;

    const lang = profile.preferredLanguage;
    // Personalize with last station if available
    let body = lang === 'ar' ? template.bodyAr : template.bodyEn;
    if (profile.topStations[0]) {
      body = lang === 'ar' 
        ? `تعالى كمل سماع ${profile.topStations[0].name} ❤️`
        : `Come back and continue listening to ${profile.topStations[0].name} ❤️`;
    }

    return {
      title: lang === 'ar' ? template.titleAr : template.titleEn,
      body,
      icon: template.icon || undefined,
      actionText: lang === 'ar' ? (template.actionTextAr || 'افتح') : (template.actionTextEn || 'Open'),
      deepLink: template.deepLink || '/',
      stationId: profile.topStations[0]?.id,
      stationName: profile.topStations[0]?.name,
      type: 're_engagement',
      category: 'morning',
    };
  }

  // Get Islamic notification
  static async getIslamicNotification(profile: UserBehaviorProfile): Promise<SmartNotification | null> {
    const template = await db.notificationTemplate.findFirst({
      where: {
        type: 'islamic',
        isActive: true,
      },
      orderBy: { priority: 'desc' },
    });

    if (!template) return null;

    const lang = profile.preferredLanguage;
    return {
      title: lang === 'ar' ? template.titleAr : template.titleEn,
      body: lang === 'ar' ? template.bodyAr : template.bodyEn,
      icon: template.icon || undefined,
      actionText: lang === 'ar' ? (template.actionTextAr || 'استمع') : (template.actionTextEn || 'Listen'),
      deepLink: template.deepLink || '/?tab=quran',
      type: 'islamic',
      category: 'quran',
    };
  }

  // Get behavior-based notification
  static async getBehaviorNotification(profile: UserBehaviorProfile): Promise<SmartNotification | null> {
    const lang = profile.preferredLanguage;
    const topStation = profile.topStations[0];
    const topCategory = profile.topCategories[0];

    // If user has a favorite station
    if (topStation) {
      return {
        title: lang === 'ar' ? 'إذاعتك المفضلة شغالة 📻' : 'Your favorite station is on 📻',
        body: lang === 'ar' 
          ? `${topStation.name} جاهزة ليك`
          : `${topStation.name} is ready for you`,
        icon: '📻',
        actionText: lang === 'ar' ? 'شغّل الآن' : 'Play Now',
        deepLink: `/?station=${topStation.id}`,
        stationId: topStation.id,
        stationName: topStation.name,
        type: 'behavior',
        category: (topCategory as NotificationCategory) || 'quran',
      };
    }

    // Based on preferred category
    if (topCategory) {
      const categoryMessages: Record<string, { ar: string; en: string }> = {
        quran: { 
          ar: 'جاهز لجلسة قرآن هادئة؟ 🤍', 
          en: 'Ready for a calm Quran session? 🤍' 
        },

        lecture: { 
          ar: 'في محاضرات جديدة ممكن تعجبك 📚', 
          en: 'New lectures you might like 📚' 
        },
      };

      const message = categoryMessages[topCategory] || categoryMessages.quran;

      return {
        title: lang === 'ar' ? 'محتوى مخصص ليك ✨' : 'Content tailored for you ✨',
        body: lang === 'ar' ? message.ar : message.en,
        icon: '✨',
        actionText: lang === 'ar' ? 'اكتشف' : 'Discover',
        deepLink: `/?category=${topCategory}`,
        type: 'behavior',
        category: (topCategory as NotificationCategory) || 'quran',
      };
    }

    return null;
  }

  // A/B Testing: Select variant
  static async selectVariant(
    variants: NotificationVariant[],
    template: NotificationTemplate
  ): Promise<NotificationVariant | null> {
    if (variants.length === 0) return null;

    // Calculate total sent for even distribution
    const totalSent = variants.reduce((sum, v) => sum + v.sentCount, 0);

    // Select variant with lowest sent count for even distribution
    // Or use weighted selection based on performance
    if (totalSent < 100) {
      // Even distribution for first 100 sends
      variants.sort((a, b) => a.sentCount - b.sentCount);
      return variants[0];
    }

    // After 100 sends, use weighted selection based on conversion rate
    const variantScores = variants.map(v => {
      const conversionRate = v.sentCount > 0 ? v.conversionCount / v.sentCount : 0;
      return { variant: v, score: conversionRate };
    });

    variantScores.sort((a, b) => b.score - a.score);
    
    // 80% chance to pick best performer, 20% to explore others
    if (Math.random() < 0.8) {
      return variantScores[0].variant;
    }
    
    return variants[Math.floor(Math.random() * variants.length)];
  }

  // Check quiet hours
  static isInQuietHours(prefs: NotificationPreference): boolean {
    if (!prefs.quietHoursStart || !prefs.quietHoursEnd) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
    const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes < endMinutes) {
      // Same day range (e.g., 14:00 - 18:00)
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    } else {
      // Overnight range (e.g., 22:00 - 08:00)
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }
  }

  // Get or create notification preferences
  static async getOrCreatePreferences(userId: string): Promise<NotificationPreference> {
    let prefs = await db.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await db.notificationPreference.create({
        data: { userId },
      });
    }

    // Reset daily counter if needed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (prefs.lastResetDate < today) {
      prefs = await db.notificationPreference.update({
        where: { userId },
        data: {
          totalSentToday: 0,
          lastResetDate: today,
        },
      });
    }

    return prefs;
  }

  // Schedule notification for user
  static async scheduleNotification(
    userId: string,
    notification: SmartNotification,
    scheduledFor: Date
  ): Promise<NotificationSchedule> {
    return db.notificationSchedule.create({
      data: {
        userId,
        type: notification.type,
        scheduledFor,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        actionText: notification.actionText,
        deepLink: notification.deepLink,
        stationId: notification.stationId,
        stationName: notification.stationName,
        status: 'pending',
      },
    });
  }

  // Record notification sent
  static async recordNotificationSent(
    userId: string,
    notification: SmartNotification,
    templateId?: string,
    variantId?: string
  ): Promise<NotificationHistory> {
    // Update preferences
    await db.notificationPreference.update({
      where: { userId },
      data: {
        lastNotificationAt: new Date(),
        totalSentToday: { increment: 1 },
      },
    });

    // Update variant stats if applicable
    if (variantId) {
      await db.notificationVariant.update({
        where: { id: variantId },
        data: { sentCount: { increment: 1 } },
      });
    }

    // Record in history
    return db.notificationHistory.create({
      data: {
        userId,
        templateId,
        variantId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        actionText: notification.actionText,
        deepLink: notification.deepLink,
        stationId: notification.stationId,
        stationName: notification.stationName,
      },
    });
  }

  // Record notification opened
  static async recordNotificationOpened(historyId: string): Promise<void> {
    await db.notificationHistory.update({
      where: { id: historyId },
      data: { openedAt: new Date() },
    });

    // Update metrics
    // This would update the NotificationMetric table
  }

  // Record notification clicked
  static async recordNotificationClicked(historyId: string): Promise<void> {
    await db.notificationHistory.update({
      where: { id: historyId },
      data: { clickedAt: new Date() },
    });
  }

  // Get optimal notification time for user
  static async getOptimalNotificationTime(userId: string): Promise<Date> {
    const profile = await this.getUserBehaviorProfile(userId);
    const prefs = await this.getOrCreatePreferences(userId);

    // If user has preferred time slots, use them
    if (profile.preferredTimeSlots.length > 0) {
      const preferredSlot = profile.preferredTimeSlots[0];
      const hourMap: Record<TimeOfDay, number> = {
        morning: 8,
        afternoon: 14,
        evening: 18,
        night: 21,
        late_night: 23,
      };

      const targetHour = hourMap[preferredSlot];
      const now = new Date();
      const scheduled = new Date(now);
      scheduled.setHours(targetHour, 0, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
      }

      // Check if it's in quiet hours
      if (prefs.quietHoursStart && prefs.quietHoursEnd) {
        const [startH] = prefs.quietHoursStart.split(':').map(Number);
        const [endH] = prefs.quietHoursEnd.split(':').map(Number);
        
        if (targetHour >= startH || targetHour < endH) {
          // Move to after quiet hours
          scheduled.setHours(endH, 0, 0, 0);
        }
      }

      return scheduled;
    }

    // Default: Schedule for next morning at 8 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  }
}
