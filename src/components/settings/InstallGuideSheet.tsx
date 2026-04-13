'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  Download,
  Smartphone,
  Monitor,
  Apple,
  Chrome,
  Globe,
  Check,
  Zap,
  Wifi,
  WifiOff,
  Star,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallGuideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallGuideSheet({ open, onOpenChange }: InstallGuideSheetProps) {
  const { language } = useRadioStore();
  const isArabic = language === 'ar';
  const [platform, setPlatform] = useState<string | null>(null);
  const [browser, setBrowser] = useState<string | null>(null);
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Detect platform
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) {
      setPlatform('ios');
    } else if (/Android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Detect browser
    if (/CriOS/.test(ua)) {
      setBrowser('chrome-ios');
    } else if (/FxiOS/.test(ua)) {
      setBrowser('firefox-ios');
    } else if (/Chrome/.test(ua) && !/Edge|OPR/.test(ua)) {
      setBrowser('chrome');
    } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
      setBrowser('safari');
    } else if (/Firefox/.test(ua)) {
      setBrowser('firefox');
    } else if (/Edge/.test(ua)) {
      setBrowser('edge');
    } else if (/SamsungBrowser/.test(ua)) {
      setBrowser('samsung');
    } else {
      setBrowser('other');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true) {
      setIsAlreadyInstalled(true);
    }
  }, [open]);

  // Listen for direct install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setCanDirectInstall(true);
      (window as unknown as Record<string, BeforeInstallPromptEvent>)['deferredInstallPrompt'] = e as BeforeInstallPromptEvent;
    };

    const handleAppInstalled = () => {
      setInstallSuccess(true);
      setCanDirectInstall(false);
      setIsAlreadyInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDirectInstall = useCallback(async () => {
    const promptEvent = (window as unknown as Record<string, BeforeInstallPromptEvent>)['deferredInstallPrompt'];
    if (!promptEvent) return;

    setInstalling(true);
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setIsAlreadyInstalled(true);
      }
    } catch (error) {
      console.error('Install error:', error);
    } finally {
      setInstalling(false);
    }
  }, []);

  const getInstallInstructions = () => {
    if (platform === 'ios') {
      return {
        steps: [
          {
            icon: <Chrome className="h-6 w-6 text-blue-500" />,
            title: isArabic ? 'استخدم متصفح Chrome أو Safari' : 'Use Chrome or Safari browser',
            desc: isArabic
              ? 'التثبيت يعمل من Chrome أو Safari فقط على iPhone. افتح هذه الصفحة في أحد هذه المتصفحات.'
              : 'Installation works from Chrome or Safari only on iPhone. Open this page in one of these browsers.',
          },
          {
            icon: <Apple className="h-6 w-6 text-gray-800 dark:text-gray-200" />,
            title: isArabic ? 'اضغط على زر المشاركة' : 'Tap the Share button',
            desc: isArabic
              ? 'اضغط على أيقونة المشاركة (مربع مع سهم لأعلى) في أسفل الشاشة أو في شريط العنوان.'
              : 'Tap the Share icon (square with an arrow pointing up) at the bottom of the screen or in the address bar.',
          },
          {
            icon: <Download className="h-6 w-6 text-[#2D8B8B]" />,
            title: isArabic ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"',
            desc: isArabic
              ? 'ابحث عن خيار "إضافة إلى الشاشة الرئيسية" في القائمة واضغط عليه.'
              : 'Look for "Add to Home Screen" option in the menu and tap it.',
          },
          {
            icon: <Check className="h-6 w-6 text-green-500" />,
            title: isArabic ? 'اضغط "إضافة"' : 'Tap "Add"',
            desc: isArabic
              ? 'اضغط على زر "إضافة" للتأكيد. هيحمل التطبيق ويت install على جهازك.'
              : 'Tap the "Add" button to confirm. The app will be downloaded and installed on your device.',
          },
        ],
        tip: isArabic
          ? '💡 على iPhone لازم تفتح الموقع في Safari أو Chrome عشان التثبيت يشتغل'
          : '💡 On iPhone, you must open the site in Safari or Chrome for installation to work',
      };
    }

    if (platform === 'android') {
      return {
        steps: canDirectInstall ? [
          {
            icon: <Zap className="h-6 w-6 text-orange-500" />,
            title: isArabic ? 'اضغط "تثبيت التطبيق"' : 'Tap "Install App"',
            desc: isArabic
              ? 'متصفحك بيقدم لك تثبيت مباشر! اضغط على الزر ده وهيتثبت فوراً.'
              : 'Your browser offers direct installation! Tap the button below and it will install instantly.',
          },
        ] : [
          {
            icon: <Chrome className="h-6 w-6 text-blue-500" />,
            title: isArabic ? 'استخدم Chrome أو Samsung Internet' : 'Use Chrome or Samsung Internet',
            desc: isArabic
              ? 'أفضل تجربة تثبيت بتكون من Chrome أو Samsung Internet على Android.'
              : 'Best installation experience is from Chrome or Samsung Internet on Android.',
          },
          {
            icon: <Globe className="h-6 w-6 text-green-500" />,
            title: isArabic ? 'افتح قائمة المتصفح (⋮)' : 'Open browser menu (⋮)',
            desc: isArabic
              ? 'اضغط على النقط التلاتة (⋮) في أعلى يمين أو يسار الشاشة حسب اتجاه اللغة.'
              : 'Tap the three dots (⋮) at the top right or left of the screen depending on language direction.',
          },
          {
            icon: <Download className="h-6 w-6 text-[#2D8B8B]" />,
            title: isArabic ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Select "Add to Home Screen"',
            desc: isArabic
              ? 'ابحث عن الخيار في القائمة واضغط عليه. ممكن يكون اسمه "تثبيت التطبيق" كمان.'
              : 'Find the option in the menu and tap it. It might also be called "Install app".',
          },
          {
            icon: <Check className="h-6 w-6 text-green-500" />,
            title: isArabic ? 'اضغط "إضافة"' : 'Tap "Add/Install"',
            desc: isArabic
              ? 'اضغط على زر التأكيد والتطبيق هيتم تثبيته على جهازك.'
              : 'Tap the confirm button and the app will be installed on your device.',
          },
        ],
        tip: isArabic
          ? '💡 لو متصفحك مش بيقدم التثبيت المباشر، جرب تفتح الموقع في Chrome'
          : '💡 If your browser doesn\'t offer direct installation, try opening the site in Chrome',
      };
    }

    // Desktop
    return {
      steps: canDirectInstall ? [
        {
          icon: <Zap className="h-6 w-6 text-orange-500" />,
          title: isArabic ? 'اضغط "تثبيت التطبيق"' : 'Click "Install App"',
          desc: isArabic
              ? 'متصفحك بيقدم لك تثبيت مباشر! اضغط على الزر ده وهيتثبت فوراً.'
              : 'Your browser offers direct installation! Click the button below and it will install instantly.',
        },
      ] : [
        {
          icon: <Monitor className="h-6 w-6 text-blue-500" />,
          title: isArabic ? 'استخدم Chrome أو Edge' : 'Use Chrome or Edge',
          desc: isArabic
            ? 'التثبيت كتطبيق مستقل شغال على Chrome و Edge على الكمبيوتر.'
            : 'Installation as a standalone app works on Chrome and Edge on desktop.',
        },
        {
          icon: <Globe className="h-6 w-6 text-green-500" />,
          title: isArabic ? 'اضغط على أيقونة التثبيت في شريط العنوان' : 'Click the install icon in the address bar',
          desc: isArabic
            ? 'هتلاقي أيقونة التثبيت (شاشة صغيرة مع سهم) على يسار شريط العنوان في Chrome أو الأيقونة في Edge.'
            : 'You\'ll find the install icon (small screen with arrow) on the left of the address bar in Chrome or the icon in Edge.',
        },
        {
          icon: <Globe className="h-6 w-6 text-blue-500" />,
          title: isArabic ? 'أو من قائمة المتصفح (⋮)' : 'Or from browser menu (⋮)',
          desc: isArabic
            ? 'ممكن تلاقي الخيار كمان في قائمة النقط التلاتة: "تثبيت اسمع راديو" أو "Install app".'
            : 'You might also find the option in the three-dot menu: "Install Esmaa Radio" or "Install app".',
        },
      ],
      tip: isArabic
        ? '💡 التطبيق هيشتغل كنافذة مستقلة زي أي تطبيق على الكمبيوتر'
        : '💡 The app will run as an independent window like any desktop app',
    };
  };

  const instructions = platform ? getInstallInstructions() : null;

  const features = [
    {
      icon: <WifiOff className="h-5 w-5 text-blue-500" />,
      title: isArabic ? 'يعمل بدون إنترنت' : 'Works offline',
    },
    {
      icon: <Zap className="h-5 w-5 text-orange-500" />,
      title: isArabic ? 'فتح سريع' : 'Fast loading',
    },
    {
      icon: <Star className="h-5 w-5 text-yellow-500" />,
      title: isArabic ? 'تجربة مثل التطبيقات' : 'App-like experience',
    },
    {
      icon: <Wifi className="h-5 w-5 text-green-500" />,
      title: isArabic ? 'بث مباشر مستمر' : 'Continuous live streaming',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        <VisuallyHidden>
          <SheetTitle>
            {isArabic ? 'تثبيت التطبيق' : 'Install App'}
          </SheetTitle>
          <SheetDescription>
            {isArabic ? 'تعليمات تثبيت التطبيق على جهازك' : 'Instructions to install the app on your device'}
          </SheetDescription>
        </VisuallyHidden>

        <div className="p-4">
          {/* Header */}
          <SheetHeader className="mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D8B8B]/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-[#2D8B8B]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {isArabic ? 'تثبيت التطبيق' : 'Install App'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'أضف اسمع راديو لشاشتك الرئيسية' : 'Add Esmaa Radio to your home screen'}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* App Icon + Title */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg mb-3">
              <img
                src="/icons/icon-192x192.png"
                alt={isArabic ? 'اسمع راديو' : 'Esmaa Radio'}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold">{isArabic ? 'اسمع راديو' : 'Esmaa Radio'}</h3>
            <p className="text-muted-foreground text-xs">
              {isArabic
                ? 'بث مباشر لمحطات الراديو من حول العالم والقرآن الكريم'
                : 'Live streaming of radio stations from around the world and Holy Quran'}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border"
              >
                {feature.icon}
                <span className="text-xs font-medium">{feature.title}</span>
              </div>
            ))}
          </div>

          {/* Already Installed */}
          {isAlreadyInstalled && (
            <div className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-700 dark:text-green-400">
                    {isArabic ? '✅ التطبيق مثبت بالفعل!' : '✅ App already installed!'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? 'مفيش حاجة تاني تحتاج تعملها'
                      : 'Nothing else you need to do'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Direct Install Button */}
          {!isAlreadyInstalled && canDirectInstall && (
            <div className="mb-6">
              <Button
                onClick={handleDirectInstall}
                disabled={installing || installSuccess}
                size="lg"
                className="w-full h-14 rounded-2xl text-lg gap-3 bg-gradient-to-l from-[#2D8B8B] to-[#237575] hover:from-[#237575] hover:to-[#1d5e5e] shadow-lg"
              >
                {installing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : installSuccess ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <Download className="h-6 w-6" />
                )}
                {installing
                  ? (isArabic ? 'جاري التثبيت...' : 'Installing...')
                  : installSuccess
                    ? (isArabic ? '✅ تم التثبيت!' : '✅ Installed!')
                    : (isArabic ? 'تثبيت التطبيق' : 'Install App')}
              </Button>
              {installSuccess && (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  {isArabic
                    ? 'مبروك! التطبيق اتمام تثبيته على جهازك. تقدر تفتحه من الشاشة الرئيسية مباشرة.'
                    : 'Congratulations! The app has been installed on your device. You can open it directly from your home screen.'}
                </p>
              )}
            </div>
          )}

          {/* Install Instructions */}
          {!isAlreadyInstalled && !canDirectInstall && instructions && (
            <div className="space-y-4">
              {/* Platform indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {platform === 'ios' ? (
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                ) : platform === 'android' ? (
                  <Smartphone className="h-5 w-5 text-green-600" />
                ) : (
                  <Monitor className="h-5 w-5 text-blue-600" />
                )}
                <span className="text-sm text-muted-foreground">
                  {platform === 'ios'
                    ? (isArabic ? 'جهاز iPhone' : 'iPhone device')
                    : platform === 'android'
                      ? (isArabic ? 'جهاز Android' : 'Android device')
                      : (isArabic ? 'كمبيوتر' : 'Desktop')}
                  {' · '}
                  {browser === 'chrome' ? 'Chrome' : browser === 'safari' ? 'Safari' : browser === 'firefox' ? 'Firefox' : browser === 'edge' ? 'Edge' : browser === 'chrome-ios' ? 'Chrome' : browser === 'samsung' ? 'Samsung Internet' : 'Browser'}
                </span>
              </div>

              <h4 className="text-lg font-bold text-center">
                {isArabic ? 'خطوات التثبيت' : 'Installation Steps'}
              </h4>

              {/* Steps */}
              <div className="space-y-3">
                {instructions.steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 rounded-2xl bg-muted/50 border"
                  >
                    <div className="shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-xl bg-background border flex items-center justify-center">
                        {step.icon}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <h5 className="font-bold text-xs">{step.title}</h5>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tip */}
              {instructions.tip && (
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/30">
                  <p className="text-xs text-muted-foreground">{instructions.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
