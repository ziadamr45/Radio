'use client';

import { useEffect, useRef } from 'react';

interface SplashScreenProps {
  onLoadingComplete: () => void;
}

export function SplashScreen({ onLoadingComplete }: SplashScreenProps) {
  const hasCompleted = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasCompleted.current) return;

    const removeSplash = () => {
      // Ensure we only complete once
      if (hasCompleted.current) return;
      hasCompleted.current = true;

      const initialSplash = document.getElementById('initial-splash');
      if (initialSplash) {
        initialSplash.style.transition = 'opacity 0.3s ease-out';
        initialSplash.style.opacity = '0';
        setTimeout(() => {
          const splash = document.getElementById('initial-splash');
          if (splash) splash.remove();
          onLoadingComplete();
        }, 300);
      } else {
        onLoadingComplete();
      }
    };

    // Check if user came from a shared link (deep link to station/quran/surah)
    const isDeepLink = () => {
      const path = window.location.pathname;
      // Check if it's a direct link to a station, surah, or reciter
      return path.startsWith('/station/') || 
             path.startsWith('/surah/') || 
             path.startsWith('/reciter/') ||
             path.includes('/share');
    };

    // For deep links: show splash for shorter time (500ms)
    // For normal visits: show splash for normal time (1500ms)
    const minShowTime = isDeepLink() ? 500 : 1500;
    
    // Use requestAnimationFrame to ensure we're in the browser context
    // and the DOM is ready
    const timer = setTimeout(() => {
      removeSplash();
    }, minShowTime);

    // Also listen for window load as a fallback
    const handleLoad = () => {
      // Still wait for minimum time (use the calculated minShowTime)
      setTimeout(removeSplash, Math.max(0, minShowTime - 300));
    };

    if (document.readyState === 'complete') {
      // Page already loaded, just wait minimum time
      // Timer already set above
    } else {
      window.addEventListener('load', handleLoad, { once: true });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, [onLoadingComplete]);

  return null;
}
