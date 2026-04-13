import { Loader2 } from 'lucide-react';

export default function StationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background" dir="rtl">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">جاري تحميل المحطة...</p>
      </div>
    </div>
  );
}
