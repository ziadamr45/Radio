import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for live streams

// SSRF Protection: Block internal/private network IPs
const BLOCKED_HOSTNAMES = [
  'localhost', '127.0.0.1', '0.0.0.0', '::1',
  '169.254.169.254', // Cloud metadata endpoint
  'metadata.google.internal', // GCP metadata
  'metadata.internal', // Generic metadata
];

const BLOCKED_IP_RANGES = [
  /^10\./,                    // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[01])\./, // 172.16.0.0/12
  /^192\.168\./,              // 192.168.0.0/16
  /^fc00:/i,                  // IPv6 private
  /^fe80:/i,                  // IPv6 link-local
  /^169\.254\./,              // Link-local
];

function isBlockedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    
    // Check blocked hostnames
    if (BLOCKED_HOSTNAMES.some(blocked => hostname === blocked || hostname.endsWith('.' + blocked))) {
      return true;
    }
    
    // Check blocked IP ranges
    if (BLOCKED_IP_RANGES.some(range => range.test(hostname))) {
      return true;
    }
    
    // Block non-standard ports (only allow 80, 443, and common streaming ports)
    const port = parsed.port;
    if (port && !['80', '443', '8080', '8443', '8000', '3000'].includes(port)) {
      return true;
    }
    
    return false;
  } catch {
    return true;
  }
}

/**
 * Parse M3U playlist
 */
function parseM3u(content: string): string | null {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
  }
  return null;
}

/**
 * Parse PLS playlist
 */
function parsePls(content: string): string | null {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith('file')) {
      const match = trimmed.match(/file\d+\s*=\s*(.+)/i);
      if (match && match[1]) {
        const url = match[1].trim();
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
      }
    }
  }
  return null;
}

/**
 * Check if URL is a playlist
 */
function isPlaylistUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.endsWith('.m3u') || lower.endsWith('.pls');
}

/**
 * Stream Proxy API
 * - Handles playlists (.m3u, .pls)
 * - Follows redirects
 * - No timeout cutoff
 * - Direct body streaming
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  // Decode URL (handle double encoding)
  let streamUrl: string;
  try {
    streamUrl = decodeURIComponent(url);
    try {
      streamUrl = decodeURIComponent(streamUrl);
    } catch {
      // Already single decoded
    }
    
    // Validate
    const parsed = new URL(streamUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
    }
    
    // SSRF Protection: Block internal/private network requests
    if (isBlockedUrl(streamUrl)) {
      console.warn('[Stream Proxy] Blocked SSRF attempt:', streamUrl);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  console.log('[Stream Proxy] Fetching:', streamUrl);

  try {
    // Check if it's a playlist URL
    if (isPlaylistUrl(streamUrl)) {
      console.log('[Stream Proxy] Detected playlist, resolving...');
      
      const playlistResponse = await fetch(streamUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AsmaeRadio/1.0)',
          'Accept': '*/*',
        },
        redirect: 'follow',
      });
      
      if (!playlistResponse.ok) {
        return NextResponse.json({ error: 'Playlist fetch failed' }, { status: playlistResponse.status });
      }
      
      const content = await playlistResponse.text();
      const actualUrl = streamUrl.toLowerCase().endsWith('.m3u') 
        ? parseM3u(content) 
        : parsePls(content);
      
      if (!actualUrl) {
        return NextResponse.json({ error: 'No stream URL in playlist' }, { status: 400 });
      }
      
      console.log('[Stream Proxy] Resolved to:', actualUrl);
      streamUrl = actualUrl;
    }

    // Fetch the stream - with timeout, follow redirects
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'audio/*, */*',
        'Accept-Encoding': 'identity',
        'Icy-MetaData': '1',
        'Connection': 'keep-alive',
      },
      redirect: 'follow',
      cache: 'no-store',
      signal: AbortSignal.timeout(30000), // 30 second connection timeout
    } as RequestInit);

    if (!response.ok) {
      console.error('[Stream Proxy] Upstream error:', response.status);
      return NextResponse.json(
        { error: `Stream unavailable: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    console.log('[Stream Proxy] Streaming:', contentType);

    // Build response headers
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    headers.set('Connection', 'keep-alive');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Access-Control-Allow-Origin', '*');

    // STREAM DIRECTLY - absolutely no buffering or transformation
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[Stream Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to stream' },
      { status: 502 }
    );
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
