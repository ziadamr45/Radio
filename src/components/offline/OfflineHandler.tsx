'use client';

import { useEffect, useState, useRef } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { Button } from '@/components/ui/button';
import {
  WifiOff,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Offline Handler Component
 * Shows a banner at the top when offline
 * Does NOT block the interface - user can still see the same UI
 */
export function OfflineHandler() {
  const {
    language,
    networkStatus,
    updateNetworkStatus,
  } = useRadioStore();
  
  const [isRetrying, setIsRetrying] = useState(false);
  const [isBackOnline, setIsBackOnline] = useState(false);
  const retryCountRef = useRef(0);
  
  const isArabic = language === 'ar';
  const isOnline = networkStatus.isOnline;
  
  // Check network status
  useEffect(() => {
    updateNetworkStatus();
    
    const handleOnline = () => {
      updateNetworkStatus();
      setIsBackOnline(true);
      setTimeout(() => setIsBackOnline(false), 3000);
    };
    const handleOffline = () => {
      updateNetworkStatus();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateNetworkStatus]);
  
  const handleRetry = async () => {
    setIsRetrying(true);
    retryCountRef.current += 1;
    
    // Try to fetch a small resource to check connectivity
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('/api/radio?action=stations&limit=1', {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      updateNetworkStatus();
    } catch {
      // Still offline
    } finally {
      setTimeout(() => setIsRetrying(false), 500);
    }
  };
  
  // Show "back online" notification briefly
  if (isBackOnline && isOnline) {
    return (
      <div className="fixed top-0 start-0 end-0 z-[60] bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg safe-area-top animate-in slide-in-from-top duration-300">
        <div className="px-4 py-3">
          <div className="container mx-auto flex items-center justify-center gap-3">
            <Wifi className="h-5 w-5" />
            <p className="font-medium">
              {isArabic ? 'تم استعادة الاتصال بالإنترنت!' : 'Connection restored!'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Offline Banner - Shows at top of screen
  if (!isOnline) {
    return (
      <div className="fixed top-0 start-0 end-0 z-[60] bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg safe-area-top">
        <div className="px-4 py-3">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <WifiOff className="h-5 w-5" />
                <span className="absolute -top-1 -end-1 w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {isArabic ? 'لا يوجد اتصال بالإنترنت' : 'No Internet Connection'}
                </p>
                <p className="text-xs opacity-90">
                  {isArabic ? 'المحطات والتشغيل غير متاحين حالياً' : 'Stations and playback are unavailable'}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 gap-2 shrink-0"
            >
              <RefreshCw className={cn('h-4 w-4', isRetrying && 'animate-spin')} />
              <span className="hidden sm:inline">
                {isArabic ? 'إعادة الاتصال' : 'Reconnect'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Online - don't show anything
  return null;
}

export default OfflineHandler;
