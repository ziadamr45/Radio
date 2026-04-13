'use client';

import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { cn } from '@/lib/utils';

interface VoiceButtonProps {
  onResult: (text: string) => void;
  lang?: string;
  className?: string;
  disabled?: boolean;
}

export function VoiceButton({ onResult, lang = 'ar-SA', className, disabled }: VoiceButtonProps) {
  const { isListening, isSupported, startListening, stopListening } = useVoiceRecognition({
    onResult,
    lang,
  });

  if (!isSupported) return null;

  const isArabic = lang === 'ar-SA';

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'shrink-0 transition-all duration-200',
        isListening
          ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20 hover:text-red-600'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
      aria-label={isListening ? (isArabic ? 'إيقاف التسجيل' : 'Stop recording') : (isArabic ? 'تحدث بالصوت' : 'Voice search')}
    >
      {isListening ? (
        <Mic className="h-5 w-5 animate-pulse" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
