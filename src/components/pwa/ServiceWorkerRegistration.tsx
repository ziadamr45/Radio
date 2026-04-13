'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  RefreshCw, 
  Download, 
  Share2, 
  MonitorSmartphone,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Extend WindowEventMap for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function ServiceWorkerRegistration() {
  const { language } = useRadioStore();
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  // Install prompt state - initialize with proper defaults
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  
  // Initialize iOS and standalone state synchronously
  const [isIOS] = useState(() => {
    if (typeof navigator !== 'undefined') {
      return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
    return false;
  });
  
  const [isStandalone] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    }
    return false;
  });

  // Check if dismissed recently
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show prompt again within 7 days
      }
    }
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register main PWA service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg);
          setRegistration(reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setNeedRefresh(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });

      // Listen for controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('[PWA] beforeinstallprompt event fired');
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);

      // Show install prompt after a delay (better UX)
      setTimeout(() => {
        const dismissedTime = localStorage.getItem('pwa-install-dismissed');
        if (!dismissedTime || (Date.now() - parseInt(dismissedTime)) > 7 * 24 * 60 * 60 * 1000) {
          setShowInstallPrompt(true);
        }
      }, 5000); // Show after 5 seconds
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App installed');
      setInstallPrompt(null);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setNeedRefresh(false);
  }, [registration]);

  // Handle install
  const handleInstall = useCallback(async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log('[PWA] Install prompt outcome:', outcome);
      
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('[PWA] Install error:', error);
    }
    
    setShowInstallPrompt(false);
  }, [installPrompt]);

  // Handle dismiss
  const handleDismissInstall = useCallback(() => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }, []);

  // Don't show if already standalone
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Update Available Dialog */}
      <Dialog open={needRefresh} onOpenChange={setNeedRefresh}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-orange-500" />
            </div>
            <DialogTitle className="text-xl">
              {language === 'ar' ? 'تحديث متاح' : 'Update Available'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {language === 'ar'
                ? 'يوجد إصدار جديد من التطبيق. هل تريد التحديث الآن؟'
                : 'A new version is available. Update now?'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button onClick={handleRefresh} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              {language === 'ar' ? 'تحديث الآن' : 'Update Now'}
            </Button>
            <Button variant="outline" onClick={() => setNeedRefresh(false)} className="w-full">
              {language === 'ar' ? 'لاحقاً' : 'Later'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Install Prompt Dialog */}
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <MonitorSmartphone className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-xl">
              {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {language === 'ar'
                ? 'ثبّت تطبيق اسمع راديو على جهازك للوصول السريع وتجربة أفضل!'
                : 'Install Esmaa Radio on your device for quick access and better experience!'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4">
            {isIOS ? (
              // iOS install instructions
              <div className="bg-muted p-4 rounded-lg text-start space-y-3">
                <p className="text-sm font-medium">
                  {language === 'ar' ? 'لتثبيت التطبيق:' : 'To install the app:'}
                </p>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                    <span>{language === 'ar' ? 'اضغط على زر المشاركة' : 'Tap the share button'}</span>
                    <Share2 className="h-4 w-4" />
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                    <span>{language === 'ar' ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"'}</span>
                  </li>
                </ol>
              </div>
            ) : (
              // Non-iOS install button
              <Button onClick={handleInstall} className="w-full gap-2">
                <Download className="h-4 w-4" />
                {language === 'ar' ? 'تثبيت' : 'Install'}
              </Button>
            )}
            
            <Button variant="outline" onClick={handleDismissInstall} className="w-full">
              {language === 'ar' ? 'ليس الآن' : 'Not Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
