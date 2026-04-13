'use client';

import { useEffect } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ContentFilter } from '@/types/radio';

const FILTERS: { id: ContentFilter; emoji: string; nameAr: string; nameEn: string }[] = [
  { id: 'all', emoji: '📻', nameAr: 'الكل', nameEn: 'All' },
  { id: 'quran', emoji: '📖', nameAr: 'قرآن', nameEn: 'Quran' },
  { id: 'islamic', emoji: '🕌', nameAr: 'إسلامي', nameEn: 'Islamic' },
  { id: 'music', emoji: '🎵', nameAr: 'موسيقى', nameEn: 'Music' },
  { id: 'news', emoji: '📰', nameAr: 'أخبار', nameEn: 'News' },
];

const ISLAMIC_FILTERS: ContentFilter[] = ['all', 'quran', 'islamic'];

export function ContentFilter() {
  const { contentFilter, setContentFilter, language, islamicMode } = useRadioStore();
  const t = translations[language];
  
  // In Islamic mode, restrict to Islamic content only
  const availableFilters = islamicMode
    ? FILTERS.filter((f) => ISLAMIC_FILTERS.includes(f.id))
    : FILTERS;
  
  // Auto-switch to a valid filter when Islamic mode is activated
  // and current filter is not available (e.g., music or news)
  useEffect(() => {
    if (islamicMode && !ISLAMIC_FILTERS.includes(contentFilter)) {
      setContentFilter('all');
    }
  }, [islamicMode, contentFilter, setContentFilter]);
  
  // Reverse order for RTL
  const orderedFilters = language === 'ar' ? [...availableFilters].reverse() : availableFilters;
  
  return (
    <div className="space-y-4" role="group" aria-label={t.contentFilter}>
      <h3 className="font-semibold text-base">{t.contentFilter}</h3>
      <div className="flex flex-wrap gap-2">
        {orderedFilters.map((filter) => (
          <Button
            key={filter.id}
            variant={contentFilter === filter.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setContentFilter(filter.id)}
            className={cn(
              "h-10 px-4 gap-2 rounded-full min-w-[44px]",
              contentFilter === filter.id && "shadow-md"
            )}
            aria-pressed={contentFilter === filter.id}
            aria-label={language === 'ar' ? filter.nameAr : filter.nameEn}
          >
            <span>{filter.emoji}</span>
            <span>{language === 'ar' ? filter.nameAr : filter.nameEn}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
