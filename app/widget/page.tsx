'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { WEATHER_API_URL, WEATHER_API_KEY } from '@/app/api';
import { Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { AIWeatherInsights } from '@/components/ai-weather-insights';
import { SmartWeatherNotifications } from '@/components/smart-weather-notifications';
import { HealthMetrics } from '@/components/health-metrics';
import { ExtendedForecast } from '@/components/extended-forecast';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  visibility?: number;
  name: string;
}

const getWeatherIcon = (condition: string) => {
  const iconClass = "w-8 h-8 text-white";
  switch (condition.toLowerCase()) {
    case 'clear':
      return <Sun className={iconClass} />;
    case 'rain':
      return <CloudRain className={iconClass} />;
    case 'snow':
      return <CloudSnow className={iconClass} />;
    case 'clouds':
      return <Cloud className={iconClass} />;
    default:
      return <Sun className={iconClass} />;
  }
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Location access denied');
          // Fallback to default location (London)
          setLocation({ lat: 51.5074, lon: -0.1278 });
        }
      );
    } else {
      setError('Geolocation not supported');
      // Fallback to default location
      setLocation({ lat: 51.5074, lon: -0.1278 });
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetch(
        `${WEATHER_API_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_API_KEY}&units=metric`
      )
        .then(response => {
          if (!response.ok) {
            throw new Error('Weather data unavailable');
          }
          return response.json();
        })
        .then(data => {
          setWeather(data);
          setError(null);
        })
        .catch(error => {
          console.error('Error fetching weather:', error);
          setError('Weather data unavailable');
        });
    }
  }, [location]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-700 p-4">
        <Card className="w-full max-w-sm bg-white/20 backdrop-blur-lg border-white/30 text-white p-6 text-center">
          <p className="text-red-300 mb-2">⚠️ {error}</p>
          <p className="text-sm text-white/70">Please enable location access and refresh</p>
        </Card>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 p-4">
        <Card className="w-full max-w-sm bg-white/20 backdrop-blur-lg border-white/30 text-white p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading weather...</p>
        </Card>
      </div>
    );
  }

  const backgroundClass = weather.weather[0].main.toLowerCase() === 'clear' 
    ? 'from-orange-400 to-pink-500'
    : weather.weather[0].main.toLowerCase() === 'rain'
    ? 'from-gray-600 to-blue-700'
    : weather.weather[0].main.toLowerCase() === 'clouds'
    ? 'from-gray-400 to-gray-600'
    : 'from-blue-400 to-purple-600';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundClass} p-4`}>
      <div className="container mx-auto max-w-md space-y-4">
        {/* Main Weather Card */}
        <Card className="w-full bg-white/20 backdrop-blur-lg border-white/30 text-white shadow-2xl">
          <div className="p-6 text-center space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h1 className="text-2xl font-bold">WeatherWave</h1>
                <p className="text-sm opacity-80">{weather.name}</p>
              </div>
              {getWeatherIcon(weather.weather[0].main)}
            </div>
            
            {/* Main Temperature */}
            <div className="space-y-2">
              <h2 className="text-5xl font-bold">
                {Math.round(weather.main.temp)}°C
              </h2>
              <p className="text-lg capitalize text-white/90">
                {weather.weather[0].description}
              </p>
              <p className="text-sm text-white/70">
                Feels like {Math.round(weather.main.feels_like)}°C
              </p>
            </div>
            
            {/* Weather Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-xs opacity-60">Humidity</span>
                </div>
                <p className="font-semibold">{weather.main.humidity}%</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Wind className="w-3 h-3 opacity-60" />
                  <span className="text-xs opacity-60">Wind</span>
                </div>
                <p className="font-semibold">{weather.wind.speed} m/s</p>
              </div>
            </div>
            
            {/* Footer */}
            <div className="pt-4 border-t border-white/20">
              <p className="text-xs opacity-60">
                Last updated: {new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Smart Notifications - Widget Version */}
        <SmartWeatherNotifications currentWeather={weather} isWidget={true} />

        {/* Health Metrics - Widget Version */}
        <HealthMetrics currentWeather={weather} isCompact={true} />

        {/* Extended Forecast - Widget Version */}
        <ExtendedForecast location={weather ? { lat: 0, lon: 0 } : null} isCompact={true} />

        {/* AI Weather Insights - Compact Version */}
        <AIWeatherInsights currentWeather={weather} isCompact={true} />
      </div>
    </div>
  );
}
