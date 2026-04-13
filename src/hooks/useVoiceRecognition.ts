'use client';

import { useState, useCallback, useRef } from 'react';

interface UseVoiceRecognitionOptions {
  onResult: (text: string) => void;
  lang?: string;
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export function useVoiceRecognition({ onResult, lang = 'ar-SA' }: UseVoiceRecognitionOptions): UseVoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Browser SpeechRecognition API (Chrome, Edge, Safari)
  const startBrowserRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const result = event.results[0];
      if (result && result.isFinal) {
        const text = result[0].transcript.trim();
        if (text) onResult(text);
      }
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' is not a real error, just no speech detected
      if (event.error !== 'no-speech') {
        console.warn('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  }, [lang, onResult]);

  // Fallback: MediaRecorder + server API (Firefox, etc.)
  const startServerRecognition = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          if (!base64) return;
          try {
            const res = await fetch('/api/voice', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64,
                language: lang.startsWith('ar') ? 'ar' : 'en',
              }),
            });
            const data = await res.json();
            if (data.success && data.data?.transcription) {
              const text = data.data.transcription.trim();
              if (text) onResult(text);
            }
          } catch (err) {
            console.error('Voice API error:', err);
          }
        };

        reader.readAsDataURL(blob);

        // Cleanup stream
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      };

      mediaRecorder.onerror = () => {
        setIsListening(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, [lang, onResult]);

  const startListening = useCallback(() => {
    if (isSupported) {
      startBrowserRecognition();
    } else if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      startServerRecognition();
    }
  }, [isSupported, startBrowserRecognition, startServerRecognition]);

  return { isListening, isSupported, startListening, stopListening };
}
