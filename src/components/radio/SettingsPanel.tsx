'use client';

import { useRadioStore } from '@/stores/radio-store';
import { useUserData } from '@/components/providers/UserDataProvider';
import { translations } from '@/lib/translations';
import { InstallGuideSheet } from '@/components/settings/InstallGuideSheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { NotificationPermission } from '@/components/notifications/NotificationPermission';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowRight,
  Settings,
  Moon,
  Sun,
  Globe,
  Heart,
  Trash2,
  Volume2,
  VolumeX,
  Timer,
  Clock,
  Shield,
  Database,
  History,
  ChevronLeft,
  Radio,
  Bell,
  Info,
  ExternalLink,
  Mail,
  FileText,
  Smartphone,
  Headphones,
  Mic,
  Brain,
  Sparkles,
  Lock,
  Eye,
  MessageCircle,
  Download,
  CheckCircle,
  TrendingUp,
  User,
  Pencil,
  Check,
  X,
  Minus,
  Plus,
  Bot,
} from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const sleepTimerOptions = [
  { value: 15, labelAr: '15 دقيقة', labelEn: '15 minutes' },
  { value: 30, labelAr: '30 دقيقة', labelEn: '30 minutes' },
  { value: 45, labelAr: '45 دقيقة', labelEn: '45 minutes' },
  { value: 60, labelAr: 'ساعة', labelEn: '1 hour' },
  { value: 90, labelAr: 'ساعة ونصف', labelEn: '1.5 hours' },
  { value: 120, labelAr: 'ساعتين', labelEn: '2 hours' },
];

