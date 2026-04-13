'use client';

import { useRadioStore } from '@/stores/radio-store';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, language } = useRadioStore();
  const isArabic = language === 'ar';
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title={theme === 'dark' ? (isArabic ? 'الوضع الساطع' : 'Light Mode') : (isArabic ? 'الوضع الداكن' : 'Dark Mode')}
      aria-label={theme === 'dark' ? (isArabic ? 'الوضع الساطع' : 'Light Mode') : (isArabic ? 'الوضع الداكن' : 'Dark Mode')}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
