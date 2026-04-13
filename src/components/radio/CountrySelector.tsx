'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { translations } from '@/lib/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CountryData {
  iso_3166_1: string;
  name: string;
  stationcount: number;
  nameAr: string;
  nameEn: string;
}

// Popular country codes shown first (Arab + major world countries)
const POPULAR_COUNTRY_CODES = new Set([
  'EG', 'SA', 'AE', 'MA', 'DZ', 'TN', 'JO', 'LB', 'IQ', 'KW',
  'QA', 'BH', 'OM', 'PS', 'SY', 'SD', 'LY', 'YE', 'MR',
  'US', 'GB', 'FR', 'DE', 'TR', 'BR', 'IN', 'JP', 'CN', 'KR',
  'ES', 'IT', 'NL', 'CA', 'AU', 'RU', 'ID', 'MX', 'AR', 'SE',
  'NO', 'DK', 'FI', 'CH', 'AT', 'PL', 'PT', 'GR', 'CZ', 'RO',
  'NG', 'ZA', 'KE', 'TH', 'PH', 'VN', 'PK', 'MY', 'CO', 'CL',
]);

// Convert country code to emoji flag
function countryToFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

export function CountrySelector() {
  const { selectedCountry, setSelectedCountry, language } = useRadioStore();
  const t = translations[language];
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch('/api/radio?action=countries');
        const data = await res.json();
        if (data.success && data.data) {
          setCountries(data.data as CountryData[]);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
      }
    }
    loadCountries();
  }, []);

  // Filter countries by search term
  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return countries;
    const term = searchTerm.toLowerCase().trim();
    return countries.filter((c) =>
      c.name.toLowerCase().includes(term) ||
      c.nameAr.includes(term) ||
      c.nameEn.toLowerCase().includes(term) ||
      c.iso_3166_1.toLowerCase().includes(term)
    );
  }, [countries, searchTerm]);

  // Split into popular countries first, then rest
  const { popularCountries, otherCountries } = useMemo(() => {
    const popular: CountryData[] = [];
    const other: CountryData[] = [];
    for (const c of filteredCountries) {
      if (POPULAR_COUNTRY_CODES.has(c.iso_3166_1)) {
        popular.push(c);
      } else {
        other.push(c);
      }
    }
    return { popularCountries: popular, otherCountries: other };
  }, [filteredCountries]);

  const selectedCountryData = useMemo(
    () => countries.find((c) => c.iso_3166_1 === selectedCountry),
    [countries, selectedCountry]
  );

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      <Select
        value={selectedCountry}
        onValueChange={(val) => {
          setSelectedCountry(val);
          setSearchTerm('');
          setIsOpen(false);
        }}
        open={isOpen}
        onOpenChange={(v) => {
          setIsOpen(v);
          if (!v) setSearchTerm('');
        }}
      >
        <SelectTrigger className="w-[200px] sm:w-[220px]">
          <SelectValue>
            {selectedCountryData ? (
              <span className="flex items-center gap-2">
                <span>{countryToFlag(selectedCountryData.iso_3166_1)}</span>
                <span className="truncate">
                  {language === 'ar' ? selectedCountryData.nameAr : selectedCountryData.nameEn}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>🌍</span>
                <span>{language === 'ar' ? 'اختر دولة' : 'Select Country'}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {/* Search input */}
          <div className="p-2 border-b bg-popover z-10">
            <div className="relative">
              <Search className="absolute start-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'ابحث عن دولة...' : 'Search countries...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-8 h-8 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          {/* Popular Countries Section */}
          {popularCountries.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-popover">
                {language === 'ar' ? '🌍 الدول الأكثر شيوعاً' : '🌍 Popular Countries'}
              </div>
              {popularCountries.map((country) => (
                <SelectItem key={country.iso_3166_1} value={country.iso_3166_1}>
                  <span className="flex items-center gap-2">
                    <span>{countryToFlag(country.iso_3166_1)}</span>
                    <span>{language === 'ar' ? country.nameAr : country.nameEn}</span>
                    <span className="text-xs text-muted-foreground ms-auto">
                      {country.stationcount}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </>
          )}
          
          {/* Other Countries Section */}
          {otherCountries.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t">
                {language === 'ar' ? '🌐 بقية الدول' : '🌐 More Countries'}
              </div>
              {otherCountries.slice(0, 100).map((country) => (
                <SelectItem key={country.iso_3166_1} value={country.iso_3166_1}>
                  <span className="flex items-center gap-2">
                    <span>{countryToFlag(country.iso_3166_1)}</span>
                    <span>{language === 'ar' ? country.nameAr : country.nameEn}</span>
                    <span className="text-xs text-muted-foreground ms-auto">
                      {country.stationcount}
                    </span>
                  </span>
                </SelectItem>
              ))}
              {otherCountries.length > 100 && searchTerm && (
                <div className="px-2 py-1 text-xs text-muted-foreground text-center">
                  {language === 'ar'
                    ? `و ${otherCountries.length - 100} دولة أخرى... استخدم البحث`
                    : `and ${otherCountries.length - 100} more... use search`}
                </div>
              )}
            </>
          )}
          
          {filteredCountries.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
