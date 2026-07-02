'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useWeather } from '@/hooks/use-weather';
import LiveWeatherBackground from '@/components/live-weather-background';
import Icon from '@/components/ui/icon';
import {
  Wind, Droplets, Gauge, Thermometer, Eye, Sun,
  Search, MapPin, ChevronDown, Loader2, X,
} from 'lucide-react';

const OWM_KEY = '604b70cea2c7eedbd5e229712b80004d';

// ── Helpers ────────────────────────────────────────────────────────────────

const windDir = (deg: number) => ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];

const fmt = (ts: number) =>
  new Date(ts * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const formatLocal = (
  unixSeconds: number,
  timezoneOffset: number,
  options: Intl.DateTimeFormatOptions,
) => new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(
  new Date((unixSeconds + timezoneOffset) * 1000),
);

// ── AI helpers ─────────────────────────────────────────────────────────────

function aiSummary(w: any): string {
  const t = w.main.temp;
  const cond = w.weather[0].main.toLowerCase();
  if (cond.includes('thunder')) return 'Thunderstorms developing. Stay indoors, avoid open areas and elevated terrain.';
  if (cond.includes('snow'))    return 'Snowfall expected. Dress in warm layers. Roads may be icy — drive carefully.';
  if (cond.includes('rain'))    return 'Rain in the forecast. Bring an umbrella and allow extra travel time.';
  if (t >= 35)                  return 'Extreme heat advisory. Avoid strenuous outdoor activity. Stay hydrated.';
  if (t >= 28)                  return 'Warm and humid. Great for the beach. Apply sunscreen and drink plenty of water.';
  if (t <= 5)                   return 'Near-freezing temperatures. Thermal layers, gloves, and a hat are essential.';
  if (t <= 12)                  return 'A cool day. A warm jacket and closed shoes will keep you comfortable.';
  return 'Comfortable conditions. A pleasant day for most outdoor activities.';
}

function clothingTip(w: any): string {
  const t = w.main.temp;
  const rain = w.weather[0].main.toLowerCase().includes('rain');
  if (t < 5)   return 'Heavy coat, thermal base layer, gloves, scarf, and hat.';
  if (t < 12)  return 'Warm jacket, long sleeves, jeans. Light scarf optional.';
  if (t < 18)  return 'Light jacket or cardigan over a t-shirt. Comfortable trousers.';
  if (t < 25)  return 'T-shirt and light trousers or jeans. A layer for evening.';
  if (rain)    return 'Waterproof jacket and sturdy shoes. Umbrella recommended.';
  return 'Lightweight, breathable fabrics. Sunglasses and a hat.';
}

function drivingTip(w: any): string {
  const cond = w.weather[0].main.toLowerCase();
  const vis  = w.visibility ?? 10000;
  if (cond.includes('thunder')) return 'Avoid non-essential journeys. Hazardous road conditions.';
  if (cond.includes('snow'))    return 'Reduce speed, use winter tyres. Allow double stopping distance.';
  if (cond.includes('rain'))    return 'Use headlights, increase following distance. Brake gently.';
  if (vis < 1000)               return 'Low visibility — use fog lights and significantly reduce speed.';
  return 'Good driving conditions. Standard safe-driving practices apply.';
}

function healthTip(w: any): string {
  const t = w.main.temp;
  const h = w.main.humidity;
  if (t > 35)           return 'Heat stress risk. Rest in shade, drink 3+ litres of water.';
  if (t > 28 && h > 70) return 'High heat index. Limit strenuous activity between 11am and 3pm.';
  if (t < 0)            return 'Frostbite risk with prolonged exposure. Minimise time outdoors.';
  if (h > 85)           return 'Very high humidity. Those with respiratory conditions should take care.';
  return 'Comfortable conditions. A good day for outdoor exercise.';
}

// Returns 1-10 with label — the unique "Go Outside?" differentiator
function goOutScore(w: any): { score: number; label: string; ring: string } {
  const t    = w.main.temp;
  const cond = w.weather[0].main.toLowerCase();
  const wind = w.wind.speed * 3.6; // convert m/s → km/h
  const hum  = w.main.humidity;
  let s = 10;
  if (cond.includes('thunder'))               s -= 7;
  else if (cond.includes('rain'))             s -= 3;
  else if (cond.includes('drizzle'))          s -= 2;
  else if (cond.includes('snow'))             s -= 2;
  if (t >= 38 || t < -10)                     s -= 4;
  else if (t >= 33 || t < 2)                  s -= 2;
  if (wind > 55)                              s -= 3;
  else if (wind > 35)                         s -= 1;
  if (hum > 90)                               s -= 1;
  s = Math.max(1, Math.min(10, s));
  if (s >= 8) return { score: s, label: 'Perfect conditions to go out',   ring: '#4ade80' };
  if (s >= 5) return { score: s, label: 'Decent conditions outside',      ring: '#facc15' };
  return       { score: s, label: 'Better to stay indoors today',          ring: '#f87171' };
}

interface Activity { icon: string; label: string; ok: boolean }
function getActivities(w: any): Activity[] {
  const t    = w.main.temp;
  const cond = w.weather[0].main.toLowerCase();
  const wind = w.wind.speed * 3.6;
  return [
    { icon: 'PersonStanding', label: 'Running',   ok: !cond.includes('thunder') && t < 33 && t > 5  && wind < 30 },
    { icon: 'Bike',           label: 'Cycling',   ok: !cond.includes('rain') && !cond.includes('thunder') && wind < 25 },
    { icon: 'Umbrella',       label: 'Umbrella',  ok: cond.includes('rain') || cond.includes('drizzle') },
    { icon: 'Glasses',        label: 'Sunglasses',ok: cond.includes('clear') || (cond.includes('cloud') && t > 20) },
    { icon: 'FlameKindling',  label: 'Sunscreen', ok: t > 22 && !cond.includes('thunder') && !cond.includes('rain') },
    { icon: 'Footprints',     label: 'Beach day', ok: t > 26 && cond.includes('clear') },
  ];
}

// ── Animation variants ─────────────────────────────────────────────────────

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } },
};

// ── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-4">
      {children}
    </p>
  );
}

function MetricTile({
  icon, label, value, sub,
}: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="glass-panel-hover rounded-2xl p-4 space-y-3 cursor-default">
      <div className="flex items-center justify-between">
        {icon}
        <span className="text-white/30 text-xs font-medium">{label}</span>
      </div>
      <div>
        <div className="text-white text-2xl font-light leading-none">{value}</div>
        {sub && <div className="text-white/30 text-xs mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function HeroMiniCard({
  iconName,
  label,
  value,
  meta,
}: {
  iconName: string;
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <div className="glass-panel rounded-2xl px-4 py-3 text-left shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-white/35">{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/8">
          <Icon name={iconName as any} className="h-3.5 w-3.5 text-white/55" />
        </div>
      </div>
      <div className="text-base font-medium text-white">{value}</div>
      {meta && <div className="mt-1 text-xs text-white/35">{meta}</div>}
    </div>
  );
}

function AIRow({ iconName, label, text }: { iconName: string; label: string; text: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-white/5 border border-white/[0.08] flex items-center justify-center">
        <Icon name={iconName as any} className="w-3.5 h-3.5 text-white/50" />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">{label}</div>
        <div className="text-sm text-white/70 leading-relaxed">{text}</div>
      </div>
    </div>
  );
}

// ── Geocoding types ────────────────────────────────────────────────────────

interface GeoCity {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Home() {
  const { currentWeather, forecast, isLoading, error, searchByCity, searchByCoords } = useWeather({ lat: 5.56, lon: -0.20 });

  // ── Search state ───────────────────────────────────────────────────────
  const [query, setQuery]               = useState('');
  const [suggestions, setSuggestions]   = useState<GeoCity[]>([]);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [showDrop, setShowDrop]         = useState(false);
  const [activeIdx, setActiveIdx]       = useState(-1);
  const searchRef                       = useRef<HTMLDivElement>(null);
  const dashRef                         = useRef<HTMLDivElement>(null);

  // Debounced geocoding as user types
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); setShowDrop(false); return; }
    const t = setTimeout(async () => {
      setIsGeoLoading(true);
      try {
        const res  = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=6&appid=${OWM_KEY}`);
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setShowDrop(true);
        setActiveIdx(-1);
      } catch { setSuggestions([]); }
      finally  { setIsGeoLoading(false); }
    }, 320);
    return () => clearTimeout(t);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDrop || !suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    if (e.key === 'Escape')    { setShowDrop(false); setActiveIdx(-1); }
    if (e.key === 'Enter' && activeIdx >= 0) { e.preventDefault(); selectCity(suggestions[activeIdx]); }
  }, [showDrop, suggestions, activeIdx]); // eslint-disable-line

  const selectCity = useCallback((city: GeoCity) => {
    searchByCoords({ lat: city.lat, lon: city.lon });
    setQuery('');
    setSuggestions([]);
    setShowDrop(false);
    setActiveIdx(-1);
  }, [searchByCoords]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (activeIdx >= 0 && suggestions[activeIdx]) { selectCity(suggestions[activeIdx]); return; }
    const q = query.trim();
    if (q) { searchByCity(q); setQuery(''); setShowDrop(false); }
  }, [activeIdx, suggestions, query, selectCity, searchByCity]);

  const clearSearch = useCallback(() => {
    setQuery(''); setSuggestions([]); setShowDrop(false); setActiveIdx(-1);
  }, []);

  // ── Data processing ────────────────────────────────────────────────────

  const hourly = useMemo(() => {
    if (!forecast?.list) return [];
    return forecast.list.slice(0, 9).map((item: any) => ({
      time:    new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
      temp:    Math.round(item.main.temp),
      owmIcon: item.weather[0].icon,
      pop:     Math.round((item.pop ?? 0) * 100),
    }));
  }, [forecast]);

  const daily = useMemo(() => {
    if (!forecast?.list) return [];
    const map: Record<string, any> = {};
    forecast.list.forEach((item: any) => {
      const key = new Date(item.dt * 1000).toDateString();
      if (!map[key]) map[key] = { dt: item.dt, owmIcon: item.weather[0].icon, desc: item.weather[0].main, hi: -Infinity, lo: Infinity, pop: 0 };
      map[key].hi  = Math.max(map[key].hi, item.main.temp_max);
      map[key].lo  = Math.min(map[key].lo, item.main.temp_min);
      map[key].pop = Math.max(map[key].pop, item.pop ?? 0);
    });
    return Object.values(map).slice(0, 7).map((d: any, i: number) => ({
      ...d, label: i === 0 ? 'Today' : new Date(d.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    }));
  }, [forecast]);

  const code = currentWeather?.weather?.[0]?.icon ?? '01d';
  const localTime = currentWeather
    ? formatLocal(currentWeather.dt, currentWeather.timezone ?? 0, { hour: 'numeric', minute: '2-digit', hour12: true })
    : '';
  const localDate = currentWeather
    ? formatLocal(currentWeather.dt, currentWeather.timezone ?? 0, { weekday: 'long', month: 'short', day: 'numeric' })
    : '';
  const sunsetTime = currentWeather?.sys
    ? formatLocal(currentWeather.sys.sunset, currentWeather.timezone ?? 0, { hour: 'numeric', minute: '2-digit', hour12: true })
    : '';

  return (
    <LiveWeatherBackground weatherCode={code}>

      {/* ━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative min-h-screen flex flex-col">

        {/* Nav */}
        <nav className="relative z-20 flex items-center justify-between px-6 md:px-10 pt-6 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-center justify-center">
              <Icon name="Waves" className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">WeatherWave</span>
          </div>
          {currentWeather && (
            <div className="flex items-center gap-1.5 text-white/45 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{currentWeather.name}, {currentWeather.sys?.country}</span>
            </div>
          )}
        </nav>

        {/* Hero body */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" variants={fadeIn} initial="hidden" animate="show" exit="hidden"
                className="flex flex-col items-center gap-3">
                <Loader2 className="w-7 h-7 text-white/40 animate-spin" />
                <p className="text-white/40 text-sm">Loading weather data…</p>
              </motion.div>
            ) : currentWeather ? (
              <motion.div key={currentWeather.id} variants={stagger} initial="hidden" animate="show"
                className="flex flex-col items-center gap-5 w-full max-w-md">

                {/* City pill */}
                <motion.div variants={rise}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none p-1 glass-panel text-white/60 text-xs font-medium">
                  <MapPin className="w-3 h-3" />
                  {currentWeather.name}, {currentWeather.sys?.country}
                </motion.div>

                {/* Temperature */}
                <motion.div variants={rise} className="flex items-start leading-none -my-1">
                  <span className="text-[8.5rem] md:text-[11rem] font-extralight text-white tracking-tighter leading-none select-none">
                    {Math.round(currentWeather.main.temp)}
                  </span>
                  <span className="text-3xl md:text-4xl font-light text-white/50 mt-8 md:mt-10">°C</span>
                </motion.div>

                {/* Condition with OWM icon */}
                <motion.div variants={rise} className="flex items-center gap-2 -mt-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://openweathermap.org/img/wn/${code}@2x.png`}
                    alt={currentWeather.weather[0].description} width={52} height={52} className="drop-shadow-lg" />
                  <span className="text-white/75 text-lg font-light capitalize">
                    {currentWeather.weather[0].description}
                  </span>
                </motion.div>

                {/* Hi / Lo / Feels */}
                <motion.div variants={rise} className="flex items-center gap-3 text-xs text-white/40 font-medium">
                  <span>H {Math.round(currentWeather.main.temp_max)}°</span>
                  <span className="w-px h-3 bg-white/15 rounded-full" />
                  <span>L {Math.round(currentWeather.main.temp_min)}°</span>
                  <span className="w-px h-3 bg-white/15 rounded-full" />
                  <span>Feels {Math.round(currentWeather.main.feels_like)}°</span>
                </motion.div>

                {/* AI summary */}
                <motion.p variants={rise} className="max-w-lg text-sm leading-relaxed text-white/52 md:text-[15px]">
                  {aiSummary(currentWeather)}
                </motion.p>

                {/* ── Live search with autocomplete ── */}
                <motion.div variants={rise} className="relative w-full max-w-xl" ref={searchRef}>
                  <form onSubmit={handleSubmit}>
                    <div className={`flex items-center glass-panel px-4 py-3 gap-3 transition-all duration-200
                      focus-within:border-white/25
                      ${showDrop && suggestions.length > 0 ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl'}`}>
                      {isGeoLoading
                        ? <Loader2 className="w-4 h-4 text-white/35 flex-shrink-0 animate-spin" />
                        : <Search className="w-4 h-4 text-white/35 flex-shrink-0" />}
                      <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search any city — Accra, Tokyo, Berlin…"
                        className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                      <AnimatePresence>
                        {query && (
                          <motion.button type="button" onClick={clearSearch}
                            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.12 }}
                            className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                            <X className="w-3 h-3 text-white/60" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </form>

                  {/* Dropdown suggestions */}
                  <AnimatePresence>
                    {showDrop && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.14 }}
                        className="absolute top-full left-0 right-0 z-50 rounded-b-2xl overflow-hidden"
                        style={{ background: 'rgba(8,11,20,0.96)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderTop: 'none' }}>
                        {suggestions.map((city, i) => (
                          <button key={`${city.name}-${city.country}-${i}`}
                            onMouseDown={e => { e.preventDefault(); selectCity(city); }}
                            onMouseEnter={() => setActiveIdx(i)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                              ${activeIdx === i ? 'bg-white/8' : 'hover:bg-white/5'}`}>
                            <MapPin className="w-3 h-3 text-white/25 flex-shrink-0" />
                            <span className="text-white/90 text-sm font-medium">{city.name}</span>
                            <span className="text-white/35 text-xs">
                              {city.state ? `${city.state}, ` : ''}{city.country}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Inline error */}
                  <AnimatePresence>
                    {error && !isLoading && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-2 text-red-400/80 text-xs text-left px-1">
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={rise} className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <HeroMiniCard
                    iconName="Clock3"
                    label="Local Time"
                    value={localTime}
                    meta={localDate}
                  />
                  <HeroMiniCard
                    iconName="Wind"
                    label="Wind"
                    value={`${Math.round((currentWeather.wind?.speed ?? 0) * 3.6)} km/h`}
                    meta={windDir(currentWeather.wind?.deg ?? 0)}
                  />
                  <HeroMiniCard
                    iconName="Sunset"
                    label="Sunset"
                    value={sunsetTime}
                    meta={`${currentWeather.main.humidity}% humidity`}
                  />
                </motion.div>

              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Scroll cue */}
        {!isLoading && currentWeather && (
          <motion.button onClick={() => dashRef.current?.scrollIntoView({ behavior: 'smooth' })}
            initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 5, 0] }}
            transition={{ delay: 1.8, duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 mx-auto mb-8 flex flex-col items-center gap-1 text-white/25 hover:text-white/50 transition-colors">
            <span className="text-[10px] tracking-widest uppercase font-medium">Scroll</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </section>

      {/* ━━━━ DASHBOARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div ref={dashRef} className="relative z-10 bg-[#060810] border-t border-white/5">
        <div className="mx-auto max-w-5xl px-4 py-14 space-y-14">

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-2xl">
              <SectionLabel>Forecast Board</SectionLabel>
              <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl">
                Practical weather intelligence, not just a forecast.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/38 md:text-base">
                Live conditions, activity readiness, and decision-grade context in one open interface you can ship to GitHub and Vercel without apology.
              </p>
            </div>
            {currentWeather && (
              <div className="glass-panel rounded-2xl px-4 py-3 text-left md:min-w-[220px]">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Updated</div>
                <div className="mt-1 text-base font-medium text-white">{localTime} local</div>
                <div className="mt-1 text-xs text-white/35">{currentWeather.name}, {currentWeather.sys?.country}</div>
              </div>
            )}
          </motion.section>

          {/* ── Go Outside? (unique differentiator) ── */}
          {currentWeather && (() => {
            const { score, label, ring } = goOutScore(currentWeather);
            const activities = getActivities(currentWeather);
            const pct = (score / 10) * 100;
            return (
              <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <SectionLabel>Go Outside?</SectionLabel>
                <div className="glass-panel rounded-2xl p-5">
                  <div className="flex items-center gap-6">
                    {/* Circular score */}
                    <div className="flex-shrink-0 relative w-20 h-20">
                      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke={ring} strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 34}`}
                          strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                          style={{ transition: 'stroke-dashoffset 1s ease' }} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-light text-white">{score}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-base">{label}</div>
                      <div className="text-white/40 text-sm mt-0.5">{Math.round(currentWeather.main.temp)}° · {currentWeather.weather[0].main} · {currentWeather.main.humidity}% humidity</div>
                    </div>
                  </div>

                  {/* Activity badges */}
                  <div className="grid grid-cols-3 gap-2 mt-5">
                    {activities.map(a => (
                      <div key={a.label}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors
                          ${a.ok ? 'bg-white/8 text-white/80' : 'bg-white/3 text-white/25'}`}>
                        <Icon name={a.icon as any} className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{a.label}</span>
                        <span className="ml-auto">{a.ok ? '✓' : '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            );
          })()}

          {/* ── Hourly ── */}
          {hourly.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <SectionLabel>Hourly Forecast</SectionLabel>
              <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-none">
                {hourly.map((h: any, i: number) => (
                  <div key={i} className="glass-panel-hover flex-shrink-0 flex flex-col items-center gap-1.5 rounded-2xl px-4 py-3 min-w-[68px] text-center">
                    <span className="text-white/35 text-xs">{h.time}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://openweathermap.org/img/wn/${h.owmIcon}@2x.png`} alt="" width={40} height={40} />
                    <span className="text-white text-sm font-medium -mt-1">{h.temp}°</span>
                    {h.pop > 0 && <span className="text-blue-400/80 text-[10px] font-semibold">{h.pop}%</span>}
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ── 7-Day ── */}
          {daily.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <SectionLabel>7-Day Forecast</SectionLabel>
              <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
                {daily.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors">
                    <span className="text-white/55 text-sm w-12 flex-shrink-0">{d.label}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://openweathermap.org/img/wn/${d.owmIcon}.png`} alt={d.desc} width={28} height={28} className="flex-shrink-0" />
                    <span className="text-white/35 text-xs flex-1">{d.desc}</span>
                    {d.pop > 0.05 && <span className="text-blue-400/70 text-xs flex-shrink-0">{Math.round(d.pop * 100)}%</span>}
                    <div className="flex gap-2.5 text-sm flex-shrink-0">
                      <span className="text-white font-medium">{Math.round(d.hi)}°</span>
                      <span className="text-white/30">{Math.round(d.lo)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* ── Current Conditions ── */}
          {currentWeather && (
            <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <SectionLabel>Current Conditions</SectionLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                <MetricTile icon={<Droplets className="w-4 h-4 text-blue-400/80" />}
                  label="Humidity" value={`${currentWeather.main.humidity}%`} sub="Relative" />
                <MetricTile icon={<Wind className="w-4 h-4 text-cyan-400/80" />}
                  label="Wind" value={`${Math.round(currentWeather.wind.speed * 3.6)} km/h`}
                  sub={windDir(currentWeather.wind.deg)} />
                <MetricTile icon={<Gauge className="w-4 h-4 text-violet-400/80" />}
                  label="Pressure" value={`${currentWeather.main.pressure}`} sub="hPa" />
                <MetricTile icon={<Eye className="w-4 h-4 text-amber-400/80" />}
                  label="Visibility" value={`${((currentWeather.visibility ?? 10000) / 1000).toFixed(0)} km`} />
                <MetricTile icon={<Thermometer className="w-4 h-4 text-orange-400/80" />}
                  label="Feels Like" value={`${Math.round(currentWeather.main.feels_like)}°C`}
                  sub="Apparent temp" />
                <MetricTile icon={<Icon name="Cloud" className="w-4 h-4 text-slate-400/80" />}
                  label="Cloud Cover" value={`${currentWeather.clouds?.all ?? 0}%`} />
              </div>
            </motion.section>
          )}

          {/* ── Sunrise / Sunset ── */}
          {currentWeather?.sys && (
            <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <SectionLabel>Sun</SectionLabel>
              <div className="glass-panel rounded-2xl px-8 py-6 flex items-center justify-around gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-yellow-400/80" />
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Sunrise</span>
                  <span className="text-white font-light text-lg">{fmt(currentWeather.sys.sunrise)}</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/20 via-orange-400/30 to-yellow-400/20 mx-2" />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
                    <Icon name="Sunset" className="w-5 h-5 text-orange-400/80" />
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">Sunset</span>
                  <span className="text-white font-light text-lg">{fmt(currentWeather.sys.sunset)}</span>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── AI Insights ── */}
          {currentWeather && (
            <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <SectionLabel>AI Insights</SectionLabel>
              <div className="glass-panel rounded-2xl p-5 space-y-5">
                <AIRow iconName="Shirt"    label="Clothing" text={clothingTip(currentWeather)} />
                <div className="h-px bg-white/[0.05]" />
                <AIRow iconName="Car"      label="Driving"  text={drivingTip(currentWeather)} />
                <div className="h-px bg-white/[0.05]" />
                <AIRow iconName="Activity" label="Health"   text={healthTip(currentWeather)} />
              </div>
            </motion.section>
          )}

          <p className="text-center text-white/15 text-xs pt-4">
            WeatherWave · 
          </p>
        </div>
      </div>
    </LiveWeatherBackground>
  );
}

