'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Radio } from 'lucide-react';

interface StationSEOContentProps {
  stationName: string;
  country?: string;
  tags?: string;
}

export function StationSEOContent({ stationName, country, tags }: StationSEOContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const tagList = tags ? tags.split(',').slice(0, 5).map(t => t.trim()).filter(Boolean) : [];
  const countryName = country || 'العالم';

  return (
    <section className="mt-4" aria-label={`معلومات عن محطة ${stationName}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 hover:border-primary/20 transition-colors text-start"
        aria-expanded={isExpanded}
      >
        <span className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          عن المحطة
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-300 px-1">
          <article className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground text-sm leading-7">
              استمع إلى <strong>{stationName}</strong> بث مباشر أونلاين. 
              {country && ` محطة راديو من ${countryName}.`}
              {tagList.length > 0 && (
                <>
                  {' '}المحطة تقدم محتوى متنوع يشمل: {tagList.join('، ')}.
                </>
              )}
              {' '}استمع الآن على اسمع راديو بجودة عالية بدون انقطاع.
            </p>
          </article>

          <article className="prose prose-sm dark:prose-invert max-w-none">
            <h4 className="text-sm font-semibold mb-2">كيف تستمع إلى {stationName}؟</h4>
            <p className="text-muted-foreground text-sm leading-7">
              يمكنك الاستماع إلى {stationName} مباشرة من خلال موقع اسمع راديو. 
              اضغط على زر التشغيل لتبدأ الاستماع فوراً. 
              يمكنك أيضاً إضافة المحطة إلى المفضلة للوصول السريع إليها لاحقاً.
              يعمل البث المباشر على جميع الأجهزة: الهاتف، الكمبيوتر، والتابلت.
            </p>
          </article>

          {tagList.some(t => ['quran', 'قرآن', 'islamic', 'إسلام'].includes(t.toLowerCase())) && (
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <h4 className="text-sm font-semibold mb-2">محتوى إسلامي</h4>
              <p className="text-muted-foreground text-sm leading-7">
                {stationName} محطة إذاعية إسلامية تقدم محتوى ديني مميز. 
                يمكنك الاستماع إلى تلاوات القرآن الكريم والأناشيد الإسلامية. 
                اسمع راديو يجمع لك أفضل المحطات الإسلامية في مكان واحد.
              </p>
            </article>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              كلمات دلالية: {stationName}، راديو مباشر، بث مباشر، راديو أونلاين، استماع راديو
              {country && `، راديو ${country}`}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
