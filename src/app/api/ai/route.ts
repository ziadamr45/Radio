import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

// جلب المحطات
async function fetchStations(params: {
  countryCode?: string;
  tag?: string;
  limit?: number;
  search?: string;
}): Promise<unknown[]> {
  const { countryCode, tag, limit = 5, search } = params;
  
  const RADIO_BROWSER_SERVERS = [
    'https://de1.api.radio-browser.info/json',
    'https://at1.api.radio-browser.info/json',
  ];
  
  for (const baseUrl of RADIO_BROWSER_SERVERS) {
    try {
      let endpoint = '';
      
      if (search) {
        // البحث بالاسم - ديناميكي
        endpoint = `/stations/search?name=${encodeURIComponent(search)}&limit=${limit}&order=clickcount&reverse=true`;
      } else if (countryCode && tag) {
        endpoint = `/stations/bycountrycodeexact/${countryCode}?limit=${limit}&order=clickcount&reverse=true&tag=${encodeURIComponent(tag)}`;
      } else if (countryCode) {
        endpoint = `/stations/bycountrycodeexact/${countryCode}?limit=${limit}&order=clickcount&reverse=true`;
      } else if (tag) {
        endpoint = `/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}`;
      } else {
        endpoint = `/stations/topclick/${limit}`;
      }
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'User-Agent': 'AsmaeRadio/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });
      
      if (!response.ok) continue;
      return await response.json();
    } catch {
      continue;
    }
  }
  
  return [];
}

// استخراج اسم المحطة من رسالة المستخدم
function extractStationName(message: string): string | null {
  const lowerMessage = message.toLowerCase().trim();
  
  // أنماط البحث الشائعة
  const patterns = [
    /شغل\s+(?:لي\s+)?(.+)/i,           // شغل لي [اسم المحطة]
    /شغّل\s+(?:لي\s+)?(.+)/i,          // شغّل لي [اسم المحطة]
    /ابحث\s+(?:عن\s+)?(.+)/i,          // ابحث عن [اسم المحطة]
    /دور\s+(?:على\s+)?(.+)/i,          // دور على [اسم المحطة]
    /play\s+(?:for\s+me\s+)?(.+)/i,    // play for me [station]
    /search\s+(?:for\s+)?(.+)/i,       // search for [station]
    /find\s+(?:me\s+)?(.+)/i,          // find me [station]
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // لو المستخدم كتب اسم المحطة مباشرة
  // نشوف إذا كانت الرسالة مش أمر تاني
  const commandWords = [
    'اوقف', 'وقف', 'إيقاف', 'stop', 'pause',
    'اكتم', 'كتم', 'mute', 'صوت',
    'ليلي', 'نهاري', 'dark', 'light',
    'مساعدة', 'help', 'مرحبا', 'hello',
    'المفضلة', 'favorites', 'السجل', 'history',
    'مؤقت', 'timer', 'نوم', 'sleep'
  ];
  
  const isCommand = commandWords.some(cmd => lowerMessage.includes(cmd));
  
  if (!isCommand && message.length > 2) {
    return message.trim();
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, language = 'ar', context, stationQuery } = body;
    
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 });
    }

    const isArabic = language === 'ar';
    
    // البحث عن محطة
    let stations: unknown[] = [];
    let searchQuery = stationQuery || extractStationName(message);
    
    if (searchQuery) {
      // البحث الديناميكي - أي اسم محطة
      stations = await fetchStations({ search: searchQuery, limit: 5 });
      
      // لو ملقيناش، نجرب نبحث بالتاج
      if (stations.length === 0) {
        stations = await fetchStations({ tag: searchQuery, limit: 5 });
      }
    }
    
    const zai = await ZAI.create();
    
    // بناء الـ context
    const contextStr = context ? `
حالة التطبيق الحالية:
- اللغة: ${context.language === 'ar' ? 'العربية' : 'English'}
- المظهر: ${context.theme === 'dark' ? 'ليلي' : 'نهاري'}
- المحطة الحالية: ${context.currentStation?.name || 'لا توجد'}
- التشغيل: ${context.isPlaying ? 'يعمل' : 'متوقف'}
- الصوت: ${Math.round(context.volume * 100)}%
- الوضع الإسلامي: ${context.islamicMode ? 'مفعل' : 'معطل'}
- الدولة: ${context.selectedCountry || 'غير محدد'}
` : '';

    const stationsInfo = stations.length > 0 
      ? `\n\nمحطات تم العثور عليها: ${stations.map((s: any) => s.name).join(', ')}`
      : '';

    const systemPrompt = `أنت "سمع" - المساعد الذكي لتطبيق "اسمع راديو" 📻

## شخصيتك:
- مساعد ودود ومحترم
- تتكلم العربية والإنجليزية بطلاقة
- تحب تساعد المستخدم

## قدراتك:
تقدر تتحكم في التطبيق بالكامل:
- تشغيل أي محطة راديو (المستخدم يكتب اسم المحطة وأنت تشغلها)
- التحكم في الصوت والتشغيل
- تغيير المظهر (ليلي/نهاري)
- ضبط مؤقت النوم

## مهم جداً:
- لو المستخدم طلب تشغيل محطة، رد عليه إنك هتشغلها وسيستم الـ front-end هيعمل البحث
- متقولش "تم التشغيل" إلا لما المحطة تتشغل فعلاً
${stationsInfo}

${contextStr}

## قواعد الرد:
1. كن طبيعي ومحادث عادي
2. رد بسرعة ومختصر (2-4 جمل عادة)
3. استخدم الإيموجي بحكمة`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    return NextResponse.json({
      success: true,
      data: {
        response,
        actions: [],
        stations,
        searchQuery,
      },
    });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
