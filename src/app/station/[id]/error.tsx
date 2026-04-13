'use client';

import { useEffect } from 'react';
import { Radio, RefreshCw, Home } from 'lucide-react';

export default function StationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Station page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4" dir="rtl">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <Radio className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">حدث خطأ</h1>
          <p className="text-muted-foreground">
            عذراً، حدث خطأ أثناء تحميل هذه المحطة. يرجى المحاولة مرة أخرى.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-input bg-background hover:bg-muted transition-colors"
          >
            <Home className="h-4 w-4" />
            العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
