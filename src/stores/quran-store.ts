import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reciter {
  id: string;
  identifier: string;
  name: string;
  nameEn: string;
  style: string;
}

export interface Surah {
  number: number;
  name: string;
  nameEn: string;
  ayahs: number;
  type: 'meccan' | 'medinan';
}

export interface QuranAudio {
  reciterId: string;
  reciterName: string;
  surahNumber: number;
  surahName: string;
  audioUrl: string;
}

export interface QuranFavorite {
  type: 'reciter' | 'surah';
  id: string;
  name: string;
  addedAt: number;
}

export interface QuranProgress {
  reciterId: string | null;
  surahNumber: number;
  position: number;
  lastPlayedAt: number;
}

interface QuranStore {
  // Data
  reciters: Reciter[];
  surahs: Surah[];
  
  // Selection
  selectedReciter: Reciter | null;
  selectedSurah: Surah | null;
  
  // Playback
  currentAudio: QuranAudio | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  
  // Favorites
  favoriteReciters: string[];
  favoriteSurahs: number[];
  
  // Progress - Continue listening
  lastProgress: QuranProgress | null;
  
  // Search
  searchQuery: string;
  
  // Loading states
  isLoadingReciters: boolean;
  isLoadingSurahs: boolean;
  
  // Actions
  setReciters: (reciters: Reciter[]) => void;
  setSurahs: (surahs: Surah[]) => void;
  
  setSelectedReciter: (reciter: Reciter | null) => void;
  setSelectedSurah: (surah: Surah | null) => void;
  
  setCurrentAudio: (audio: QuranAudio | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  
  toggleFavoriteReciter: (reciterId: string) => void;
  toggleFavoriteSurah: (surahNumber: number) => void;
  isFavoriteReciter: (reciterId: string) => boolean;
  isFavoriteSurah: (surahNumber: number) => boolean;
  
  saveProgress: (reciterId: string, surahNumber: number, position: number) => void;
  clearProgress: () => void;
  
  setSearchQuery: (query: string) => void;
  
  setIsLoadingReciters: (loading: boolean) => void;
  setIsLoadingSurahs: (loading: boolean) => void;
  
  // Audio controls
  playAudio: (reciter: Reciter, surah: Surah) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const useQuranStore = create<QuranStore>()(
  persist(
    (set, get) => ({
      // Initial state
      reciters: [],
      surahs: [],
      
      selectedReciter: null,
      selectedSurah: null,
      
      currentAudio: null,
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      
      favoriteReciters: [],
      favoriteSurahs: [],
      
      lastProgress: null,
      
      searchQuery: '',
      
      isLoadingReciters: false,
      isLoadingSurahs: false,
      
      // Setters
      setReciters: (reciters) => set({ reciters }),
      setSurahs: (surahs) => set({ surahs }),
      
      setSelectedReciter: (reciter) => set({ selectedReciter: reciter }),
      setSelectedSurah: (surah) => set({ selectedSurah: surah }),
      
      setCurrentAudio: (audio) => set({ currentAudio: audio }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),
      
      // Favorites
      toggleFavoriteReciter: (reciterId) => {
        const { favoriteReciters } = get();
        if (favoriteReciters.includes(reciterId)) {
          set({ favoriteReciters: favoriteReciters.filter(id => id !== reciterId) });
        } else {
          set({ favoriteReciters: [...favoriteReciters, reciterId] });
        }
      },
      
      toggleFavoriteSurah: (surahNumber) => {
        const { favoriteSurahs } = get();
        if (favoriteSurahs.includes(surahNumber)) {
          set({ favoriteSurahs: favoriteSurahs.filter(num => num !== surahNumber) });
        } else {
          set({ favoriteSurahs: [...favoriteSurahs, surahNumber] });
        }
      },
      
      isFavoriteReciter: (reciterId) => {
        return get().favoriteReciters.includes(reciterId);
      },
      
      isFavoriteSurah: (surahNumber) => {
        return get().favoriteSurahs.includes(surahNumber);
      },
      
      // Progress
      saveProgress: (reciterId, surahNumber, position) => {
        set({
          lastProgress: {
            reciterId,
            surahNumber,
            position,
            lastPlayedAt: Date.now(),
          }
        });
      },
      
      clearProgress: () => set({ lastProgress: null }),
      
      // Search
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      // Loading states
      setIsLoadingReciters: (loading) => set({ isLoadingReciters: loading }),
      setIsLoadingSurahs: (loading) => set({ isLoadingSurahs: loading }),
      
      // Audio controls
      playAudio: (reciter, surah) => {
        const surahPadded = String(surah.number).padStart(3, '0');
        // If identifier is a full URL (e.g., mp3quran.net), use it directly
        const audioUrl = reciter.identifier.startsWith('http')
          ? `${reciter.identifier}${surahPadded}.mp3`
          : `https://download.quranicaudio.com/quran/${reciter.identifier}/${surahPadded}.mp3`;

        console.log('Playing Quran audio:', {
          reciter: reciter.name,
          identifier: reciter.identifier,
          surah: surah.name,
          audioUrl
        });

        set({
          currentAudio: {
            reciterId: reciter.id,
            reciterName: reciter.name,
            surahNumber: surah.number,
            surahName: surah.name,
            audioUrl,
          },
          isPlaying: true,
          isLoading: true,
          selectedReciter: reciter,
          selectedSurah: surah,
        });
      },
      
      pauseAudio: () => set({ isPlaying: false }),
      
      resumeAudio: () => set({ isPlaying: true }),
      
      seekTo: (time) => set({ currentTime: time }),
      
      playNext: () => {
        const { selectedSurah, surahs, selectedReciter } = get();
        if (!selectedSurah || !selectedReciter) return;
        
        const currentIndex = selectedSurah.number - 1;
        if (currentIndex < surahs.length - 1) {
          const nextSurah = surahs[currentIndex + 1];
          get().playAudio(selectedReciter, nextSurah);
        }
      },
      
      playPrevious: () => {
        const { selectedSurah, surahs, selectedReciter } = get();
        if (!selectedSurah || !selectedReciter) return;
        
        const currentIndex = selectedSurah.number - 1;
        if (currentIndex > 0) {
          const prevSurah = surahs[currentIndex - 1];
          get().playAudio(selectedReciter, prevSurah);
        }
      },
    }),
    {
      name: 'quran-storage',
      partialize: (state) => ({
        favoriteReciters: state.favoriteReciters,
        favoriteSurahs: state.favoriteSurahs,
        lastProgress: state.lastProgress,
        volume: state.volume,
        selectedReciter: state.selectedReciter,
        currentAudio: state.currentAudio,
        selectedSurah: state.selectedSurah,
      }),
    }
  )
);
