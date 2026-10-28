'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  CloudSun,
  Wind,
  Droplets,
  Sun,
  CloudRain,
  Search,
  MapPin,
  Navigation,
  Check,
  History,
  X,
  Compass,
  Home,
} from 'lucide-react';

interface CityOption {
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
}

const PRESET_CITIES: CityOption[] = [
  { name: 'Lisbon', country: 'Portugal', admin1: 'Lisbon District', lat: 38.7223, lon: -9.1393 },
  { name: 'Porto', country: 'Portugal', admin1: 'Porto District', lat: 41.1496, lon: -8.611 },
  { name: 'London', country: 'United Kingdom', admin1: 'England', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'France', admin1: 'Île-de-France', lat: 48.8566, lon: 2.3522 },
  { name: 'Madrid', country: 'Spain', admin1: 'Madrid Community', lat: 40.4168, lon: -3.7038 },
  { name: 'New York', country: 'United States', admin1: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', country: 'Japan', admin1: 'Tokyo', lat: 35.6762, lon: 139.6503 },
];

export default function WeatherPage() {
  const { settings, updateSettings, addToast } = useDaymark();

  const homeCityName = settings.homeCity || 'Porto';
  const homeLat = settings.homeLat ?? 41.1496;
  const homeLon = settings.homeLon ?? -8.611;
  const homeCountry = settings.homeCountry || 'Portugal';

  const [activeCity, setActiveCity] = useState<CityOption>({
    name: homeCityName,
    country: homeCountry,
    lat: homeLat,
    lon: homeLon,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CityOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentCities, setRecentCities] = useState<CityOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<any>(null);
  const [hourly, setHourly] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isCurrentCityHome =
    activeCity.name.toLowerCase().trim() === homeCityName.toLowerCase().trim();

  // Load recent cities from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('daymark_weather_recent_cities');
      if (stored) {
        setRecentCities(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced search query to Open-Meteo Geocoding API
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            searchQuery.trim()
          )}&count=8&language=en&format=json`
        );
        if (!res.ok) throw new Error('Geocoding search failed');
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const formatted: CityOption[] = data.results.map((r: any) => ({
            name: r.name,
            country: r.country || '',
            admin1: r.admin1 || '',
            lat: r.latitude,
            lon: r.longitude,
          }));
          setSearchResults(formatted);
          setShowDropdown(true);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchForecast = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=auto`
      );
      if (!res.ok) throw new Error('Failed to retrieve forecast data');
      const data = await res.json();

      setCurrent(data.current);

      // Extract next 8 hours
      if (data.hourly && data.hourly.time) {
        const nextHours = [];
        const currentHourISO = new Date().toISOString().substring(0, 13);
        const startIndex = data.hourly.time.findIndex((t: string) => t.startsWith(currentHourISO));
        const idx = Math.max(0, startIndex);
        for (let i = idx; i < idx + 8 && i < data.hourly.time.length; i++) {
          nextHours.push({
            time: data.hourly.time[i].substring(11, 16),
            temp: Math.round(data.hourly.temperature_2m[i]),
            precipProb: data.hourly.precipitation_probability[i],
          });
        }
        setHourly(nextHours);
      }

      // Extract 7-day forecast
      if (data.daily && data.daily.time) {
        const days = [];
        for (let i = 0; i < data.daily.time.length; i++) {
          const d = new Date(data.daily.time[i]);
          days.push({
            date: data.daily.time[i],
            dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
            maxTemp: Math.round(data.daily.temperature_2m_max[i]),
            minTemp: Math.round(data.daily.temperature_2m_min[i]),
            precipProb: data.daily.precipitation_probability_max[i],
            uvIndex: data.daily.uv_index_max ? Math.round(data.daily.uv_index_max[i]) : 3,
          });
        }
        setDaily(days);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn('Weather fetch error:', err);
      setError('Weather API connection could not be established.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(activeCity.lat, activeCity.lon);
  }, [activeCity.lat, activeCity.lon]);

  const selectCity = (city: CityOption) => {
    setActiveCity(city);
    setSearchQuery('');
    setShowDropdown(false);

    // Save to recents without modifying home settings or firing toast popups
    const updated = [city, ...recentCities.filter((c) => c.name !== city.name || c.lat !== city.lat)].slice(0, 5);
    setRecentCities(updated);
    try {
      localStorage.setItem('daymark_weather_recent_cities', JSON.stringify(updated));
    } catch (e) {
      // Ignore
    }
  };

  // Pin Current City as Permanent App Home (Only when explicitly clicked)
  const handlePinAsHome = () => {
    updateSettings({
      homeCity: activeCity.name,
      homeCountry: activeCity.country,
      homeLat: activeCity.lat,
      homeLon: activeCity.lon,
    });
  };

  // Switch back to Home
  const handleGoHome = () => {
    selectCity({
      name: homeCityName,
      country: homeCountry,
      lat: homeLat,
      lon: homeLon,
    });
  };

  // Browser Geolocation Detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));

        try {
          // Reverse geocode to find name
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${lat},${lon}&count=1&language=en&format=json`
          );
          let cityName = 'Current Location';
          let countryName = '';

          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results[0]) {
              cityName = data.results[0].name;
              countryName = data.results[0].country || '';
            }
          }

          selectCity({
            name: cityName,
            country: countryName,
            lat,
            lon,
          });
        } catch (e) {
          selectCity({
            name: 'Current Location',
            country: 'GPS',
            lat,
            lon,
          });
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        addToast('Location Denied', 'Please allow location access in your browser or search by city name.', 'error');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#242424]">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight text-white">
            Weather Forecast
          </h1>
          <p className="text-xs text-[#AAAAAA] mt-1">
            Hyper-local meteorological observations & forecasts powered by Open-Meteo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Home jump button */}
          <button
            onClick={handleGoHome}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isCurrentCityHome
                ? 'bg-[#E50914] text-white border-[#E50914]'
                : 'bg-[#141414] hover:bg-[#1C1C1C] text-[#AAAAAA] hover:text-white border-[#242424] hover:border-[#E50914]'
            }`}
            title="Jump to pinned home location"
          >
            <Home size={13} className={isCurrentCityHome ? 'text-white' : 'text-[#E50914]'} />
            <span>Home: {homeCityName}</span>
          </button>

          {/* GPS Location button */}
          <button
            onClick={handleUseCurrentLocation}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] hover:bg-[#1C1C1C] text-white border border-[#242424] hover:border-[#E50914] rounded-lg text-xs font-semibold transition-colors shrink-0"
          >
            <Navigation size={13} className="text-[#E50914]" />
            <span>Use My Location</span>
          </button>
        </div>
      </div>

      {/* Location Search Bar & Presets */}
      <div className="space-y-3">
        <div ref={searchContainerRef} className="relative">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#141414] border border-[#242424] focus-within:border-[#E50914] rounded-xl transition-colors">
            <Search size={16} className="text-[#777777] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              placeholder="Search any place in the world (e.g. Porto, Braga, Sintra, London, Madrid, Tokyo)..."
              className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#777777] focus:outline-none focus:ring-0 flex-1 w-full"
            />
            {isSearching && (
              <span className="text-[10px] text-[#AAAAAA] animate-pulse">Searching...</span>
            )}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                className="text-[#777777] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0D0D0D] border border-[#242424] rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-[#1C1C1C] max-h-72 overflow-y-auto">
              {searchResults.map((city, idx) => (
                <button
                  key={`${city.lat}-${city.lon}-${idx}`}
                  onClick={() => selectCity(city)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#141414] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={15} className="text-[#777777] group-hover:text-[#E50914] shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-white font-heading">{city.name}</p>
                      <p className="text-[11px] text-[#777777]">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#555555]">
                    {city.lat.toFixed(2)}°, {city.lon.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Location Chips: Home + Active + Recent + Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
          <span className="text-[11px] text-[#777777] mr-1 shrink-0 font-medium">Quick Select:</span>

          {/* Dedicated Home Chip */}
          <button
            onClick={handleGoHome}
            className={`px-3 py-1 rounded-lg whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
              isCurrentCityHome
                ? 'bg-[#E50914] text-white font-semibold'
                : 'bg-[#141414] text-[#E50914] hover:bg-[#1C1C1C] border border-[#E50914]/40 font-semibold'
            }`}
          >
            <Home size={12} />
            <span>Home ({homeCityName})</span>
          </button>

          {/* Active City indicator (if different from Home) */}
          {!isCurrentCityHome && (
            <button
              onClick={() => {}}
              className="px-3 py-1 bg-[#242424] text-white font-semibold rounded-lg whitespace-nowrap flex items-center gap-1.5 shrink-0"
            >
              <Check size={12} className="text-[#E50914]" />
              <span>{activeCity.name}</span>
            </button>
          )}

          {/* Recent Cities */}
          {recentCities
            .filter((c) => c.name !== activeCity.name && c.name !== homeCityName)
            .map((c) => (
              <button
                key={`recent-${c.name}-${c.lat}`}
                onClick={() => selectCity(c)}
                className="px-2.5 py-1 bg-[#141414] hover:bg-[#1C1C1C] text-[#AAAAAA] hover:text-white border border-[#242424] hover:border-[#333333] rounded-lg whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <History size={11} className="text-[#777777]" />
                <span>{c.name}</span>
              </button>
            ))}

          {/* Top Presets */}
          {PRESET_CITIES.filter(
            (c) => c.name !== activeCity.name && c.name !== homeCityName && !recentCities.some((r) => r.name === c.name)
          ).map((c) => (
            <button
              key={`preset-${c.name}`}
              onClick={() => selectCity(c)}
              className="px-2.5 py-1 bg-[#141414] hover:bg-[#1C1C1C] text-[#AAAAAA] hover:text-white border border-[#242424] hover:border-[#333333] rounded-lg whitespace-nowrap shrink-0 transition-colors"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="text-center py-16">
          <CloudSun size={36} className="mx-auto text-[#777777] animate-pulse mb-3" />
          <p className="text-sm font-semibold text-white font-heading">
            Fetching live meteorological data for {activeCity.name}...
          </p>
        </Card>
      ) : error ? (
        <Card className="text-center py-12">
          <p className="text-sm text-[#E50914] mb-3">{error}</p>
          <Button onClick={() => fetchForecast(activeCity.lat, activeCity.lon)}>Retry Connection</Button>
        </Card>
      ) : current ? (
        <div className="space-y-6">
          {/* Main Current Conditions Hero */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs text-[#E50914] font-semibold">
                    <MapPin size={14} />
                    <span>
                      {activeCity.name}
                      {activeCity.admin1 ? ` • ${activeCity.admin1}` : ''}
                      {activeCity.country ? `, ${activeCity.country}` : ''}
                    </span>
                  </div>

                  {/* Pin as Home Button */}
                  <button
                    onClick={handlePinAsHome}
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors border ${
                      isCurrentCityHome
                        ? 'bg-[#E50914]/15 border-[#E50914] text-[#E50914]'
                        : 'bg-[#181818] hover:bg-[#222222] border-[#242424] hover:border-[#E50914] text-[#AAAAAA] hover:text-white'
                    }`}
                    title={
                      isCurrentCityHome
                        ? 'This location is pinned as your app-wide Home base'
                        : 'Click to pin this location as your default Home across the app'
                    }
                  >
                    <Home size={11} className={isCurrentCityHome ? 'text-[#E50914]' : 'text-[#777777]'} />
                    <span>{isCurrentCityHome ? 'Pinned as App Home' : 'Pin as App Home'}</span>
                  </button>
                </div>

                <div className="flex items-baseline gap-4 mt-2">
                  <span className="text-6xl font-black font-heading text-white">
                    {Math.round(current.temperature_2m)}°C
                  </span>
                  <div className="text-xs text-[#AAAAAA]">
                    <p className="font-semibold text-sm text-white font-heading">
                      Feels like {Math.round(current.apparent_temperature)}°C
                    </p>
                    <p className="text-[11px] text-[#777777] mt-0.5">Updated at {lastUpdated}</p>
                  </div>
                </div>
              </div>

              {/* Conditions Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#181818] rounded-xl border border-[#242424]">
                  <span className="text-[10px] text-[#777777] flex items-center gap-1 font-medium">
                    <Droplets size={12} /> Humidity
                  </span>
                  <p className="font-mono text-base font-bold text-white mt-1">
                    {Math.round(current.relative_humidity_2m)}%
                  </p>
                </div>

                <div className="p-3 bg-[#181818] rounded-xl border border-[#242424]">
                  <span className="text-[10px] text-[#777777] flex items-center gap-1 font-medium">
                    <Wind size={12} /> Wind Speed
                  </span>
                  <p className="font-mono text-base font-bold text-white mt-1">
                    {Math.round(current.wind_speed_10m)} km/h
                  </p>
                </div>

                <div className="p-3 bg-[#181818] rounded-xl border border-[#242424]">
                  <span className="text-[10px] text-[#777777] flex items-center gap-1 font-medium">
                    <CloudRain size={12} /> Precipitation
                  </span>
                  <p className="font-mono text-base font-bold text-white mt-1">
                    {current.precipitation} mm
                  </p>
                </div>

                <div className="p-3 bg-[#181818] rounded-xl border border-[#242424]">
                  <span className="text-[10px] text-[#777777] flex items-center gap-1 font-medium">
                    <Sun size={12} /> UV Index
                  </span>
                  <p className="font-mono text-base font-bold text-white mt-1">
                    {daily[0]?.uvIndex || 3} / 10
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Hourly Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Next 8 Hours</CardTitle>
              <span className="text-xs text-[#777777]">Hourly temperature & rain probability</span>
            </CardHeader>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
              {hourly.map((h, i) => (
                <div key={i} className="p-2.5 bg-[#181818] rounded-xl border border-[#242424]">
                  <p className="text-[11px] font-mono text-[#AAAAAA]">{h.time}</p>
                  <p className="text-base font-mono font-bold text-white my-1">{h.temp}°</p>
                  <span className="text-[10px] text-[#3B82F6] font-mono">
                    {h.precipProb}% rain
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Outlook</CardTitle>
              <span className="text-xs text-[#777777]">Daily highs, lows, and precipitation</span>
            </CardHeader>

            <div className="divide-y divide-[#242424] text-xs">
              {daily.map((d, i) => (
                <div key={d.date} className="flex items-center justify-between py-2.5">
                  <div className="w-20 font-semibold text-sm text-white font-heading">
                    {i === 0 ? 'Today' : d.dayName}
                  </div>
                  <span className="text-xs text-[#3B82F6] font-mono w-24">
                    {d.precipProb}% rain
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[#777777]">{d.minTemp}°</span>
                    <span className="font-bold text-white">{d.maxTemp}°C</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
