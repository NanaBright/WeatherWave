'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloudRain, Sun, CloudSnow, Wind, Zap } from 'lucide-react';

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

interface WeatherAlert {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  time: Date;
}

interface AIWeatherInsightsProps {
  currentWeather: WeatherData | null;
  isCompact?: boolean;
}

export function AIWeatherInsights({ currentWeather, isCompact = false }: AIWeatherInsightsProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [airQuality, setAirQuality] = useState<number | null>(null);

  // AI-powered weather insights with enhanced recommendations
  const generateInsights = (weather: WeatherData) => {
    const insights: string[] = [];
    const recs: string[] = [];
    
    // Enhanced temperature insights with health recommendations
    if (weather.main.temp > 35) {
      insights.push("🌡️ Extreme heat warning! Heat stroke risk is high today.");
      recs.push("Stay indoors during peak hours (10am-4pm), drink water every 15 minutes");
    } else if (weather.main.temp > 30) {
      insights.push("🌡️ It's quite hot today! Heat index suggests staying hydrated.");
      recs.push("Wear light, breathable clothing and seek shade during peak hours");
    } else if (weather.main.temp < -10) {
      insights.push("🥶 Extreme cold! Frostbite can occur in minutes of exposure.");
      recs.push("Limit outdoor time to essentials, cover all exposed skin");
    } else if (weather.main.temp < 0) {
      insights.push("🥶 Freezing temperatures detected! Risk of hypothermia if outdoors too long.");
      recs.push("Layer up with thermal underwear and waterproof outer layers");
    } else if (weather.main.temp < 10) {
      insights.push("🧥 Quite chilly today - don't underestimate the cold!");
      recs.push("Wear warm layers and don't forget gloves and a hat");
    }

    // Enhanced humidity insights
    if (weather.main.humidity > 90) {
      insights.push("💧 Extremely high humidity - sweat won't evaporate properly!");
      recs.push("Stay in air-conditioned spaces, avoid strenuous outdoor activities");
    } else if (weather.main.humidity > 80) {
      insights.push("💧 Very high humidity levels may cause discomfort and affect cooling.");
      recs.push("Use air conditioning or fans, and wear moisture-wicking fabrics");
    } else if (weather.main.humidity < 20) {
      insights.push("🏜️ Low humidity detected - your skin and respiratory system may feel dry.");
      recs.push("Use a humidifier and apply moisturizer regularly");
    } else if (weather.main.humidity < 30) {
      insights.push("🏜️ Dry air conditions - stay hydrated and moisturized.");
      recs.push("Drink extra water and use lip balm to prevent chapping");
    }

    // Enhanced wind insights
    if (weather.wind.speed > 20) {
      insights.push("💨 Very strong winds! Potentially dangerous conditions for driving.");
      recs.push("Avoid high-profile vehicles, secure all outdoor items");
    } else if (weather.wind.speed > 15) {
      insights.push("💨 Strong winds detected! This may affect outdoor activities.");
      recs.push("Secure loose objects, be cautious when driving or walking");
    } else if (weather.wind.speed > 10) {
      insights.push("💨 Moderate winds detected! This may affect outdoor activities.");
      recs.push("Secure loose objects and be cautious when driving or walking");
    }

    // Weather condition insights
    const weatherMain = weather.weather[0].main.toLowerCase();
    if (weatherMain.includes('rain')) {
      insights.push("☔ Rain expected - visibility may be reduced and roads slippery.");
      recs.push("Carry an umbrella and drive slowly with headlights on");
    } else if (weatherMain.includes('snow')) {
      insights.push("❄️ Snow conditions - travel times may increase significantly.");
      recs.push("Allow extra travel time and keep emergency supplies in your car");
    } else if (weatherMain.includes('clear')) {
      insights.push("☀️ Clear skies provide excellent visibility and pleasant conditions.");
      recs.push("Perfect weather for outdoor activities - don't forget sunscreen!");
    }

    // Health recommendations based on weather
    if (weather.main.temp > 25 && weather.main.humidity > 70) {
      recs.push("High heat and humidity - take frequent breaks if exercising outdoors");
    }

    if (weather.visibility && weather.visibility < 1000) {
      insights.push("🌫️ Poor visibility conditions detected - be extra cautious!");
      recs.push("Use fog lights when driving and maintain safe following distances");
    }

    setInsights(insights);
    setRecommendations(recs);
  };

  // Simulate weather alerts
  const generateAlerts = (weather: WeatherData) => {
    const newAlerts: WeatherAlert[] = [];

    if (weather.main.temp > 35) {
      newAlerts.push({
        title: "Heat Warning",
        description: "Extreme heat conditions. Risk of heat exhaustion.",
        severity: 'high',
        time: new Date()
      });
    }

    if (weather.wind.speed > 15) {
      newAlerts.push({
        title: "Wind Advisory",
        description: "Strong winds may cause travel difficulties.",
        severity: 'medium',
        time: new Date()
      });
    }

    if (weather.main.humidity > 90) {
      newAlerts.push({
        title: "High Humidity",
        description: "Uncomfortable conditions for sensitive individuals.",
        severity: 'low',
        time: new Date()
      });
    }

    setAlerts(newAlerts);
  };

  // Simulate air quality data
  const fetchAirQuality = async () => {
    // In a real app, you'd fetch from an air quality API
    const simulatedAQI = Math.floor(Math.random() * 300) + 1;
    setAirQuality(simulatedAQI);
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return { level: 'Good', color: 'text-green-400', bg: 'bg-green-400/20' };
    if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', color: 'text-orange-400', bg: 'bg-orange-400/20' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-400', bg: 'bg-red-400/20' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'text-purple-400', bg: 'bg-purple-400/20' };
    return { level: 'Hazardous', color: 'text-red-600', bg: 'bg-red-600/20' };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-400 bg-red-400/10';
      case 'medium': return 'border-orange-400 bg-orange-400/10';
      case 'low': return 'border-yellow-400 bg-yellow-400/10';
      default: return 'border-blue-400 bg-blue-400/10';
    }
  };

  useEffect(() => {
    if (currentWeather) {
      generateInsights(currentWeather);
      generateAlerts(currentWeather);
      fetchAirQuality();
    }
  }, [currentWeather]);

  if (!currentWeather) return null;

  const aqiData = airQuality ? getAQILevel(airQuality) : null;

  // Compact version for widget use
  if (isCompact) {
    return (
      <div className="space-y-3">
        {/* Quick Insights */}
        <Card className="glass-card p-3 border-white/20">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
            🤖 Quick Insights
          </h3>
          <div className="space-y-1">
            {insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="text-xs text-white/80 bg-white/5 p-1.5 rounded">
                {insight}
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Recommendations */}
        <Card className="glass-card p-3 border-white/20">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
            💡 Tips
          </h3>
          <div className="space-y-1">
            {recommendations.slice(0, 1).map((rec, index) => (
              <div key={index} className="text-xs text-white/80 bg-blue-500/10 p-1.5 rounded border-l-2 border-blue-400">
                {rec}
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts if any */}
        {alerts.length > 0 && (
          <Card className="glass-card p-3 border-white/20">
            <div className={`p-2 rounded border text-xs ${getSeverityColor(alerts[0].severity)}`}>
              <div className="font-semibold text-white">{alerts[0].title}</div>
              <div className="text-white/80 mt-1">{alerts[0].description}</div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Insights Card */}
      <Card className="glass-card p-4 border-white/20">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          🤖 AI Weather Insights
        </h3>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="text-sm text-white/80 bg-white/5 p-2 rounded">
              {insight}
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations Card */}
      <Card className="glass-card p-4 border-white/20">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          💡 Smart Recommendations
        </h3>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div key={index} className="text-sm text-white/80 bg-blue-500/10 p-2 rounded border-l-2 border-blue-400">
              {rec}
            </div>
          ))}
        </div>
      </Card>

      {/* Air Quality Card */}
      {aqiData && (
        <Card className="glass-card p-4 border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3">Air Quality Index</h3>
          <div className={`p-3 rounded ${aqiData.bg}`}>
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${aqiData.color}`}>{aqiData.level}</span>
              <span className="text-white text-xl font-bold">{airQuality}</span>
            </div>
            <div className="mt-2 text-sm text-white/70">
              {airQuality && airQuality <= 50 ? "Air quality is satisfactory for most people" :
               airQuality && airQuality <= 100 ? "Air quality is acceptable for most people" :
               airQuality && airQuality <= 150 ? "Sensitive individuals should limit outdoor exposure" :
               "Everyone should limit outdoor activities"}
            </div>
          </div>
        </Card>
      )}

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <Card className="glass-card p-4 border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            ⚠️ Weather Alerts
          </h3>
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded border ${getSeverityColor(alert.severity)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-white">{alert.title}</h4>
                    <p className="text-sm text-white/80 mt-1">{alert.description}</p>
                  </div>
                  <span className="text-xs text-white/60">
                    {alert.time.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weather Impact on Activities */}
      <Card className="glass-card p-4 border-white/20">
        <h3 className="text-lg font-semibold text-white mb-3">Activity Recommendations</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-lg mb-1">🏃‍♂️</div>
            <div className="text-xs text-white/80">
              {currentWeather.main.temp > 30 ? "Indoor Exercise" : 
               currentWeather.main.temp < 0 ? "Bundle Up" : "Perfect for Running"}
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-lg mb-1">🚗</div>
            <div className="text-xs text-white/80">
              {currentWeather.wind.speed > 10 ? "Drive Carefully" :
               currentWeather.weather[0].main.includes('Rain') ? "Use Headlights" : "Good Driving"}
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-lg mb-1">🌱</div>
            <div className="text-xs text-white/80">
              {currentWeather.weather[0].main.includes('Rain') ? "No Watering Needed" : "Water Plants"}
            </div>
          </div>
          <div className="bg-white/5 p-2 rounded text-center">
            <div className="text-lg mb-1">📸</div>
            <div className="text-xs text-white/80">
              {currentWeather.weather[0].main === 'Clear' ? "Perfect Photos" : "Indoor Photography"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
