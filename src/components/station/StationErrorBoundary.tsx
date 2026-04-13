'use client';

import { Component, type ReactNode } from 'react';
import { AlertCircle, Home, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallbackLanguage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class StationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[StationErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isArabic = this.props.fallbackLanguage === 'ar';
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-xl font-bold">
                {isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isArabic 
                  ? 'عذراً، حدث خطأ أثناء تحميل المحطة. حاول مرة أخرى.' 
                  : 'Sorry, an error occurred while loading the station. Please try again.'}
              </p>
              {this.state.error && (
                <p className="text-xs text-muted-foreground/60 font-mono bg-muted/50 rounded-lg p-3 text-start overflow-auto max-h-32">
                  {this.state.error.message}
                </p>
              )}
              <div className="flex gap-3">
                <Button onClick={this.handleRetry} variant="outline" className="flex-1 gap-2">
                  <RotateCw className="h-4 w-4" />
                  {isArabic ? 'إعادة المحاولة' : 'Retry'}
                </Button>
                <Button onClick={this.handleGoHome} className="flex-1 gap-2">
                  <Home className="h-4 w-4" />
                  {isArabic ? 'الرئيسية' : 'Home'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
