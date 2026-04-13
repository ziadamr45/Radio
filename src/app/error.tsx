'use client';

import { useEffect } from 'react';
import { Radio, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the full error for debugging
    console.error('Page error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error digest:', error.digest);
    
    // Also remove splash screen if it exists
    const splash = document.getElementById('initial-splash');
    if (splash) {
      splash.style.display = 'none';
      splash.remove();
    }
  }, [error]);

  // Detect language from localStorage or document
  const isArabic = typeof document !== 'undefined' && document.documentElement.lang !== 'en';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" role="alert">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <Radio className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            {isArabic ? 'حدث خطأ غير متوقع' : 'Unexpected Error'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' : 'Sorry, an unexpected error occurred. Please try again.'}
          </p>
          {/* Show error details in development */}
          {error.message && (
            <p className="text-xs text-destructive/70 font-mono break-all mt-2">
              {error.message}
            </p>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mx-auto min-w-[44px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
          aria-label={isArabic ? 'إعادة المحاولة' : 'Try again'}
        >
          <RefreshCw className="h-4 w-4" />
          {isArabic ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}
