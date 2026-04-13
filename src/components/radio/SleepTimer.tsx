'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Clock, Timer, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIMER_OPTIONS = [
  { mins: 3, label: '3' },
  { mins: 5, label: '5' },
  { mins: 10, label: '10' },
  { mins: 15, label: '15' },
  { mins: 30, label: '30' },
  { mins: 45, label: '45' },
  { mins: 60, label: '60' },
  { mins: 90, label: '90' },
  { mins: 120, label: '120' },
];

export function SleepTimerSheet() {
  const {
    language,
    sleepTimerActive,
    sleepTimerEnd,
    setSleepTimer,
    clearSleepTimer,
  } = useRadioStore();

  const [customMinutes, setCustomMinutes] = useState(3);
  const t = translations[language];
  const isArabic = language === 'ar';

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(isArabic ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRemaining = useCallback((timestamp: number) => {
    const remaining = Math.max(0, timestamp - Date.now());
    const totalSeconds = Math.ceil(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, []);

  // تحديث العد التنازلي - عرض فقط (SleepTimerManager يدير المنطق الفعلي)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!sleepTimerActive || !sleepTimerEnd) return;

    const interval = setInterval(() => {
      const remaining = sleepTimerEnd - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
      } else {
        setTick(t => t + 1);
      }
    }, 5000); // Update every 5 seconds instead of every second

    return () => clearInterval(interval);
  }, [sleepTimerActive, sleepTimerEnd]);

  const currentRemaining = sleepTimerActive && sleepTimerEnd
    ? formatRemaining(sleepTimerEnd)
    : '';

  const adjustCustom = (delta: number) => {
    setCustomMinutes(prev => Math.max(1, Math.min(480, prev + delta)));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full relative",
            sleepTimerActive && "text-primary"
          )}
          aria-label={isArabic ? 'مؤقت النوم' : 'Sleep timer'}
        >
          <Clock className="h-5 w-5" />
          {sleepTimerActive && (
            <span className="absolute -top-0.5 -end-0.5 w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-center">
          <SheetTitle className="flex items-center justify-center gap-2 text-lg">
            <Timer className="h-5 w-5 text-primary" />
            {t.sleepTimer}
          </SheetTitle>
          <SheetDescription className="text-center">
            {isArabic ? 'اختر مدة المؤقت أو أدخل وقتاً مخصصاً' : 'Choose a duration or enter a custom time'}
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-6 space-y-5">
          {/* حالة التشغيل - العد التنازلي */}
          {sleepTimerActive && sleepTimerEnd ? (
            <div className="text-center space-y-4 py-4">
              {/* دائرة العد التنازلي */}
              <div className="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/30">
                <span className="text-4xl font-mono font-bold text-primary tracking-wider">
                  {currentRemaining || '00:00'}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {isArabic ? 'متبقي' : 'remaining'}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                {t.timerEndsAt}: {formatTime(sleepTimerEnd)}
              </p>

              <div className="flex gap-3 max-w-xs mx-auto">
                <Button
                  variant="outline"
                  onClick={() => {
                    clearSleepTimer();
                    const mins = Math.max(1, Math.ceil((sleepTimerEnd - Date.now()) / 60000) + 15);
                    setSleepTimer(mins);
                  }}
                  className="flex-1 gap-2"
                >
                  <Clock className="h-4 w-4" />
                  {isArabic ? '+ 15 دقيقة' : '+ 15 min'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={clearSleepTimer}
                  className="flex-1 gap-2"
                >
                  {t.cancelTimer}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* خيارات سريعة */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  {isArabic ? 'توقيت سريع' : 'Quick Timer'}
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {TIMER_OPTIONS.map(({ mins, label }) => (
                    <Button
                      key={mins}
                      variant="outline"
                      onClick={() => setSleepTimer(mins)}
                      className={cn(
                        "h-12 text-base font-medium transition-all",
                        "hover:bg-primary hover:text-primary-foreground hover:scale-105",
                        "active:scale-95"
                      )}
                    >
                      {label}
                      <span className="text-xs opacity-70 me-1">{t.minutes}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* فاصل */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">
                  {isArabic ? 'أو وقت مخصص' : 'or custom time'}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* إدخال يدوي مخصص */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  {isArabic ? 'تحديد يدوي' : 'Manual Input'}
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    onClick={() => adjustCustom(-1)}
                    aria-label={isArabic ? 'تقليل الوقت' : 'Decrease time'}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1 bg-muted/50 rounded-xl px-4 h-12 min-w-[120px] justify-center">
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={customMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= 480) {
                          setCustomMinutes(val);
                        }
                      }}
                      className="w-14 text-center text-2xl font-bold bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      dir="ltr"
                    />
                    <span className="text-sm text-muted-foreground font-medium">
                      {t.minutes}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-xl"
                    onClick={() => adjustCustom(1)}
                    aria-label={isArabic ? 'زيادة الوقت' : 'Increase time'}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="default"
                  onClick={() => setSleepTimer(customMinutes)}
                  className="w-full mt-3 h-12 text-base font-medium gap-2"
                >
                  <Timer className="h-4 w-4" />
                  {t.setTimer} ({customMinutes} {t.minutes})
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