// About App Dialog Component
function AboutAppDialog({ isArabic }: { isArabic: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-3 h-14 rounded-xl bg-gradient-to-br from-[#2D8B8B]/5 to-[#2D8B8B]/10 border-[#2D8B8B]/20 hover:bg-[#2D8B8B]/15">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D8B8B] to-[#237575] flex items-center justify-center">
            <Info className="h-5 w-5 text-white" />
          </div>
          <div className="text-start flex-1">
            <p className="font-semibold">{isArabic ? 'عن التطبيق' : 'About App'}</p>
            <p className="text-xs text-muted-foreground">{isArabic ? 'تعرف على التطبيق وتواصل معنا' : 'Learn about the app and contact us'}</p>
          </div>
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Radio className="h-5 w-5 text-[#2D8B8B]" />
            {isArabic ? 'عن تطبيق اسمع راديو' : 'About Esmaa Radio'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isArabic ? 'تطبيق راديو عالمي متكامل' : 'Complete World Radio App'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* App Goal */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-[#2D8B8B]">
              <Sparkles className="h-4 w-4" />
              {isArabic ? 'هدف التطبيق' : 'Our Mission'}
            </h4>
            <p className="text-sm text-muted-foreground leading-7">
              {isArabic ? (
                <>
                  تطبيق <strong>اسمع راديو</strong> يهدف إلى توفير تجربة استماع متميزة لكل مستمع حول العالم،
                  حيث يجمع بين محطات الراديو من مختلف الدول والقرآن الكريم في مكان واحد.
                  نسعى لتقديم محتوى إسلامي راقي ومتنوع يلبي احتياجات المستمع المسلم حول العالم.
                </>
              ) : (
                <>
                  <strong>Esmaa Radio</strong> aims to provide an exceptional listening experience for users worldwide,
                  combining radio stations from around the world with the Holy Quran in one place.
                  We strive to deliver quality Islamic content that meets the needs of Muslim listeners worldwide.
                </>
              )}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-[#2D8B8B]">
              <Headphones className="h-4 w-4" />
              {isArabic ? 'مميزات التطبيق' : 'App Features'}
            </h4>
            <div className="grid gap-2">
              {[
                { icon: Radio, ar: 'أكثر من 40,000 محطة راديو من جميع أنحاء العالم', en: 'Over 40,000 radio stations from all around the world' },
                { icon: Mic, ar: 'أكثر من 50 قارئ للقرآن الكريم', en: 'Over 50 Quran reciters' },
                { icon: Brain, ar: 'مساعد ذكي للبحث والتوصيات', en: 'AI assistant for search and recommendations' },
                { icon: Heart, ar: 'حفظ المحطات المفضلة وسجل الاستماع', en: 'Save favorites and listening history' },
                { icon: Bell, ar: 'إشعارات ذكية وتنبيهات مخصصة', en: 'Smart notifications and custom alerts' },
                { icon: Timer, ar: 'مؤقت نوم تلقائي', en: 'Automatic sleep timer' },
                { icon: Moon, ar: 'وضع داكن للراحة الليلية', en: 'Dark mode for night comfort' },
                { icon: Globe, ar: 'دعم اللغة العربية والإنجليزية', en: 'Arabic and English language support' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
                  <feature.icon className="h-4 w-4 text-[#2D8B8B] flex-shrink-0" />
                  <span className="text-sm">{isArabic ? feature.ar : feature.en}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Us */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-[#2D8B8B]">
              <MessageCircle className="h-4 w-4" />
              {isArabic ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <div className="grid gap-2">
              <a
                href="https://www.facebook.com/ziad7mr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg p-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Facebook</p>
                  <p className="text-xs text-muted-foreground">@ziad7mr</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              
              <a
                href="https://t.me/ziadamr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-sky-500/10 hover:bg-sky-500/20 rounded-lg p-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Telegram</p>
                  <p className="text-xs text-muted-foreground">@ziadamr</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              
              <a
                href="mailto:ziad90216@gmail.com"
                className="flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg p-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Email</p>
                  <p className="text-xs text-muted-foreground">ziad90216@gmail.com</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* App Version */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'الإصدار 2.0.0' : 'Version 2.0.0'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © 2026 {isArabic ? 'اسمع راديو | ' : 'Esmaa Radio | '}<a href="https://ziadamrme.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[#2D8B8B] hover:underline">Ziad Amr</a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Privacy Policy Dialog Component
function PrivacyPolicyDialog({ isArabic }: { isArabic: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-3 h-14 rounded-xl bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20 hover:bg-green-500/15">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div className="text-start flex-1">
            <p className="font-semibold">{isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}</p>
            <p className="text-xs text-muted-foreground">{isArabic ? 'كيف نحمي خصوصيتك' : 'How we protect your privacy'}</p>
          </div>
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {isArabic ? 'آخر تحديث: 2026' : 'Last updated: 2026'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 mt-4 text-sm leading-7">
          {/* Introduction */}
          <div className="space-y-2">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {isArabic ? 'مقدمة' : 'Introduction'}
            </h4>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  نحن في <strong>اسمع راديو</strong> نلتزم بحماية خصوصيتك بشكل كامل.
                  تطبيقنا مصمم ليحترم خصوصية المستخدم ولا نجمع أي بيانات شخصية.
                </>
              ) : (
                <>
                  At <strong>Esmaa Radio</strong>, we are fully committed to protecting your privacy.
                  Our app is designed to respect user privacy and we do not collect any personal data.
                </>
              )}
            </p>
          </div>

          {/* Data Collection */}
          <div className="space-y-2">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Database className="h-4 w-4" />
              {isArabic ? 'البيانات التي نجمعها' : 'Data We Collect'}
            </h4>
            <div className="bg-green-500/10 rounded-lg p-4">
              <p className="font-medium text-green-600 mb-2">
                {isArabic ? '✓ لا نجمع أي بيانات شخصية' : '✓ We do not collect any personal data'}
              </p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• {isArabic ? 'لا نجمع الاسم أو البريد الإلكتروني' : 'We do not collect names or emails'}</li>
                <li>• {isArabic ? 'لا نجمع معلومات الموقع الجغرافي' : 'We do not collect location information'}</li>
                <li>• {isArabic ? 'لا نجمع بيانات الجهاز أو المعرفات' : 'We do not collect device data or identifiers'}</li>
                <li>• {isArabic ? 'لا نتتبع سلوك المستخدم' : 'We do not track user behavior'}</li>
              </ul>
            </div>
          </div>

          {/* Local Storage */}
          <div className="space-y-2">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              {isArabic ? 'التخزين المحلي' : 'Local Storage'}
            </h4>
            <p className="text-muted-foreground text-xs">
              {isArabic ? (
                <>
                  جميع بياناتك محفوظة <strong>محلياً على جهازك فقط</strong> وتشمل: المحطات المفضلة، سجل الاستماع، الإعدادات.
                </>
              ) : (
                <>
                  All your data is stored <strong>locally on your device only</strong> and includes: favorites, history, settings.
                </>
              )}
            </p>
          </div>

          {/* User Rights */}
          <div className="space-y-2">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {isArabic ? 'حقوقك' : 'Your Rights'}
            </h4>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• {isArabic ? 'الوصول إلى بياناتك المحلية' : 'Access your local data'}</li>
              <li>• {isArabic ? 'حذف جميع بياناتك من التطبيق' : 'Delete all your data from the app'}</li>
              <li>• {isArabic ? 'استخدام التطبيق دون تسجيل' : 'Use the app without registration'}</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2 pt-3 border-t">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {isArabic ? 'للاستفسارات' : 'For Inquiries'}
            </h4>
            <a href="mailto:ziad90216@gmail.com" className="text-[#2D8B8B] hover:underline text-xs">
              ziad90216@gmail.com
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SettingsPanelProps {
  onBack?: () => void;
}

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const {
    language,
    setLanguage,
    theme,
    setTheme,
    islamicMode,
    setIslamicMode,
    favorites,
    history,
    clearHistory: clearLocalHistory,
    clearAIMessages: clearLocalAIMessages,
    volume,
    setVolume,
    sleepTimerActive,
    sleepTimerEnd,
    sleepTimerMinutes,
    setSleepTimer,
    clearSleepTimer,
    isPlaying,
    setIsPlaying,
    currentStation,
    setSettingsOpen,
    displayName,
    setDisplayName,
    setNamePromptRequired,
    clearListeningStats,
    deviceId,
    userPreferences,
  } = useRadioStore();
  
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  
  const { 
    clearHistory, 
    clearAIChats, 
    clearAllData 
  } = useUserData();
  
  const { toast } = useToast();
  
  const [isClearing, setIsClearing] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0);
  const [customSleepMinutes, setCustomSleepMinutes] = useState(3);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(displayName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [confirmNameChange, setConfirmNameChange] = useState(false);
  
  const t = translations[language];
  const isArabic = language === 'ar';
  const isDark = theme === 'dark';
  const isMuted = volume === 0;
  
  function getDeviceId(): string {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', id);
    }
    return id;
  }
  
  useEffect(() => {
    setEditedName(displayName || '');
  }, [displayName]);
  
  // Handle back
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setSettingsOpen(false);
    }
  };
  
  // Volume controls
  const handleMuteToggle = () => {
    setVolume(isMuted ? 1.0 : 0); // Unmute to 100%
  };
  
  // Sleep timer controls
  const handleSleepTimer = (minutes: number) => {
    setSleepTimer(minutes);
  };
  
  const handleClearSleepTimer = () => {
    clearSleepTimer();
    if (currentStation) {
      setIsPlaying(false);
    }
  };
  
  // Update sleep timer remaining time - display only (SleepTimerManager handles the actual timer logic)
  useEffect(() => {
    const interval = setInterval(() => {
      if (sleepTimerActive && sleepTimerEnd) {
        const remaining = Math.max(0, sleepTimerEnd - Date.now());
        setSleepTimerRemaining(Math.ceil(remaining / 1000 / 60));
      }
    }, 10000); // Update display every 10 seconds instead of every second
    
    return () => clearInterval(interval);
  }, [sleepTimerActive, sleepTimerEnd]);
  
  const handleClearHistory = async () => {
    setIsClearing(true);
    clearLocalHistory();
    await clearHistory();
    setIsClearing(false);
  };
  
  const handleClearAIChats = async () => {
    setIsClearing(true);
    clearLocalAIMessages();
    await clearAIChats();
    setIsClearing(false);
  };
  
  // Handle name save
  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast({
        title: isArabic ? 'الرجاء إدخال اسم' : 'Please enter a name',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSavingName(true);
    
    try {
      const currentDeviceId = deviceId || getDeviceId();
      
      const response = await fetch('/api/notifications/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: currentDeviceId,
          displayName: editedName.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDisplayName(data.displayName);
        setNamePromptRequired(false);
        setIsEditingName(false);
        toast({
          title: isArabic ? 'تم الحفظ' : 'Saved',
          description: isArabic ? `تم حفظ اسمك: ${data.displayName}` : `Name saved: ${data.displayName}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving name:', error);
      toast({
        title: isArabic ? 'حدث خطأ' : 'Error',
        description: isArabic ? 'لم نتمكن من حفظ الاسم' : 'Could not save name',
        variant: 'destructive',
      });
    } finally {
      setIsSavingName(false);
    }
  };
  
  const handleClearAllData = async () => {
    setIsClearing(true);
    clearLocalHistory();
    clearLocalAIMessages();
    clearListeningStats();
    await clearAllData();
    setIsClearing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-l from-[#2D8B8B] to-[#237575] shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full bg-white/10 hover:bg-white/20 text-white"
            aria-label={isArabic ? 'رجوع' : 'Go back'}
          >
            {isArabic ? (
              <ChevronLeft className="h-6 w-6" />
            ) : (
              <ArrowRight className="h-6 w-6" />
            )}
          </Button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isArabic ? 'الإعدادات' : 'Settings'}
          </h1>
        </div>
      </header>
      
      {/* Scrollable Content */}
      <div className="h-[calc(100vh-72px)] overflow-y-auto">
        <div className="container mx-auto px-4 py-4 space-y-4 pb-24">

          {/* User Name Section */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#2D8B8B]/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#2D8B8B]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">
                    {isArabic ? 'اسمك' : 'Your Name'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'يظهر في إشعاراتك المخصصة' : 'Shown in your personalized notifications'}
                  </p>
                </div>
                {!isEditingName && (
                  <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="h-10 w-10" aria-label={isArabic ? 'تعديل الاسم' : 'Edit name'}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder={isArabic ? 'أدخل اسمك...' : 'Enter your name...'}
                    className="flex-1"
                    maxLength={50}
                    dir={isArabic ? 'rtl' : 'ltr'}
                  />
                  <Button variant="ghost" size="icon" onClick={() => { setEditedName(displayName || ''); setIsEditingName(false); }} className="h-10 w-10 text-red-500" aria-label={isArabic ? 'إلغاء' : 'Cancel'}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setConfirmNameChange(true)} disabled={isSavingName || !editedName.trim()} className="h-10 w-10 text-green-500" aria-label={isArabic ? 'حفظ الاسم' : 'Save name'}>
                    {isSavingName ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500" /> : <Check className="h-4 w-4" />}
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-muted/50 rounded-lg">
                  {displayName ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium truncate">{displayName}</span>
                      <Badge variant="secondary" className="text-xs">{isArabic ? 'محفوظ' : 'Saved'}</Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'لم يتم إدخال اسم بعد. اضغط على ✏️ لإضافته.' : 'No name set yet. Tap ✏️ to add one.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* تأكيد تغيير الاسم */}
          <AlertDialog open={confirmNameChange} onOpenChange={setConfirmNameChange}>
            <AlertDialogContent dir={isArabic ? 'rtl' : 'ltr'}>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isArabic ? 'تغيير الاسم؟' : 'Change Name?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isArabic 
                    ? `سيتم تغيير اسمك إلى "${editedName.trim()}". هل تريد المتابعة؟`
                    : `Your name will be changed to "${editedName.trim()}". Do you want to continue?`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => { setConfirmNameChange(false); handleSaveName(); }}>
                  {isArabic ? 'تأكيد' : 'Confirm'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Your Stats Section */}
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-[#2D8B8B] to-[#237575]">
            <div className="p-4">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5" />
                {isArabic ? 'إحصائياتك' : 'Your Stats'}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                  <Heart className="h-5 w-5 text-white/90 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{favorites.length}</p>
                  <p className="text-xs text-white/90">{isArabic ? 'مفضلة' : 'Favorites'}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                  <History className="h-5 w-5 text-white/90 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{history.length}</p>
                  <p className="text-xs text-white/90">{isArabic ? 'سجل' : 'History'}</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                  <Headphones className="h-5 w-5 text-white/90 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">
                    {userPreferences?.sessionsCount > 0
                      ? Math.round(userPreferences.averageSessionDuration / 60)
                      : 0}
                  </p>
                  <p className="text-xs text-white/90">{isArabic ? 'متوسط دقيقة' : 'Avg Min'}</p>
                </div>
              </div>
              {userPreferences?.sessionsCount > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                    <Clock className="h-5 w-5 text-white/90 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">
                      {(userPreferences?.totalListeningTime || 0) >= 3600
                        ? ((userPreferences?.totalListeningTime || 0) / 3600).toFixed(1)
                        : Math.floor((userPreferences?.totalListeningTime || 0) / 60)}
                    </p>
                    <p className="text-xs text-white/90">
                      {(userPreferences?.totalListeningTime || 0) >= 3600
                        ? (isArabic ? 'ساعة إجمالي' : 'Hours')
                        : (isArabic ? 'دقيقة إجمالي' : 'Minutes')}
                    </p>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                    <Headphones className="h-5 w-5 text-white/90 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{userPreferences?.sessionsCount || 0}</p>
                    <p className="text-xs text-white/90">{isArabic ? 'جلسة' : 'Sessions'}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Install App Section - Always visible */}
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-[#2D8B8B]/5 to-[#2D8B8B]/10">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2D8B8B] to-[#237575] flex items-center justify-center shadow-md">
                  {isInstalled ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : isInstallable ? (
                    <Download className="h-6 w-6 text-white" />
                  ) : (
                    <Smartphone className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {isArabic ? 'تثبيت التطبيق' : 'Install App'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isInstalled
                      ? (isArabic ? 'التطبيق مثبت على جهازك ✓' : 'App is installed on your device ✓')
                      : isInstallable
                        ? (isArabic ? 'أضف التطبيق للشاشة الرئيسية' : 'Add app to home screen')
                        : (isArabic ? 'التطبيق غير مثبت على جهازك' : 'App is not installed on your device')}
                  </p>
                </div>
                {isInstalled ? (
                  <Badge className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm">
                    {isArabic ? 'مثبت ✓' : 'Installed ✓'}
                  </Badge>
                ) : isInstallable ? (
                  <Button
                    variant="default"
                    size="lg"
                    onClick={installApp}
                    className="rounded-xl px-6 gap-2 bg-[#2D8B8B] hover:bg-[#237575]"
                  >
                    <Download className="h-5 w-5" />
                    {isArabic ? 'تثبيت' : 'Install'}
                  </Button>
                ) : (
                  <Badge variant="outline" className="px-4 py-2 rounded-xl text-sm border-orange-500 text-orange-600">
                    {isArabic ? 'غير مثبت' : 'Not Installed'}
                  </Badge>
                )}
              </div>
              {!isInstalled && !isInstallable && (
                <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
                  <p className="text-xs text-muted-foreground">
                    {isArabic 
                      ? '💡 نصيحة: يمكنك تثبيت التطبيق من قائمة المتصفح (⋮ أو ⋯) ثم اختر "إضافة إلى الشاشة الرئيسية"'
                      : '💡 Tip: You can install the app from browser menu (⋮ or ⋯) then select "Add to Home Screen"'}
                  </p>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => setShowInstallGuide(true)}
                    className="rounded-xl px-6 gap-2 bg-[#2D8B8B] hover:bg-[#237575] w-full mt-3"
                  >
                    <Download className="h-5 w-5" />
                    {isArabic ? 'خطوات التثبيت' : 'Installation Steps'}
                  </Button>
                  <InstallGuideSheet open={showInstallGuide} onOpenChange={setShowInstallGuide} />
                </div>
              )}
            </div>
          </Card>

          {/* Volume Mute/Unmute Section - Only mute toggle, volume control is in player */}
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
                  {isMuted ? (
                    <VolumeX className="h-6 w-6 text-white" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {isArabic ? 'الصوت' : 'Volume'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isMuted 
                      ? (isArabic ? 'مكتوم 🔇' : 'Muted 🔇') 
                      : (isArabic ? 'الصوت مفعّل 🔊' : 'Sound enabled 🔊')}
                  </p>
                </div>
                <Button
                  variant={isMuted ? "default" : "outline"}
                  size="lg"
                  onClick={handleMuteToggle}
                  className="rounded-xl px-6 gap-2"
                >
                  {isMuted ? (
                    <>
                      <Volume2 className="h-5 w-5" />
                      {isArabic ? 'إلغاء الكتم' : 'Unmute'}
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-5 w-5" />
                      {isArabic ? 'كتم الصوت' : 'Mute'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Sleep Timer Section */}
          <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-900/10">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
                  <Timer className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">
                    {isArabic ? 'مؤقت النوم' : 'Sleep Timer'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {sleepTimerActive 
                      ? (isArabic ? `متبقي ${sleepTimerRemaining} دقيقة` : `${sleepTimerRemaining} minutes remaining`)
                      : (isArabic ? 'إيقاف تلقائي بعد فترة' : 'Auto stop after a period')}
                  </p>
                </div>
                {sleepTimerActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSleepTimer}
                    className="text-red-500 border-red-500/30 hover:bg-red-500/10 rounded-xl"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </Button>
                )}
              </div>
              
              {sleepTimerActive ? (
                <div className="relative bg-white/50 dark:bg-black/20 rounded-xl p-4">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-l from-indigo-400 to-purple-500 transition-[width] duration-1000 ease-linear rounded-full"
                      style={{ width: `${sleepTimerMinutes > 0 ? Math.max(0, Math.min(100, (sleepTimerRemaining / sleepTimerMinutes) * 100)) : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-sm">
                    <span className="text-muted-foreground">{isArabic ? 'متبقي' : 'Remaining'}</span>
                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {sleepTimerRemaining} {isArabic ? 'دقيقة' : 'min'}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {sleepTimerOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant="outline"
                        size="lg"
                        onClick={() => handleSleepTimer(option.value)}
                        className="h-auto py-3 flex-col bg-white/50 dark:bg-black/20 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-xl"
                      >
                        <Clock className="h-5 w-5 mb-1 text-indigo-500" />
                        <span className="text-xs font-medium">
                          {isArabic ? option.labelAr : option.labelEn}
                        </span>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Custom Time Input */}
                  <div className="pt-3 border-t border-indigo-200/50 dark:border-indigo-800/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {isArabic ? 'أو حدد وقتاً مخصصاً' : 'Or set a custom time'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-white/50 dark:bg-black/20 border-indigo-200 dark:border-indigo-800"
                        onClick={() => setCustomSleepMinutes(prev => Math.max(1, prev - 1))}
                        aria-label={isArabic ? 'تقليل' : 'Decrease'}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1 bg-white/50 dark:bg-black/20 rounded-xl px-3 h-10 flex-1 justify-center border border-indigo-200/50 dark:border-indigo-800/50">
                        <input
                          type="number"
                          min="1"
                          max="480"
                          value={customSleepMinutes}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1 && val <= 480) setCustomSleepMinutes(val);
                          }}
                          className="w-12 text-center text-xl font-bold bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          dir="ltr"
                        />
                        <span className="text-xs text-muted-foreground">
                          {isArabic ? 'دقيقة' : 'min'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-xl bg-white/50 dark:bg-black/20 border-indigo-200 dark:border-indigo-800"
                        onClick={() => setCustomSleepMinutes(prev => Math.min(480, prev + 1))}
                        aria-label={isArabic ? 'زيادة' : 'Increase'}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSleepTimer(customSleepMinutes)}
                      className="w-full mt-2 h-10 gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    >
                      <Timer className="h-4 w-4" />
                      {isArabic ? 'تحديد' : 'Set'} ({customSleepMinutes} {isArabic ? 'دقيقة' : 'min'})
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Appearance Section */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="p-4 space-y-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center">
                    {isDark ? (
                      <Moon className="h-5 w-5 text-white" />
                    ) : (
                      <Sun className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {isArabic ? 'الوضع الداكن' : 'Dark mode'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isDark 
                        ? (isArabic ? 'مفعّل' : 'Enabled') 
                        : (isArabic ? 'معطّل' : 'Disabled')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDark}
                  onCheckedChange={() => setTheme(isDark ? 'light' : 'dark')}
                  className="data-[state=checked]:bg-[#2D8B8B]"
                />
              </div>
              
              <Separator />
              
              {/* Islamic Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {isArabic ? 'الوضع الإسلامي' : 'Islamic mode'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? 'إظهار المحتوى الإسلامي فقط' : 'Show Islamic content only'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={islamicMode}
                  onCheckedChange={setIslamicMode}
                  className="data-[state=checked]:bg-[#2D8B8B]"
                />
              </div>
              
              <Separator />
              
              {/* Language Selection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {isArabic ? 'اللغة' : 'Language'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? 'اختر لغة التطبيق' : 'Select app language'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-full px-4 h-8 transition-all',
                      isArabic && 'bg-[#2D8B8B] text-white hover:bg-[#2D8B8B]/90'
                    )}
                    onClick={() => setLanguage('ar')}
                  >
                    العربية
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'rounded-full px-4 h-8 transition-all',
                      !isArabic && 'bg-[#2D8B8B] text-white hover:bg-[#2D8B8B]/90'
                    )}
                    onClick={() => setLanguage('en')}
                  >
                    English
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Notifications Section */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    {isArabic ? 'الإشعارات' : 'Notifications'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'إدارة إشعارات التطبيق' : 'Manage app notifications'}
                  </p>
                </div>
              </div>
              
              <NotificationPermission showAsCard={false} />
            </div>
          </Card>
          
          {/* Data Storage Section */}
          <Card className="overflow-hidden border-0 shadow-md">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D8B8B] to-[#237575] flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    {isArabic ? 'تخزين البيانات' : 'Data Storage'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'إدارة بياناتك المحفوظة' : 'Manage your saved data'}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Clear Actions */}
              <div className="space-y-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                      <Trash2 className="h-5 w-5 text-orange-500" />
                      {isArabic ? 'مسح سجل الاستماع' : 'Clear Listening History'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isArabic ? 'مسح سجل الاستماع؟' : 'Clear Listening History?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isArabic 
                          ? 'سيتم حذف سجل الاستماع بالكامل. هذا الإجراء لا يمكن التراجع عنه.'
                          : 'This will delete your entire listening history. This action cannot be undone.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearHistory} disabled={isClearing}>
                        {isArabic ? 'مسح' : 'Clear'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      {isArabic ? 'مسح إحصائيات الاستماع' : 'Clear Listening Stats'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isArabic ? 'مسح إحصائيات الاستماع؟' : 'Clear Listening Stats?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isArabic
                          ? 'سيتم حذف جميع إحصائيات الاستماع. هذا الإجراء لا يمكن التراجع عنه.'
                          : 'This will delete all listening statistics. This action cannot be undone.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => clearListeningStats()} disabled={isClearing}>
                        {isArabic ? 'مسح' : 'Clear'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                      <Bot className="h-5 w-5 text-blue-500" />
                      {isArabic ? 'مسح محادثات الذكاء الاصطناعي' : 'Clear AI Chats'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isArabic ? 'مسح محادثات الذكاء الاصطناعي؟' : 'Clear AI Chats?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isArabic 
                          ? 'سيتم حذف جميع محادثاتك مع المساعد الذكي. هذا الإجراء لا يمكن التراجع عنه.'
                          : 'This will delete all your conversations with the AI assistant. This action cannot be undone.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAIChats} disabled={isClearing}>
                        {isArabic ? 'مسح' : 'Clear'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start gap-3 h-12 rounded-xl">
                      <Trash2 className="h-5 w-5" />
                      {isArabic ? 'مسح جميع البيانات' : 'Clear All Data'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {isArabic ? 'مسح جميع البيانات؟' : 'Clear All Data?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isArabic 
                          ? 'سيتم حذف جميع بياناتك. هذا الإجراء لا يمكن التراجع عنه.'
                          : 'This will delete all your data. This action cannot be undone.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleClearAllData} 
                        disabled={isClearing}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isArabic ? 'مسح الكل' : 'Clear All'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
          
          {/* Privacy Info */}
          <Card className="overflow-hidden border-0 shadow-md bg-muted/50">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {isArabic ? 'الخصوصية والأمان' : 'Privacy & Security'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isArabic 
                      ? 'جميع بياناتك محفوظة محلياً على جهازك. لا نرسل أي بيانات شخصية لخوادمنا.'
                      : 'All your data is stored locally on your device. We don\'t send any personal data to our servers.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          
          {/* App Version */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <Radio className="h-4 w-4 text-[#2D8B8B]" />
              <span className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'اسمع راديو - الإصدار 2.0.0' : 'Esmaa Radio - Version 2.0.0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
