// Smart Share Message Generator
// Generates dynamic, personalized share messages based on station type, time of day, and user behavior
// Uses Egypt timezone (Africa/Cairo) for consistent time-based messages

import type { RadioStation } from '@/types/radio';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';
export type StationCategory = 'quran' | 'islamic' | 'relaxing' | 'energetic' | 'news' | 'music' | 'trending' | 'general';

// Egypt timezone offset (UTC+2, UTC+3 in DST)
function getEgyptHour(): number {
  const now = new Date();
  // Use Intl to get the hour in Egypt timezone
  const egyptTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Cairo',
    hour: 'numeric',
    hour12: false,
  }).format(now);
  return parseInt(egyptTime, 10);
}

// Get current time of day based on Egypt timezone
export function getTimeOfDay(): TimeOfDay {
  const hour = getEgyptHour();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  if (hour >= 21 && hour < 24) return 'night';
  return 'late_night';
}

// Get a human-readable time label in Arabic
function getTimeLabel(): string {
  const time = getTimeOfDay();
  const labels: Record<TimeOfDay, string> = {
    morning: 'الصبح',
    afternoon: 'الظهر',
    evening: 'العصر',
    night: 'بالليل',
    late_night: 'الليل',
  };
  return labels[time];
}

// Score-based station category detection to avoid false positives
export function detectStationCategory(station: RadioStation): StationCategory {
  const tags = (station.tags || '').toLowerCase().trim();
  const name = (station.name || '').toLowerCase().trim();
  const combined = `${name} ${tags}`;
  
  let quranScore = 0;
  let islamicScore = 0;
  let relaxScore = 0;
  let energyScore = 0;
  let newsScore = 0;
  let musicScore = 0;
  
  // === Quran detection (strict - needs high confidence) ===
  const quranKeywords = ['quran', 'قرآن', 'قران', 'koran', 'quran kareem', 'قرآن كريم'];
  const quranStrongKeywords = ['quran radio', 'إذاعة القرآن', 'quran station', 'radio quran'];
  
  for (const kw of quranKeywords) {
    if (combined.includes(kw)) quranScore += 2;
  }
  for (const kw of quranStrongKeywords) {
    if (combined.includes(kw)) quranScore += 3;
  }
  // Disqualify from Quran if it has music/pop keywords
  const musicDisqualifiers = ['pop', 'rock', 'jazz', 'dance', 'remix', 'dj', 'موسيقى', 'أغاني', 'songs', 'hip hop', 'rap', 'electronic'];
  for (const dq of musicDisqualifiers) {
    if (combined.includes(dq)) quranScore -= 5;
  }
  
  // === Islamic content detection ===
  const islamicKeywords = ['islam', 'islamic', 'إسلام', 'nasheed', 'أناشيد', 'انشيد', 'tilawat', 'تلاوة', 'دعاء', 'dua', 'sheikh', 'شيخ', 'محمد', 'محمد'];
  for (const kw of islamicKeywords) {
    if (combined.includes(kw)) islamicScore += 2;
  }
  
  // === Relaxing detection ===
  const relaxKeywords = ['calm', 'relax', 'هادئ', 'peaceful', 'sleep', 'نوم', 'meditation', 'chill', 'ambient', 'lo-fi', 'lofi', 'piano', 'بيانو', 'nature', 'طبيعة', 'jazz'];
  for (const kw of relaxKeywords) {
    if (combined.includes(kw)) relaxScore += 2;
  }
  
  // === Energetic detection ===
  const energyKeywords = ['energetic', 'workout', 'نشيط', 'dance', 'party', 'upbeat', 'club', 'gym', 'رياضة', 'sport'];
  for (const kw of energyKeywords) {
    if (combined.includes(kw)) energyScore += 2;
  }
  
  // === News detection ===
  const newsKeywords = ['news', 'أخبار', 'akhbar', 'talk', 'حوار', 'سياسة', 'politics'];
  for (const kw of newsKeywords) {
    if (combined.includes(kw)) newsScore += 2;
  }
  
  // === Music detection ===
  const musicKeywords = ['music', 'موسيقى', 'pop', 'songs', 'أغاني', 'rock', 'jazz', 'hits', 'راديو', 'radio fm', 'top 40'];
  for (const kw of musicKeywords) {
    if (combined.includes(kw)) musicScore += 1;
  }
  
  // Find the highest scoring category (minimum threshold of 2)
  const scores: { cat: StationCategory; score: number }[] = [
    { cat: 'quran', score: quranScore },
    { cat: 'islamic', score: islamicScore },
    { cat: 'relaxing', score: relaxScore },
    { cat: 'energetic', score: energyScore },
    { cat: 'news', score: newsScore },
    { cat: 'music', score: musicScore },
  ];
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // Only accept the top category if score is at least 2 and there's a clear winner
  if (scores[0].score >= 2 && scores[0].score > (scores[1]?.score || 0)) {
    return scores[0].cat;
  }
  
  // Check if trending (high click count)
  if (station.clickcount > 10000 || station.clicktrend > 100) {
    return 'trending';
  }
  
  // Default to general if no clear category
  return 'general';
}

// Dynamic share message templates
interface ShareMessage {
  ar: string;
  en: string;
}

