'use client';

import { useRadioStore } from '@/stores/radio-store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Mood } from '@/types/radio';

const MOODS: { id: Mood; emoji: string; nameAr: string; nameEn: string; color: string; bgSelected: string }[] = [
  { id: 'calm', emoji: '😌', nameAr: 'هادئ', nameEn: 'Calm', color: 'text-blue-500', bgSelected: 'bg-blue-500/10 border-blue-500' },
  { id: 'focus', emoji: '📚', nameAr: 'تركيز', nameEn: 'Focus', color: 'text-purple-500', bgSelected: 'bg-purple-500/10 border-purple-500' },
  { id: 'energetic', emoji: '🔥', nameAr: 'نشيط', nameEn: 'Energetic', color: 'text-orange-500', bgSelected: 'bg-orange-500/10 border-orange-500' },
  { id: 'spiritual', emoji: '🕌', nameAr: 'روحاني', nameEn: 'Spiritual', color: 'text-green-500', bgSelected: 'bg-green-500/10 border-green-500' },
];

export function MoodSelector() {
  const { selectedMood, setSelectedMood, language } = useRadioStore();
  const t = translations[language];
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-base">{t.selectMood}</h3>
        <p className="text-sm text-muted-foreground mt-1">{t.moodDescription}</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {MOODS.map((mood) => (
          <Button
            key={mood.id}
            variant="outline"
            className={cn(
              "h-auto flex-col gap-2 py-4 px-3 transition-all rounded-xl min-h-[44px]",
              selectedMood === mood.id && mood.bgSelected
            )}
            onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
            aria-label={language === 'ar' ? `المزاج: ${mood.nameAr}` : `Mood: ${mood.nameEn}`}
            aria-pressed={selectedMood === mood.id}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className={cn(
              "text-sm font-medium",
              selectedMood === mood.id && mood.color
            )}>
              {language === 'ar' ? mood.nameAr : mood.nameEn}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
