'use client';

import { useState } from 'react';
import { SearchLocation } from '@/components/search';
import { WeatherCard } from '@/components/weather-card';
import { WeatherDetails } from '@/components/weather-details';
import { DailyQuote } from '@/components/daily-quote';
import { WEATHER_API_URL, WEATHER_API_KEY } from '@/app/api';
import { UserMenu } from '@/components/user-menu';
import { MusicPlayer } from '@/components/music-player';

export default function Home() {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);

  // Handle the search data when a city is selected
  const handleOnSearchChange = (searchData: { value: string; label: string }) => {
    const [lat, lon] = searchData.value.split(" ");

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

        // Update the state with the fetched data
        setCurrentWeather({ city: searchData.label, ...weatherResponse });
        setForecast({ city: searchData.label, ...forecastResponse });
      })
      .catch((err) => console.error(err));
  };

  return (
    <main className="min-h-screen gradient-bg p-4 py-8">
      <div className="container mx-auto flex gap-4">
        {/* Main Content (shifted to the left) */}
        <div className="flex-grow max-w-4xl mx-auto">
         
          <div className="flex flex-col items-center gap-8">
            {/* City Search */}
            <SearchLocation onSearchChange={handleOnSearchChange} />

            <div className="w-full space-y-6">
              {/* Current Weather */}
              <div className="glass-card rounded-2xl p-8 text-center space-y-4">
                <h1 className="text-7xl font-bold text-white tracking-tight">
                  {currentWeather && Math.round(currentWeather.main.temp)}° </h1>

                <div className="space-y-1">
                  <h2 className="text-2xl text-white/90">
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

              {/* Weather Details */}
              {currentWeather && (
                <WeatherDetails
                  humidity={currentWeather.main.humidity}
                  windSpeed={currentWeather.wind.speed}
                  cloudCover={currentWeather.clouds.all}
                />
              )}

              {/* Hourly Forecast */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/90">Today&apos;s Forecast</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 p-4">
          <div className="flex justify-end mb-4">
            <UserMenu />
          </div>
          <MusicPlayer />
        </aside>
      </div>
    </main>
  );
}
