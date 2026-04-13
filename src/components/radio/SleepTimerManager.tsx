'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { useQuranStore } from '@/stores/quran-store';
import { logger } from '@/lib/performance';

/**
 * SleepTimerManager - يدير مؤقت النوم بشكل شامل ومستقر
 * 
 * يعمل على:
 * - التحقق من المؤقت عند تحميل الصفحة
 * - التحقق عند رجوع المستخدم للصفحة (visibility change)
 * - التحقق عند التركيز (focus)
 * - إيقاف كل الصوت (راديو + قرآن) عند انتهاء المؤقت
 * - حفظ جلسة الاستماع قبل الإيقاف
 * - استخدام setTimeout بدل setInterval لأداء أفضل في الخلفية
 * - حماية من التنفيذ المتكرر (debounce guard)
 */
export function SleepTimerManager() {
  const hasFiredRef = useRef(false);
  const lastCheckEndRef = useRef<number | null>(null);

  // إيقاف كل الصوت وحفظ الجلسة - يقرأ القيم مباشرة من الstore
  const stopAllAndSaveSession = useCallback(() => {
    // قراءة أحدث القيم من الstore مباشرة (بدون stale closure)
    const state = useRadioStore.getState();
    const quranState = useQuranStore.getState();

    // حفظ جلسة الاستماع قبل الإيقاف
    const session = state.currentSession;
    const station = state.currentStation;
    if (session && station) {
      const duration = Math.max(1, Math.floor((Date.now() - session.startTime) / 1000));
      try {
        const deviceId = typeof localStorage !== 'undefined' ? localStorage.getItem('deviceId') : null;
        if (deviceId) {
          fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deviceId,
              type: 'session_end',
              data: { stationId: station.stationuuid, duration, skipped: false },
            }),
          }).catch(() => {});
        }
      } catch {}
      state.endListeningSession(false);
    }

    // إيقاف الراديو
    if (state.isPlaying) {
      state.setIsPlaying(false);
    }

    // إيقاف القرآن
    if (quranState.isPlaying) {
      quranState.setIsPlaying(false);
      window.dispatchEvent(new CustomEvent('stopQuranAudio'));
    }

    // محاولة إيقاف أي صوت نشط في الصفحة
    try {
      document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
      });
    } catch {}
  }, []);

  // التحقق من المؤقت واتخاذ الإجراء المناسب
  const checkSleepTimer = useCallback(() => {
    const { sleepTimerActive, sleepTimerEnd, clearSleepTimer } = useRadioStore.getState();

    if (!sleepTimerActive || !sleepTimerEnd) {
      hasFiredRef.current = false;
      lastCheckEndRef.current = null;
      return;
    }

    // تجنب التنفيذ المتكرر لنفس المؤقت
    if (hasFiredRef.current && lastCheckEndRef.current === sleepTimerEnd) {
      return;
    }

    const now = Date.now();
    const remaining = sleepTimerEnd - now;

    // لو الوقت انتهى
    if (remaining <= 0) {
      logger.log('[SleepTimer] Timer expired! Stopping all audio & saving session...');
      hasFiredRef.current = true;
      lastCheckEndRef.current = sleepTimerEnd;
      stopAllAndSaveSession();
      clearSleepTimer();
    }
  }, [stopAllAndSaveSession]);

  // التحقق عند تحميل الصفحة
  useEffect(() => {
    // تأخير بسيط للتأكد من تحميل الstore
    const timer = setTimeout(checkSleepTimer, 100);
    return () => clearTimeout(timer);
  }, [checkSleepTimer]);

  // التحقق عند تغيير حالة الظهور (رجوع المستخدم للصفحة)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        logger.log('[SleepTimer] Page visible, checking timer...');
        checkSleepTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkSleepTimer]);

  // التحقق الدوري كل ثانية + chain على setTimeout
  useEffect(() => {
    let active = true;
    
    const tick = () => {
      if (!active) return;
      
      const { sleepTimerActive, sleepTimerEnd } = useRadioStore.getState();
      
      if (sleepTimerActive && sleepTimerEnd) {
        checkSleepTimer();
        // تحقق كل ثانية
        setTimeout(tick, 1000);
      }
    };
    
    // ابدأ التحقق
    const { sleepTimerActive, sleepTimerEnd } = useRadioStore.getState();
    if (sleepTimerActive && sleepTimerEnd) {
      const initialDelay = Math.min(1000, Math.max(0, sleepTimerEnd - Date.now()));
      setTimeout(tick, initialDelay);
    }
    
    return () => { active = false; };
  }, [checkSleepTimer]);

  // الاستماع لأحداث التركيز والرجوع للنافذة
  useEffect(() => {
    const handleFocus = () => {
      logger.log('[SleepTimer] Window focused, checking timer...');
      checkSleepTimer();
    };

    const handleBeforeUnload = () => {
      // حفظ جلسة الاستماع الحالية قبل إغلاق الصفحة
      const state = useRadioStore.getState();
      const session = state.currentSession;
      const station = state.currentStation;
      if (session && station) {
        const duration = Math.max(1, Math.floor((Date.now() - session.startTime) / 1000));
        try {
          const deviceId = localStorage.getItem('deviceId');
          if (deviceId) {
            const payload = JSON.stringify({
              deviceId,
              type: 'session_end',
              data: { stationId: station.stationuuid, duration, skipped: false },
            });
            navigator.sendBeacon('/api/user', new Blob([payload], { type: 'application/json' }));
          }
        } catch {}
      }
    };

    // أيضاً تحقق عند إخفاء الصفحة (مفيد لو المستخدم رجع بعد وقت طويل)
    const handleVisibilityHidden = () => {
      // فقط تحقق - لا تفعل شيء لأن الصفحة في الخلفية
      // لكن الـ interval/timeout في الخلفية سيتولى الأمر
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityHidden);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityHidden);
    };
  }, [checkSleepTimer]);

  // هذا المكون لا يعرض شيء
  return null;
}
