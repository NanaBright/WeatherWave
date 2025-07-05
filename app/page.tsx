'use client';

import { useState } from 'react';
import { SearchLocation } from '@/components/search';
import { WeatherCard } from '@/components/weather-card';
import { WeatherDetails } from '@/components/weather-details';
import { DailyQuote } from '@/components/daily-quote';
import { WEATHER_API_URL, WEATHER_API_KEY } from '@/app/api';
import { UserMenu } from '@/components/user-menu';
import { EnhancedMusicPlayer } from '@/components/enhanced-music-player';
import { BackgroundSlider } from "@/components/background-slider";
import { AIWeatherInsights } from '@/components/ai-weather-insights';
import { SmartWeatherNotifications } from '@/components/smart-weather-notifications';
import { LocationIntelligence } from '@/components/location-intelligence';
import { HealthMetrics } from '@/components/health-metrics';
import { ExtendedForecast } from '@/components/extended-forecast';
import { WeatherShare } from '@/components/weather-share';


export default function Home() {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lon: number} | null>(null);

  // Handle location selection from LocationIntelligence component
  const handleLocationSelect = (locationData: { lat: number; lon: number; city: string; country: string }) => {
    setCurrentLocation({ lat: locationData.lat, lon: locationData.lon });
    
    // Fetch weather for the selected location
    const currentWeatherFetch = fetch(
      `${WEATHER_API_URL}/weather?lat=${locationData.lat}&lon=${locationData.lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const forecastFetch = fetch(
      `${WEATHER_API_URL}/forecast?lat=${locationData.lat}&lon=${locationData.lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    Promise.all([currentWeatherFetch, forecastFetch])
      .then(async (response) => {
        const weatherResponse = await response[0].json();
        const forecastResponse = await response[1].json();

        // Add coordinates to weather data for health metrics
        weatherResponse.coord = { lat: locationData.lat, lon: locationData.lon };
        
        setCurrentWeather({ city: locationData.city, ...weatherResponse });
        setForecast({ city: locationData.city, ...forecastResponse });
      })
      .catch((err) => console.error(err));
  };

  // Handle the search data when a city is selected (existing search functionality)
  const handleOnSearchChange = (searchData: { value: string; label: string }) => {
    const [lat, lon] = searchData.value.split(" ");
    setCurrentLocation({ lat: parseFloat(lat), lon: parseFloat(lon) });

    // Fetch current weather and forecast
    const currentWeatherFetch = fetch(
      `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const forecastFetch = fetch(
      `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
    );

    Promise.all([currentWeatherFetch, forecastFetch])
      .then(async (response) => {
        const weatherResponse = await response[0].json();
        const forecastResponse = await response[1].json();

        // Add coordinates to weather data
        weatherResponse.coord = { lat: parseFloat(lat), lon: parseFloat(lon) };

        // Update the state with the fetched data
        setCurrentWeather({ city: searchData.label, ...weatherResponse });
        setForecast({ city: searchData.label, ...forecastResponse });
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <BackgroundSlider />
      <main className="min-h-screen relative overflow-x-hidden">
        <div className="container mx-auto max-w-7xl p-2 sm:p-4 py-4 sm:py-8">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-start justify-center">
            {/* Main Content */}
            <div className="flex-1 lg:max-w-4xl w-full">
             
              <div className="flex flex-col items-center gap-6 sm:gap-8 w-full">
                {/* City Search */}
                <SearchLocation onSearchChange={handleOnSearchChange} />

              <div className="w-full space-y-4 sm:space-y-6">
                {/* Current Weather */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 text-center space-y-4">
                  <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight">
                    {currentWeather && Math.round(currentWeather.main.temp)}° </h1>

                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl text-white/90">
                      {currentWeather && currentWeather.weather[0].description}
                    </h2>
                    <p className="text-white/70">
                      {currentWeather && new Date(currentWeather.dt * 1000).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                </div>

                {/* Daily Quote */}
                <DailyQuote />

                {/* Smart Weather Notifications */}
                {currentWeather && (
                  <SmartWeatherNotifications currentWeather={currentWeather} />
                )}

                {/* Weather Details */}
                {currentWeather && (
                  <WeatherDetails
                    humidity={currentWeather.main.humidity}
                    windSpeed={currentWeather.wind.speed}
                    cloudCover={currentWeather.clouds.all}
                  />
                )}

                {/* AI Weather Insights */}
                {currentWeather && (
                  <AIWeatherInsights currentWeather={currentWeather} />
                )}

                {/* Health Metrics - Full Version */}
                {currentWeather && (
                  <HealthMetrics currentWeather={currentWeather} />
                )}

                {/* Extended Forecast - Full Version */}
                <ExtendedForecast location={currentLocation} />

                {/* Hourly Forecast */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white/90">Today&apos;s Forecast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {/* Render weather cards dynamically if forecast data is available */}
                    {forecast && forecast.list.slice(0, 4).map((item: any, index: number) => (
                      <WeatherCard
                        key={index}
                        temperature={Math.round(item.main.temp)}
                        condition={item.weather[0].description}
                        time={new Date(item.dt * 1000).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        isNow={index === 0} // Assuming the first one is the current time
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile Music Player - Inline on mobile */}
                <div className="lg:hidden">
                  <EnhancedMusicPlayer />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Desktop only */}
          <aside className="hidden lg:block lg:w-80 lg:flex-shrink-0">
            <div className="sticky top-4 space-y-3 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {/* User Menu */}
              <div className="flex justify-end">
                <UserMenu />
              </div>
              
              {/* Sidebar Components */}
              <div className="space-y-3">
                {/* Location Intelligence */}
                <LocationIntelligence 
                  onLocationSelect={handleLocationSelect} 
                  currentWeather={currentWeather}
                />
                
                {/* Health Metrics - Compact */}
                {currentWeather && (
                  <HealthMetrics currentWeather={currentWeather} isCompact={true} />
                )}
                
                {/* Extended Forecast - Compact */}
                <ExtendedForecast location={currentLocation} isCompact={true} />
                
                {/* Weather Share */}
                {currentWeather && (
                  <WeatherShare currentWeather={currentWeather} forecast={forecast} />
                )}
                
                {/* Music Player - Desktop */}
                <EnhancedMusicPlayer />

                {/* Bottom padding for better scrolling */}
                <div className="h-4"></div>
              </div>
            </div>
          </aside>
          </div>
        </div>
      </main>
    </>
  );
}
