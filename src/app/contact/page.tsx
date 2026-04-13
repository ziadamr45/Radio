'use client';

import { useRadioStore } from '@/stores/radio-store';
import { Mail, Globe, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const { language } = useRadioStore();
  const isArabic = language === 'ar';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-primary">
          {isArabic ? 'اتصل بنا' : 'Contact Us'}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-lg mb-8">
            {isArabic
              ? 'نحن سعداء بتواصلك معنا! يمكنك الوصول إلينا من خلال الطرق التالية:'
              : 'We are happy to hear from you! You can reach us through the following ways:'}
          </p>

          <div className="grid gap-4">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/ziad7mr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Facebook</h3>
                <p className="text-sm text-muted-foreground">@ziad7mr</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/ziadamr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Telegram</h3>
                <p className="text-sm text-muted-foreground">@ziadamr</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </a>

            {/* Email */}
            <a
              href="mailto:ziad90216@gmail.com"
              className="flex items-center gap-4 p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{isArabic ? 'البريد الإلكتروني' : 'Email'}</h3>
                <p className="text-sm text-muted-foreground">ziad90216@gmail.com</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </a>

            {/* Website */}
            <a
              href="https://ziadamrme.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{isArabic ? 'الموقع الإلكتروني' : 'Website'}</h3>
                <p className="text-sm text-muted-foreground">ziadamrme.vercel.app</p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </a>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              {isArabic ? 'للاستفسارات' : 'For Inquiries'}
            </h2>
            <div className="bg-muted/30 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                {isArabic
                  ? 'للاستفسارات والاقتراحات، يرجى التواصل معنا عبر أي من الطرق أعلاه. نرد على جميع الرسائل في أقرب وقت ممكن.'
                  : 'For inquiries and suggestions, please contact us through any of the methods above. We respond to all messages as soon as possible.'}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
