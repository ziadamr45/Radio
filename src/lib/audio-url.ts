// Utility for handling audio stream URLs
// Uses Cloudflare Worker as primary proxy for all radio stations

// Proxy options - Cloudflare Worker passes through ALL radio stations
const PROXY_OPTIONS = {
  // Primary: Cloudflare Worker - passes through all stations
  cloudflare: 'https://quiet-paper-3b4a.ziad90216.workers.dev',
  // Fallback: Next.js API route
  nextjs: '/api/stream',
};

// Current active proxy - using Cloudflare for all stations
const ACTIVE_PROXY = 'cloudflare';

/**
 * Normalize a URL string
 */
function normalizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  let normalized = url.trim();
  normalized = normalized.replace(/[\x00-\x1F\x7F]/g, '');
  
  try {
    let decoded = normalized;
    let prev = '';
    while (decoded !== prev) {
      prev = decoded;
      decoded = decodeURIComponent(decoded);
    }
    normalized = decoded;
  } catch {}
  
  return normalized;
}

/**
 * Check if URL is HTTP (needs proxy)
 */
function isHttpUrl(url: string): boolean {
  if (!url) return false;
  
  const normalized = normalizeUrl(url);
  if (!normalized) return false;
  
  const lower = normalized.toLowerCase();
  if (lower.startsWith('http://')) return true;
  
  try {
    const parsed = new URL(normalized);
    return parsed.protocol === 'http:';
  } catch {
    return lower.includes('http://');
  }
}

/**
 * Check if we're on HTTPS page
 */
function isHttpsPage(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:';
}

/**
 * Get proxy URL for a stream - ALL stations use Cloudflare proxy
 */
function getProxyUrl(streamUrl: string): string {
  const encodedUrl = encodeURIComponent(streamUrl);
  
  // Always use Cloudflare worker for all radio stations
  return `${PROXY_OPTIONS.cloudflare}/?url=${encodedUrl}`;
}

/**
 * Get the correct audio URL for a station
 * ALL radio stations go through the Cloudflare proxy
 */
export function getAudioStreamUrl(station: { url_resolved?: string; url?: string; streamUrl?: string }): string | null {
  // Support both streamUrl (from static data) and url_resolved/url (from API)
  let rawUrl = station.streamUrl || station.url_resolved || station.url;
  if (!rawUrl) return null;
  
  rawUrl = normalizeUrl(rawUrl);
  if (!rawUrl) return null;
  
  // Validate URL
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
  } catch {
    return null;
  }
  
  // ALL stations use Cloudflare proxy for:
  // 1. Better CORS handling
  // 2. HTTP to HTTPS conversion
  // 3. Consistent streaming experience
  // 4. Playlist resolution support
  console.log('[AudioURL] Using Cloudflare proxy for stream:', rawUrl.substring(0, 50));
  return getProxyUrl(rawUrl);
}

/**
 * Check if a URL needs proxy
 */
export function needsProxy(url: string): boolean {
  return isHttpUrl(url) && isHttpsPage();
}

/**
 * Get raw station URL
 */
export function getRawStationUrl(station: { url_resolved?: string; url?: string; streamUrl?: string }): string | null {
  return normalizeUrl(station.streamUrl || station.url_resolved || station.url || '');
}
