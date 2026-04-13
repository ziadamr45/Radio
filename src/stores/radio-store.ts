import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  RadioStation, 
  Mood, 
  ContentFilter, 
  AIChatMessage,
  NetworkStatus,
  NetworkQuality,
  BufferState,
  ReplayBufferState,
  PlaybackError,
  UserPreferences,
  ListeningSession,
  TimeOfDay,
  Recommendation,
  HabitNotification
} from '@/types/radio';

// No hardcoded guest user ID - userId comes from the server via deviceId

interface RadioStore {
  // ==================== USER ====================
  userId: string;
  deviceId: string | null;
  displayName: string | null;
  namePromptShown: boolean;
  namePromptRequired: boolean;
  
  // ==================== PLAYER STATE ====================
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  
  // ==================== SELECTION STATE ====================
  selectedCountry: string;
  selectedMood: Mood | null;
  contentFilter: ContentFilter;
  islamicMode: boolean;
  
  // ==================== SEARCH ====================
  searchQuery: string;
  
  // ==================== FAVORITES & HISTORY ====================
  favorites: RadioStation[];
  history: RadioStation[];
  
  // ==================== SLEEP TIMER ====================
  sleepTimerMinutes: number;
  sleepTimerActive: boolean;
  sleepTimerEnd: number | null;
  
  // ==================== AI CHAT ====================
  aiMessages: AIChatMessage[];
  aiChatOpen: boolean;
  
  // ==================== SETTINGS ====================
  language: 'ar' | 'en';
  theme: 'light' | 'dark';
  
  // ==================== UI STATE ====================
  settingsOpen: boolean;
  alarmOpen: boolean;
  
  // ==================== QURAN STATE ====================
  quranState: {
    currentSurah: { number: number; name: string } | null;
    isPlaying: boolean;
  };
  
  // ==================== NEW: NETWORK & BUFFERING ====================
  networkStatus: NetworkStatus;
  bufferState: BufferState | null;
  replayState: ReplayBufferState | null;
  playbackError: PlaybackError | null;
  retryCount: number;
  maxRetries: number;
  
  // ==================== NEW: USER BEHAVIOR ====================
  userPreferences: UserPreferences;
  currentSession: ListeningSession | null;
  sessions: ListeningSession[];
  
  // ==================== NEW: RECOMMENDATIONS ====================
  recommendations: Recommendation[];
  habitNotifications: HabitNotification[];
  
  // ==================== NEW: REPLAY BUFFER ====================
  replayBufferEnabled: boolean;
  replayBufferMaxDuration: number; // seconds
  
  // ==================== ACTIONS ====================
  
