// Radio station types based on Radio Browser API
export interface RadioStation {
  changeuuid: string;
  stationuuid: string;
  serveruuid: string | null;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  iso_3166_2: string | null;
  state: string;
  language: string;
  languagecodes: string;
  votes: number;
  lastchangetime: string;
  lastchangetime_iso8601: string;
  codec: string;
  bitrate: number;
  hls: number;
  lastcheckok: number;
  lastchecktime: string;
  lastchecktime_iso8601: string;
  lastcheckoktime: string;
  lastcheckoktime_iso8601: string;
  lastlocalchecktime: string;
  lastlocalchecktime_iso8601: string;
  clicktimestamp: string;
  clicktimestamp_iso8601: string;
  clickcount: number;
  clicktrend: number;
  ssl_error: number;
  geo_lat: number | null;
  geo_long: number | null;
  has_extended_info: boolean;
  qualityScore?: number;
}

export interface Country {
  name: string;
  iso_3166_1: string;
  stationcount: number;
}

export interface StationClick {
  name: string;
  stationuuid: string;
  url: string;
  clicktimestamp: string;
  clicktimestamp_iso8601: string;
  clickcount: number;
  clicktrend: number;
}

export interface StationVote {
  stationuuid: string;
  name: string;
  url: string;
  votes: number;
  lastchangetime: string;
}

export interface PlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  error: string | null;
}

export interface SleepTimer {
  isActive: boolean;
  endTime: Date | null;
  duration: number; // in minutes
}

export interface Alarm {
  id: string;
  time: string;
  enabled: boolean;
  days: number[];
  station: RadioStation;
  label?: string;
}

export type Mood = 'calm' | 'focus' | 'energetic' | 'spiritual';

export interface MoodConfig {
  calm: {
    keywords: string[];
    emoji: string;
    nameAr: string;
    nameEn: string;
  };
  focus: {
    keywords: string[];
    emoji: string;
    nameAr: string;
    nameEn: string;
  };
  energetic: {
    keywords: string[];
    emoji: string;
    nameAr: string;
    nameEn: string;
  };
  spiritual: {
    keywords: string[];
    emoji: string;
    nameAr: string;
    nameEn: string;
  };
}

export type ContentFilter = 'all' | 'quran' | 'islamic' | 'music' | 'news';

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ==================== NEW ENHANCED TYPES ====================

// Network status types
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
export type ConnectionType = 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'offline';

export interface NetworkStatus {
  isOnline: boolean;
  quality: NetworkQuality;
  connectionType: ConnectionType;
  effectiveType: string; // 4g, 3g, 2g, etc.
  downlink: number; // Mbps
  rtt: number; // Round trip time in ms
}

// Buffering and playback state
export interface BufferState {
  isBuffering: boolean;
  bufferProgress: number; // 0-100
  bufferedSeconds: number;
  targetBufferSeconds: number;
  replayBufferDuration: number; // seconds of stored replay buffer
}

// Replay buffer configuration
export interface ReplayBufferConfig {
  enabled: boolean;
  maxDuration: number; // seconds (default 180 = 3 minutes)
  currentDuration: number; // current stored duration
}

// Replay buffer state
export interface ReplayBufferState {
  isReplaying: boolean;
  replayPosition: number; // seconds from live
  maxReplaySeconds: number;
}

// Stream quality info
export interface StreamQuality {
  bitrate: number;
  codec: string;
  isHls: boolean;
  quality: NetworkQuality;
  autoAdjusted: boolean;
}

// Error state with user-friendly messages
export interface PlaybackError {
  type: 'network' | 'stream' | 'codec' | 'unknown';
  message: string;
  messageAr: string;
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
}

// ==================== USER BEHAVIOR & PERSONALIZATION ====================

// User listening session
export interface ListeningSession {
  stationId: string;
  stationName: string;
  startTime: number;
  endTime?: number;
  duration: number; // seconds
  category: ContentFilter;
  mood?: Mood;
  timeOfDay: TimeOfDay;
  dayOfWeek: number; // 0-6
  skipped: boolean;
  liked: boolean;
}

// Time of day categorization
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';

// User preferences learned from behavior
export interface UserPreferences {
  // Favorite categories ranked by preference
  favoriteCategories: Array<{
    category: ContentFilter;
    score: number;
    listenTime: number;
  }>;
  
  // Preferred stations
  topStations: Array<{
    stationId: string;
    stationName: string;
    playCount: number;
    totalDuration: number;
    lastPlayed: number;
  }>;
  
  // Time-based preferences
  timePreferences: Array<{
    timeOfDay: TimeOfDay;
    preferredCategories: ContentFilter[];
    preferredStationIds: string[];
  }>;
  
  // Day-based preferences (e.g., Quran on weekends)
  dayPreferences: Array<{
    dayOfWeek: number;
    preferredCategories: ContentFilter[];
  }>;
  
  // Listening patterns
  averageSessionDuration: number;
  preferredBitrate: number;
  totalListeningTime: number;
  sessionsCount: number;
}

// User memory - remembers everything
export interface UserMemory {
  // All played stations with metadata
  playedStations: Map<string, {
    station: RadioStation;
    playCount: number;
    totalDuration: number;
    firstPlayed: number;
    lastPlayed: number;
    skipped: number;
    liked: boolean;
  }>;
  
  // Search history
  searchHistory: Array<{
    query: string;
    timestamp: number;
    resultCount: number;
  }>;
  
  // AI interactions
  aiInteractions: Array<{
    message: string;
    response: string;
    timestamp: number;
    action?: string;
  }>;
  
  // Category interactions
  categoryInteractions: Map<ContentFilter, {
    views: number;
    plays: number;
    totalTime: number;
  }>;
  
  // Mood selections over time
  moodHistory: Array<{
    mood: Mood;
    timestamp: number;
    timeOfDay: TimeOfDay;
  }>;
}

// Recommendation result
export interface Recommendation {
  station: RadioStation;
  reason: string;
  reasonAr: string;
  score: number;
  type: 'because_listened' | 'trending' | 'time_based' | 'similar' | 'new_discovery';
}

// Player status for UI
export interface PlayerStatus {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  isReplaying: boolean;
  isOffline: boolean;
  error: PlaybackError | null;
  networkQuality: NetworkQuality;
  streamQuality: StreamQuality | null;
  bufferState: BufferState | null;
  replayState: ReplayBufferState | null;
}

// Habit notification
export interface HabitNotification {
  id: string;
  message: string;
  messageAr: string;
  stationId: string;
  stationName: string;
  timeOfDay: TimeOfDay;
  enabled: boolean;
}
