/**
 * Time of Day Utilities
 * Consistent time-based logic across the app
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Get the current time of day based on hour
 * Uses consistent logic across the app
 * 
 * Time ranges:
 * - Morning: 5:00 AM - 11:59 AM (5-11)
 * - Afternoon: 12:00 PM - 4:59 PM (12-16)
 * - Evening: 5:00 PM - 8:59 PM (17-20)
 * - Night: 9:00 PM - 4:59 AM (21-4)
 */
export function getTimeOfDay(hour?: number): TimeOfDay {
  const currentHour = hour ?? new Date().getHours();
  
  if (currentHour >= 5 && currentHour < 12) {
    return 'morning';
  } else if (currentHour >= 12 && currentHour < 17) {
    return 'afternoon';
  } else if (currentHour >= 17 && currentHour < 21) {
    return 'evening';
  } else {
    return 'night';
  }
}

/**
 * Get greeting text based on time of day
 */
export function getGreetingText(timeOfDay: TimeOfDay, language: 'ar' | 'en'): string {
  const greetings = {
    ar: {
      morning: 'صباح الخير',
      afternoon: 'مساء الخير',
      evening: 'مساء الخير',
      night: 'تصبح على خير',
    },
    en: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      night: 'Good Night',
    },
  };
  
  return greetings[language][timeOfDay];
}

/**
 * Get time-based recommendation data
 */
export function getTimeBasedRecommendation(timeOfDay: TimeOfDay, language: 'ar' | 'en') {
  const recommendations = {
    ar: {
      morning: {
        title: 'اقتراحات الصباح',
        subtitle: 'ابدأ يومك بالقرآن والأذكار',
        emoji: '🌅',
      },
      afternoon: {
        title: 'اقتراحات الظهيرة',
        subtitle: 'استمع لأحدث الأخبار',
        emoji: '☀️',
      },
      evening: {
        title: 'اقتراحات المساء',
        subtitle: 'وقت مثالي للاسترخاء والاستماع',
        emoji: '🌆',
      },
      night: {
        title: 'اقتراحات الليل',
        subtitle: 'محطات هادئة للنوم',
        emoji: '🌙',
      },
    },
    en: {
      morning: {
        title: 'Morning Recommendations',
        subtitle: 'Start your day with Quran and Azkar',
        emoji: '🌅',
      },
      afternoon: {
        title: 'Afternoon Recommendations',
        subtitle: 'Listen to the latest news',
        emoji: '☀️',
      },
      evening: {
        title: 'Evening Recommendations',
        subtitle: 'Perfect time to relax and listen',
        emoji: '🌆',
      },
      night: {
        title: 'Night Recommendations',
        subtitle: 'Calm stations for sleep',
        emoji: '🌙',
      },
    },
  };
  
  return recommendations[language][timeOfDay];
}
