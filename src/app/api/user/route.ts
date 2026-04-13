import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper to get or create user based on deviceId
async function getOrCreateUser(deviceId: string, userAgent?: string | null, platform?: string | null) {
  // 1. Try to find existing Device with a direct userId link
  const existingDevice = await db.device.findUnique({
    where: { deviceId },
    select: { id: true, userId: true },
  });

  if (existingDevice?.userId) {
    // Update last seen
    await db.device.update({
      where: { id: existingDevice.id },
      data: { lastSeenAt: new Date() },
    });
    return existingDevice.userId;
  }

  // 2. Check if there's a legacy user via pushSubscription (migration path)
  const subscription = await db.pushSubscription.findFirst({
    where: { deviceId },
    select: { userId: true },
  });

  if (subscription?.userId) {
    // Link the device to this existing user
    if (existingDevice) {
      await db.device.update({
        where: { id: existingDevice.id },
        data: { 
          userId: subscription.userId,
          lastSeenAt: new Date(),
          userAgent: userAgent || existingDevice.userAgent,
          platform: platform || existingDevice.platform,
        },
      });
    } else {
      await db.device.create({
        data: {
          deviceId,
          userId: subscription.userId,
          userAgent,
          platform,
        },
      });
    }
    return subscription.userId;
  }

  // 3. Create new user + device linked together
  const newUser = await db.user.create({
    data: {
      name: 'Guest User',
      settings: {
        create: {
          language: 'ar',
          theme: 'light',
          islamicMode: false,
          selectedCountry: 'EG',
          contentFilter: 'all',
          volume: 0.7,
          lastPage: 'all',
          replayBufferEnabled: true,
          replayBufferMaxDuration: 180,
        },
      },
      preferences: {
        create: {
          totalListeningTime: 0,
          sessionsCount: 0,
          averageSessionDuration: 0,
          preferredBitrate: 128,
        },
      },
      devices: {
        create: {
          deviceId,
          userAgent,
          platform,
        },
      },
    },
  });

  return newUser.id;
}

// GET - Load all user data
export async function GET(request: NextRequest) {
  try {
    // Get deviceId from header or query
    const deviceId = request.headers.get('x-device-id') || 
                     request.nextUrl.searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'Device ID required' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || null;
    const platform = request.nextUrl.searchParams.get('platform') || 'web';
    const userId = await getOrCreateUser(deviceId, userAgent, platform);

    let user = await db.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        preferences: true,
        favorites: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        history: {
          orderBy: { playedAt: 'desc' },
          take: 50,
        },
        searchHistory: {
          orderBy: { searchedAt: 'desc' },
          take: 20,
        },
        aiChats: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        sessions: {
          orderBy: { startTime: 'desc' },
          take: 100,
        },
      },
    });

    if (!user) {
      // This shouldn't happen, but just in case
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields from preferences
    let preferences = user.preferences;
    if (preferences) {
      preferences = {
        ...preferences,
        favoriteCategories: preferences.favoriteCategories ? JSON.parse(preferences.favoriteCategories) : [],
        topStations: preferences.topStations ? JSON.parse(preferences.topStations) : [],
        timePreferences: preferences.timePreferences ? JSON.parse(preferences.timePreferences) : [],
        dayPreferences: preferences.dayPreferences ? JSON.parse(preferences.dayPreferences) : [],
      } as typeof preferences;
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        settings: user.settings,
        preferences,
        favorites: user.favorites.map(f => ({
          stationuuid: f.stationId,
          name: f.stationName,
          url: f.stationUrl,
          url_resolved: f.stationUrl,
          country: f.country,
          countrycode: f.countrycode,
          favicon: f.favicon,
          tags: f.tags || '',
          bitrate: f.bitrate || 0,
          codec: f.codec || '',
          votes: f.votes || 0,
          qualityScore: f.qualityScore,
        })),
        history: user.history.map(h => ({
          stationuuid: h.stationId,
          name: h.stationName,
          url: h.stationUrl,
          url_resolved: h.stationUrl,
          country: h.country,
          countrycode: h.countrycode,
          favicon: h.favicon,
          tags: h.tags || '',
          bitrate: h.bitrate || 0,
          codec: h.codec || '',
          votes: h.votes || 0,
          qualityScore: h.qualityScore,
          playedAt: h.playedAt,
          duration: h.duration,
        })),
        searchHistory: user.searchHistory.map(s => ({
          query: s.query,
          resultCount: s.resultCount,
          searchedAt: s.searchedAt,
        })),
        aiChats: user.aiChats.map(c => ({
          role: c.role,
          content: c.content,
          action: c.action,
          stationId: c.stationId,
          createdAt: c.createdAt,
        })),
        sessions: user.sessions.map(s => ({
          stationId: s.stationId,
          stationName: s.stationName,
          startTime: s.startTime,
          endTime: s.endTime,
          duration: s.duration,
          category: s.category,
          mood: s.mood,
          timeOfDay: s.timeOfDay,
          dayOfWeek: s.dayOfWeek,
          skipped: s.skipped,
          liked: s.liked,
        })),
      },
    });
  } catch (error) {
    console.error('Error loading user data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load user data' },
      { status: 500 }
    );
  }
}

