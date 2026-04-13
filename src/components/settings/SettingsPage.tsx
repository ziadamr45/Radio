'use client';

import { useState, useEffect } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { useUserData } from '@/components/providers/UserDataProvider';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useToast } from '@/hooks/use-toast';
import { InstallGuideSheet } from '@/components/settings/InstallGuideSheet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Bell,
  Moon,
  Sun,
  Info,
  Clock,
  Globe,
  Circle,
  Repeat,
  Trash2,
  Database,
  Download,
  RefreshCw,
  History,
  Heart,
  Shield,
  Volume2,
  VolumeX,
  Timer,
  Mail,
  ExternalLink,
  Smartphone,
  Radio,
  Headphones,
  Mic,
  Brain,
  Sparkles,
  Lock,
  Eye,
  Server,
  FileText,
  MessageCircle,
  BellOff,
  BellRing,
  AlertTriangle,
  User,
  Pencil,
  Check,
  X,
  TrendingUp,
  Minus,
  Plus,
  Bot,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
// enableNotifications removed - we call Notification.requestPermission() directly
// to ensure it runs in user gesture context

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
        <Card className="p-4 overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D8B8B]/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-[#2D8B8B]" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  {isArabic ? 'عن التطبيق' : 'About App'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'تعرف على التطبيق وتواصل معنا' : 'Learn about the app and contact us'}
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
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
            <div className="grid gap-3">
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
                <div key={i} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
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
            <div className="grid gap-3">
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
                <div>
                  <p className="font-medium text-sm">Facebook</p>
                  <p className="text-xs text-muted-foreground">@ziad7mr</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground mr-auto" />
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
                <div>
                  <p className="font-medium text-sm">Telegram</p>
                  <p className="text-xs text-muted-foreground">@ziadamr</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground mr-auto" />
              </a>
              
              <a
                href="mailto:ziad90216@gmail.com"
                className="flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg p-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email</p>
                  <p className="text-xs text-muted-foreground">ziad90216@gmail.com</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground mr-auto" />
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
        <Card className="p-4 overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'كيف نحمي خصوصيتك' : 'How we protect your privacy'}
                </p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
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
        
        <div className="space-y-6 mt-4 text-sm leading-7">
          {/* Introduction */}
          <div className="space-y-3">
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
          <div className="space-y-3">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Database className="h-4 w-4" />
              {isArabic ? 'البيانات التي نجمعها' : 'Data We Collect'}
            </h4>
            <div className="bg-green-500/10 rounded-lg p-4">
              <p className="font-medium text-green-600 mb-2">
                {isArabic ? '✓ لا نجمع أي بيانات شخصية' : '✓ We do not collect any personal data'}
              </p>
              <ul className="text-muted-foreground space-y-2">
                <li>• {isArabic ? 'لا نجمع الاسم أو البريد الإلكتروني' : 'We do not collect names or emails'}</li>
                <li>• {isArabic ? 'لا نجمع معلومات الموقع الجغرافي' : 'We do not collect location information'}</li>
                <li>• {isArabic ? 'لا نجمع بيانات الجهاز أو المعرفات' : 'We do not collect device data or identifiers'}</li>
                <li>• {isArabic ? 'لا نتتبع سلوك المستخدم' : 'We do not track user behavior'}</li>
                <li>• {isArabic ? 'لا نستخدم ملفات تعريف الارتباط للتتبع' : 'We do not use tracking cookies'}</li>
              </ul>
            </div>
          </div>

          {/* Local Storage */}
          <div className="space-y-3">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              {isArabic ? 'التخزين المحلي' : 'Local Storage'}
            </h4>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  جميع بياناتك محفوظة <strong>محلياً على جهازك فقط</strong> وتشمل:
                </>
              ) : (
                <>
                  All your data is stored <strong>locally on your device only</strong> and includes:
                </>
              )}
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• {isArabic ? 'المحطات المفضلة' : 'Favorite stations'}</li>
              <li>• {isArabic ? 'سجل الاستماع' : 'Listening history'}</li>
              <li>• {isArabic ? 'إعدادات التطبيق (اللغة، المظهر)' : 'App settings (language, theme)'}</li>
              <li>• {isArabic ? 'محادثات المساعد الذكي' : 'AI assistant conversations'}</li>
            </ul>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                {isArabic 
                  ? '💡 يمكنك مسح هذه البيانات في أي وقت من إعدادات التطبيق'
                  : '💡 You can clear this data anytime from app settings'}
              </p>
            </div>
          </div>

          {/* Third Party */}
          <div className="space-y-3">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              {isArabic ? 'خدمات الطرف الثالث' : 'Third-Party Services'}
            </h4>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  نستخدم خدمات خارجية لتشغيل المحطات الإذاعية فقط:
                </>
              ) : (
                <>
                  We use external services only for streaming radio stations:
                </>
              )}
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• <strong>Radio Browser API</strong> - {isArabic ? 'لجلب قائمة المحطات' : 'for fetching station list'}</li>
              <li>• <strong>محطات الراديو</strong> - {isArabic ? 'البث يأتي مباشرة من المحطات' : 'Streaming comes directly from stations'}</li>
            </ul>
          </div>

          {/* AI Features */}
          <div className="space-y-3">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              {isArabic ? 'المساعد الذكي' : 'AI Assistant'}
            </h4>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  المساعد الذكي يعمل محلياً ولا يرسل بياناتك الشخصية لأي خادم خارجي.
                  المحادثات تُحفظ على جهازك فقط ويمكنك حذفها في أي وقت.
                </>
              ) : (
                <>
                  The AI assistant runs locally and does not send your personal data to any external server.
                  Conversations are stored only on your device and you can delete them anytime.
                </>
              )}
            </p>
          </div>

          {/* Children Privacy */}
          <div className="space-y-3">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {isArabic ? 'خصوصية الأطفال' : "Children's Privacy"}
            </h4>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  تطبيقنا مناسب لجميع الأعمار ولا يحتوي على محتوى غير لائق.
                  لا نجمع أي بيانات من الأطفال أو البالغين.
                </>
              ) : (
                <>
                  Our app is suitable for all ages and contains no inappropriate content.
                  We do not collect any data from children or adults.
                </>
              )}
            </p>
          </div>

          {/* Data Security */}
          <div className="space-y-3">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {isArabic ? 'أمن البيانات' : 'Data Security'}
            </h4>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  بما أن جميع البيانات محفوظة محلياً على جهازك، فأنت تتحكم كلياً في أمانها.
                  لا توجد خوادم خارجية نخزن عليها بياناتك.
                </>
              ) : (
                <>
                  Since all data is stored locally on your device, you have full control over its security.
                  There are no external servers where we store your data.
                </>
              )}
            </p>
          </div>

          {/* User Rights */}
          <div className="space-y-3">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {isArabic ? 'حقوقك' : 'Your Rights'}
            </h4>
            <p className="text-muted-foreground">
              {isArabic ? 'لديك الحق الكامل في:' : 'You have full rights to:'}
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li>• {isArabic ? 'الوصول إلى بياناتك المحلية' : 'Access your local data'}</li>
              <li>• {isArabic ? 'حذف جميع بياناتك من التطبيق' : 'Delete all your data from the app'}</li>
              <li>• {isArabic ? 'استخدام التطبيق دون تسجيل' : 'Use the app without registration'}</li>
              <li>• {isArabic ? 'التحكم الكامل في إعدادات الخصوصية' : 'Full control over privacy settings'}</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-green-600 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {isArabic ? 'للاستفسارات' : 'For Inquiries'}
            </h4>
            <p className="text-muted-foreground">
              {isArabic 
                ? 'لأي استفسار حول الخصوصية، تواصل معنا عبر:'
                : 'For any privacy inquiries, contact us at:'}
            </p>
            <a href="mailto:ziad90216@gmail.com" className="text-[#2D8B8B] hover:underline">
              ziad90216@gmail.com
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Get or generate device ID
function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}

