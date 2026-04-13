'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useRadioStore } from '@/stores/radio-store';

/**
 * Syncs theme between Zustand store and next-themes.
 * The Zustand store is the single source of truth for the theme.
 * next-themes is only a consumer that applies the class to <html>.
 */
export function ThemeSync() {
  const storeTheme = useRadioStore((state) => state.theme);
  const language = useRadioStore((state) => state.language);
  const { setTheme } = useTheme();
  
  const mounted = useRef(false);
  const lastAppliedTheme = useRef<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Single direction sync: store (source of truth) → next-themes
  useEffect(() => {
    if (!mounted.current) return;
    
    if (storeTheme && storeTheme !== lastAppliedTheme.current) {
      lastAppliedTheme.current = storeTheme;
      setTheme(storeTheme);
    }
  }, [storeTheme, setTheme]);

  // Apply language direction
  useEffect(() => {
    if (!mounted.current) return;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
