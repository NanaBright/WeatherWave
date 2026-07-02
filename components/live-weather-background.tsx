'use client';

import React, { useMemo } from 'react';

interface Props {
  weatherCode: string;
  children: React.ReactNode;
}

// ── Free Unsplash photos verified by fetching page CDN src ─────────────────
const PHOTOS: Record<string, string> = {
  // Clear day — wide blue sky
  '01d': 'photo-1469474968028-56623f02e42e',
  // Clear night — milky way (widely used free photo)
  '01n': 'photo-1419242902214-272b3f66ee7a',
  // Few clouds day — confirmed blue sky with clouds
  '02d': 'photo-1615286628718-4a4c8924d0eb',
  // Few clouds night
  '02n': 'photo-1419242902214-272b3f66ee7a',
  // Scattered/broken clouds
  '03d': 'photo-1534088568595-a066f410bcda',
  '03n': 'photo-1499346030926-9a72daac6c63',
  '04d': 'photo-1499346030926-9a72daac6c63',
  '04n': 'photo-1499346030926-9a72daac6c63',
  // Drizzle
  '09d': 'photo-1428592953211-077101b2021b',
  '09n': 'photo-1428592953211-077101b2021b',
  // Rain
  '10d': 'photo-1428592953211-077101b2021b',
  '10n': 'photo-1428592953211-077101b2021b',
  // Thunderstorm — confirmed NOAA lightning photo
  '11d': 'photo-1561485132-59468cd0b553',
  '11n': 'photo-1600377927594-ceae8f8981a6',
  // Snow
  '13d': 'photo-1477601263568-180e2c6d046e',
  '13n': 'photo-1477601263568-180e2c6d046e',
  // Mist / fog
  '50d': 'photo-1485739173393-ba19dfe7a6c1',
  '50n': 'photo-1485739173393-ba19dfe7a6c1',
};

// Overlay gradient tuned per condition for text legibility
const OVERLAY: Record<string, string> = {
  '01d': 'rgba(0,20,70,0.38) 0%,rgba(0,8,35,0.62) 100%',
  '01n': 'rgba(0,0,18,0.52) 0%,rgba(0,0,8,0.78) 100%',
  '02d': 'rgba(0,18,58,0.40) 0%,rgba(0,8,30,0.65) 100%',
  '03d': 'rgba(8,18,38,0.48) 0%,rgba(4,8,22,0.72) 100%',
  '04d': 'rgba(12,18,32,0.55) 0%,rgba(4,8,18,0.78) 100%',
  '09d': 'rgba(4,12,32,0.55) 0%,rgba(2,8,20,0.78) 100%',
  '10d': 'rgba(2,10,28,0.58) 0%,rgba(0,4,18,0.82) 100%',
  '11d': 'rgba(0,4,18,0.62) 0%,rgba(0,0,8,0.88) 100%',
  '13d': 'rgba(8,18,42,0.42) 0%,rgba(4,12,36,0.68) 100%',
  '50d': 'rgba(12,18,28,0.58) 0%,rgba(8,12,22,0.78) 100%',
};

// ── CSS-only rain — far fewer DOM nodes, GPU-accelerated, zero JS overhead ──
const CSSRain = ({ heavy }: { heavy?: boolean }) => {
  const count = heavy ? 36 : 20;
  return (
    <div className="rain-overlay" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: `${((i * 2.71 + Math.sin(i * 1.63) * 4.5)) % 100}%`,
            width: '1.5px',
            height: `${13 + (i % 9) * 3}px`,
            background: 'linear-gradient(to bottom, transparent, rgba(174,214,241,0.48), transparent)',
            animationName: 'rain-fall',
            animationDuration: `${0.34 + (i % 9) * 0.037}s`,
            animationDelay: `${(i * 0.079) % 1.9}s`,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            willChange: 'transform',
          }}
        />
      ))}
    </div>
  );
};

// ── CSS-only stars ─────────────────────────────────────────────────────────
const CSSStars = () => (
  <div className="rain-overlay" aria-hidden="true">
    {Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${(i * 2.0 + Math.sin(i * 0.85) * 7) % 100}%`,
          top: `${(i * 1.41 + Math.cos(i * 1.05) * 5) % 65}%`,
          width: `${1 + (i % 3) * 0.65}px`,
          height: `${1 + (i % 3) * 0.65}px`,
          borderRadius: '50%',
          backgroundColor: 'white',
          animationName: 'star-twinkle',
          animationDuration: `${1.9 + (i % 7) * 0.44}s`,
          animationDelay: `${(i * 0.115) % 3.5}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          willChange: 'opacity',
        }}
      />
    ))}
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────
const LiveWeatherBackground: React.FC<Props> = ({ weatherCode, children }) => {
  const isDay = weatherCode.endsWith('d');
  const code  = weatherCode.slice(0, 2);

  const { photo, overlay } = useMemo(() => {
    const key = `${code}${isDay ? 'd' : 'n'}`;
    const resolvedPhoto = PHOTOS[key] ?? (isDay ? PHOTOS['01d'] : PHOTOS['01n']);
    const resolvedOverlay = OVERLAY[isDay ? `${code}d` : `${code}n`]
      ?? OVERLAY[`${code}d`]
      ?? (isDay ? OVERLAY['01d'] : OVERLAY['01n']);
    return { photo: resolvedPhoto, overlay: resolvedOverlay };
  }, [weatherCode, isDay, code]);

  const showRain  = ['09', '10', '11'].includes(code);
  const heavyRain = code === '11';
  const showStars = !isDay && !['09', '10', '11'].includes(code);

  return (
    <div>
      {/* ── Fixed photo background ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -10,
          backgroundImage: `url('https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1920&q=75')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundColor: isDay ? '#0c2461' : '#020410',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, ${overlay})` }} />
      </div>

      {/* ── Weather effects (CSS-only, no Framer Motion) ── */}
      {showRain  && <CSSRain heavy={heavyRain} />}
      {showStars && <CSSStars />}

      {children}
    </div>
  );
};

export default LiveWeatherBackground;
