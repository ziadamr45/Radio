import { NextRequest, NextResponse } from 'next/server';

// Radio Browser API - Fetch single station by UUID or related stations
const RADIO_BROWSER_SERVERS = [
  'https://de1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
];

async function fetchFromRadioBrowser(endpoint: string): Promise<unknown> {
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
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }
  
  throw lastError || new Error('All Radio Browser API servers failed');
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
  
  if (station.ssl_error === 0) qualityScore += 5;
  
  return Math.min(100, Math.max(0, qualityScore));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const stationId = searchParams.get('id');
  const action = searchParams.get('action');
  
  // Handle related stations request
  if (action === 'related' || request.nextUrl.pathname.includes('/related')) {
    return handleRelatedStations(searchParams);
  }
  
  if (!stationId) {
    return NextResponse.json({ 
      success: false, 
      error: 'Station ID required' 
    }, { status: 400 });
  }
  
  try {
    // Fetch station by UUID from Radio Browser API
    const station = await fetchFromRadioBrowser(`/stations/byuuid/${stationId}`);
    
    if (!station || (Array.isArray(station) && station.length === 0)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Station not found' 
      }, { status: 404 });
    }
    
    const stationData = Array.isArray(station) ? station[0] : station;
    const qualityScore = calculateQualityScore(stationData as Record<string, unknown>);
    
    return NextResponse.json({ 
      success: true, 
      data: { ...stationData, qualityScore } 
    });
  } catch (error) {
    console.error('Station fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch station',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Handle related stations
async function handleRelatedStations(searchParams: URLSearchParams) {
  const country = searchParams.get('country');
  const tags = searchParams.get('tags');
  const excludeId = searchParams.get('exclude');
  const limit = parseInt(searchParams.get('limit') || '6');
  
  try {
    let stations: unknown[] = [];
    
    // Fetch stations from the same country
    if (country) {
      const countryStations = await fetchFromRadioBrowser(
        `/stations/bycountrycodeexact/${country}?limit=${limit + 2}&order=clickcount&reverse=true`
      );
      stations = Array.isArray(countryStations) ? countryStations : [];
    }
    
    // If we have tags, also fetch by tag
    if (tags && stations.length < limit) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      for (const tag of tagList.slice(0, 2)) {
        try {
          const tagStations = await fetchFromRadioBrowser(
            `/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}`
          );
          if (Array.isArray(tagStations)) {
            // Merge and deduplicate
            const existingIds = new Set(stations.map((s: Record<string, unknown>) => (s as Record<string, unknown>).stationuuid));
            for (const station of tagStations) {
              if (!existingIds.has((station as Record<string, unknown>).stationuuid)) {
                stations.push(station);
              }
            }
          }
        } catch {
          // Continue if tag fetch fails
        }
      }
    }
    
    // Filter out excluded station and limit
    const filteredStations = (stations as Record<string, unknown>[])
      .filter(s => s.stationuuid !== excludeId)
      .slice(0, limit)
      .map(s => ({ ...s, qualityScore: calculateQualityScore(s) }));
    
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