  // Player
  setCurrentStation: (station: RadioStation | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setIsLoading: (loading: boolean) => void;
  
  // Selection
  setSelectedCountry: (country: string) => void;
  setSelectedMood: (mood: Mood | null) => void;
  setContentFilter: (filter: ContentFilter) => void;
  setIslamicMode: (mode: boolean) => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  
  // Favorites
  addToFavorites: (station: RadioStation) => void;
  removeFromFavorites: (stationId: string) => void;
  isFavorite: (stationId: string) => boolean;
  setFavorites: (favorites: RadioStation[]) => void;
  toggleFavorite: (station: RadioStation) => void;
  saveFavorite: (station: RadioStation, save: boolean) => void;
  
  // History
  addToHistory: (station: RadioStation) => void;
  clearHistory: () => void;
  clearListeningStats: () => void;
  setHistory: (history: RadioStation[]) => void;
  
  // Sleep Timer
  setSleepTimer: (minutes: number) => void;
  clearSleepTimer: () => void;
  
  // AI Chat
  addAIMessage: (message: AIChatMessage) => void;
  clearAIMessages: () => void;
  setAIMessages: (messages: AIChatMessage[]) => void;
  setAIChatOpen: (open: boolean) => void;
  
  // Settings
  setLanguage: (lang: 'ar' | 'en') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // UI
  setSettingsOpen: (open: boolean) => void;
  setAlarmOpen: (open: boolean) => void;
  
  // Quran
  playQuran: (surah: { number: number; name: string } | null, audioUrl: string | null, reciter: { id: string; name: string } | null) => void;
  toggleQuranPlay: () => void;
  
  // ==================== NEW: NETWORK & BUFFERING ACTIONS ====================
  setNetworkStatus: (status: Partial<NetworkStatus>) => void;
  updateNetworkStatus: () => void;
  setBufferState: (state: BufferState | null) => void;
  setReplayState: (state: ReplayBufferState | null) => void;
  setPlaybackError: (error: PlaybackError | null) => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
  
  // ==================== NEW: USER BEHAVIOR ACTIONS ====================
  startListeningSession: (station: RadioStation, category: ContentFilter) => void;
  endListeningSession: (skipped: boolean) => void;
  recordSearch: (query: string, resultCount: number) => void;
  recordMoodSelection: (mood: Mood) => void;
  recordAIInteraction: (message: string, response: string, action?: string) => void;
  updateUserPreferences: () => void;
  setUserPreferences: (preferences: Partial<UserPreferences>) => void;
  
  // ==================== NEW: RECOMMENDATION ACTIONS ====================
  setRecommendations: (recommendations: Recommendation[]) => void;
  generateTimeBasedRecommendations: () => void;
  
  // ==================== NEW: REPLAY BUFFER ACTIONS ====================
  setReplayBufferEnabled: (enabled: boolean) => void;
  setReplayBufferMaxDuration: (duration: number) => void;
  
  // ==================== NEW: UTILITY ACTIONS ====================
  getTimeOfDay: () => TimeOfDay;
  getPreferredStationsForTime: () => string[];
  getHabitNotification: () => HabitNotification | null;
  
  // ==================== USER ACTIONS ====================
  setUserId: (userId: string) => void;
  setDeviceId: (deviceId: string | null) => void;
  setDisplayName: (displayName: string | null) => void;
  setNamePromptShown: (shown: boolean) => void;
  setNamePromptRequired: (required: boolean) => void;
}

// Default network status
const defaultNetworkStatus: NetworkStatus = {
  isOnline: true,
  quality: 'good',
  connectionType: 'unknown',
  effectiveType: '4g',
  downlink: 10,
  rtt: 50,
};

// Default user preferences
const defaultUserPreferences: UserPreferences = {
  favoriteCategories: [],
  topStations: [],
  timePreferences: [],
  dayPreferences: [],
  averageSessionDuration: 0,
  preferredBitrate: 128,
  totalListeningTime: 0,
  sessionsCount: 0,
};

export const useRadioStore = create<RadioStore>()(
  persist(
    (set, get) => ({
      // ==================== INITIAL STATE ====================
      userId: '',
      deviceId: null,
      displayName: null,
      namePromptShown: false,
      namePromptRequired: true,
      currentStation: null,
      isPlaying: false,
      volume: 1.0, // Default volume is 100%
      isLoading: false,

      selectedCountry: 'EG',
      selectedMood: null,
      contentFilter: 'all',
      islamicMode: false,
      
      searchQuery: '',
      
      favorites: [],
      history: [],
      
      sleepTimerMinutes: 0,
      sleepTimerActive: false,
      sleepTimerEnd: null,
      
      aiMessages: [],
      aiChatOpen: false,
      
      language: 'ar',
      theme: 'light',
      
      settingsOpen: false,
      alarmOpen: false,
      
      // Quran state
      quranState: {
        currentSurah: null,
        isPlaying: false,
      },
      
      // New state
      networkStatus: defaultNetworkStatus,
      bufferState: null,
      replayState: null,
      playbackError: null,
      retryCount: 0,
      maxRetries: 3,
      
      userPreferences: defaultUserPreferences,
      currentSession: null,
      sessions: [],
      
      recommendations: [],
      habitNotifications: [],
      
      replayBufferEnabled: true,
      replayBufferMaxDuration: 180, // 3 minutes
      
      // ==================== PLAYER ACTIONS ====================
      setCurrentStation: (station) => {
        const prevStation = get().currentStation;
        
        // End previous session if exists
        if (prevStation && get().currentSession) {
          get().endListeningSession(false);
        }
        
        set({ currentStation: station, retryCount: 0, playbackError: null });
        
        if (station) {
          get().addToHistory(station);
          // Start new session
          get().startListeningSession(station, get().contentFilter);
        }
      },
      
      setIsPlaying: (playing) => {
        set({ isPlaying: playing });
        
        // Update session - create new reference for React to detect change
        const session = get().currentSession;
        if (session && playing) {
          set({ currentSession: { ...session, startTime: Date.now() } });
        }
      },
      
      setVolume: (volume) => set({ volume }),
      setIsLoading: (isLoading) => set({ isLoading }),
      
      // ==================== SELECTION ACTIONS ====================
      setSelectedCountry: (country) => set({ selectedCountry: country }),
      setSelectedMood: (mood) => {
        set({ selectedMood: mood });
        if (mood) {
          get().recordMoodSelection(mood);
        }
      },
      setContentFilter: (filter) => set({ contentFilter: filter }),
      setIslamicMode: (mode) => {
        const currentFilter = get().contentFilter;
        const islamicFilters: ContentFilter[] = ['all', 'quran', 'islamic'];
        // Auto-switch to 'all' if current filter is not allowed in Islamic mode
        const newFilter = mode && !islamicFilters.includes(currentFilter) ? 'all' : currentFilter;
        set({ islamicMode: mode, contentFilter: newFilter });
      },
      
      // ==================== SEARCH ACTIONS ====================
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // ==================== FAVORITES ACTIONS ====================
      addToFavorites: (station) => {
        const { favorites } = get();
        if (!favorites.find(f => f.stationuuid === station.stationuuid)) {
          set({ favorites: [...favorites, station] });
        }
      },
      
      removeFromFavorites: (stationId) => {
        const { favorites } = get();
        set({ favorites: favorites.filter(f => f.stationuuid !== stationId) });
      },
      
      isFavorite: (stationId) => {
        const { favorites } = get();
        return favorites.some(f => f.stationuuid === stationId);
      },
      
      setFavorites: (favorites) => set({ favorites }),
      
      toggleFavorite: (station) => {
        const { favorites, removeFromFavorites, addToFavorites } = get();
        if (favorites.some(f => f.stationuuid === station.stationuuid)) {
          removeFromFavorites(station.stationuuid);
        } else {
          addToFavorites(station);
        }
      },
      
      // ==================== HISTORY ACTIONS ====================
      addToHistory: (station) => {
        const { history } = get();
        const filteredHistory = history.filter(h => h.stationuuid !== station.stationuuid);
        set({ history: [station, ...filteredHistory].slice(0, 50) });
      },
      
      clearHistory: () => set({ history: [] }),
      clearListeningStats: () => set({
        sessions: [],
        userPreferences: defaultUserPreferences,
      }),
      setHistory: (history) => set({ history }),
      
      // ==================== SLEEP TIMER ACTIONS ====================
      setSleepTimer: (minutes) => {
        const endTime = Date.now() + minutes * 60 * 1000;
        set({
          sleepTimerMinutes: minutes,
          sleepTimerActive: true,
          sleepTimerEnd: endTime,
        });
      },
      
      clearSleepTimer: () => set({
        sleepTimerMinutes: 0,
        sleepTimerActive: false,
        sleepTimerEnd: null,
      }),
      
      // ==================== AI CHAT ACTIONS ====================
      addAIMessage: (message) => {
        const { aiMessages } = get();
        set({ aiMessages: [...aiMessages, message] });
      },
      
      clearAIMessages: () => set({ aiMessages: [] }),
      setAIMessages: (messages) => set({ aiMessages: messages }),
      setAIChatOpen: (open) => set({ aiChatOpen: open }),
      
      // ==================== SETTINGS ACTIONS ====================
      setLanguage: (lang) => set({ language: lang }),
      setTheme: (theme) => set({ theme: theme }),
      
      // ==================== UI ACTIONS ====================
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setAlarmOpen: (open) => set({ alarmOpen: open }),
      
      // ==================== QURAN ACTIONS ====================
      playQuran: (surah, audioUrl, reciter) => {
        set({
          quranState: {
            currentSurah: surah,
            isPlaying: surah !== null,
          },
        });
      },
      
      toggleQuranPlay: () => {
        const { quranState } = get();
        set({
          quranState: {
            ...quranState,
            isPlaying: !quranState.isPlaying,
          },
        });
      },
      
      // ==================== SAVE FAVORITE ====================
      saveFavorite: (station, save) => {
        const { favorites } = get();
        if (save) {
          if (!favorites.find(f => f.stationuuid === station.stationuuid)) {
            set({ favorites: [...favorites, station] });
          }
        } else {
          set({ favorites: favorites.filter(f => f.stationuuid !== station.stationuuid) });
        }
      },
      
      // ==================== NETWORK & BUFFERING ACTIONS ====================
      setNetworkStatus: (status) => {
        const currentStatus = get().networkStatus;
        set({ networkStatus: { ...currentStatus, ...status } });
      },
      
      updateNetworkStatus: () => {
        if (typeof navigator === 'undefined') return;
        
        const connection = (navigator as Navigator & { 
          connection?: { 
            effectiveType?: string; 
            downlink?: number; 
            rtt?: number;
            type?: string;
            saveData?: boolean;
          } 
        }).connection;
        
        const isOnline = navigator.onLine;
        let quality: NetworkQuality = 'good';
        
        if (!isOnline) {
          quality = 'offline';
        } else if (connection) {
          const { effectiveType, downlink, rtt, saveData } = connection;
          
          if (saveData) {
            quality = 'poor';
          } else if (effectiveType === '4g' && (downlink || 0) > 10 && (rtt || 100) < 100) {
            quality = 'excellent';
          } else if (effectiveType === '4g' || effectiveType === '3g') {
            quality = (downlink || 0) > 5 ? 'good' : 'fair';
          } else if (effectiveType === '2g') {
            quality = 'poor';
          }
        }
        
        set({
          networkStatus: {
            isOnline,
            quality,
            connectionType: (connection?.type as NetworkStatus['connectionType']) || 'unknown',
            effectiveType: connection?.effectiveType || '4g',
            downlink: connection?.downlink || 10,
            rtt: connection?.rtt || 50,
          },
        });
      },
      
      setBufferState: (state) => set({ bufferState: state }),
      setReplayState: (state) => set({ replayState: state }),
      setPlaybackError: (error) => set({ playbackError: error }),
      
      incrementRetryCount: () => {
        const { retryCount } = get();
        set({ retryCount: retryCount + 1 });
      },
      
      resetRetryCount: () => set({ retryCount: 0 }),
      
      // ==================== USER BEHAVIOR ACTIONS ====================
      startListeningSession: (station, category) => {
        const timeOfDay = get().getTimeOfDay();
        const session: ListeningSession = {
          stationId: station.stationuuid,
          stationName: station.name,
          startTime: Date.now(),
          duration: 0,
          category,
          mood: get().selectedMood || undefined,
          timeOfDay,
          dayOfWeek: new Date().getDay(),
          skipped: false,
          liked: false,
        };
        set({ currentSession: session });
      },
      
      endListeningSession: (skipped) => {
        const session = get().currentSession;
        if (!session) return;
        
        const endTime = Date.now();
        // Minimum 1 second duration to avoid 0 values affecting average
        const duration = Math.max(1, Math.floor((endTime - session.startTime) / 1000));
        
        const completedSession: ListeningSession = {
          ...session,
          endTime,
          duration,
          skipped,
        };
        
        const { sessions, userPreferences } = get();
        const newSessions = [...sessions, completedSession].slice(-100); // Keep last 100 sessions
        
        // Update user preferences
        const totalListeningTime = userPreferences.totalListeningTime + duration;
        const sessionsCount = userPreferences.sessionsCount + 1;
        const averageSessionDuration = Math.round(totalListeningTime / sessionsCount);
        
        // Update top stations
        const existingStation = userPreferences.topStations.find(
          s => s.stationId === session.stationId
        );
        
        let topStations = [...userPreferences.topStations];
        if (existingStation) {
          topStations = topStations.map(s => 
            s.stationId === session.stationId
              ? {
                  ...s,
                  playCount: s.playCount + 1,
                  totalDuration: s.totalDuration + duration,
                  lastPlayed: endTime,
                }
              : s
          );
        } else {
          topStations.push({
            stationId: session.stationId,
            stationName: session.stationName,
            playCount: 1,
            totalDuration: duration,
            lastPlayed: endTime,
          });
        }
        
        // Sort by total duration and keep top 20
        topStations.sort((a, b) => b.totalDuration - a.totalDuration);
        topStations = topStations.slice(0, 20);
        
        // Update category preferences
        let favoriteCategories = [...userPreferences.favoriteCategories];
        const existingCategory = favoriteCategories.find(c => c.category === session.category);
        if (existingCategory) {
          favoriteCategories = favoriteCategories.map(c =>
            c.category === session.category
              ? { ...c, listenTime: c.listenTime + duration, score: c.score + (skipped ? 0 : 1) }
              : c
          );
        } else if (session.category !== 'all') {
          favoriteCategories.push({
            category: session.category,
            score: skipped ? 0 : 1,
            listenTime: duration,
          });
        }
        favoriteCategories.sort((a, b) => b.listenTime - a.listenTime);
        
        // Update time preferences
        let timePreferences = [...userPreferences.timePreferences];
        const existingTimePref = timePreferences.find(t => t.timeOfDay === session.timeOfDay);
        if (existingTimePref) {
          if (!existingTimePref.preferredStationIds.includes(session.stationId) && !skipped) {
            existingTimePref.preferredStationIds.push(session.stationId);
          }
        } else {
          timePreferences.push({
            timeOfDay: session.timeOfDay,
            preferredCategories: [session.category],
            preferredStationIds: skipped ? [] : [session.stationId],
          });
        }
        
        set({
          currentSession: null,
          sessions: newSessions,
          userPreferences: {
            ...userPreferences,
            totalListeningTime,
            sessionsCount,
            averageSessionDuration,
            topStations,
            favoriteCategories,
            timePreferences,
          },
        });
      },
      
      recordSearch: (query, resultCount) => {
        // Track search for user preference analysis
        const { userPreferences } = get();
        const timeOfDay = get().getTimeOfDay();
        const existingTimePref = userPreferences.timePreferences.find(t => t.timeOfDay === timeOfDay);
        if (!existingTimePref) {
          set({
            userPreferences: {
              ...userPreferences,
              timePreferences: [
                ...userPreferences.timePreferences,
                { timeOfDay, preferredCategories: [], preferredStationIds: [] },
              ],
            },
          });
        }
      },
      
      recordMoodSelection: (mood) => {
        const timeOfDay = get().getTimeOfDay();
        const { userPreferences } = get();
        // Track mood patterns by time of day
        const dayPreferences = [...(userPreferences.dayPreferences || [])];
        const existingDayPref = dayPreferences.find(d => d.day === new Date().getDay());
        if (existingDayPref) {
          existingDayPref.mood = mood;
        } else {
          dayPreferences.push({ day: new Date().getDay(), mood, timeOfDay });
        }
        set({
          userPreferences: {
            ...userPreferences,
            dayPreferences,
          },
        });
      },
      
      recordAIInteraction: (message, response, action) => {
        // Track AI interactions for personalization
        // This data helps improve recommendations over time
        const { userPreferences } = get();
        const dayPreferences = [...(userPreferences.dayPreferences || [])];
        set({
          userPreferences: {
            ...userPreferences,
            dayPreferences,
          },
        });
      },
      
      updateUserPreferences: () => {
        // Recalculate preferences based on sessions
        const { sessions, userPreferences } = get();
        if (sessions.length === 0) return;
        
        const newTotalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const newSessionsCount = sessions.length;
        const newAverageSessionDuration = Math.round(newTotalDuration / newSessionsCount);
        
        set({
          userPreferences: {
            ...userPreferences,
            totalListeningTime: newTotalDuration,
            sessionsCount: newSessionsCount,
            averageSessionDuration: newAverageSessionDuration,
          },
        });
      },
      
      setUserPreferences: (preferences) => {
        const currentPreferences = get().userPreferences;
        // Don't let server zeros overwrite locally accumulated listening stats
        // Server is source of truth only when it has data (non-zero)
        const serverTotalTime = preferences.totalListeningTime || 0;
        const serverSessionsCount = preferences.sessionsCount || 0;
        const totalListeningTime = Math.max(currentPreferences.totalListeningTime, serverTotalTime);
        const sessionsCount = Math.max(currentPreferences.sessionsCount, serverSessionsCount);
        const averageSessionDuration = sessionsCount > 0
          ? Math.round(totalListeningTime / sessionsCount)
          : 0;

        set({
          userPreferences: {
            ...currentPreferences,
            ...preferences,
            totalListeningTime,
            sessionsCount,
            averageSessionDuration,
          },
        });
      },
      
      // ==================== RECOMMENDATION ACTIONS ====================
      setRecommendations: (recommendations) => set({ recommendations }),
      
      generateTimeBasedRecommendations: () => {
        const timeOfDay = get().getTimeOfDay();
        const { userPreferences, history, favorites } = get();
        
        const recommendations: Recommendation[] = [];
        
        // Get stations for current time of day
        const timePref = userPreferences.timePreferences.find(t => t.timeOfDay === timeOfDay);
        if (timePref && timePref.preferredStationIds.length > 0) {
          const stationId = timePref.preferredStationIds[0];
          const station = history.find(s => s.stationuuid === stationId);
          if (station) {
            recommendations.push({
              station,
              reason: 'Based on your listening habits',
              reasonAr: 'بناءً على عادات استماعك',
              score: 100,
              type: 'time_based',
            });
          }
        }
        
        // Add from favorites if not already included
        favorites.slice(0, 3).forEach((station, index) => {
          if (!recommendations.find(r => r.station.stationuuid === station.stationuuid)) {
            recommendations.push({
              station,
              reason: 'From your favorites',
              reasonAr: 'من المفضلة لديك',
              score: 90 - index * 10,
              type: 'because_listened',
            });
          }
        });
        
        set({ recommendations });
      },
      
      // ==================== REPLAY BUFFER ACTIONS ====================
      setReplayBufferEnabled: (enabled) => set({ replayBufferEnabled: enabled }),
      setReplayBufferMaxDuration: (duration) => set({ replayBufferMaxDuration: duration }),
      
      // ==================== UTILITY ACTIONS ====================
      getTimeOfDay: () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        if (hour >= 21 && hour < 24) return 'night';
        return 'late_night';
      },
      
      getPreferredStationsForTime: () => {
        const timeOfDay = get().getTimeOfDay();
        const { userPreferences } = get();
        const timePref = userPreferences.timePreferences.find(t => t.timeOfDay === timeOfDay);
        return timePref?.preferredStationIds || [];
      },
      
      getHabitNotification: () => {
        const timeOfDay = get().getTimeOfDay();
        const { habitNotifications } = get();
        return habitNotifications.find(n => n.timeOfDay === timeOfDay && n.enabled) || null;
      },
      
      // ==================== USER ACTIONS ====================
      setUserId: (userId) => set({ userId }),
      setDeviceId: (deviceId) => set({ deviceId }),
      setDisplayName: (displayName) => {
        set({ displayName });
        // Also save to localStorage for notification helpers
        if (typeof window !== 'undefined') {
          if (displayName) {
            localStorage.setItem('displayName', displayName);
          } else {
            localStorage.removeItem('displayName');
          }
        }
      },
      setNamePromptShown: (shown) => set({ namePromptShown: shown }),
      setNamePromptRequired: (required) => set({ namePromptRequired: required }),
    }),
    {
      name: 'asmae-radio-storage-v4',
      partialize: (state) => ({
        userId: state.userId,
        deviceId: state.deviceId,
        displayName: state.displayName,
        namePromptShown: state.namePromptShown,
        namePromptRequired: state.namePromptRequired,
        favorites: state.favorites,
        history: state.history,
        language: state.language,
        theme: state.theme,
        volume: state.volume,
        selectedCountry: state.selectedCountry,
        islamicMode: state.islamicMode,
        contentFilter: state.contentFilter,
        // Don't persist currentStation full object - just store the ID and reload on hydration
        // This prevents localStorage bloat from large station objects
        // Don't persist sessions - can grow to 100 items and cause localStorage overflow
        // Don't persist userPreferences - derived from sessions, recalculated on load
        replayBufferEnabled: state.replayBufferEnabled,
        replayBufferMaxDuration: state.replayBufferMaxDuration,
        // Sleep Timer - للحفاظ على المؤقت عند إغلاق الموقع
        sleepTimerMinutes: state.sleepTimerMinutes,
        sleepTimerActive: state.sleepTimerActive,
        sleepTimerEnd: state.sleepTimerEnd,
        // ❌ لا تضف settingsOpen هنا أبداً — هي UI state فقط
        // ❌ لا تضف aiChatOpen هنا أبداً
        // ❌ لا تضف alarmOpen هنا أبداً
        // ❌ لا تضف currentStation هنا — كائن كبير يسبب انتفاخ localStorage
        // ❌ لا تضف sessions هنا — ممكن يوصل لـ 100 عنصر
        // ❌ لا تضف userPreferences هنا — يتجمع من الـ sessions
      }),
    }
  )
);
