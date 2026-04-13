import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 8; // 8 voice requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { audioBase64, language = 'ar' } = body;
    
    if (!audioBase64) {
      return NextResponse.json({ success: false, error: 'Audio data required' }, { status: 400 });
    }
    
    const zai = await ZAI.create();
    
    const response = await zai.audio.asr.create({
      file_base64: audioBase64
    });
    
    const transcription = response.text || '';
    
    return NextResponse.json({
      success: true,
      data: {
        transcription,
        language
      }
    });
    
  } catch (error) {
    console.error('ASR API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}