const SHARE_MESSAGES: Record<StationCategory, Record<TimeOfDay, ShareMessage[]>> = {
  quran: {
    morning: [
      { ar: 'ابدأ يومك بآيات القرآن الكريم', en: 'Start your day with Quran verses' },
      { ar: 'صباح النور! استمع للقرآن وابدأ يومك براحة بال', en: 'Good morning! Listen to Quran and start your day with peace' },
      { ar: 'بكرة الصبح والقرآن أحلى شيء تسمعه', en: 'The Quran is the best thing to listen to in the morning' },
      { ar: 'جرب تسمع القرآن من المحطة دي، هتحس براحة', en: 'Try listening to Quran from this station, you will feel at peace' },
      { ar: 'استمع للقرآن الكريم وابدأ يومك بإيمان', en: 'Listen to the Holy Quran and start your day with faith' },
      { ar: 'محطة قرآنية حلوة، جربها الصبح', en: 'A nice Quran station, try it in the morning' },
      { ar: 'أفضل بداية لليوم سماع القرآن الكريم', en: 'The best start to the day is listening to the Holy Quran' },
      { ar: 'استمع لتلاوة خاشعة مع المحطة دي', en: 'Listen to a reverent recitation with this station' },
      { ar: 'صباحك قرآن، جرب المحطة دي', en: 'Make your morning with Quran, try this station' },
      { ar: 'القرآن الكريم في الصبح نور للقلب', en: 'The Holy Quran in the morning is light for the heart' },
    ],
    afternoon: [
      { ar: 'خد بريك واسمع شوية قرآن، القلب بيحتاج', en: 'Take a break and listen to some Quran, the heart needs it' },
      { ar: 'استراحة مع القرآن الكريم في وقت الظهيرة', en: 'A break with the Holy Quran at noon' },
      { ar: 'بعد الظهر جرب تسمع القرآن، الراحة روحانية', en: 'In the afternoon try listening to Quran, it is spiritual rest' },
      { ar: 'محطة قرآنية ممتازة، جربها دلوقتي', en: 'An excellent Quran station, try it now' },
      { ar: 'استمع للقرآن في وقت راحتك', en: 'Listen to Quran during your break time' },
      { ar: 'القرآن في الظهر هديك طاقة للنصف التاني من اليوم', en: 'Quran at noon will give you energy for the second half of the day' },
      { ar: 'جرب المحطة دي لسماع القرآن الكريم', en: 'Try this station for listening to the Holy Quran' },
      { ar: 'تلاوة قرآنية خاشعة على مدار الساعة', en: 'Reverent Quran recitation around the clock' },
      { ar: 'اسمع القرآن وارتاح روحانياً', en: 'Listen to Quran and rest spiritually' },
      { ar: 'أحلى تلاوة قرآنية، جرب المحطة دي', en: 'The best Quran recitation, try this station' },
    ],
    evening: [
      { ar: 'استمع للقرآن بعد العصر، أحلى وقت للتدبر', en: 'Listen to Quran after Asr, the best time for reflection' },
      { ar: 'أمسية قرآنية هادئة مع المحطة دي', en: 'A peaceful Quranic evening with this station' },
      { ar: 'وقت هدوء واستماع للقرآن الكريم', en: 'Time for calmness and listening to the Holy Quran' },
      { ar: 'جرب تسمع القرآن من المحطة دي في المساء', en: 'Try listening to Quran from this station in the evening' },
      { ar: 'المحطة دي قرآن كريم على طول، جربها', en: 'This station has Quran all the time, try it' },
      { ar: 'استمع للقرآن وارتاح بعد يوم شغال', en: 'Listen to Quran and rest after a busy day' },
      { ar: 'تلاوة قرآنية هتديك الراحة', en: 'Quran recitation that will give you peace' },
      { ar: 'القرآن في المساء نور وهدوء', en: 'Quran in the evening is light and calmness' },
      { ar: 'محطة قرآنية مميزة، شوفها بنفسك', en: 'A special Quran station, see for yourself' },
      { ar: 'جرب المحطة دي، قرآن كريم بتلاوة حلوة', en: 'Try this station, Holy Quran with beautiful recitation' },
    ],
    night: [
      { ar: 'استمع للقرآن الكريم في هدوء الليل', en: 'Listen to the Holy Quran in the quiet of the night' },
      { ar: 'القرآن في الليل أحلى، جرب المحطة دي', en: 'Quran is sweeter at night, try this station' },
      { ar: 'محطة قرآنية هتديك راحة في الليل', en: 'A Quran station that will give you peace at night' },
      { ar: 'جرب تسمع القرآن من المحطة دي', en: 'Try listening to Quran from this station' },
      { ar: 'تلاوة خاشعة في وقت هدوء', en: 'Reverent recitation in quiet time' },
      { ar: 'القرآن الكريم في الليل بيرتاح بيه القلب', en: 'The Holy Quran at night brings peace to the heart' },
      { ar: 'استمع للقرآن وهدىء بعد يوم طويل', en: 'Listen to Quran and calm down after a long day' },
      { ar: 'محطة قرآنية جميلة، جربها', en: 'A beautiful Quran station, try it' },
      { ar: 'الليل والقرآن جلسة حلوة', en: 'Night and Quran make a nice session' },
      { ar: 'اسمع القرآن الكريم على المحطة دي', en: 'Listen to the Holy Quran on this station' },
    ],
    late_night: [
      { ar: 'ساعات الليل والقرآن أحلى شيء', en: 'Late night hours and Quran is the best thing' },
      { ar: 'استمع للقرآن في سكون الليل', en: 'Listen to Quran in the stillness of the night' },
      { ar: 'محطة قرآنية تناسب ساعات الليل الهادية', en: 'A Quran station suitable for quiet late night hours' },
      { ar: 'جرب المحطة دي، قرآن كريم على طول', en: 'Try this station, Holy Quran all the time' },
      { ar: 'القرآن في ساعات متأخرة، هدوء للروح', en: 'Quran in late hours, peace for the soul' },
      { ar: 'تلاوة خاشعة في جنح الليل', en: 'Reverent recitation in the darkness of night' },
      { ar: 'جرب تسمع القرآن دلوقتي', en: 'Try listening to Quran right now' },
      { ar: 'استماع للقرآن في وقت السكون', en: 'Listening to Quran in the time of silence' },
    ],
  },
  islamic: {
    morning: [
      { ar: 'صباح إيماني! محتوى إسلامي يبدأ بيها يومك', en: 'A faithful morning! Islamic content to start your day' },
      { ar: 'ابدأ يومك بأناشيد وأدعية جميلة', en: 'Start your day with beautiful nasheeds and supplications' },
      { ar: 'محطة إسلامية ممتازة، جربها الصبح', en: 'An excellent Islamic station, try it in the morning' },
      { ar: 'أناشيد وبرامج إسلامية على مدار الساعة', en: 'Nasheeds and Islamic programs around the clock' },
      { ar: 'استمع لمحتوى إسلامي مفيد وريّح قلبك', en: 'Listen to useful Islamic content and comfort your heart' },
      { ar: 'محطة إسلامية حلوة، جربها', en: 'A nice Islamic station, try it' },
      { ar: 'ابدأ يومك بذكر الله وأناشيد جميلة', en: 'Start your day with remembrance of Allah and beautiful nasheeds' },
      { ar: 'محتوى إسلامي يديك طاقة إيجابية', en: 'Islamic content that gives you positive energy' },
    ],
    afternoon: [
      { ar: 'استراحة ظهر مع أناشيد وبرامج إسلامية', en: 'Noon break with nasheeds and Islamic programs' },
      { ar: 'جرب المحطة دي، محتوى إسلامي حلو', en: 'Try this station, nice Islamic content' },
      { ar: 'خد بريك واسمع أناشيد هتديك راحة', en: 'Take a break and listen to nasheeds that will comfort you' },
      { ar: 'وقت راحة مع محتوى إسلامي مفيد', en: 'Rest time with useful Islamic content' },
      { ar: 'استمع لأناشيد جميلة في وقت فراغك', en: 'Listen to beautiful nasheeds in your free time' },
      { ar: 'محطة إسلامية رائعة، جربها دلوقتي', en: 'A wonderful Islamic station, try it now' },
      { ar: 'أناشيد وذكريات إسلامية طيبة', en: 'Islamic nasheeds and good memories' },
      { ar: 'استمع لمحتوى إسلامي متجدد', en: 'Listen to fresh Islamic content' },
    ],
    evening: [
      { ar: 'أمسية إيمانية هادئة مع المحطة دي', en: 'A peaceful faithful evening with this station' },
      { ar: 'استمع لأناشيد وبرامج إسلامية بعد العصر', en: 'Listen to nasheeds and Islamic programs after Asr' },
      { ar: 'محتوى إسلامي يجدد الروح والطاقة', en: 'Islamic content that renews the soul and energy' },
      { ar: 'جرب المحطة دي في المساء، هتعجبك', en: 'Try this station in the evening, you will like it' },
      { ar: 'أناشيد هادئة وقت هدوء', en: 'Calm nasheeds in quiet time' },
      { ar: 'استمع لمحتوى إسلامي مميز', en: 'Listen to special Islamic content' },
      { ar: 'محطة إسلامية جميلة، شوفها بنفسك', en: 'A beautiful Islamic station, see for yourself' },
      { ar: 'برامج وأناشيد إسلامية متنوعة', en: 'Various Islamic programs and nasheeds' },
    ],
    night: [
      { ar: 'أناشيد إسلامية هادية في الليل', en: 'Calm Islamic nasheeds at night' },
      { ar: 'استمع لمحتوى إسلامي في هدوء الليل', en: 'Listen to Islamic content in the quiet of the night' },
      { ar: 'جرب المحطة دي، محتوى إسلامي حلو', en: 'Try this station, nice Islamic content' },
      { ar: 'أناشيد وذكريات طيبة في الليل', en: 'Nasheeds and good memories at night' },
      { ar: 'استمع لأناشيد هتديك راحة بعد يوم شغال', en: 'Listen to nasheeds that will comfort you after a busy day' },
      { ar: 'محطة إسلامية مميزة، جربها', en: 'A special Islamic station, try it' },
      { ar: 'محتوى إسلامي مفيد ومتنوع', en: 'Useful and varied Islamic content' },
      { ar: 'أناشيد جميلة على مدار الساعة', en: 'Beautiful nasheeds around the clock' },
    ],
    late_night: [
      { ar: 'ساعات متأخرة مع أناشيد إسلامية جميلة', en: 'Late hours with beautiful Islamic nasheeds' },
      { ar: 'جرب المحطة دي، محتوى إسلامي مميز', en: 'Try this station, special Islamic content' },
      { ar: 'استمع لأناشيد في سكون الليل', en: 'Listen to nasheeds in the stillness of night' },
      { ar: 'أناشيد وبرامج إسلامية تناسب الليل', en: 'Islamic nasheeds and programs suitable for night' },
      { ar: 'محطة إسلامية على طول، جربها', en: 'An Islamic station all the time, try it' },
      { ar: 'استمع لمحتوى إسلامي مفيد', en: 'Listen to useful Islamic content' },
    ],
  },
  relaxing: {
    morning: [
      { ar: 'ابدأ يومك بهدوء واسترخاء', en: 'Start your day with calmness and relaxation' },
      { ar: 'صباح هادي مع محطة رائعة', en: 'A calm morning with a wonderful station' },
      { ar: 'جرب المحطة دي، هتديك طاقة هادية', en: 'Try this station, it will give you calm energy' },
      { ar: 'استمع لموسيقى هادية وابدأ يومك براحة', en: 'Listen to calm music and start your day relaxed' },
      { ar: 'محطة هادئة ومناسبة للصبح', en: 'A calm station suitable for morning' },
      { ar: 'جرب تسمع المحطة دي في الصبح', en: 'Try listening to this station in the morning' },
      { ar: 'ابدأ يومك بموسيقى هادية ومريحة', en: 'Start your day with calm and relaxing music' },
      { ar: 'استرخي مع المحطة دي وابدأ يومك', en: 'Relax with this station and start your day' },
      { ar: 'موسيقى هادية مناسبة لبدء اليوم', en: 'Calm music suitable for starting the day' },
      { ar: 'جرب المحطة دي لو عايز هدوء', en: 'Try this station if you want calmness' },
    ],
    afternoon: [
      { ar: 'استراحة ظهر مع موسيقى هادية', en: 'Noon break with calm music' },
      { ar: 'لو عايز تهدى شوية جرب المحطة دي', en: 'If you want to relax a bit try this station' },
      { ar: 'محطة رائعة للاسترخاء في وقت الظهيرة', en: 'A wonderful station for relaxation at noon' },
      { ar: 'جرب المحطة دي، هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'استمع لموسيقى هادية في وقت فراغك', en: 'Listen to calm music in your free time' },
      { ar: 'خد بريك واسمع حاجة هادية', en: 'Take a break and listen to something calm' },
      { ar: 'محطة هادئة تناسب وقت الظهر', en: 'A calm station suitable for noon time' },
      { ar: 'استرخي شوية مع المحطة دي', en: 'Relax a bit with this station' },
    ],
    evening: [
      { ar: 'أمسية هادئة مع محطة رائعة', en: 'A calm evening with a wonderful station' },
      { ar: 'استرخي بعد يوم شغال مع المحطة دي', en: 'Relax after a busy day with this station' },
      { ar: 'جرب المحطة دي في المساء، هتديك راحة', en: 'Try this station in the evening, it will comfort you' },
      { ar: 'موسيقى هادية مناسبة للمساء', en: 'Calm music suitable for the evening' },
      { ar: 'استمع لمحطة هادئة في وقت هدوء', en: 'Listen to a calm station in quiet time' },
      { ar: 'جرب المحطة دي لو عايز تسترخي', en: 'Try this station if you want to relax' },
      { ar: 'محطة رائعة للاسترخاء والمساء', en: 'A wonderful station for relaxation and evening' },
      { ar: 'استمع للمحطة دي وارتاح', en: 'Listen to this station and rest' },
    ],
    night: [
      { ar: 'استمع لمحطة هادئة في الليل', en: 'Listen to a calm station at night' },
      { ar: 'جرب المحطة دي، هادية ومريحة', en: 'Try this station, it is calm and relaxing' },
      { ar: 'محطة رائعة للاستماع في الليل', en: 'A wonderful station for listening at night' },
      { ar: 'استرخي مع موسيقى هادية', en: 'Relax with calm music' },
      { ar: 'جرب تسمع المحطة دي', en: 'Try listening to this station' },
      { ar: 'استمع للمحطة دي في وقت هدوء', en: 'Listen to this station in quiet time' },
      { ar: 'محطة هادئة تناسب الليل', en: 'A calm station suitable for night' },
      { ar: 'جرب المحطة دي هتعجبك', en: 'Try this station, you will like it' },
    ],
    late_night: [
      { ar: 'محطة هادئة في ساعات متأخرة', en: 'A calm station in late hours' },
      { ar: 'جرب المحطة دي، مناسبة لليل', en: 'Try this station, suitable for night' },
      { ar: 'استمع لموسيقى هادية في سكون الليل', en: 'Listen to calm music in the stillness of night' },
      { ar: 'جرب تسمع المحطة دي دلوقتي', en: 'Try listening to this station right now' },
      { ar: 'استرخي مع المحطة دي', en: 'Relax with this station' },
      { ar: 'محطة رائعة لساعات الليل الهادية', en: 'A wonderful station for quiet night hours' },
    ],
  },
  energetic: {
    morning: [
      { ar: 'ابدأ يومك بطاقة ونشاط', en: 'Start your day with energy and activity' },
      { ar: 'صباح نشيط مع المحطة دي', en: 'An energetic morning with this station' },
      { ar: 'جرب المحطة دي هتديك طاقة', en: 'Try this station, it will give you energy' },
      { ar: 'موسيقى نشيطة لبدء يومك بقوة', en: 'Upbeat music to start your day strong' },
      { ar: 'ابدأ يومك بموسيقى محفزة', en: 'Start your day with motivating music' },
      { ar: 'جرب المحطة دي في الصبح هتفضلك', en: 'Try this station in the morning, it will energize you' },
      { ar: 'محطة رياضية ونشيطة، جربها', en: 'A sports and energetic station, try it' },
      { ar: 'استمع لموسيقى هتخليك تنشط', en: 'Listen to music that will activate you' },
    ],
    afternoon: [
      { ar: 'عايز طاقة؟ جرب المحطة دي', en: 'Need energy? Try this station' },
      { ar: 'موسيقى نشيطة لوقت الظهر', en: 'Upbeat music for noon time' },
      { ar: 'جرب المحطة دي هتخليك تنشط', en: 'Try this station, it will activate you' },
      { ar: 'استمع لمحطة مليانة طاقة', en: 'Listen to a station full of energy' },
      { ar: 'جرب المحطة دي في وقت فراغك', en: 'Try this station in your free time' },
      { ar: 'موسيقى محفزة ومناسبة للنشاط', en: 'Motivating music suitable for activity' },
      { ar: 'جرب المحطة دي، هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'استمع لمحطة رائعة هتديك طاقة', en: 'Listen to a wonderful station that will give you energy' },
    ],
    evening: [
      { ar: 'سهرة مليانة طاقة مع المحطة دي', en: 'A night full of energy with this station' },
      { ar: 'جرب المحطة دي هتخليك تنشط', en: 'Try this station, it will activate you' },
      { ar: 'موسيقى نشيطة للمساء', en: 'Upbeat music for the evening' },
      { ar: 'استمع لمحطة مليانة حيوية', en: 'Listen to a station full of vitality' },
      { ar: 'جرب المحطة دي، رائعة', en: 'Try this station, it is wonderful' },
      { ar: 'استمع لموسيقى محفزة', en: 'Listen to motivating music' },
      { ar: 'محطة نشيطة ومليانة طاقة', en: 'An energetic station full of energy' },
    ],
    night: [
      { ar: 'سهرة مليانة طاقة مع المحطة دي', en: 'A night full of energy with this station' },
      { ar: 'جرب المحطة دي لو لسه موعود', en: 'Try this station if you are still up' },
      { ar: 'استمع لموسيقى نشيطة', en: 'Listen to upbeat music' },
      { ar: 'جرب المحطة دي، مليانة طاقة', en: 'Try this station, full of energy' },
      { ar: 'موسيقى محفزة لليل', en: 'Motivating music for the night' },
      { ar: 'استمع لمحطة رائعة', en: 'Listen to a wonderful station' },
    ],
    late_night: [
      { ar: 'لسه موعود؟ جرب المحطة دي', en: 'Still up? Try this station' },
      { ar: 'موسيقى نشيطة في ساعات متأخرة', en: 'Upbeat music in late hours' },
      { ar: 'جرب المحطة دي دلوقتي', en: 'Try this station right now' },
      { ar: 'استمع لمحطة مليانة طاقة', en: 'Listen to a station full of energy' },
      { ar: 'جرب المحطة دي هتفيّدك', en: 'Try this station, it will keep you going' },
    ],
  },
  news: {
    morning: [
      { ar: 'تابع آخر الأخبار مع المحطة دي', en: 'Follow the latest news with this station' },
      { ar: 'ابدأ يومك بآخر الأخبار والمستجدات', en: 'Start your day with the latest news and updates' },
      { ar: 'محطة أخبار ممتازة، جربها الصبح', en: 'An excellent news station, try it in the morning' },
      { ar: 'تابع الأخبار مع المحطة دي', en: 'Follow the news with this station' },
      { ar: 'استمع لآخر الأخبار والمستجدات', en: 'Listen to the latest news and updates' },
      { ar: 'جرب المحطة دي لو عايز تعرف الأخبار', en: 'Try this station if you want to know the news' },
      { ar: 'محطة أخبار رائعة', en: 'A wonderful news station' },
      { ar: 'تابع الأخبار على مدار الساعة', en: 'Follow the news around the clock' },
    ],
    afternoon: [
      { ar: 'تابع آخر الأخبار في وقت الظهيرة', en: 'Follow the latest news at noon' },
      { ar: 'جرب المحطة دي لو عايز تابع الأخبار', en: 'Try this station if you want to follow the news' },
      { ar: 'استمع لآخر الأخبار والمستجدات', en: 'Listen to the latest news and updates' },
      { ar: 'محطة أخبار على طول', en: 'A news station all the time' },
      { ar: 'تابع الأخبار مع المحطة دي', en: 'Follow the news with this station' },
      { ar: 'جرب المحطة دي للأخبار', en: 'Try this station for news' },
      { ar: 'آخر الأخبار والمستجدات', en: 'The latest news and updates' },
      { ar: 'استمع لمحطة أخبار مميزة', en: 'Listen to a special news station' },
    ],
    evening: [
      { ar: 'تابع آخر الأخبار في المساء', en: 'Follow the latest news in the evening' },
      { ar: 'جرب المحطة دي للأخبار والتحليلات', en: 'Try this station for news and analysis' },
      { ar: 'استمع لآخر الأخبار بعد العصر', en: 'Listen to the latest news after Asr' },
      { ar: 'محطة أخبار ممتازة', en: 'An excellent news station' },
      { ar: 'تابع الأخبار مع المحطة دي', en: 'Follow the news with this station' },
      { ar: 'جرب المحطة دي لو عايز تابع الأخبار', en: 'Try this station if you want to follow the news' },
      { ar: 'استمع لآخر المستجدات', en: 'Listen to the latest updates' },
    ],
    night: [
      { ar: 'تابع ملخص أخبار اليوم', en: "Follow today's news summary" },
      { ar: 'جرب المحطة دي لو عايز تابع الأخبار', en: 'Try this station if you want to follow the news' },
      { ar: 'استمع لآخر الأخبار', en: 'Listen to the latest news' },
      { ar: 'محطة أخبار على طول، جربها', en: 'A news station all the time, try it' },
      { ar: 'تابع الأخبار في الليل', en: 'Follow the news at night' },
      { ar: 'جرب المحطة دي للأخبار', en: 'Try this station for news' },
      { ar: 'استمع لمحطة أخبار مميزة', en: 'Listen to a special news station' },
    ],
    late_night: [
      { ar: 'تابع آخر الأخبار في ساعات متأخرة', en: 'Follow the latest news in late hours' },
      { ar: 'جرب المحطة دي للأخبار', en: 'Try this station for news' },
      { ar: 'استمع لآخر الأخبار والمستجدات', en: 'Listen to the latest news and updates' },
      { ar: 'محطة أخبار رائعة', en: 'A wonderful news station' },
      { ar: 'تابع الأخبار مع المحطة دي', en: 'Follow the news with this station' },
      { ar: 'جرب المحطة دي دلوقتي', en: 'Try this station right now' },
    ],
  },
  music: {
    morning: [
      { ar: 'صباح مليان موسيقى حلوة', en: 'A morning full of nice music' },
      { ar: 'ابدأ يومك بموسيقى جميلة من المحطة دي', en: 'Start your day with beautiful music from this station' },
      { ar: 'جرب المحطة دي، موسيقى حلوة', en: 'Try this station, nice music' },
      { ar: 'استمع لأغاني حلوة وابدأ يومك', en: 'Listen to nice songs and start your day' },
      { ar: 'موسيقى حلوة مناسبة للصبح', en: 'Nice music suitable for morning' },
      { ar: 'جرب المحطة دي في الصبح', en: 'Try this station in the morning' },
      { ar: 'ابدأ يومك بأغاني رائعة', en: 'Start your day with wonderful songs' },
      { ar: 'استمع لموسيقى متنوعة وجميلة', en: 'Listen to varied and beautiful music' },
      { ar: 'محطة موسيقية ممتازة، جربها', en: 'An excellent music station, try it' },
      { ar: 'أغاني حلوة على مدار الساعة', en: 'Nice songs around the clock' },
    ],
    afternoon: [
      { ar: 'استراحة ظهر مع موسيقى حلوة', en: 'Noon break with nice music' },
      { ar: 'جرب المحطة دي، موسيقى رائعة', en: 'Try this station, wonderful music' },
      { ar: 'استمع لأغاني حلوة في وقت فراغك', en: 'Listen to nice songs in your free time' },
      { ar: 'محطة موسيقية مميزة، جربها', en: 'A special music station, try it' },
      { ar: 'جرب تسمع المحطة دي', en: 'Try listening to this station' },
      { ar: 'موسيقى حلوة لوقت الظهر', en: 'Nice music for noon time' },
      { ar: 'استمع لموسيقى متنوعة', en: 'Listen to varied music' },
      { ar: 'جرب المحطة دي هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'أغاني رائعة على المحطة دي', en: 'Wonderful songs on this station' },
      { ar: 'استرخي مع موسيقى حلوة', en: 'Relax with nice music' },
    ],
    evening: [
      { ar: 'أمسية موسيقية جميلة مع المحطة دي', en: 'A beautiful musical evening with this station' },
      { ar: 'جرب المحطة دي في المساء', en: 'Try this station in the evening' },
      { ar: 'استمع لموسيقى حلوة بعد العصر', en: 'Listen to nice music after Asr' },
      { ar: 'محطة موسيقية رائعة، جربها', en: 'A wonderful music station, try it' },
      { ar: 'أغاني جميلة تناسب المساء', en: 'Beautiful songs suitable for the evening' },
      { ar: 'استمع للمحطة دي، موسيقى متنوعة', en: 'Listen to this station, varied music' },
      { ar: 'جرب المحطة دي هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'استمع لموسيقى رائعة في المساء', en: 'Listen to wonderful music in the evening' },
      { ar: 'محطة ممتازة للأغاني والموسيقى', en: 'An excellent station for songs and music' },
    ],
    night: [
      { ar: 'استمع لموسيقى حلوة في الليل', en: 'Listen to nice music at night' },
      { ar: 'جرب المحطة دي، موسيقى رائعة', en: 'Try this station, wonderful music' },
      { ar: 'أغاني حلوة تناسب الليل', en: 'Nice songs suitable for night' },
      { ar: 'جرب تسمع المحطة دي', en: 'Try listening to this station' },
      { ar: 'استمع لموسيقى متنوعة وجميلة', en: 'Listen to varied and beautiful music' },
      { ar: 'محطة موسيقية مميزة', en: 'A special music station' },
      { ar: 'جرب المحطة دي هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'استمع لأغاني حلوة', en: 'Listen to nice songs' },
    ],
    late_night: [
      { ar: 'موسيقى حلوة في ساعات متأخرة', en: 'Nice music in late hours' },
      { ar: 'جرب المحطة دي، موسيقى رائعة', en: 'Try this station, wonderful music' },
      { ar: 'استمع لموسيقى هادية ومتنوعة', en: 'Listen to calm and varied music' },
      { ar: 'جرب تسمع المحطة دي دلوقتي', en: 'Try listening to this station right now' },
      { ar: 'محطة موسيقية مميزة، شوفها', en: 'A special music station, check it out' },
      { ar: 'استمع لأغاني حلوة على المحطة دي', en: 'Listen to nice songs on this station' },
    ],
  },
  trending: {
    morning: [
      { ar: 'المحطة دي تريند دلوقتي، جربها', en: 'This station is trending now, try it' },
      { ar: 'الناس بتسمعها دلوقتي، شوف بنفسك', en: 'People are listening to it now, see for yourself' },
      { ar: 'محطة تريند ومحبوبة، جربها', en: 'A trending and popular station, try it' },
      { ar: 'جرب المحطة دي، كل الناس بتسمعها', en: 'Try this station, everyone is listening to it' },
      { ar: 'المحطة دي ناجحة جدًا، جربها', en: 'This station is very successful, try it' },
      { ar: 'من أكثر المحطات اللي بتتسمع، جربها', en: 'One of the most listened to stations, try it' },
      { ar: 'شوف المحطة دي ليها شوكة كبيرة', en: 'Check out this station, it has a big audience' },
      { ar: 'المحطة دي مشهورة، جربها بنفسك', en: 'This station is famous, try it yourself' },
    ],
    afternoon: [
      { ar: 'المحطة دي تريند، لازم تسمعها', en: 'This station is trending, you must listen to it' },
      { ar: 'جرب المحطة دي، الناس بتحبها', en: 'Try this station, people love it' },
      { ar: 'من المحطات الأكثر شعبية دلوقتي', en: 'One of the most popular stations right now' },
      { ar: 'المحطة دي ناجحة جدًا، جربها', en: 'This station is very successful, try it' },
      { ar: 'جرب تسمع المحطة دي', en: 'Try listening to this station' },
      { ar: 'المحطة دي عليها طلب كبير', en: 'This station is in high demand' },
      { ar: 'جرب المحطة دي هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'من أشهر المحطات دلوقتي', en: 'One of the most famous stations right now' },
    ],
    evening: [
      { ar: 'المحطة دي تريند في المساء، جربها', en: 'This station is trending in the evening, try it' },
      { ar: 'جرب المحطة دي، الناس بتسمعها دلوقتي', en: 'Try this station, people are listening to it now' },
      { ar: 'من المحطات الأكثر شعبية', en: 'One of the most popular stations' },
      { ar: 'المحطة دي ناجحة، جربها بنفسك', en: 'This station is successful, try it yourself' },
      { ar: 'جرب تسمع المحطة دي', en: 'Try listening to this station' },
      { ar: 'المحطة دي ليها مستمعين كتير', en: 'This station has many listeners' },
      { ar: 'شوف المحطة دي بنفسك', en: 'Check out this station yourself' },
    ],
    night: [
      { ar: 'الناس بتسمعها دلوقتي، جربها', en: 'People are listening to it now, try it' },
      { ar: 'المحطة دي تريند، جربها بنفسك', en: 'This station is trending, try it yourself' },
      { ar: 'من المحطات الأكثر شعبية في الليل', en: 'One of the most popular stations at night' },
      { ar: 'جرب المحطة دي هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'المحطة دي عليها طلب كبير', en: 'This station is in high demand' },
      { ar: 'جرب تسمع المحطة دي', en: 'Try listening to this station' },
    ],
    late_night: [
      { ar: 'المحطة دي تريند حتى في الليل', en: 'This station is trending even at night' },
      { ar: 'جرب المحطة دي، ناس كتير بتسمعها', en: 'Try this station, many people are listening to it' },
      { ar: 'من أشهر المحطات، جربها', en: 'One of the most famous stations, try it' },
      { ar: 'جرب تسمع المحطة دي دلوقتي', en: 'Try listening to this station right now' },
      { ar: 'المحطة دي ناجحة ومحبوبة', en: 'This station is successful and loved' },
    ],
  },
  general: {
    morning: [
      { ar: 'جرب المحطة دي، حلوة جدًا', en: 'Try this station, it is very nice' },
      { ar: 'صباح جميل مع محطة راديو حلوة', en: 'A beautiful morning with a nice radio station' },
      { ar: 'ابدأ يومك مع المحطة دي', en: 'Start your day with this station' },
      { ar: 'جرب تسمع المحطة دي في الصبح', en: 'Try listening to this station in the morning' },
      { ar: 'محطة راديو ممتازة، جربها', en: 'An excellent radio station, try it' },
      { ar: 'جرب المحطة دي هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'ابدأ يومك بمحطة راديو رائعة', en: 'Start your day with a wonderful radio station' },
      { ar: 'استمع للمحطة دي وابدأ يومك', en: 'Listen to this station and start your day' },
      { ar: 'محطة حلوة تناسب الصبح', en: 'A nice station suitable for morning' },
      { ar: 'جرب المحطة دي لو عايز حاجة حلوة', en: 'Try this station if you want something nice' },
    ],
    afternoon: [
      { ar: 'جرب المحطة دي، هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'استمع لمحطة راديو حلوة في وقت فراغك', en: 'Listen to a nice radio station in your free time' },
      { ar: 'جرب تسمع المحطة دي', en: 'Try listening to this station' },
      { ar: 'محطة راديو مميزة، جربها', en: 'A special radio station, try it' },
      { ar: 'استمع للمحطة دي في وقت الظهر', en: 'Listen to this station at noon' },
      { ar: 'جرب المحطة دي لو عايز حاجة جديدة', en: 'Try this station if you want something new' },
      { ar: 'محطة حلوة على مدار الساعة', en: 'A nice station around the clock' },
      { ar: 'خد بريك واسمع المحطة دي', en: 'Take a break and listen to this station' },
      { ar: 'جرب المحطة دي هتديك راحة', en: 'Try this station, it will comfort you' },
      { ar: 'استمع لمحطة راديو رائعة', en: 'Listen to a wonderful radio station' },
    ],
    evening: [
      { ar: 'أمسية مع محطة راديو جميلة', en: 'An evening with a beautiful radio station' },
      { ar: 'جرب المحطة دي في المساء', en: 'Try this station in the evening' },
      { ar: 'استمع لمحطة راديو مميزة', en: 'Listen to a special radio station' },
      { ar: 'جرب المحطة دي هتعجبك', en: 'Try this station, you will like it' },
      { ar: 'محطة حلوة تناسب المساء', en: 'A nice station suitable for the evening' },
      { ar: 'جرب تسمع المحطة دي', en: 'Try listening to this station' },
      { ar: 'استمع للمحطة دي بعد يوم شغال', en: 'Listen to this station after a busy day' },
      { ar: 'محطة راديو رائعة، شوفها بنفسك', en: 'A wonderful radio station, check it out yourself' },
      { ar: 'جرب المحطة دي لو عايز حاجة حلوة', en: 'Try this station if you want something nice' },
      { ar: 'استمع لمحطة مميزة في المساء', en: 'Listen to a special station in the evening' },
    ],
    night: [
      { ar: 'جرب المحطة دي، حلوة جدًا', en: 'Try this station, it is very nice' },
      { ar: 'استمع لمحطة راديو رائعة في الليل', en: 'Listen to a wonderful radio station at night' },
      { ar: 'جرب تسمع المحطة دي', en: 'Try listening to this station' },
      { ar: 'محطة حلوة تناسب الليل', en: 'A nice station suitable for night' },
      { ar: 'استمع للمحطة دي هتعجبك', en: 'Listen to this station, you will like it' },
      { ar: 'جرب المحطة دي لو عايز حاجة مميزة', en: 'Try this station if you want something special' },
      { ar: 'محطة راديو ممتازة، جربها', en: 'An excellent radio station, try it' },
      { ar: 'استمع لمحطة راديو حلوة', en: 'Listen to a nice radio station' },
      { ar: 'جرب المحطة دي شوف بنفسك', en: 'Try this station and see for yourself' },
      { ar: 'استمع للمحطة دي في وقت هدوء', en: 'Listen to this station in quiet time' },
    ],
    late_night: [
      { ar: 'محطة راديو حلوة في ساعات متأخرة', en: 'A nice radio station in late hours' },
      { ar: 'جرب المحطة دي، مميزة', en: 'Try this station, it is special' },
      { ar: 'استمع لمحطة راديو رائعة', en: 'Listen to a wonderful radio station' },
      { ar: 'جرب تسمع المحطة دي دلوقتي', en: 'Try listening to this station right now' },
      { ar: 'محطة حلوة تناسب الليل', en: 'A nice station suitable for night' },
      { ar: 'جرب المحطة دي لو لسه موعود', en: 'Try this station if you are still up' },
      { ar: 'استمع للمحطة دي في سكون الليل', en: 'Listen to this station in the stillness of night' },
      { ar: 'محطة راديو مميزة، شوفها', en: 'A special radio station, check it out' },
    ],
  },
};

// Personalized messages (when user shares from favorites/history) - generic ones that work anytime
const PERSONALIZED_MESSAGES: ShareMessage[] = [
  { ar: 'دي من المحطات اللي أنا بحبها، جربها', en: "This is one of my favorites, try it" },
  { ar: 'المحطة دي بتسمعها كتير، حلوة جدًا', en: "I listen to this station a lot, very nice" },
  { ar: 'دي محطتي المفضلة، جربها', en: "This is my favorite station, try it" },
  { ar: 'باين عليك هتعجبك المحطة دي', en: "I think you will like this station" },
  { ar: 'سمعت المحطة دي وعجبتني جدًا، جربها', en: "I heard this station and really liked it, try it" },
  { ar: 'نصحك بالمحطة دي، حلوة أوي', en: "I recommend this station, it's very nice" },
  { ar: 'المحطة دي لازم تسمعها على الأقل مرة', en: "You must listen to this station at least once" },
  { ar: 'جرب المحطة دي ما تندمش', en: "Try this station, you won't regret it" },
  { ar: 'اكتشفت المحطة دي ودولت حلوة، شاركها معاك', en: "I discovered this station and it's nice, sharing it with you" },
  { ar: 'من أحلى المحطات اللي سمعتها، جربها', en: "One of the nicest stations I've heard, try it" },
  { ar: 'المحطة دي مستحيل تعجبك، جربها دلوقتي', en: "This station will definitely please you, try it now" },
  { ar: 'شغال اسمع المحطة دي دي وكمان حلوة', en: "I'm listening to this station right now and it's nice" },
  { ar: 'لو بتدور على محطة حلوة، جرب دي', en: "If you are looking for a nice station, try this one" },
  { ar: 'المحطة دي قمة، جربها وانت هتفهم', en: "This station is top notch, try it and you'll understand" },
  { ar: 'من المحطات اللي بفضل أسمعها كل يوم', en: "One of the stations I keep listening to every day" },
];

// Call-to-action suffixes (randomized, added to the message)
const CTA_SUFFIXES: ShareMessage[] = [
  { ar: 'جربها دلوقتي!', en: 'Try it now!' },
  { ar: 'شوفها بنفسك!', en: 'See for yourself!' },
  { ar: 'مفيش أروع من كده!', en: 'Nothing beats this!' },
  { ar: 'هتعجبك أوي!', en: 'You will love it!' },
  { ar: 'جربها مش هتندم!', en: 'Try it, you will not regret!' },
  { ar: 'سمعها وانت هتحكم!', en: 'Listen and judge for yourself!' },
  { ar: 'نصحك بيها!', en: 'I recommend it!' },
  { ar: 'بلاش تتردد، جربها!', en: "Don't hesitate, try it!" },
  { ar: 'لازم تسمعها!', en: 'You must listen to it!' },
  { ar: 'حلوة جداً، جربها!', en: 'Very nice, try it!' },
];

// Generate a dynamic share message
export function generateShareMessage(
  station: RadioStation,
  language: 'ar' | 'en' = 'ar',
  isPersonal: boolean = false
): string {
  const category = detectStationCategory(station);
  const timeOfDay = getTimeOfDay();
  
  // Use personalized message if applicable (40% chance)
  if (isPersonal && Math.random() < 0.4) {
    const personalMsg = PERSONALIZED_MESSAGES[Math.floor(Math.random() * PERSONALIZED_MESSAGES.length)];
    return personalMsg[language];
  }
  
  // Get messages for this category and time
  const categoryMessages = SHARE_MESSAGES[category]?.[timeOfDay];
  
  // If category has no messages for this time, fall back to general
  const messages = categoryMessages && categoryMessages.length > 0 
    ? categoryMessages 
    : SHARE_MESSAGES.general[timeOfDay];
  
  // Pick a random message from the pool
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  // 50% chance to add a CTA suffix (only if not already present in message)
  if (Math.random() > 0.5) {
    const suffix = CTA_SUFFIXES[Math.floor(Math.random() * CTA_SUFFIXES.length)];
    return `${message[language]} ${suffix[language]}`;
  }
  
  return message[language];
}

// Generate complete share content (message + deep link)
export interface ShareContent {
  title: string;
  text: string;
  url: string;
}

export function generateShareContent(
  station: RadioStation,
  language: 'ar' | 'en' = 'ar',
  isPersonal: boolean = false
): ShareContent {
  const message = generateShareMessage(station, language, isPersonal);
  
  // Generate deep link URL (relative to app base)
  const deepLink = `/station/${station.stationuuid}`;
  
  return {
    title: station.name,
    text: message,
    url: typeof window !== 'undefined' 
      ? `${window.location.origin}${deepLink}` 
      : deepLink,
  };
}

// Generate OG meta tags for station page
export interface StationMeta {
  title: string;
  description: string;
  image: string;
  url: string;
}

export function generateStationMeta(
  station: RadioStation,
  baseUrl: string
): StationMeta {
  const category = detectStationCategory(station);
  const language = 'ar'; // Default to Arabic for meta tags
  
  // Generate description based on category - only mention category if confident
  const categoryDescriptions: Record<StationCategory, string> = {
    quran: `استمع إلى ${station.name} - إذاعة قرآنية تجلب لك آيات الذكر الحكيم في أي وقت`,
    islamic: `استمع إلى ${station.name} - محتوى إسلامي متنوع من أناشيد وبرامج دينية`,
    relaxing: `استمع إلى ${station.name} - محطة هادئة للاسترخاء والتركيز`,
    energetic: `استمع إلى ${station.name} - محطة نشيطة مليانة طاقة`,
    news: `استمع إلى ${station.name} - آخر الأخبار والتحليلات`,
    music: `استمع إلى ${station.name} - موسيقى متنوعة على مدار الساعة`,
    trending: `استمع إلى ${station.name} - المحطة الأكثر رواجاً الآن`,
    general: `استمع إلى ${station.name} - إذاعة ${station.country || 'متنوعة'}`,
  };
  
  return {
    title: `${station.name} | اسمع راديو`,
    description: categoryDescriptions[category],
    image: station.favicon || `${baseUrl}/og-default.png`,
    url: `${baseUrl}/station/${station.stationuuid}`,
  };
}