// POST - Save user data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'Device ID required' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || null;
    const platform = data.platform || 'web';
    const userId = await getOrCreateUser(deviceId, userAgent, platform);

    switch (type) {
      case 'settings': {
        const settings = await db.settings.upsert({
          where: { userId },
          update: {
            language: data.language,
            theme: data.theme,
            islamicMode: data.islamicMode,
            selectedCountry: data.selectedCountry,
            selectedMood: data.selectedMood,
            contentFilter: data.contentFilter,
            volume: data.volume,
            lastStationId: data.lastStationId,
            lastStationName: data.lastStationName,
            lastStationUrl: data.lastStationUrl,
            lastStationCountry: data.lastStationCountry,
            lastStationFavicon: data.lastStationFavicon,
            lastStationTags: data.lastStationTags,
            lastCountry: data.lastCountry,
            lastPage: data.lastPage,
            lastFilters: data.lastFilters,
            sleepTimerMinutes: data.sleepTimerMinutes,
            sleepTimerActive: data.sleepTimerActive,
            replayBufferEnabled: data.replayBufferEnabled,
            replayBufferMaxDuration: data.replayBufferMaxDuration,
          },
          create: {
            userId,
            language: data.language || 'ar',
            theme: data.theme || 'light',
            islamicMode: data.islamicMode || false,
            selectedCountry: data.selectedCountry || 'EG',
            contentFilter: data.contentFilter || 'all',
            volume: data.volume || 0.7,
          },
        });
        return NextResponse.json({ success: true, data: settings });
      }

      case 'favorite': {
        const existing = await db.favorite.findUnique({
          where: {
            userId_stationId: {
              userId,
              stationId: data.stationuuid,
            },
          },
        });

        if (existing) {
          await db.favorite.delete({
            where: { id: existing.id },
          });
          return NextResponse.json({ success: true, action: 'removed' });
        } else {
          const favorite = await db.favorite.create({
            data: {
              userId,
              stationId: data.stationuuid,
              stationName: data.name,
              stationUrl: data.url_resolved || data.url,
              stationUuid: data.stationuuid,
              country: data.country,
              countrycode: data.countrycode,
              favicon: data.favicon,
              tags: data.tags,
              bitrate: data.bitrate,
              codec: data.codec,
              votes: data.votes,
              qualityScore: data.qualityScore,
            },
          });
          return NextResponse.json({ success: true, action: 'added', data: favorite });
        }
      }

      case 'history': {
        const existing = await db.history.findFirst({
          where: {
            userId,
            stationId: data.stationuuid,
          },
          orderBy: { playedAt: 'desc' },
        });

        if (existing) {
          const updated = await db.history.update({
            where: { id: existing.id },
            data: {
              playedAt: new Date(),
              stationName: data.name,
              stationUrl: data.url_resolved || data.url,
              country: data.country,
              countrycode: data.countrycode,
              favicon: data.favicon,
              tags: data.tags,
              bitrate: data.bitrate,
              codec: data.codec,
              votes: data.votes,
              qualityScore: data.qualityScore,
            },
          });
          return NextResponse.json({ success: true, data: updated });
        } else {
          const history = await db.history.create({
            data: {
              userId,
              stationId: data.stationuuid,
              stationName: data.name,
              stationUrl: data.url_resolved || data.url,
              stationUuid: data.stationuuid,
              country: data.country,
              countrycode: data.countrycode,
              favicon: data.favicon,
              tags: data.tags,
              bitrate: data.bitrate,
              codec: data.codec,
              votes: data.votes,
              qualityScore: data.qualityScore,
            },
          });

          // Keep only last 50 history items
          const allHistory = await db.history.findMany({
            where: { userId },
            orderBy: { playedAt: 'desc' },
            select: { id: true },
          });

          if (allHistory.length > 50) {
            const toDelete = allHistory.slice(50).map(h => h.id);
            await db.history.deleteMany({
              where: { id: { in: toDelete } },
            });
          }

          return NextResponse.json({ success: true, data: history });
        }
      }

      case 'search': {
        const search = await db.searchHistory.create({
          data: {
            userId,
            query: data.query,
            resultCount: data.resultCount || 0,
          },
        });

        // Keep only last 20 searches
        const allSearches = await db.searchHistory.findMany({
          where: { userId },
          orderBy: { searchedAt: 'desc' },
          select: { id: true },
        });

        if (allSearches.length > 20) {
          const toDelete = allSearches.slice(20).map(s => s.id);
          await db.searchHistory.deleteMany({
            where: { id: { in: toDelete } },
          });
        }

        return NextResponse.json({ success: true, data: search });
      }

      case 'ai_chat': {
        const chat = await db.aIChat.create({
          data: {
            userId,
            role: data.role,
            content: data.content,
            action: data.action,
            stationId: data.stationId,
          },
        });

        // Keep only last 100 AI chats
        const allChats = await db.aIChat.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });

        if (allChats.length > 100) {
          const toDelete = allChats.slice(100).map(c => c.id);
          await db.aIChat.deleteMany({
            where: { id: { in: toDelete } },
          });
        }

        return NextResponse.json({ success: true, data: chat });
      }

      case 'session_start': {
        const session = await db.listeningSession.create({
          data: {
            userId,
            stationId: data.stationId,
            stationName: data.stationName,
            category: data.category,
            mood: data.mood,
            timeOfDay: data.timeOfDay,
            dayOfWeek: data.dayOfWeek,
          },
        });
        return NextResponse.json({ success: true, data: { sessionId: session.id } });
      }

      case 'session_end': {
        const session = await db.listeningSession.findFirst({
          where: {
            userId,
            stationId: data.stationId,
            endTime: null,
          },
          orderBy: { startTime: 'desc' },
        });

        if (session) {
          const updated = await db.listeningSession.update({
            where: { id: session.id },
            data: {
              endTime: new Date(),
              duration: data.duration,
              skipped: data.skipped || false,
              liked: data.liked || false,
            },
          });

          await updateUserPreferences(userId);

          return NextResponse.json({ success: true, data: updated });
        }
        return NextResponse.json({ success: true });
      }

      case 'clear_history': {
        await db.history.deleteMany({
          where: { userId },
        });
        return NextResponse.json({ success: true });
      }

      case 'clear_search_history': {
        await db.searchHistory.deleteMany({
          where: { userId },
        });
        return NextResponse.json({ success: true });
      }

      case 'clear_ai_chats': {
        await db.aIChat.deleteMany({
          where: { userId },
        });
        return NextResponse.json({ success: true });
      }

      case 'clear_all_data': {
        await db.history.deleteMany({ where: { userId } });
        await db.favorite.deleteMany({ where: { userId } });
        await db.searchHistory.deleteMany({ where: { userId } });
        await db.aIChat.deleteMany({ where: { userId } });
        await db.listeningSession.deleteMany({ where: { userId } });
        
        // Reset settings to defaults
        await db.settings.update({
          where: { userId },
          data: {
            language: 'ar',
            theme: 'light',
            islamicMode: false,
            selectedCountry: 'EG',
            contentFilter: 'all',
            volume: 0.7,
            lastStationId: null,
            lastStationName: null,
            lastStationUrl: null,
            sleepTimerMinutes: null,
            sleepTimerActive: false,
          },
        });
        
        return NextResponse.json({ success: true, message: 'All data cleared' });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save user data' },
      { status: 500 }
    );
  }
}

