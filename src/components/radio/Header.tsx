'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { useQuranStore } from '@/stores/quran-store';
import { translations } from '@/lib/translations';
import { ThemeToggle } from './ThemeToggle';
import { FavoritesModal } from '@/components/favorites/FavoritesModal';
import { NotificationPermission } from '@/components/notifications/NotificationPermission';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Settings, 
  Menu, 
  Info, 
  Shield, 
  FileText,
  Mail,
  ChevronLeft,
  Heart
} from 'lucide-react';
import { getTimeOfDay, getGreetingText } from '@/lib/time-utils';
import { cn } from '@/lib/utils';

const subscribe = (callback: () => void) => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function Header() {
  const { language, favorites, settingsOpen, setSettingsOpen } = useRadioStore();
  const { favoriteReciters, favoriteSurahs } = useQuranStore();
  const t = translations[language];
  const isArabic = language === 'ar';
  
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  
  const greeting = mounted 
    ? getGreetingText(getTimeOfDay(), language)
    : (language === 'ar' ? 'مرحباً' : 'Hello');
  
  const hasFavorites = favorites.length > 0 || favoriteReciters.length > 0 || favoriteSurahs.length > 0;
  
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Image 
                src="/icons/icon-192x192.png" 
                alt={isArabic ? 'اسمع راديو' : 'Esmaa Radio'} 
                width={40} 
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold whitespace-nowrap">{t.appName}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {greeting}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              aria-label={isArabic ? 'المفضلة' : 'Favorites'}
              onClick={() => setFavoritesOpen(true)}
            >
              <Heart className={cn("h-5 w-5", hasFavorites && "fill-red-500 text-red-500")} />
            </Button>
            <NotificationPermission headerOnly />
            <ThemeToggle />
            
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={isArabic ? 'القائمة' : 'Menu'}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-4 bg-gradient-to-l from-[#2D8B8B] to-[#237575]">
                    <SheetTitle className="text-white flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center">
                        <Image 
                          src="/icons/icon-192x192.png" 
                          alt={isArabic ? 'اسمع راديو' : 'Esmaa Radio'} 
                          width={40} 
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>{t.appName}</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* من نحن */}
                    <Link
                      href="/about"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#2D8B8B]/10 flex items-center justify-center">
                        <Info className="h-5 w-5 text-[#2D8B8B]" />
                      </div>
                      <div className="flex-1 text-start">
                        <p className="font-medium">{isArabic ? 'من نحن' : 'About Us'}</p>
                        <p className="text-xs text-muted-foreground">{isArabic ? 'تعرف علينا' : 'Learn about us'}</p>
                      </div>
                      <ChevronLeft className={cn("h-4 w-4 text-muted-foreground", !isArabic && "rotate-180")} />
                    </Link>
                    
                    {/* سياسة الخصوصية */}
                    <Link
                      href="/privacy"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 text-start">
                        <p className="font-medium">{isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}</p>
                        <p className="text-xs text-muted-foreground">{isArabic ? 'كيف نحمي خصوصيتك' : 'How we protect your privacy'}</p>
                      </div>
                      <ChevronLeft className={cn("h-4 w-4 text-muted-foreground", !isArabic && "rotate-180")} />
                    </Link>
                    
                    {/* شروط الاستخدام */}
                    <Link
                      href="/terms"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="flex-1 text-start">
                        <p className="font-medium">{isArabic ? 'شروط الاستخدام' : 'Terms of Service'}</p>
                        <p className="text-xs text-muted-foreground">{isArabic ? 'شروط استخدام التطبيق' : 'App usage terms'}</p>
                      </div>
                      <ChevronLeft className={cn("h-4 w-4 text-muted-foreground", !isArabic && "rotate-180")} />
                    </Link>
                    
                    {/* اتصل بنا */}
                    <Link
                      href="/contact"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 text-start">
                        <p className="font-medium">{isArabic ? 'اتصل بنا' : 'Contact Us'}</p>
                        <p className="text-xs text-muted-foreground">{isArabic ? 'تواصل معنا للدعم' : 'Get in touch for support'}</p>
                      </div>
                      <ChevronLeft className={cn("h-4 w-4 text-muted-foreground", !isArabic && "rotate-180")} />
                    </Link>
                    
                    <Separator className="my-3" />
                    
                    {/* الإعدادات */}
                    <button
                      onClick={() => { setMenuOpen(false); setSettingsOpen(true); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                      aria-label={isArabic ? 'الإعدادات' : 'Settings'}
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="flex-1 text-start">
                        <p className="font-medium">{isArabic ? 'الإعدادات' : 'Settings'}</p>
                        <p className="text-xs text-muted-foreground">{isArabic ? 'تخصيص التطبيق' : 'Customize the app'}</p>
                      </div>
                      <ChevronLeft className={cn("h-4 w-4 text-muted-foreground", !isArabic && "rotate-180")} />
                    </button>
                  </div>
                  
                  <div className="p-4 border-t text-center text-xs text-muted-foreground">
                    <p>{isArabic ? 'الإصدار 2.0.0' : 'Version 2.0.0'}</p>
                    <p className="mt-1">© 2026 {t.appName} | <a href="https://ziadamrme.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[#2D8B8B] hover:underline">Ziad Amr</a></p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      <FavoritesModal open={favoritesOpen} onOpenChange={setFavoritesOpen} />
    </>
  );
}