export function SettingsPage() {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const { toast } = useToast();
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
    clearListeningStats,
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
    deviceId,
    displayName,
    setDeviceId,
    setDisplayName,
    setNamePromptRequired,
    userPreferences,
  } = useRadioStore();
  
  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(displayName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [confirmNameChange, setConfirmNameChange] = useState(false);
  
  const { 
    clearHistory, 
    clearAIChats,
    clearAllData 
  } = useUserData();
  
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  
  const [isClearing, setIsClearing] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0);
  const [sleepTimerProgress, setSleepTimerProgress] = useState(0);
  const [customSleepMinutes, setCustomSleepMinutes] = useState(3);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);
  
  // Initialize device ID
  useEffect(() => {
    const id = getDeviceId();
    if (!deviceId) {
      setDeviceId(id);
    }
  }, [deviceId, setDeviceId]);
  
  // Sync editedName with displayName
  useEffect(() => {
    setEditedName(displayName || '');
  }, [displayName]);
  
  const isArabic = language === 'ar';
  const isDark = theme === 'dark';
  const isMuted = volume === 0;
  const notifGranted = notifPermission === 'granted';
  const notifDenied = notifPermission === 'denied';
  
  const handleLanguageToggle = () => {
    setLanguage(isArabic ? 'en' : 'ar');
  };
  
  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
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
  
  const handleClearAllData = async () => {
    setIsClearing(true);
    clearLocalHistory();
    clearLocalAIMessages();
    await clearAllData();
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
  
  const handleCancelEdit = () => {
    setEditedName(displayName || '');
    setIsEditingName(false);
  };
  
  // Volume controls
  const handleMuteToggle = () => {
    setVolume(isMuted ? 0.7 : 0);
  };
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
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
  
  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);
  
  // Handle notification toggle from settings
  // CRITICAL: requestPermission MUST be the FIRST await in the click handler
  // to ensure Chrome shows the permission dialog instead of auto-denying
  const handleNotifToggle = async () => {
    if (notifGranted) {
      // Can't revoke from JS - show instructions
      return;
    }
    if (notifDenied) {
      // Can't request again - redirect to browser settings
      return;
    }

    try {
      // Step 1: Request permission FIRST - must be in direct user gesture context
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);

      if (permission === 'granted') {
        setNotifLoading(true);

        // Step 2: Save to localStorage
        localStorage.setItem('notification-enabled', 'true');
        localStorage.removeItem('notification-prompt-dismissed-at');

        // Step 3: Register push subscription
        try {
          const { registerPushSubscription } = await import('@/lib/notification-helpers');
          await registerPushSubscription();
        } catch (pushError) {
          console.error('Push registration failed:', pushError);
        }

        // Step 4: Show welcome notification
        try {
          const { showWelcomeNotification } = await import('@/lib/notification-helpers');
          await showWelcomeNotification(isArabic);
        } catch (notifError) {
          console.error('Welcome notification failed:', notifError);
        }

        setNotifLoading(false);
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setNotifLoading(false);
    }
  };
  
  // Update sleep timer remaining time and progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (sleepTimerActive && sleepTimerEnd && sleepTimerMinutes > 0) {
        const remaining = Math.max(0, sleepTimerEnd - Date.now());
        const remainingMinutes = Math.ceil(remaining / 1000 / 60);
        const progress = Math.max(0, Math.min(100, (remaining / (sleepTimerMinutes * 60 * 1000)) * 100));
        
        setSleepTimerRemaining(remainingMinutes);
        setSleepTimerProgress(progress);
        
        if (remaining <= 0) {
          clearSleepTimer();
          setSleepTimerProgress(0);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sleepTimerActive, sleepTimerEnd, sleepTimerMinutes, clearSleepTimer]);

  // Initialize progress when timer starts
  useEffect(() => {
    if (sleepTimerActive && sleepTimerEnd && sleepTimerMinutes > 0) {
      const remaining = Math.max(0, sleepTimerEnd - Date.now());
      const progress = Math.max(0, Math.min(100, (remaining / (sleepTimerMinutes * 60 * 1000)) * 100));
      setSleepTimerProgress(progress);
      setSleepTimerRemaining(Math.ceil(remaining / 1000 / 60));
    } else {
      setSleepTimerProgress(0);
      setSleepTimerRemaining(0);
    }
  }, [sleepTimerActive, sleepTimerEnd, sleepTimerMinutes]);
  
  return (
    <div className="container mx-auto px-4 py-6 pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isArabic ? 'الإعدادات' : 'Settings'}
        </h1>
      </div>
      
      <div className="space-y-4">
        {/* User Name Section */}
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D8B8B]/10 flex items-center justify-center">
              <User className="h-5 w-5 text-[#2D8B8B]" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                {isArabic ? 'اسمك' : 'Your Name'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'يظهر في إشعاراتك المخصصة' : 'Shown in your personalized notifications'}
              </p>
            </div>
            {!isEditingName && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingName(true)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {isEditingName ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder={isArabic ? 'أدخل اسمك...' : 'Enter your name...'}
                  className="flex-1"
                  maxLength={50}
                  dir={isArabic ? 'rtl' : 'ltr'}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelEdit}
                  className="h-10 w-10 text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmNameChange(true)}
                  disabled={isSavingName || !editedName.trim()}
                  className="h-10 w-10 text-green-500"
                >
                  {isSavingName ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted/50 rounded-lg">
              {displayName ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{displayName}</span>
                  <Badge variant="secondary" className="text-xs">
                    {isArabic ? 'محفوظ' : 'Saved'}
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'لم يتم إدخال اسم بعد. اضغط على ✏️ لإضافته.' : 'No name set yet. Tap ✏️ to add one.'}
                </p>
              )}
            </div>
          )}
        </Card>

        {/* تأكيد تغيير الاسم */}
        <AlertDialog open={confirmNameChange} onOpenChange={setConfirmNameChange}>
          <AlertDialogContent dir="rtl">
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
        <Card className="p-4 overflow-hidden bg-gradient-to-br from-[#2D8B8B] to-[#237575]">
          <h3 className="font-bold text-white flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5" />
            {isArabic ? 'إحصائياتك' : 'Your Stats'}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <Heart className="h-5 w-5 text-white/80 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{favorites.length}</p>
              <p className="text-xs text-white/70">{isArabic ? 'مفضلة' : 'Favorites'}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <History className="h-5 w-5 text-white/80 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{history.length}</p>
              <p className="text-xs text-white/70">{isArabic ? 'سجل' : 'History'}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <Headphones className="h-5 w-5 text-white/80 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">
                {userPreferences.sessionsCount > 0
                  ? Math.round(userPreferences.averageSessionDuration / 60)
                  : 0}
              </p>
              <p className="text-xs text-white/70">{isArabic ? 'متوسط دقيقة' : 'Avg Min'}</p>
            </div>
          </div>
          {userPreferences.sessionsCount > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <Clock className="h-5 w-5 text-white/80 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">
                  {userPreferences.totalListeningTime >= 3600
                    ? (userPreferences.totalListeningTime / 3600).toFixed(1)
                    : Math.floor(userPreferences.totalListeningTime / 60)}
                </p>
                <p className="text-xs text-white/70">
                  {userPreferences.totalListeningTime >= 3600
                    ? (isArabic ? 'ساعة إجمالي' : 'Hours')
                    : (isArabic ? 'دقيقة إجمالي' : 'Minutes')}
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
                <Headphones className="h-5 w-5 text-white/80 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{userPreferences.sessionsCount}</p>
                <p className="text-xs text-white/70">{isArabic ? 'جلسة' : 'Sessions'}</p>
              </div>
            </div>
          )}
        </Card>
        
        {/* Data Storage Section */}
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#2D8B8B]/10 flex items-center justify-center">
              <Database className="h-5 w-5 text-[#2D8B8B]" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {isArabic ? 'تخزين البيانات' : 'Data Storage'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isArabic ? 'إدارة بياناتك المحفوظة' : 'Manage your saved data'}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Separator />
            
            {/* Clear Actions */}
            <div className="flex flex-col gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="justify-start gap-2 h-10">
                    <Trash2 className="h-4 w-4 text-orange-500" />
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
                  <Button variant="outline" className="justify-start gap-2 h-10">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
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
                        ? 'سيتم حذف جميع إحصائيات الاستماع والجلسات. هذا الإجراء لا يمكن التراجع عنه.'
                        : 'This will delete all listening statistics and sessions. This action cannot be undone.'}
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
                  <Button variant="outline" className="justify-start gap-2 h-10">
                    <Bot className="h-4 w-4 text-blue-500" />
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
                  <Button variant="destructive" className="justify-start gap-2 h-10">
                    <Trash2 className="h-4 w-4" />
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
                        ? 'سيتم حذف جميع بياناتك بما في ذلك المفضلة، السجل، والإعدادات. هذا الإجراء لا يمكن التراجع عنه.'
                        : 'This will delete all your data including favorites, history, and settings. This action cannot be undone.'}
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
        
        {/* Volume Control Section */}
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-orange-500" />
              ) : (
                <Volume2 className="h-5 w-5 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                {isArabic ? 'الصوت' : 'Volume'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isMuted 
                  ? (isArabic ? 'مكتوم' : 'Muted') 
                  : `${Math.round(volume * 100)}%`}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleMuteToggle}
              className={cn("h-10 w-10", isMuted && "bg-red-500/10 border-red-500/30")}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-red-500" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <VolumeX className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {isMuted && (
            <div className="mt-3 p-3 bg-red-500/10 rounded-lg text-sm text-red-600 dark:text-red-400">
              {isArabic 
                ? '🔇 الصوت مكتوم. اضغط على زر الصوت لإلغاء الكتم.'
                : '🔇 Sound is muted. Press the volume button to unmute.'}
            </div>
          )}
        </Card>
        
        {/* Sleep Timer Section */}
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Timer className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                {isArabic ? 'مؤقت النوم' : 'Sleep Timer'}
              </h3>
              <p className="text-xs text-muted-foreground">
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
                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
            )}
          </div>
          
          {sleepTimerActive ? (
            <div className="relative">
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${sleepTimerProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{isArabic ? 'متبقي' : 'Remaining'}</span>
                <span className="font-medium text-indigo-500">
                  {sleepTimerRemaining} {isArabic ? 'دقيقة' : 'min'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {sleepTimerOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSleepTimer(option.value)}
                    className="h-auto py-2 flex-col"
                  >
                    <Clock className="h-4 w-4 mb-1" />
                    <span className="text-xs">
                      {isArabic ? option.labelAr : option.labelEn}
                    </span>
                  </Button>
                ))}
              </div>
              
              {/* Custom Time Input - like the main page */}
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {isArabic ? 'وقت مخصص' : 'Custom Time'}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCustomSleepMinutes(prev => Math.max(1, prev - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-3 h-9 flex-1 justify-center">
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={customSleepMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= 480) setCustomSleepMinutes(val);
                      }}
                      className="w-12 text-center text-lg font-bold bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      dir="ltr"
                    />
                    <span className="text-xs text-muted-foreground">
                      {isArabic ? 'دقيقة' : 'min'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setCustomSleepMinutes(prev => Math.min(480, prev + 1))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSleepTimer(customSleepMinutes)}
                  className="w-full mt-2 gap-2"
                >
                  <Timer className="h-3.5 w-3.5" />
                  {isArabic ? 'تحديد' : 'Set'} ({customSleepMinutes} {isArabic ? 'دقيقة' : 'min'})
                </Button>
              </div>
            </div>
          )}
        </Card>
        
        {/* Notifications Section */}
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              notifGranted ? "bg-green-500/10" : notifDenied ? "bg-red-500/10" : "bg-orange-500/10"
            )}>
              {notifGranted ? (
                <Bell className="h-5 w-5 text-green-500" />
              ) : notifDenied ? (
                <BellOff className="h-5 w-5 text-red-500" />
              ) : (
                <BellRing className="h-5 w-5 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                {isArabic ? 'الإشعارات' : 'Notifications'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {notifGranted
                  ? (isArabic ? 'مفعّلة' : 'Enabled')
                  : notifDenied
                    ? (isArabic ? 'محظورة من المتصفح' : 'Blocked by browser')
                    : (isArabic ? 'معطّلة' : 'Disabled')}
              </p>
            </div>
            {!notifDenied && (
              <div className={cn(
                "w-3 h-3 rounded-full",
                notifGranted ? "bg-green-500" : "bg-muted-foreground/30"
              )} />
            )}
          </div>

          {notifGranted ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Bell className="h-4 w-4" />
                  <p className="font-medium text-sm">
                    {isArabic ? '✅ الإشعارات مفعّلة' : '✅ Notifications enabled'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArabic
                    ? 'هتستلم إشعارات ذكية حسب وقتك واهتماماتك'
                    : 'You will receive smart notifications based on your preferences'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {isArabic
                  ? '💡 لتعطيل الإشعارات، اذهب لإعدادات المتصفح > إعدادات الموقع > إشعارات'
                  : '💡 To disable notifications, go to browser settings > site settings > notifications'}
              </p>
            </div>
          ) : notifDenied ? (
            <div className="space-y-3">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="font-medium text-sm">
                    {isArabic ? '⚠️ الإشعارات محظورة' : '⚠️ Notifications blocked'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArabic
                    ? 'الإشعارات محظورة من المتصفح. اتبع الخطوات التالية لتفعيلها:'
                    : 'Notifications are blocked by the browser. Follow these steps to enable:'}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium">
                  {isArabic ? 'خطوات التفعيل:' : 'How to enable:'}
                </p>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>{isArabic ? 'اضغط على 🔒 بجانب عنوان الموقع في شريط العنوان' : 'Click 🔒 next to the URL in the address bar'}</li>
                  <li>{isArabic ? 'ابحث عن "الإشعارات" أو "Notifications"' : 'Find "Notifications" or "Site settings"'}</li>
                  <li>{isArabic ? 'غيّرها من "حظر" إلى "سماح"' : 'Change from "Block" to "Allow"'}</li>
                  <li>{isArabic ? 'أعد تحميل الصفحة' : 'Reload the page'}</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {isArabic
                    ? 'فعّل الإشعارات عشان تمنعش رسائل ذكية عن القرآن والبرامج الإسلامية'
                    : 'Enable notifications to receive smart reminders about Quran and Islamic programs'}
                </p>
              </div>
              <Button
                onClick={handleNotifToggle}
                disabled={notifLoading}
                className={cn(
                  "w-full gap-2",
                  "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                )}
              >
                {notifLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {isArabic ? 'جاري التفعيل...' : 'Enabling...'}
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    {isArabic ? 'فعّل الإشعارات' : 'Enable Notifications'}
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
        
        {/* Night Mode Section */}
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                {isDark ? (
                  <Moon className="h-5 w-5 text-purple-500" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-foreground">
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
              onCheckedChange={handleThemeToggle}
              className="data-[state=checked]:bg-[#2D8B8B]"
            />
          </div>
        </Card>
        
        {/* Islamic Mode */}
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
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
        </Card>
        
        {/* Language Selection */}
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
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
        </Card>
        
        {/* PWA Install Section */}
        {!isInstalled && !isInstallable && (
          <Card className="p-4 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2D8B8B]/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-[#2D8B8B]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">
                  {isArabic ? 'تثبيت التطبيق' : 'Install App'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isArabic ? 'أضف التطبيق للشاشة الرئيسية' : 'Add to home screen'}
                </p>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? 'ثبّت التطبيق على جهازك للوصول السريع والعمل بدون إنترنت'
                  : 'Install the app for quick access and offline use'}
              </p>
            </div>
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
          </Card>
        )}

        {(isInstallable || isInstalled) && (
          <Card className="p-4 overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2D8B8B]/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-[#2D8B8B]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">
                  {isArabic ? 'تثبيت التطبيق' : 'Install App'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isInstalled 
                    ? (isArabic ? 'مثبت على جهازك' : 'Installed on your device')
                    : (isArabic ? 'أضف التطبيق للشاشة الرئيسية' : 'Add to home screen')}
                </p>
              </div>
            </div>
            
            {isInstalled ? (
              <div className="p-3 bg-green-500/10 rounded-lg">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Smartphone className="h-4 w-4" />
                  <p className="font-medium text-sm">
                    {isArabic ? '✅ التطبيق مثبت' : '✅ App installed'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isArabic
                    ? 'التطبيق مثبت على جهازك ويعمل بدون إنترنت'
                    : 'The app is installed and works offline'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {isArabic 
                      ? 'ثبّت التطبيق على جهازك للوصول السريع والعمل بدون إنترنت'
                      : 'Install the app for quick access and offline use'}
                  </p>
                </div>
                <Button
                  onClick={installApp}
                  className="w-full gap-2 bg-[#2D8B8B] hover:bg-[#237575]"
                >
                  <Download className="h-4 w-4" />
                  {isArabic ? 'تثبيت التطبيق' : 'Install App'}
                </Button>
              </div>
            )}
          </Card>
        )}
        
        {/* About App & Privacy Policy */}
        <AboutAppDialog isArabic={isArabic} />
        <PrivacyPolicyDialog isArabic={isArabic} />
        
        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            {isArabic ? 'الإصدار 2.0.0' : 'Version 2.0.0'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isArabic ? 'اسمع راديو' : 'Esmaa Radio'}
          </p>
        </div>
      </div>
    </div>
  );
}
