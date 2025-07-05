'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Sun, Wind, Eye, AlertTriangle, Shield, Heart } from 'lucide-react';

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
  coord?: {
    lat: number;
    lon: number;
  };
}

interface HealthMetricsProps {
  currentWeather: WeatherData | null;
  isCompact?: boolean;
}

interface UVData {
  value: number;
  level: string;
  recommendation: string;
  color: string;
  bgColor: string;
}

interface AirQualityData {
  aqi: number;
  level: string;
  healthAdvice: string;
  color: string;
  bgColor: string;
  components: {
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
  };
}

export function HealthMetrics({ currentWeather, isCompact = false }: HealthMetricsProps) {
  const [uvData, setUvData] = useState<UVData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [pollenCount, setPollenCount] = useState<number | null>(null);
  const [healthAlerts, setHealthAlerts] = useState<string[]>([]);

  // Get UV Index data
  const fetchUVData = async (lat: number, lon: number) => {
    try {
      // In real app, you'd fetch from UV API
      // For demo, we'll simulate UV data
      const simulatedUV = Math.floor(Math.random() * 11) + 1;
      const uvData = getUVLevel(simulatedUV);
      setUvData(uvData);
    } catch (error) {
      console.error('Failed to fetch UV data:', error);
    }
  };

  // Get Air Quality data
  const fetchAirQuality = async (lat: number, lon: number) => {
    try {
      // Simulate air quality data (in real app, use OpenWeatherMap Air Pollution API)
      const simulatedAQI = Math.floor(Math.random() * 300) + 1;
      const aqData = getAirQualityLevel(simulatedAQI);
      setAirQuality(aqData);
    } catch (error) {
      console.error('Failed to fetch air quality data:', error);
    }
  };

  // Generate pollen count
  const generatePollenData = () => {
    const today = new Date();
    const month = today.getMonth();
    
    // Higher pollen in spring/summer months
    let basePollen = 1;
    if (month >= 2 && month <= 5) basePollen = 8; // Spring
    else if (month >= 6 && month <= 8) basePollen = 6; // Summer
    else if (month >= 9 && month <= 10) basePollen = 4; // Fall
    
    const pollen = Math.floor(Math.random() * 5) + basePollen;
    setPollenCount(Math.min(pollen, 10));
  };

  // Generate health alerts based on all metrics
  const generateHealthAlerts = (weather: WeatherData, uv: UVData | null, aqi: AirQualityData | null) => {
    const alerts: string[] = [];
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;

    // Temperature-based health alerts
    if (temp > 35) {
      alerts.push("🚨 Extreme heat warning: Risk of heat stroke. Stay indoors, drink water frequently.");
    } else if (temp > 30) {
      alerts.push("⚠️ High temperature: Take frequent breaks, avoid prolonged sun exposure.");
    } else if (temp < -5) {
      alerts.push("🥶 Extreme cold: Risk of frostbite. Limit outdoor exposure, cover all skin.");
    }

    // UV-based alerts
    if (uv && uv.value >= 8) {
      alerts.push("☀️ Very high UV: Wear SPF 30+, hat, and sunglasses. Seek shade 10am-4pm.");
    } else if (uv && uv.value >= 6) {
      alerts.push("🌞 High UV: Sunscreen recommended, wear protective clothing.");
    }

    // Air quality alerts
    if (aqi && aqi.aqi > 150) {
      alerts.push("💨 Unhealthy air quality: Wear mask outdoors, limit physical activities.");
    } else if (aqi && aqi.aqi > 100) {
      alerts.push("😷 Moderate air quality: Sensitive individuals should limit outdoor exposure.");
    }

    // Humidity health effects
    if (humidity > 85 && temp > 25) {
      alerts.push("💧 High humidity + heat: Increased risk of dehydration and heat exhaustion.");
    } else if (humidity < 30) {
      alerts.push("🏜️ Low humidity: May cause dry skin, eyes, and respiratory irritation.");
    }

    // Pollen alerts
    if (pollenCount && pollenCount >= 8) {
      alerts.push("🌸 High pollen count: Allergy sufferers should take precautions.");
    }

    setHealthAlerts(alerts);
  };

  const getUVLevel = (uvIndex: number): UVData => {
    if (uvIndex <= 2) {
      return {
        value: uvIndex,
        level: 'Low',
        recommendation: 'No protection needed. Safe for outdoor activities.',
        color: 'text-green-400',
        bgColor: 'bg-green-400/20'
      };
    } else if (uvIndex <= 5) {
      return {
        value: uvIndex,
        level: 'Moderate',
        recommendation: 'Some protection required. Wear sunscreen SPF 15+.',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/20'
      };
    } else if (uvIndex <= 7) {
      return {
        value: uvIndex,
        level: 'High',
        recommendation: 'Protection essential. SPF 30+, hat, sunglasses.',
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/20'
      };
    } else if (uvIndex <= 10) {
      return {
        value: uvIndex,
        level: 'Very High',
        recommendation: 'Extra protection needed. Avoid sun 10am-4pm.',
        color: 'text-red-400',
        bgColor: 'bg-red-400/20'
      };
    } else {
      return {
        value: uvIndex,
        level: 'Extreme',
        recommendation: 'Stay indoors. UV radiation is dangerous.',
        color: 'text-purple-400',
        bgColor: 'bg-purple-400/20'
      };
    }
  };

  const getAirQualityLevel = (aqi: number): AirQualityData => {
    let level: string, healthAdvice: string, color: string, bgColor: string;
    
    if (aqi <= 50) {
      level = 'Good';
      healthAdvice = 'Air quality is excellent. Perfect for outdoor activities.';
      color = 'text-green-400';
      bgColor = 'bg-green-400/20';
    } else if (aqi <= 100) {
      level = 'Moderate';
      healthAdvice = 'Air quality is acceptable for most people.';
      color = 'text-yellow-400';
      bgColor = 'bg-yellow-400/20';
    } else if (aqi <= 150) {
      level = 'Unhealthy for Sensitive Groups';
      healthAdvice = 'Sensitive individuals should limit prolonged outdoor exposure.';
      color = 'text-orange-400';
      bgColor = 'bg-orange-400/20';
    } else if (aqi <= 200) {
      level = 'Unhealthy';
      healthAdvice = 'Everyone should limit outdoor activities.';
      color = 'text-red-400';
      bgColor = 'bg-red-400/20';
    } else if (aqi <= 300) {
      level = 'Very Unhealthy';
      healthAdvice = 'Health warnings. Everyone should avoid outdoor exposure.';
      color = 'text-purple-400';
      bgColor = 'bg-purple-400/20';
    } else {
      level = 'Hazardous';
      healthAdvice = 'Emergency conditions. Stay indoors with air purification.';
      color = 'text-red-600';
      bgColor = 'bg-red-600/20';
    }

    return {
      aqi,
      level,
      healthAdvice,
      color,
      bgColor,
      components: {
        pm25: Math.floor(Math.random() * 50) + 10,
        pm10: Math.floor(Math.random() * 100) + 20,
        no2: Math.floor(Math.random() * 200) + 50,
        o3: Math.floor(Math.random() * 300) + 100
      }
    };
  };

  const getPollenLevel = (count: number) => {
    if (count <= 2) return { level: 'Low', color: 'text-green-400', bgColor: 'bg-green-400/20' };
    if (count <= 5) return { level: 'Moderate', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' };
    if (count <= 7) return { level: 'High', color: 'text-orange-400', bgColor: 'bg-orange-400/20' };
    return { level: 'Very High', color: 'text-red-400', bgColor: 'bg-red-400/20' };
  };

  useEffect(() => {
    if (currentWeather && currentWeather.coord) {
      fetchUVData(currentWeather.coord.lat, currentWeather.coord.lon);
      fetchAirQuality(currentWeather.coord.lat, currentWeather.coord.lon);
    }
    generatePollenData();
  }, [currentWeather]);

  useEffect(() => {
    if (currentWeather) {
      generateHealthAlerts(currentWeather, uvData, airQuality);
    }
  }, [currentWeather, uvData, airQuality, pollenCount]);

  if (!currentWeather) return null;

  // Compact version for widget
  if (isCompact) {
    return (
      <div className="space-y-3">
        {/* Health Alerts */}
        {healthAlerts.length > 0 && (
          <Card className="glass-card p-3 border-white/20">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1">
              <Heart className="w-4 h-4" />
              Health Alert
            </h3>
            <div className="text-xs text-white/80 bg-red-500/10 p-2 rounded border-l-2 border-red-400">
              {healthAlerts[0]}
            </div>
          </Card>
        )}

        {/* Quick UV & AQI */}
        <Card className="glass-card p-3 border-white/20">
          <div className="grid grid-cols-2 gap-3 text-center">
            {uvData && (
              <div className={`p-2 rounded ${uvData.bgColor}`}>
                <div className={`text-xs font-semibold ${uvData.color}`}>UV Index</div>
                <div className="text-white text-lg font-bold">{uvData.value}</div>
                <div className={`text-xs ${uvData.color}`}>{uvData.level}</div>
              </div>
            )}
            
            {airQuality && (
              <div className={`p-2 rounded ${airQuality.bgColor}`}>
                <div className={`text-xs font-semibold ${airQuality.color}`}>Air Quality</div>
                <div className="text-white text-lg font-bold">{airQuality.aqi}</div>
                <div className={`text-xs ${airQuality.color}`}>{airQuality.level.split(' ')[0]}</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Full version for main app
  return (
    <div className="space-y-4">
      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <Card className="glass-card p-4 border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5" />
            Health Alerts
          </h3>
          <div className="space-y-2">
            {healthAlerts.map((alert, index) => (
              <div key={index} className="text-sm text-white/80 bg-red-500/10 p-3 rounded border-l-2 border-red-400">
                {alert}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* UV Index */}
      {uvData && (
        <Card className="glass-card p-4 border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Sun className="w-5 h-5" />
            UV Index
          </h3>
          <div className={`p-4 rounded ${uvData.bgColor}`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`font-semibold text-lg ${uvData.color}`}>{uvData.level}</span>
              <span className="text-white text-2xl font-bold">{uvData.value}</span>
            </div>
            <p className="text-sm text-white/80">{uvData.recommendation}</p>
          </div>
        </Card>
      )}

      {/* Air Quality */}
      {airQuality && (
        <Card className="glass-card p-4 border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Wind className="w-5 h-5" />
            Air Quality Index
          </h3>
          <div className={`p-4 rounded ${airQuality.bgColor} mb-3`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`font-semibold ${airQuality.color}`}>{airQuality.level}</span>
              <span className="text-white text-2xl font-bold">{airQuality.aqi}</span>
            </div>
            <p className="text-sm text-white/80">{airQuality.healthAdvice}</p>
          </div>
          
          {/* Air Quality Components */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 p-2 rounded">
              <div className="text-white/60">PM2.5</div>
              <div className="text-white font-semibold">{airQuality.components.pm25} μg/m³</div>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <div className="text-white/60">PM10</div>
              <div className="text-white font-semibold">{airQuality.components.pm10} μg/m³</div>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <div className="text-white/60">NO2</div>
              <div className="text-white font-semibold">{airQuality.components.no2} μg/m³</div>
            </div>
            <div className="bg-white/5 p-2 rounded">
              <div className="text-white/60">O3</div>
              <div className="text-white font-semibold">{airQuality.components.o3} μg/m³</div>
            </div>
          </div>
        </Card>
      )}

      {/* Pollen Count */}
      {pollenCount !== null && (
        <Card className="glass-card p-4 border-white/20">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            🌸 Pollen Count
          </h3>
          <div className={`p-3 rounded ${getPollenLevel(pollenCount).bgColor}`}>
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${getPollenLevel(pollenCount).color}`}>
                {getPollenLevel(pollenCount).level}
              </span>
              <span className="text-white text-xl font-bold">{pollenCount}/10</span>
            </div>
            <div className="mt-2 text-sm text-white/70">
              {pollenCount >= 8 ? "High pollen levels - allergy sufferers take precautions" :
               pollenCount >= 5 ? "Moderate pollen - some people may experience symptoms" :
               "Low pollen levels - generally comfortable for most people"}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
