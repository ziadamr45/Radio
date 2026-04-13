import { NextRequest, NextResponse } from 'next/server';
import { fetchFromRadioBrowser, calculateQualityScore, COUNTRIES_MAP } from '@/lib/radio-browser';

// Pinned stations - these are always included at the top of results for their country
const PINNED_STATIONS: Record<string, Array<Record<string, unknown>>> = {
  SA: [
    {
      changeuuid: 'pinned-fred-film-radio-ar',
      stationuuid: 'e2d75665-c4a9-4433-b953-3a5346ae5fb6',
      serveruuid: null,
      name: 'Fred Film Radio (لغة عربية)',
      url: 'https://s10.webradio-hosting.com/proxy/fredradioar/stream',
      url_resolved: 'https://s10.webradio-hosting.com/proxy/fredradioar/stream',
      homepage: 'http://www.fred.fm/',
      favicon: '',
      tags: 'culture,film,movie,أفلام,سينما',
      country: 'Saudi Arabia',
      countrycode: 'SA',
      iso_3166_2: '',
      state: '',
      language: 'arabic',
      languagecodes: 'ar',
      votes: 1462,
      lastchangetime: '',
      lastchangetime_iso8601: '',
      codec: 'MP3',
      bitrate: 128,
      hls: 0,
      lastcheckok: 1,
      lastchecktime: '',
      lastchecktime_iso8601: '',
      lastcheckoktime: '',
      lastcheckoktime_iso8601: '',
      lastlocalchecktime: '',
      lastlocalchecktime_iso8601: '',
      clicktimestamp: '',
      clicktimestamp_iso8601: '',
      clickcount: 2,
      clicktrend: 2,
      ssl_error: 0,
      geo_lat: 24.7136,
      geo_long: 46.6753,
      geo_distance: null,
      has_extended_info: false,
      _pinned: true,
    },
  ],
  AE: [
    {
      changeuuid: 'pinned-fun-radio-kids',
      stationuuid: '3d91ba0d-c4fa-4a30-ae4d-73aff8e9bc91',
      serveruuid: null,
      name: 'Fun Radio For Kids - Bedtime Stories',
      url: 'https://drive.uber.radio/uber/forkidzbedtimestories/icecast.audio',
      url_resolved: 'https://nl4.mystreaming.net/uber/forkidzbedtimestories/icecast.audio',
      homepage: 'https://forkids.radio/',
      favicon: 'https://forkids.radio/static/assets/img/apple-icon-120x120.png',
      tags: 'books,children,kids,stories,storytelling,قصص,حكايات,أطفال',
      country: 'The United Arab Emirates',
      countrycode: 'AE',
      iso_3166_2: '',
      state: '',
      language: 'english',
      languagecodes: 'en',
      votes: 293,
      lastchangetime: '',
      lastchangetime_iso8601: '',
      codec: 'MP3',
      bitrate: 128,
      hls: 0,
      lastcheckok: 1,
      lastchecktime: '',
      lastchecktime_iso8601: '',
      lastcheckoktime: '',
      lastcheckoktime_iso8601: '',
      lastlocalchecktime: '',
      lastlocalchecktime_iso8601: '',
      clicktimestamp: '',
      clicktimestamp_iso8601: '',
      clickcount: 2,
      clicktrend: 2,
      ssl_error: 0,
      geo_lat: 24.4539,
      geo_long: 54.3773,
      geo_distance: null,
      has_extended_info: false,
      _pinned: true,
    },
  ],
  MA: [
    {
      changeuuid: 'pinned-radio-manarat',
      stationuuid: '2c260d07-110c-473c-8a7f-df4b937b31a8',
      serveruuid: null,
      name: 'Radio Manarat',
      url: 'https://listen.radioking.com/radio/252934/stream/297385',
      url_resolved: 'https://listen.radioking.com/radio/252934/stream/297385',
      homepage: 'https://fm6education.ma/prestations/culture-education-et-formation/radio-manarat/',
      favicon: '',
      tags: 'culture,education,talk,ثقافة,تعليم,حوار',
      country: 'Morocco',
      countrycode: 'MA',
      iso_3166_2: '',
      state: '',
      language: 'arabic',
      languagecodes: 'ar',
      votes: 3063,
      lastchangetime: '',
      lastchangetime_iso8601: '',
      codec: 'MP3',
      bitrate: 192,
      hls: 0,
      lastcheckok: 1,
      lastchecktime: '',
      lastchecktime_iso8601: '',
      lastcheckoktime: '',
      lastcheckoktime_iso8601: '',
      lastlocalchecktime: '',
      lastlocalchecktime_iso8601: '',
      clicktimestamp: '',
      clicktimestamp_iso8601: '',
      clickcount: 12,
      clicktrend: 12,
      ssl_error: 0,
      geo_lat: 33.9794,
      geo_long: -6.8594,
      geo_distance: null,
      has_extended_info: false,
      _pinned: true,
    },
  ],
  PS: [
    {
      changeuuid: 'pinned-radio-nas',
      stationuuid: 'bcfe2aae-33fa-494a-a571-c3bbc8715c7d',
      serveruuid: null,
      name: 'راديو الناس',
      url: 'https://cdna.streamgates.net/RadioNas/Live-Audio/icecast.audio',
      url_resolved: 'https://cdna.streamgates.net/RadioNas/Live-Audio/icecast.audio',
      homepage: 'https://nasradio.fm/',
      favicon: 'https://nasradio.fm/images/logo.png',
      tags: 'culture,music,news,talk,ثقافة,أخبار,حوار,موسيقى',
      country: 'State Of Palestine',
      countrycode: 'PS',
      iso_3166_2: '',
      state: '',
      language: 'arabic',
      languagecodes: 'ar',
      votes: 2292,
      lastchangetime: '',
      lastchangetime_iso8601: '',
      codec: 'AAC+',
      bitrate: 64,
      hls: 0,
      lastcheckok: 1,
      lastchecktime: '',
      lastchecktime_iso8601: '',
      lastcheckoktime: '',
      lastcheckoktime_iso8601: '',
      lastlocalchecktime: '',
      lastlocalchecktime_iso8601: '',
      clicktimestamp: '',
      clicktimestamp_iso8601: '',
      clickcount: 19,
      clicktrend: 19,
      ssl_error: 0,
      geo_lat: 32.7008,
      geo_long: 35.2972,
      geo_distance: null,
      has_extended_info: false,
      _pinned: true,
    },
  ],
  TN: [
    {
      changeuuid: 'pinned-mosaiquefm',
      stationuuid: 'e4113924-a6ce-4a48-8781-97507dda0d67',
      serveruuid: null,
      name: 'mosaiquefm',
      url: 'https://radio.mosaiquefm.net/mosalive',
      url_resolved: 'https://radio.mosaiquefm.net/mosalive',
      homepage: 'https://www.mosaiquefm.net/ar/',
      favicon: '',
      tags: 'news talk music entertainment,أخبار,حوار,موسيقى,ترفيه',
      country: 'Tunisia',
      countrycode: 'TN',
      iso_3166_2: '',
      state: '',
      language: 'arabic',
      languagecodes: 'ar',
      votes: 1948,
      lastchangetime: '',
      lastchangetime_iso8601: '',
      codec: 'MP3',
      bitrate: 90,
      hls: 0,
      lastcheckok: 1,
      lastchecktime: '',
      lastchecktime_iso8601: '',
      lastcheckoktime: '',
      lastcheckoktime_iso8601: '',
      lastlocalchecktime: '',
      lastlocalchecktime_iso8601: '',
      clicktimestamp: '',
      clicktimestamp_iso8601: '',
      clickcount: 4,
      clicktrend: 4,
      ssl_error: 0,
      geo_lat: 36.8145,
      geo_long: 10.1699,
      geo_distance: null,
      has_extended_info: false,
      _pinned: true,
    },
  ],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  try {
    switch (action) {
      case 'countries': {
        const countries = await fetchFromRadioBrowser('/countries');
        const allCountries = (countries as Array<{ iso_3166_1: string; name: string; stationcount: number }>)
          .filter((c) => c.stationcount > 0)
          .map((c) => ({
            ...c,
            nameAr: COUNTRIES_MAP[c.iso_3166_1]?.nameAr || c.name,
            nameEn: COUNTRIES_MAP[c.iso_3166_1]?.nameEn || c.name,
          }))
          .sort((a, b) => b.stationcount - a.stationcount);
        return NextResponse.json({ success: true, data: allCountries });
      }
      
      case 'stations': {
        const countryCode = searchParams.get('country') || 'EG';
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');
        const search = searchParams.get('search') || '';
        
        let endpoint: string;
        
        if (search) {
          endpoint = `/stations/search?name=${encodeURIComponent(search)}&countrycode=${countryCode}&limit=${limit}&offset=${offset}&order=clickcount&reverse=true`;
        } else {
          endpoint = `/stations/bycountrycodeexact/${countryCode}?limit=${limit}&offset=${offset}&order=clickcount&reverse=true`;
        }
        
        const stations = await fetchFromRadioBrowser(endpoint, !search); // Don't cache search results
        
        const pinned = (!search && offset === 0 && PINNED_STATIONS[countryCode]) ? PINNED_STATIONS[countryCode] : [];
        let allStations: Array<Record<string, unknown>>;
        if (pinned.length > 0) {
          const pinnedNames = new Set(pinned.map((s) => String(s.name)));
          const filtered = (stations as Array<Record<string, unknown>>).filter(
            (s) => !pinnedNames.has(String(s.name))
          );
          allStations = [...pinned, ...filtered];
        } else {
          allStations = stations as Array<Record<string, unknown>>;
        }
        
        const stationsWithQuality = allStations.map((station) => {
          const qualityScore = calculateQualityScore(station);
          return { ...station, qualityScore };
        });
        
        const hasMore = stationsWithQuality.length >= limit;
        
        return NextResponse.json({ success: true, data: stationsWithQuality, hasMore });
      }
      
      case 'trending': {
        const countryCode = searchParams.get('country');
        const limit = parseInt(searchParams.get('limit') || '20');
        
        let endpoint = `/stations/topclick/${limit}`;
        if (countryCode) {
          endpoint = `/stations/bycountrycodeexact/${countryCode}?limit=${limit}&order=clicktrend&reverse=true`;
        }
        
        const stations = await fetchFromRadioBrowser(endpoint);
        const stationsWithQuality = (stations as Array<Record<string, unknown>>).map((station) => {
          const qualityScore = calculateQualityScore(station);
          return { ...station, qualityScore };
        });
        return NextResponse.json({ success: true, data: stationsWithQuality });
      }
      
      case 'topvoted': {
        const countryCode = searchParams.get('country');
        const limit = parseInt(searchParams.get('limit') || '20');
        
        let endpoint = `/stations/topvote/${limit}`;
        if (countryCode) {
          endpoint = `/stations/bycountrycodeexact/${countryCode}?limit=${limit}&order=votes&reverse=true`;
        }
        
        const stations = await fetchFromRadioBrowser(endpoint);
        const stationsWithQuality = (stations as Array<Record<string, unknown>>).map((station) => {
          const qualityScore = calculateQualityScore(station);
          return { ...station, qualityScore };
        });
        return NextResponse.json({ success: true, data: stationsWithQuality });
      }
      
      case 'click': {
        const stationUuid = searchParams.get('uuid');
        if (!stationUuid) {
          return NextResponse.json({ success: false, error: 'Station UUID required' }, { status: 400 });
        }
        
        await fetchFromRadioBrowser(`/url/${stationUuid}`, false);
        return NextResponse.json({ success: true });
      }
      
      case 'vote': {
        const stationUuid = searchParams.get('uuid');
        if (!stationUuid) {
          return NextResponse.json({ success: false, error: 'Station UUID required' }, { status: 400 });
        }
        
        await fetchFromRadioBrowser(`/vote/${stationUuid}`, false);
        return NextResponse.json({ success: true });
      }
      
      case 'tags': {
        const tag = searchParams.get('tag') || '';
        const countryCode = searchParams.get('country') || '';
        const limit = parseInt(searchParams.get('limit') || '50');
        
        let endpoint = `/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}`;
        if (countryCode) {
          endpoint = `/stations/bycountrycodeexact/${countryCode}?limit=${limit}&tag=${encodeURIComponent(tag)}`;
        }
        
        const stations = await fetchFromRadioBrowser(endpoint);
        const stationsWithQuality = (stations as Array<Record<string, unknown>>).map((station) => {
          const qualityScore = calculateQualityScore(station);
          return { ...station, qualityScore };
        });
        return NextResponse.json({ success: true, data: stationsWithQuality });
      }
      
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Radio API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch data from Radio Browser API',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