// Helper function to update user preferences based on listening history
async function updateUserPreferences(userId: string) {
  const sessions = await db.listeningSession.findMany({
    where: {
      userId,
      endTime: { not: null },
    },
    orderBy: { startTime: 'desc' },
    take: 100,
  });

  if (sessions.length === 0) return;

  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  const sessionsCount = sessions.length;
  const averageSessionDuration = totalDuration / sessionsCount;

  // Calculate category preferences
  const categoryMap: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.category) {
      categoryMap[s.category] = (categoryMap[s.category] || 0) + (s.duration || 0);
    }
  });

  const favoriteCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, listenTime]) => ({ 
      category, 
      listenTime, 
      score: listenTime / totalDuration 
    }));

  // Calculate top stations
  const stationMap: Record<string, { name: string; count: number; duration: number }> = {};
  sessions.forEach(s => {
    if (!stationMap[s.stationId]) {
      stationMap[s.stationId] = { name: s.stationName, count: 0, duration: 0 };
    }
    stationMap[s.stationId].count++;
    stationMap[s.stationId].duration += s.duration || 0;
  });

  const topStations = Object.entries(stationMap)
    .sort((a, b) => b[1].duration - a[1].duration)
    .slice(0, 20)
    .map(([stationId, data]) => ({
      stationId,
      stationName: data.name,
      playCount: data.count,
      totalDuration: data.duration,
    }));

  // Calculate time preferences
  const timeMap: Record<string, { categories: Record<string, number>; stationIds: string[] }> = {};
  sessions.forEach(s => {
    if (s.timeOfDay) {
      if (!timeMap[s.timeOfDay]) {
        timeMap[s.timeOfDay] = { categories: {}, stationIds: [] };
      }
      if (s.category) {
        timeMap[s.timeOfDay].categories[s.category] = (timeMap[s.timeOfDay].categories[s.category] || 0) + 1;
      }
      if (!s.skipped && !timeMap[s.timeOfDay].stationIds.includes(s.stationId)) {
        timeMap[s.timeOfDay].stationIds.push(s.stationId);
      }
    }
  });

  const timePreferences = Object.entries(timeMap).map(([timeOfDay, data]) => ({
    timeOfDay,
    preferredCategories: Object.entries(data.categories)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat)
      .slice(0, 3),
    preferredStationIds: data.stationIds.slice(0, 5),
  }));

  await db.userPreference.upsert({
    where: { userId },
    update: {
      totalListeningTime: totalDuration,
      sessionsCount,
      averageSessionDuration,
      favoriteCategories: JSON.stringify(favoriteCategories),
      topStations: JSON.stringify(topStations),
      timePreferences: JSON.stringify(timePreferences),
    },
    create: {
      userId,
      totalListeningTime: totalDuration,
      sessionsCount,
      averageSessionDuration,
      favoriteCategories: JSON.stringify(favoriteCategories),
      topStations: JSON.stringify(topStations),
      timePreferences: JSON.stringify(timePreferences),
    },
  });
}
