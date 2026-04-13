// ==================== SHARED TYPES ====================
// Only types that are actively imported by components are kept here.
// Radio-specific types are in @/types/radio
// Quran-specific types are in @/types/quran

// Navigation
export type TabId = 'home' | 'library' | 'favorites' | 'settings';

// Reciter/Preacher
export interface Reciter {
  id: string;
  name: string;
  nameAr: string;
  image?: string;
  bio?: string;
  bioAr?: string;
  category: string;
  isFeatured: boolean;
  tracks?: AudioTrack[];
}

// Audio Track
export interface AudioTrack {
  id: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  audioUrl: string;
  duration: number;
  category: AudioCategory;
  surahNumber?: number;
  surahName?: string;
  surahNameAr?: string;
  juz?: number;
  reciterId?: string;
  reciter?: Reciter;
  imageUrl?: string;
  playCount: number;
  isFeatured: boolean;
}

// Audio Categories
export type AudioCategory = 'quran' | 'lecture' | 'nasheed' | 'radio';

// Surah Info (for Quran)
export interface SurahInfo {
  number: number;
  name: string;
  nameAr: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
