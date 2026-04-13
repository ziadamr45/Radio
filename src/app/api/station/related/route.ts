import { NextRequest, NextResponse } from 'next/server';

// Radio Browser API - Fetch related stations
const RADIO_BROWSER_SERVERS = [
  'https://de1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
];

async function fetchFromRadioBrowser(endpoint: string): Promise<unknown[]> {
  let lastError: Error | null = null;
  
  for (const baseUrl of RADIO_BROWSER_SERVERS) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'User-Agent': 'AsmaeRadio/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }
  
  console.error('[RelatedStations] All servers failed:', lastError?.message);
  return [];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country');
  const tags = searchParams.get('tags');
  const excludeId = searchParams.get('exclude');
  const limit = parseInt(searchParams.get('limit') || '6');
  
  try {
    let stations: Record<string, unknown>[] = [];
    const seenUuids = new Set<string>();
    
    if (excludeId) {
      seenUuids.add(excludeId);
    }
    
    // Fetch stations from the same country
    if (country) {
      const countryStations = await fetchFromRadioBrowser(
        `/stations/bycountrycodeexact/${country}?limit=${limit + 5}&order=clickcount&reverse=true&lastcheckok=1`
      );
      
      for (const station of countryStations) {
        const s = station as Record<string, unknown>;
        const uuid = s.stationuuid as string;
        if (uuid && !seenUuids.has(uuid)) {
          seenUuids.add(uuid);
          stations.push(s);
        }
      }
    }
    
    // If we have tags and need more stations, fetch by tag
    if (tags && stations.length < limit) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      
      for (const tag of tagList.slice(0, 2)) {
        if (stations.length >= limit) break;
        
        try {
          const tagStations = await fetchFromRadioBrowser(
            `/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}&lastcheckok=1&order=clickcount&reverse=true`
          );
          
          for (const station of tagStations) {
            const s = station as Record<string, unknown>;
            const uuid = s.stationuuid as string;
            if (uuid && !seenUuids.has(uuid)) {
              seenUuids.add(uuid);
              stations.push(s);
            }
          }
        } catch {
          // Continue if tag fetch fails
        }
      }
    }
    
    // Filter out excluded station and limit
    const filteredStations = stations
      .filter(s => s.stationuuid !== excludeId)
      .slice(0, limit)
      .map(s => ({
        ...s,
        qualityScore: calculateQualityScore(s),
      }));
    
    return NextResponse.json({
      success: true,
      data: filteredStations,
    });
  } catch (error) {
    console.error('Related stations fetch error:', error);
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}

function calculateQualityScore(station: Record<string, unknown>): number {
  let qualityScore = 50;
  
  const bitrate = typeof station.bitrate === 'number' ? station.bitrate : 0;
  if (bitrate >= 128) qualityScore += 30;
  else if (bitrate >= 64) qualityScore += 20;
  else if (bitrate >= 32) qualityScore += 10;
  
  if (station.lastcheckok === 1) qualityScore += 20;
  
  const votes = typeof station.votes === 'number' ? station.votes : 0;
  if (votes > 100) qualityScore += 10;
  else if (votes > 50) qualityScore += 7;
  else if (votes > 10) qualityScore += 5;
  
  return Math.min(100, Math.max(0, qualityScore));
}
