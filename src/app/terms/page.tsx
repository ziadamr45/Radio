'use client';

import { useRadioStore } from '@/stores/radio-store';

export default function TermsPage() {
  const { language } = useRadioStore();
  const isArabic = language === 'ar';

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-primary">
          {isArabic ? 'شروط الاستخدام' : 'Terms of Service'}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-4">
            {isArabic 
              ? 'آخر تحديث: أبريل 2026'
              : 'Last updated: April 2026'}
          </p>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '1. قبول الشروط' : '1. Acceptance of Terms'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'باستخدامك لتطبيق "اسمع راديو"، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق على أي جزء منها، يرجى التوقف عن استخدام التطبيق.'
                : 'By using "Esmaa Radio", you agree to abide by these terms. If you do not agree with any part of them, please stop using the application.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '2. استخدام الخدمة' : '2. Use of Service'}
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                {isArabic
                  ? 'يجوز لك استخدام التطبيق للأغراض الشخصية فقط'
                  : 'You may use the application for personal purposes only'}
              </li>
              <li>
                {isArabic
                  ? 'يُحظر إعادة بيع أو إعادة توزيع المحتوى'
                  : 'Reselling or redistributing content is prohibited'}
              </li>
              <li>
                {isArabic
                  ? 'يُحظر استخدام التطبيق لأغراض غير قانونية'
                  : 'Using the application for illegal purposes is prohibited'}
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '3. الملكية الفكرية' : '3. Intellectual Property'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'جميع المحتويات في التطبيق (بما في ذلك التصميم والشعارات والنصوص) محمية بموجب قوانين الملكية الفكرية. المحطات الإذاعية والقرآن الكريم ملك لأصحابها.'
                : 'All content in the application (including design, logos, and texts) is protected by intellectual property laws. Radio stations and the Holy Quran belong to their respective owners.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '4. الإعلانات' : '4. Advertisements'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'يعرض التطبيق إعلانات من Google AdSense وشبكات إعلانية أخرى لتغطية تكاليف التشغيل. أنت توافق على عرض هذه الإعلانات أثناء استخدام التطبيق.'
                : 'The application displays ads from Google AdSense and other ad networks to cover operating costs. You agree to view these ads while using the application.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '5. إخلاء المسؤولية' : '5. Disclaimer'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'التطبيق يُقدم "كما هو" دون أي ضمانات. نحن لا نضمن استمرارية الخدمة أو خلوها من الأخطاء. نحن غير مسؤولين عن أي أضرار ناتجة عن استخدام التطبيق.'
                : 'The application is provided "as is" without any warranties. We do not guarantee service continuity or error-free operation. We are not responsible for any damages resulting from using the application.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '6. التعديلات' : '6. Modifications'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. س يتم إخطارك بأي تغييرات جوهرية عبر التطبيق.'
                : 'We reserve the right to modify these terms at any time. You will be notified of any material changes through the application.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '7. القانون الحاكم' : '7. Governing Law'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'تخضع هذه الشروط وتفسر وفقاً لقوانين جمهورية مصر العربية.'
                : 'These terms are governed by and construed in accordance with the laws of the Arab Republic of Egypt.'}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">
              {isArabic ? '8. اتصل بنا' : '8. Contact Us'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'لأي استفسارات حول شروط الاستخدام، يمكنك التواصل معنا عبر صفحة الاتصال.'
                : 'For any questions about our terms of service, you can contact us through our contact page.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
