'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

export function NamePrompt() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    deviceId,
    displayName,
    namePromptShown,
    namePromptRequired,
    language,
    setDeviceId,
    setDisplayName,
    setNamePromptShown,
    setNamePromptRequired,
  } = useRadioStore();
  const isArabic = language === 'ar';

  // Initialize device ID
  useEffect(() => {
    const id = getDeviceId();
    if (!deviceId) {
      setDeviceId(id);
    }
  }, [deviceId, setDeviceId]);

  // Check if we need to show the prompt
  const checkAndShowPrompt = useCallback(async () => {
    // If user already has a name, don't show
    if (displayName) {
      setNamePromptRequired(false);
      return;
    }

    // If prompt was shown recently and user is not required to enter name yet
    if (namePromptShown && !namePromptRequired) {
      // Check if it's time to show again (every 5 minutes)
      const lastShown = localStorage.getItem('namePromptLastShown');
      if (lastShown) {
        const timeSinceLastShown = Date.now() - parseInt(lastShown);
        const fiveMinutes = 5 * 60 * 1000;
        if (timeSinceLastShown < fiveMinutes) {
          return;
        }
      }
    }

    // Check server for existing name
    try {
      const currentDeviceId = deviceId || getDeviceId();
      const response = await fetch(`/api/notifications/update-name?deviceId=${currentDeviceId}`);
      const data = await response.json();
      
      if (data.displayName) {
        setDisplayName(data.displayName);
        setNamePromptRequired(false);
        return;
      }
    } catch (error) {
      console.error('Error checking display name:', error);
    }

    // Show the prompt
    setIsOpen(true);
  }, [deviceId, displayName, namePromptShown, namePromptRequired, setDisplayName, setNamePromptRequired]);

  // Show prompt on mount and periodically
  useEffect(() => {
    // Initial check after a short delay
    const initialTimeout = setTimeout(() => {
      checkAndShowPrompt();
    }, 3000);

    // Check every 5 minutes
    const interval = setInterval(() => {
      if (!displayName) {
        checkAndShowPrompt();
      }
    }, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [checkAndShowPrompt, displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: language === 'ar' ? 'الرجاء إدخال اسمك' : 'Please enter your name',
        description: language === 'ar' ? 'يجب إدخال اسم للإستمرار' : 'Name is required to continue',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const currentDeviceId = deviceId || getDeviceId();
      
      // Save to server
      const response = await fetch('/api/notifications/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: currentDeviceId,
          displayName: name.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDisplayName(data.displayName);
        setNamePromptShown(true);
        setNamePromptRequired(false);
        setIsOpen(false);
        
        toast({
          title: language === 'ar' ? 'تم الحفظ' : 'Saved',
          description: language === 'ar' ? `تم حفظ اسمك: ${data.displayName}` : `Your name has been saved: ${data.displayName}`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving name:', error);
      toast({
        title: language === 'ar' ? 'حدث خطأ' : 'Error',
        description: language === 'ar' ? 'لم نتمكن من حفظ الاسم، حاول مرة أخرى' : 'Could not save your name, please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Mark as shown but keep required true
    localStorage.setItem('namePromptLastShown', Date.now().toString());
    setNamePromptShown(true);
    setIsOpen(false);
    
    // Will show again in 5 minutes
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-start">
            {language === 'ar' ? '👋 مرحباً بك في راديو اسمع!' : '👋 Welcome to Asmae Radio!'}
          </DialogTitle>
          <DialogDescription className="text-start text-base pt-2">
            {language === 'ar' ? 'أدخل اسمك لتتمكن من استقبال الإشعارات المخصصة' : 'Enter your name to receive personalized notifications'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-start block">
              {language === 'ar' ? 'اسمك أو كنيتك' : 'Your name or nickname'}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: أحمد، أبو محمد، أم علي...' : 'e.g. Ahmed, Abu Mohamed...'}
              className="text-start"
              maxLength={50}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-start">
              {language === 'ar' ? 'سيظهر اسمك في إعداداتك ويمكنك تغييره لاحقاً' : 'Your name will appear in settings and can be changed later'}
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ الاسم' : 'Save Name')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="w-full sm:w-auto"
            >
              {isArabic ? 'لاحقاً' : 'Later'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
