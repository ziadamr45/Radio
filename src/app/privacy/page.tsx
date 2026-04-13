'use client';

import { useRadioStore } from '@/stores/radio-store';

export default function PrivacyPolicyPage() {
  const { language } = useRadioStore();
  const isArabic = language === 'ar';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-primary">
          {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-4">
            {isArabic 
              ? 'آخر تحديث: أبريل 2026'
              : 'Last updated: April 2026'}
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '1. مقدمة' : '1. Introduction'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'مرحباً بك في تطبيق "اسمع راديو". نحن نحتترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك.'
                : 'Welcome to "Esmaa Radio". We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '2. المعلومات التي نجمعها' : '2. Information We Collect'}
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                {isArabic
                  ? 'بيانات الاستخدام: كيفية تفاعلك مع التطبيق'
                  : 'Usage data: How you interact with the app'}
              </li>
              <li>
                {isArabic
                  ? 'التفضيلات: المحطات المفضلة والإعدادات'
                  : 'Preferences: Favorite stations and settings'}
              </li>
              <li>
                {isArabic
                  ? 'بيانات الجهاز: نوع الجهاز ونظام التشغيل'
                  : 'Device data: Device type and operating system'}
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '3. ملفات تعريف الارتباط (Cookies)' : '3. Cookies'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وعرض الإعلانات المناسبة. يمكنك التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.'
                : 'We use cookies to improve your experience and display relevant ads. You can control cookie settings through your browser.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '4. الإعلانات' : '4. Advertisements'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'نستخدم Google AdSense لعرض الإعلانات. قد تستخدم Google بيانات الاستخدام لعرض إعلانات مخصصة. يمكنك معرفة المزيد من سياسة الخصوصية الخاصة بـ Google.'
                : 'We use Google AdSense to display ads. Google may use usage data to show personalized ads. Learn more from Google\'s privacy policy.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '5. حماية البيانات' : '5. Data Protection'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'نتخذ جميع الإجراءات الأمنية اللازمة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الكشف.'
                : 'We take all necessary security measures to protect your data from unauthorized access, modification, or disclosure.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '6. حقوقك' : '6. Your Rights'}
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                {isArabic
                  ? 'الحق في الوصول إلى بياناتك'
                  : 'Right to access your data'}
              </li>
              <li>
                {isArabic
                  ? 'الحق في تصحيح أو حذف بياناتك'
                  : 'Right to correct or delete your data'}
              </li>
              <li>
                {isArabic
                  ? 'الحق في الاعتراض على معالجة البيانات'
                  : 'Right to object to data processing'}
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '7. اتصل بنا' : '7. Contact Us'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'لأي استفسارات حول سياسة الخصوصية، يمكنك التواصل معنا عبر صفحة الاتصال.'
                : 'For any questions about our privacy policy, you can contact us through our contact page.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
