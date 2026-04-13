"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Play, Check, Volume2 } from "lucide-react";
import { useRadioStore } from "@/stores/radio-store";
import type { RadioStation } from "@/types/radio";

interface Station {
  stationuuid: string;
  name: string;
  country: string;
  favicon: string;
  url_resolved: string;
  tags: string;
  countrycode?: string;
  codec?: string;
  bitrate?: number;
  votes?: number;
}

function ShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentStation, setIsPlaying, currentStation, isPlaying } = useRadioStore();
  const [sharedText, setSharedText] = useState("");
  const [sharedUrl, setSharedUrl] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Remove splash screen on mount (for deep links / share pages)
  useEffect(() => {
    const removeSplash = () => {
      const splash = document.getElementById('initial-splash');
      if (splash) {
        splash.style.transition = 'opacity 0.3s ease-out';
        splash.style.opacity = '0';
        setTimeout(() => {
          const s = document.getElementById('initial-splash');
          if (s) s.remove();
        }, 300);
      }
    };

    // Remove splash after a short delay for share page
    const timer = setTimeout(removeSplash, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const title = searchParams.get("title") || "";
    const text = searchParams.get("text") || "";
    const url = searchParams.get("url") || "";

    const combined = [title, text].filter(Boolean).join(" - ");
    setSharedText(combined);
    setSharedUrl(url);

    if (combined.trim()) {
      handleSearch(combined.trim());
    }
  }, [searchParams]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/radio?action=stations&country=EG&search=${encodeURIComponent(query)}&limit=6`
      );
      if (res.ok) {
        const data = await res.json();
        setStations(Array.isArray(data.data) ? data.data : Array.isArray(data.stations) ? data.stations : []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Play station directly without navigation (avoids SSR issues on Vercel)
  const handlePlayStation = (station: Station) => {
    try {
      const radioStation: RadioStation = {
        changeuuid: '',
        stationuuid: station.stationuuid,
        serveruuid: null,
        name: station.name,
        url: station.url_resolved,
        url_resolved: station.url_resolved,
        homepage: '',
        favicon: station.favicon || '',
        tags: station.tags || '',
        country: station.country || '',
        countrycode: station.countrycode || '',
        iso_3166_2: null,
        state: '',
        language: 'arabic',
        languagecodes: 'ar',
        votes: station.votes || 0,
        lastchangetime: '',
        lastchangetime_iso8601: '',
        codec: station.codec || 'MP3',
        bitrate: station.bitrate || 128,
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
        clickcount: 0,
        clicktrend: 0,
        ssl_error: 0,
        geo_lat: null,
        geo_long: null,
        has_extended_info: false,
      };
      setCurrentStation(radioStation);
      setIsPlaying(true);
      setPlayingId(station.stationuuid);
    } catch (error) {
      console.error('Error playing station:', error);
    }
  };

  const isCurrentlyPlaying = (station: Station) => {
    return playingId === station.stationuuid || 
      (currentStation?.stationuuid === station.stationuuid && isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 pt-6 pb-32" dir="rtl">
      <div className="max-w-lg mx-auto space-y-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-orange-600">تم المشاركة إلى اسمع راديو</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sharedText && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p className="font-medium">{sharedText}</p>
              </div>
            )}
            {sharedUrl && (
              <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground truncate">
                {sharedUrl}
              </div>
            )}
          </CardContent>
        </Card>

        {sharedText && (
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                محطات مقترحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : stations.length > 0 ? (
                <div className="space-y-2">
                  {stations.map((station) => {
                    const playing = isCurrentlyPlaying(station);
                    return (
                      <Button
                        key={station.stationuuid}
                        variant={playing ? "default" : "outline"}
                        className={`w-full justify-start text-end h-auto py-3 transition-all ${playing ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' : ''}`}
                        onClick={() => handlePlayStation(station)}
                      >
                        {playing ? (
                          <div className="flex items-center gap-1.5 ms-2 shrink-0">
                            <Volume2 className="h-4 w-4" />
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          </div>
                        ) : (
                          <Play className="h-4 w-4 ms-2 text-orange-600 shrink-0" />
                        )}
                        <div className="text-end flex-1">
                          <div className="font-medium text-sm">{station.name}</div>
                          <div className="text-xs opacity-80">{station.country}</div>
                        </div>
                        {playing && <Check className="h-4 w-4 shrink-0" />}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  لم يتم العثور على محطات مطابقة
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Button
          className="w-full"
          variant="outline"
          onClick={() => router.push("/")}
        >
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" dir="rtl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
