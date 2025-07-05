'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from 'lucide-react';

interface ForecastData {
  date: Date;
  temp: {
    day: number;
    night: number;
    min: number;
    max: number;
  };
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  precipitation: number;
  uvIndex: number;
}

interface ExtendedForecastProps {
  location?: { lat: number; lon: number } | null;
  isCompact?: boolean;
}

export function ExtendedForecast({ location, isCompact = false }: ExtendedForecastProps) {
  const [forecast7Day, setForecast7Day] = useState<ForecastData[]>([]);
  const [forecast14Day, setForecast14Day] = useState<ForecastData[]>([]);
  const [selectedRange, setSelectedRange] = useState<'7day' | '14day'>('7day');
  const [isLoading, setIsLoading] = useState(false);

  // Generate realistic forecast data
  const generateForecastData = (days: number): ForecastData[] => {
    const forecast: ForecastData[] = [];
    const today = new Date();
    
    // Base temperature around current season
    const month = today.getMonth();
    let baseTemp = 20; // Default
    
    if (month >= 11 || month <= 1) baseTemp = 5;   // Winter
    else if (month >= 2 && month <= 4) baseTemp = 15; // Spring
    else if (month >= 5 && month <= 7) baseTemp = 25; // Summer
    else baseTemp = 18; // Fall

    const conditions = ['clear', 'clouds', 'rain', 'drizzle'];
    const conditionWeights = [0.4, 0.3, 0.2, 0.1]; // Clear weather is more likely

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Add some temperature variation
      const tempVariation = (Math.random() - 0.5) * 10;
      const dayTemp = baseTemp + tempVariation;
      const nightTemp = dayTemp - (Math.random() * 8 + 2);
      
      // Choose weather condition based on weights
      const random = Math.random();
      let selectedCondition = 'clear';
      let cumulativeWeight = 0;
      
      for (let j = 0; j < conditions.length; j++) {
        cumulativeWeight += conditionWeights[j];
        if (random <= cumulativeWeight) {
          selectedCondition = conditions[j];
          break;
        }
      }

      // Adjust precipitation based on condition
      let precipitation = 0;
      if (selectedCondition === 'rain') precipitation = Math.random() * 10 + 5;
      else if (selectedCondition === 'drizzle') precipitation = Math.random() * 3 + 1;
      else if (selectedCondition === 'clouds' && Math.random() > 0.7) precipitation = Math.random() * 2;

      forecast.push({
        date,
        temp: {
          day: Math.round(dayTemp),
          night: Math.round(nightTemp),
          min: Math.round(Math.min(dayTemp, nightTemp) - 2),
          max: Math.round(Math.max(dayTemp, nightTemp) + 2)
        },
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.random() * 15 + 2, // 2-17 m/s
        condition: selectedCondition,
        description: getWeatherDescription(selectedCondition),
        precipitation,
        uvIndex: Math.floor(Math.random() * 8) + 1 // 1-8
      });
    }

    return forecast;
  };

  const getWeatherDescription = (condition: string): string => {
    const descriptions: Record<string, string[]> = {
      clear: ['Clear sky', 'Sunny', 'Bright sunshine'],
      clouds: ['Partly cloudy', 'Overcast', 'Cloudy skies'],
      rain: ['Light rain', 'Heavy rain', 'Showers'],
      drizzle: ['Light drizzle', 'Misty rain', 'Fine rain']
    };

    const options = descriptions[condition] || ['Mild weather'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const getWeatherIcon = (condition: string) => {
    const iconClass = "w-6 h-6 text-white";
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun className={iconClass} />;
      case 'rain':
        return <CloudRain className={iconClass} />;
      case 'drizzle':
        return <Droplets className={iconClass} />;
      case 'clouds':
        return <Cloud className={iconClass} />;
      default:
        return <Sun className={iconClass} />;
    }
  };

  const getTemperatureTrend = (forecast: ForecastData[]) => {
    if (forecast.length < 2) return 'stable';
    
    const firstTemp = forecast[0].temp.day;
    const lastTemp = forecast[forecast.length - 1].temp.day;
    const difference = lastTemp - firstTemp;
    
    if (difference > 3) return 'warming';
    if (difference < -3) return 'cooling';
    return 'stable';
  };

  const getWeeklyHighlights = (forecast: ForecastData[]) => {
    const highlights: string[] = [];
    
    if (forecast.length === 0) return highlights;
    
    // Find hottest and coldest days
    const temps = forecast.map(day => day.temp.max);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    const maxTempDay = forecast[temps.indexOf(maxTemp)];
    const minTempDay = forecast[temps.indexOf(minTemp)];
    
    if (maxTempDay && minTempDay) {
      highlights.push(`🌡️ Hottest: ${maxTemp}°C on ${maxTempDay.date?.toLocaleDateString('en-US', { weekday: 'short' }) || 'Unknown'}`);
      highlights.push(`❄️ Coolest: ${minTemp}°C on ${minTempDay.date?.toLocaleDateString('en-US', { weekday: 'short' }) || 'Unknown'}`);
    }
    
    // Find rainiest day
    const rainyDays = forecast.filter(day => day.precipitation > 0);
    if (rainyDays.length > 0) {
      const rainiestDay = rainyDays.reduce((prev, current) => 
        prev.precipitation > current.precipitation ? prev : current
      );
      highlights.push(`🌧️ Rainiest: ${rainiestDay.precipitation.toFixed(1)}mm on ${rainiestDay.date?.toLocaleDateString('en-US', { weekday: 'short' }) || 'Unknown'}`);
    } else {
      highlights.push('☀️ No rain expected this week');
    }
    
    // UV warnings
    const highUVDays = forecast.filter(day => day.uvIndex >= 6);
    if (highUVDays.length > 0) {
      highlights.push(`☀️ High UV expected on ${highUVDays.length} day(s)`);
    }
    
    return highlights;
  };

  useEffect(() => {
    setIsLoading(true);
    const forecast7 = generateForecastData(7);
    const forecast14 = generateForecastData(14);
    
    setForecast7Day(forecast7);
    setForecast14Day(forecast14);
    setIsLoading(false);
  }, [location]);

  const currentForecast = selectedRange === '7day' ? forecast7Day : forecast14Day;
  const temperatureTrend = getTemperatureTrend(currentForecast);
  const weeklyHighlights = getWeeklyHighlights(currentForecast.slice(0, 7));

  if (isLoading) {
    return (
      <Card className="glass-card p-4 border-white/20">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Compact version for widget
  if (isCompact) {
    return (
      <Card className="glass-card p-3 border-white/20">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          3-Day Outlook
        </h3>
        <div className="space-y-2">
          {currentForecast.slice(0, 3).map((day, index) => (
            <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded">
              <div className="flex items-center gap-2">
                {getWeatherIcon(day.condition)}
                <div>
                  <div className="text-xs text-white font-semibold">
                    {day.date?.toLocaleDateString('en-US', { weekday: 'short' }) || `Day ${index + 1}`}
                  </div>
                  <div className="text-xs text-white/70">{day.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{day.temp.max}°</div>
                <div className="text-xs text-white/60">{day.temp.min}°</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Full version for main app
  return (
    <div className="space-y-4">
      {/* Forecast Range Selector */}
      <Card className="glass-card p-4 border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Extended Forecast
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setSelectedRange('7day')}
              variant={selectedRange === '7day' ? 'default' : 'ghost'}
              size="sm"
              className="text-white"
            >
              7 Days
            </Button>
            <Button
              onClick={() => setSelectedRange('14day')}
              variant={selectedRange === '14day' ? 'default' : 'ghost'}
              size="sm"
              className="text-white"
            >
              14 Days
            </Button>
          </div>
        </div>

        {/* Temperature Trend */}
        <div className="mb-4 p-3 bg-white/5 rounded">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <TrendingUp className="w-4 h-4" />
            <span>
              Temperature trend: {
                temperatureTrend === 'warming' ? '📈 Getting warmer' :
                temperatureTrend === 'cooling' ? '📉 Getting cooler' : 
                '➡️ Staying stable'
              }
            </span>
          </div>
        </div>

        {/* Forecast List */}
        <div className="space-y-2">
          {currentForecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                {getWeatherIcon(day.condition)}
                <div>
                  <div className="text-white font-semibold">
                    {index === 0 ? 'Today' : 
                     index === 1 ? 'Tomorrow' : 
                     day.date?.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) || `Day ${index + 1}`
                    }
                  </div>
                  <div className="text-sm text-white/70">{day.description}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Precipitation */}
                {day.precipitation > 0 && (
                  <div className="text-center">
                    <Droplets className="w-4 h-4 text-blue-400 mx-auto" />
                    <div className="text-xs text-white/60">{day.precipitation.toFixed(1)}mm</div>
                  </div>
                )}
                
                {/* Wind */}
                <div className="text-center">
                  <Wind className="w-4 h-4 text-white/60 mx-auto" />
                  <div className="text-xs text-white/60">{day.windSpeed.toFixed(0)} m/s</div>
                </div>
                
                {/* Temperature */}
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{day.temp.max}°</div>
                  <div className="text-sm text-white/60">{day.temp.min}°</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Highlights */}
      <Card className="glass-card p-4 border-white/20">
        <h3 className="text-lg font-semibold text-white mb-3">Week Highlights</h3>
        <div className="space-y-2">
          {weeklyHighlights.map((highlight, index) => (
            <div key={index} className="text-sm text-white/80 bg-blue-500/10 p-2 rounded">
              {highlight}
            </div>
          ))}
        </div>
      </Card>

      {/* Weather Summary Chart */}
      <Card className="glass-card p-4 border-white/20">
        <h3 className="text-lg font-semibold text-white mb-3">Temperature Trend</h3>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {forecast7Day.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-white/60 mb-1">
                {day.date?.toLocaleDateString('en-US', { weekday: 'short' }) || `Day ${index + 1}`}
              </div>
              <div className="relative bg-white/10 rounded h-20 flex flex-col justify-end">
                <div 
                  className="bg-gradient-to-t from-orange-400/60 to-orange-400/30 rounded"
                  style={{ height: `${Math.max(20, (day.temp.max / 40) * 100)}%` }}
                ></div>
                <div className="text-xs text-white font-semibold mt-1">{day.temp.max}°</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
