'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  Calendar,
  Building2,
  MessageCircle,
  Sparkles,
  Loader2,
  Trash2,
  Globe,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPageProps {
  className?: string;
}

export function ChatPage({ className }: ChatPageProps) {
  const { language } = useRadioStore();
  const isArabic = language === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial bot greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: isArabic
          ? 'مرحباً! أنا مساعدك لتعلم اللغة العربية. كيف أستطيع مساعدتك اليوم؟ هل تريد أن نتعلم معاً مفردات جديدة، أو نتحدث عن الثقافة العربية؟'
          : 'Hello! I am your Arabic language learning assistant. How can I help you today? Would you like to learn new vocabulary together, or discuss Arabic culture?',
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isArabic, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message to API
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          language,
          context: 'arabic_learning',
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Error handling
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: isArabic
            ? 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
            : 'Sorry, a connection error occurred. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isArabic
          ? 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
          : 'Sorry, an unexpected error occurred. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, language, isArabic]);

  // Clear chat and start new conversation
  const handleNewConversation = useCallback(() => {
    const greeting: ChatMessage = {
      id: 'greeting',
      role: 'assistant',
      content: isArabic
        ? 'مرحباً! أنا مساعدك لتعلم اللغة العربية. كيف أستطيع مساعدتك اليوم؟'
        : 'Hello! I am your Arabic language learning assistant. How can I help you today?',
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [isArabic]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Quick suggestions
  const quickSuggestions = isArabic
    ? [
        'كيف أتعلم الحروف العربية؟',
        'علمني مفردات يومية',
        'ما هي أفضل طريقة لممارسة العربية؟',
        'حدثني عن الثقافة العربية',
      ]
    : [
        'How do I learn Arabic letters?',
        'Teach me daily vocabulary',
        'What is the best way to practice Arabic?',
        'Tell me about Arabic culture',
      ];

  return (
    <div className={cn('flex flex-col h-screen bg-background', className)} dir="rtl">
      {/* Chatbot Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40">
                <Bot className="h-7 w-7 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {isArabic ? 'مساعدك للغة العربية' : 'Your Arabic Assistant'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'للمساعدة في تعلم اللغة العربية' : 'For help learning Arabic'}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNewConversation}
              title={isArabic ? 'محادثة جديدة' : 'New conversation'}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="container mx-auto py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 me-2 mt-1 shrink-0">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-bl-sm'
                    : 'bg-muted rounded-br-sm'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p
                  className={cn(
                    'text-xs mt-2',
                    message.role === 'user'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  )}
                >
                  {message.timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 ms-2 mt-1 shrink-0">
                  <AvatarFallback className="bg-muted">
                    <MessageCircle className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-2xl rounded-br-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {isArabic ? 'جاري التفكير...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="container mx-auto pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => sendMessage(isArabic ? 'أريد أمثلة يومية للتعلم' : 'I want daily examples for learning')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {isArabic ? 'أمثلة يومية' : 'Daily Examples'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'تعلم مفردات جديدة كل يوم' : 'Learn new vocabulary daily'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => sendMessage(isArabic ? 'حدثني عن الثقافة العربية' : 'Tell me about Arabic culture')}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {isArabic ? 'الثقافة العربية' : 'Arabic Culture'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'فهم التراث والثقافة' : 'Understand heritage and culture'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Suggestions */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {isArabic ? 'اقتراحات سريعة:' : 'Quick suggestions:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors py-2 px-3"
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            className="w-full h-12 text-base gap-2"
            onClick={handleNewConversation}
          >
            <MessageCircle className="h-5 w-5" />
            {isArabic ? 'ابدأ محادثة جديدة الآن' : 'Start a new conversation now'}
          </Button>
        </div>
      </ScrollArea>

      {/* Input Field */}
      <div className="sticky bottom-0 bg-background border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => sendMessage(isArabic ? 'ساعدني في تعلم العربية' : 'Help me learn Arabic')}
            >
              <BookOpen className="h-5 w-5" />
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isArabic
                  ? 'اكتب رسالتك هنا...'
                  : 'Type your message here...'
              }
              className="flex-1 h-12 text-base"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="shrink-0 h-12 w-12"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* Additional Features */}
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {isArabic ? 'العربية' : 'Arabic'}
            </span>
            <span>•</span>
            <span>{isArabic ? 'مدعوم بالذكاء الاصطناعي' : 'AI-powered'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
