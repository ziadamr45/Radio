'use client';

import { createContext, useContext, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import type { RadioStation } from '@/types/radio';

// Get or generate device ID from localStorage
function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

// Debounce helper
function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

// Context for user data operations (server-synced)
interface UserDataContextType {
  isLoaded: boolean;
  saveFavorite: (station: RadioStation, isAdding: boolean) => Promise<void>;
  saveHistory: (station: RadioStation) => Promise<void>;
  saveSearch: (query: string, resultCount: number) => Promise<void>;
  saveAIChat: (message: { role: string; content: string; action?: string; stationId?: string }) => Promise<void>;
  startSession: (station: RadioStation) => Promise<void>;
  endSession: (stationId: string, duration: number, skipped?: boolean) => Promise<void>;
  clearHistory: () => Promise<void>;
  clearAIChats: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType>({
  isLoaded: false,
  saveFavorite: async () => {},
  saveHistory: async () => {},
  saveSearch: async () => {},
  saveAIChat: async () => {},
  startSession: async () => {},
  endSession: async () => {},
  clearHistory: async () => {},
  clearAIChats: async () => {},
  clearAllData: async () => {},
});

export const useUserData = () => useContext(UserDataContext);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const isLoaded = useRef(false);
  const isSaving = useRef(false);
  const hasLoadedRef = useRef(false);

  const store = useRadioStore();

  // Ensure deviceId exists in store and localStorage
  useEffect(() => {
    const id = getDeviceId();
    if (!store.deviceId || store.deviceId !== id) {
      store.setDeviceId(id);
    }
  }, []);

  // Load user data from server and set userId
  useEffect(() => {
    const currentDeviceId = store.deviceId || getDeviceId();
    if (!currentDeviceId || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    let cancelled = false;

    const loadFromServer = async () => {
      try {
        const response = await fetch(`/api/user?deviceId=${currentDeviceId}&platform=web`);
        const result = await response.json();

        if (cancelled) return;

        if (result.success) {
          const { user, settings, favorites: dbFavorites, history: dbHistory, preferences } = result.data;

          // Set the real userId from the server
          if (user?.id) {
            store.setUserId(user.id);
          }

          // Restore display name from user record
          if (user?.name && user.name !== 'Guest User') {
            store.setDisplayName(user.name);
          }

          // Restore settings — local settings always win, server is fallback only
          if (settings) {
            const localStore = JSON.parse(localStorage.getItem('asmae-radio-storage-v4') || '{}');
            const localState = localStore?.state || {};

            if (localState.language === undefined && settings.language) store.setLanguage(settings.language as 'ar' | 'en');
            if (localState.theme === undefined && settings.theme) store.setTheme(settings.theme as 'light' | 'dark');
            if (localState.islamicMode === undefined) store.setIslamicMode(settings.islamicMode ?? false);
            if (localState.selectedCountry === undefined && settings.selectedCountry) store.setSelectedCountry(settings.selectedCountry);
            if (localState.contentFilter === undefined && settings.contentFilter) store.setContentFilter(settings.contentFilter as any);
            if (localState.volume === undefined) store.setVolume(settings.volume ?? 1.0);

            // Restore last station if exists
            if (settings.lastStationId && settings.lastStationUrl) {
              const lastStation: RadioStation = {
                changeuuid: '',
                stationuuid: settings.lastStationId,
                serveruuid: null,
                name: settings.lastStationName || 'Unknown Station',
                url: settings.lastStationUrl,
                url_resolved: settings.lastStationUrl,
                homepage: '',
                favicon: settings.lastStationFavicon || '',
                tags: settings.lastStationTags || '',
                country: settings.lastStationCountry || '',
                countrycode: settings.lastCountry || '',
                iso_3166_2: null,
                state: '',
                language: '',
                languagecodes: '',
                votes: 0,
                lastchangetime: '',
                lastchangetime_iso8601: '',
                codec: '',
                bitrate: 0,
                hls: 0,
                lastcheckok: 1,
                lastchecktime: '',
                lastchecktime_iso8601: '',
                lastcheckoktime: '',
                lastcheckoktime_iso8601: '',
                lastlocalchecktime: '',
                lastlocalchecktime_iso8601: '',
                clicktimestamp: '',
                clicktimestamp_iso8601: '',
                clickcount: 0,
                clicktrend: 0,
                ssl_error: 0,
                geo_lat: null,
                geo_long: null,
                has_extended_info: false,
              };
              store.setCurrentStation(lastStation);
              store.setIsPlaying(false);
            }
          }

          // Restore favorites (only if server has more than local)
          if (dbFavorites && dbFavorites.length > 0) {
            store.setFavorites(dbFavorites);
          }

          // Restore history (only if server has more than local)
          if (dbHistory && dbHistory.length > 0) {
            store.setHistory(dbHistory);
          }

          // Restore preferences
          if (preferences) {
            const parsedPreferences = {
              ...preferences,
              favoriteCategories: typeof preferences.favoriteCategories === 'string' 
                ? JSON.parse(preferences.favoriteCategories) 
                : (preferences.favoriteCategories || []),
              topStations: typeof preferences.topStations === 'string'
                ? JSON.parse(preferences.topStations)
                : (preferences.topStations || []),
              timePreferences: typeof preferences.timePreferences === 'string'
                ? JSON.parse(preferences.timePreferences)
                : (preferences.timePreferences || []),
            };
            store.setUserPreferences(parsedPreferences);
          }

          isLoaded.current = true;
        }
      } catch (error) {
        console.error('Error loading user data from server:', error);
      }
    };

    loadFromServer();

    return () => {
      cancelled = true;
    };
  }, [store.deviceId]);

  // Helper to get current deviceId
  const getDeviceIdForRequest = useCallback((): string => {
    return store.deviceId || getDeviceId();
  }, [store.deviceId]);

  // Save favorite to server
  const saveFavorite = useCallback(async (station: RadioStation, isAdding: boolean) => {
    const deviceId = getDeviceIdForRequest();
    if (!deviceId) return;

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          type: 'favorite',
          data: station,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        console.error('Failed to save favorite:', result.error);
      }
    } catch (error) {
      console.error('Error saving favorite to server:', error);
    }
  }, [getDeviceIdForRequest]);

  // Save history to server
  const saveHistory = useCallback(async (station: RadioStation) => {
    const deviceId = getDeviceIdForRequest();
    if (!deviceId) return;

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          type: 'history',
          data: station,
        }),
      });
    } catch (error) {
      console.error('Error saving history to server:', error);
    }
  }, [getDeviceIdForRequest]);

  // Save search to server
  const saveSearch = useCallback(async (query: string, resultCount: number) => {
    const deviceId = getDeviceIdForRequest();
    if (!deviceId) return;

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          type: 'search',
          data: { query, resultCount },
        }),
      });
    } catch (error) {
      console.error('Error saving search to server:', error);
    }
  }, [getDeviceIdForRequest]);

  // Save AI chat to server
  const saveAIChat = useCallback(async (message: { role: string; content: string; action?: string; stationId?: string }) => {
    const deviceId = getDeviceIdForRequest();
    if (!deviceId) return;

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          type: 'ai_chat',
          data: message,
        }),
      });
    } catch (error) {
      console.error('Error saving AI chat to server:', error);
    }
  }, [getDeviceIdForRequest]);

  // Start listening session
  const startSession = useCallback(async (station: RadioStation) => {
    const deviceId = getDeviceIdForRequest();
    if (!deviceId) return;

    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = 'afternoon';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21) timeOfDay = 'night';

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          type: 'session_start',
          data: {
            stationId: station.stationuuid,
            stationName: station.name,
            category: store.contentFilter,
            mood: store.selectedMood,
            timeOfDay,
            dayOfWeek: now.getDay(),
          },
        }),
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [getDeviceIdForRequest, store.contentFilter, store.selectedMood]);

  // End listening session
  const endSession = useCallback(async (stationId: string, duration: number, skipped: boolean = false) => {
    const deviceId = getDeviceIdForRequest();
    if (!deviceId) return;

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          type: 'session_end',
          data: { stationId, duration, skipped },
        }),
      });
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [getDeviceIdForRequest]);

  // Clear history
  const clearHistory = useCallback(async () => {
    const deviceId = getDeviceIdForRequest();
    if (!deviceId) return;

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, type: 'clear_history' }),
      });
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }, [getDeviceIdForRequest]);

  // Clear AI chats
  const clearAIChats = useCallback(async () => {
    const deviceId = getDeviceIdForRequest();
    if (!deviceId) return;

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, type: 'clear_ai_chats' }),
      });
    } catch (error) {
      console.error('Error clearing AI chats:', error);
    }
  }, [getDeviceIdForRequest]);

  // Clear all data
  const clearAllData = useCallback(async () => {
    const deviceId = getDeviceIdForRequest();
    if (!deviceId) return;

    try {
      await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, type: 'clear_all_data' }),
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }, [getDeviceIdForRequest]);

  // Debounced settings save
  const saveSettingsDebounced = useCallback(
    debounce(async () => {
      if (isSaving.current || !isLoaded.current) return;
      const deviceId = getDeviceIdForRequest();
      if (!deviceId) return;

      isSaving.current = true;
      try {
        await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            type: 'settings',
            data: {
              language: store.language,
              theme: store.theme,
              islamicMode: store.islamicMode,
              selectedCountry: store.selectedCountry,
              selectedMood: store.selectedMood,
              contentFilter: store.contentFilter,
              volume: store.volume,
              lastStationId: store.currentStation?.stationuuid,
              lastStationName: store.currentStation?.name,
              lastStationUrl: store.currentStation?.url_resolved || store.currentStation?.url,
              lastStationCountry: store.currentStation?.country,
              lastStationFavicon: store.currentStation?.favicon,
              lastStationTags: store.currentStation?.tags,
              lastCountry: store.selectedCountry,
              sleepTimerMinutes: store.sleepTimerMinutes,
              sleepTimerActive: store.sleepTimerActive,
              replayBufferEnabled: store.replayBufferEnabled,
              replayBufferMaxDuration: store.replayBufferMaxDuration,
            },
          }),
        });
      } catch (error) {
        console.error('Error saving settings:', error);
      } finally {
        isSaving.current = false;
      }
    }, 2000),
    [getDeviceIdForRequest, store.language, store.theme, store.islamicMode, store.selectedCountry, store.selectedMood, store.contentFilter, store.volume, store.currentStation, store.sleepTimerMinutes, store.sleepTimerActive, store.replayBufferEnabled, store.replayBufferMaxDuration]
  );

  // Auto-save settings when they change
  useEffect(() => {
    if (isLoaded.current) {
      saveSettingsDebounced();
    }
  }, [store.language, store.theme, store.islamicMode, store.selectedCountry, store.contentFilter, store.volume, saveSettingsDebounced]);

  // Save when current station changes
  useEffect(() => {
    if (isLoaded.current && store.currentStation) {
      saveSettingsDebounced();
    }
  }, [store.currentStation?.stationuuid, saveSettingsDebounced]);

  const contextValue = useMemo(() => ({
    isLoaded: isLoaded.current,
    saveFavorite,
    saveHistory,
    saveSearch,
    saveAIChat,
    startSession,
    endSession,
    clearHistory,
    clearAIChats,
    clearAllData,
  }), [saveFavorite, saveHistory, saveSearch, saveAIChat, startSession, endSession, clearHistory, clearAIChats, clearAllData]);

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
}
