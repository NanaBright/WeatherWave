'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, TrendingUp, Calendar, Shirt, Coffee, Umbrella } from 'lucide-react';

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
  dt: number;
}

interface LocationData {
  lat: number;
  lon: number;
  city: string;
  country: string;
}

interface LocationIntelligenceProps {
  onLocationSelect: (locationData: LocationData) => void;
  currentWeather?: WeatherData | null;
}

export function LocationIntelligence({ onLocationSelect, currentWeather }: LocationIntelligenceProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [weatherHistory, setWeatherHistory] = useState<string[]>([]);
  const [clothingSuggestions, setClothingSuggestions] = useState<string[]>([]);
  const [activityRecommendations, setActivityRecommendations] = useState<string[]>([]);

  // Auto-detect user location
  const detectLocation = async () => {
    setIsDetecting(true);
    
    try {
      // Try GPS first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding to get city name
            try {
              const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'demo-key'}`
              );
              const data = await response.json();
              
              if (data && data.length > 0) {
                const locationData: LocationData = {
                  lat: latitude,
                  lon: longitude,
                  city: data[0].name,
                  country: data[0].country
                };
                
                setCurrentLocation(locationData);
                addToLocationHistory(locationData);
                onLocationSelect(locationData);
              }
            } catch (error) {
              console.error('Reverse geocoding failed:', error);
              // Fallback with coordinates only
              const locationData: LocationData = {
                lat: latitude,
                lon: longitude,
                city: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
                country: 'Unknown'
              };
              setCurrentLocation(locationData);
              onLocationSelect(locationData);
            }
            setIsDetecting(false);
          },
          (error) => {
            console.error('GPS detection failed:', error);
            // Fallback to IP-based detection
            detectLocationByIP();
          }
        );
      } else {
        // Fallback to IP-based detection
        detectLocationByIP();
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      setIsDetecting(false);
    }
  };

  // Fallback IP-based location detection
  const detectLocationByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        const locationData: LocationData = {
          lat: data.latitude,
          lon: data.longitude,
          city: data.city || 'Unknown City',
          country: data.country_name || 'Unknown Country'
        };
        
        setCurrentLocation(locationData);
        addToLocationHistory(locationData);
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('IP-based location detection failed:', error);
      // Ultimate fallback to a default location (London)
      const defaultLocation: LocationData = {
        lat: 51.5074,
        lon: -0.1278,
        city: 'London',
        country: 'United Kingdom'
      };
      setCurrentLocation(defaultLocation);
      onLocationSelect(defaultLocation);
    }
    setIsDetecting(false);
  };

  // Add location to history
  const addToLocationHistory = (location: LocationData) => {
    setLocationHistory(prev => {
      const filtered = prev.filter(loc => 
        !(loc.lat === location.lat && loc.lon === location.lon)
      );
      return [location, ...filtered].slice(0, 5); // Keep last 5 locations
    });
  };

  // Generate clothing suggestions based on weather
  const generateClothingSuggestions = (weather: WeatherData) => {
    const suggestions: string[] = [];
    const temp = weather.main.temp;
    const feelsLike = weather.main.feels_like;
    const windSpeed = weather.wind.speed;
    const condition = weather.weather[0].main.toLowerCase();

    if (temp < 0) {
      suggestions.push("🧥 Heavy winter coat, thermal layers essential");
      suggestions.push("🧤 Gloves, scarf, and warm hat are must-haves");
      suggestions.push("👢 Insulated boots to keep feet warm");
    } else if (temp < 10) {
      suggestions.push("🧥 Warm jacket or heavy sweater needed");
      suggestions.push("👖 Long pants, avoid shorts");
      if (windSpeed > 5) suggestions.push("🧣 Scarf recommended due to wind");
    } else if (temp < 20) {
      suggestions.push("👕 Light jacket or cardigan perfect");
      suggestions.push("👖 Jeans or long pants comfortable");
      if (Math.abs(temp - feelsLike) > 3) {
        suggestions.push(`🌡️ Feels like ${Math.round(feelsLike)}°C, dress accordingly`);
      }
    } else if (temp < 30) {
      suggestions.push("👕 Light clothing, t-shirt or blouse ideal");
      suggestions.push("🩳 Shorts or light pants work great");
      suggestions.push("🕶️ Sunglasses recommended for bright conditions");
    } else {
      suggestions.push("👕 Minimal, breathable clothing essential");
      suggestions.push("👒 Hat to protect from intense sun");
      suggestions.push("🥤 Stay hydrated, avoid dark colors");
    }

    if (condition.includes('rain')) {
      suggestions.push("☂️ Umbrella essential, waterproof jacket ideal");
      suggestions.push("👟 Waterproof shoes to keep feet dry");
    }

    if (weather.main.humidity > 80) {
      suggestions.push("🌫️ Moisture-wicking fabrics recommended");
    }

    setClothingSuggestions(suggestions);
  };

  // Generate activity recommendations
  const generateActivityRecommendations = (weather: WeatherData) => {
    const recommendations: string[] = [];
    const temp = weather.main.temp;
    const condition = weather.weather[0].main.toLowerCase();
    const windSpeed = weather.wind.speed;
    const hour = new Date().getHours();

    // Weather-based activities
    if (condition === 'clear' && temp >= 18 && temp <= 26) {
      recommendations.push("🏃‍♂️ Perfect weather for outdoor jogging or cycling");
      recommendations.push("🧺 Ideal conditions for a picnic in the park");
      recommendations.push("📸 Great lighting for outdoor photography");
    } else if (condition.includes('rain')) {
      recommendations.push("☕ Cozy indoor activities: coffee shop, museum, reading");
      recommendations.push("🏋️‍♀️ Indoor workout session at home or gym");
      recommendations.push("🎬 Perfect movie marathon weather");
    } else if (temp > 30) {
      recommendations.push("🏊‍♀️ Swimming or water activities to cool down");
      recommendations.push("🏢 Indoor shopping malls for air conditioning");
      recommendations.push("🌳 Seek shaded parks for outdoor activities");
    } else if (temp < 5) {
      recommendations.push("🔥 Indoor activities: cooking, board games, crafts");
      recommendations.push("☕ Hot beverages and warm indoor spaces");
      recommendations.push("📚 Reading by a warm fireplace");
    }

    // Time-based recommendations
    if (hour >= 6 && hour <= 10) {
      if (temp >= 15 && condition === 'clear') {
        recommendations.push("🌅 Morning walk to start the day energized");
      }
      recommendations.push("☕ Morning coffee with weather check");
    } else if (hour >= 17 && hour <= 20) {
      if (windSpeed < 10 && temp >= 12) {
        recommendations.push("🚶‍♀️ Evening stroll to unwind");
      }
    }

    setActivityRecommendations(recommendations);
  };

  // Generate weather history insights
  const generateWeatherHistory = () => {
    const today = new Date();
    const insights: string[] = [];
    
    // Simulated historical data (in real app, you'd fetch from weather history API)
    insights.push(`📊 This time last year: Average temp was ${Math.round(Math.random() * 10 + 15)}°C`);
    insights.push(`📈 Temperature trend: ${Math.random() > 0.5 ? 'Warmer' : 'Cooler'} than seasonal average`);
    insights.push(`🌧️ Rainfall this month: ${Math.random() > 0.3 ? 'Above' : 'Below'} average`);
    
    setWeatherHistory(insights);
  };

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
    generateWeatherHistory();
  }, []);

  // Update recommendations when weather changes
  useEffect(() => {
    if (currentWeather) {
      generateClothingSuggestions(currentWeather);
      generateActivityRecommendations(currentWeather);
    }
  }, [currentWeather]);

  return (
    <div className="space-y-3">
      {/* Location Detection Card */}
      <Card className="glass-card p-3 border-white/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Smart Location
          </h3>
          <Button
            onClick={detectLocation}
            disabled={isDetecting}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white h-6 px-2 text-xs"
          >
            {isDetecting ? "..." : "📍"}
          </Button>
        </div>
        
        {currentLocation && (
          <div className="text-xs text-white/80 mb-2">
            📍 {currentLocation.city}, {currentLocation.country}
          </div>
        )}
        
        {locationHistory.length > 1 && (
          <div className="mt-2">
            <p className="text-xs text-white/60 mb-1">Recent:</p>
            <div className="flex flex-wrap gap-1">
              {locationHistory.slice(1, 3).map((location, index) => (
                <button
                  key={index}
                  onClick={() => onLocationSelect(location)}
                  className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white/70"
                >
                  {location.city}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Clothing Suggestions - Condensed */}
      {clothingSuggestions.length > 0 && (
        <Card className="glass-card p-3 border-white/20">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Shirt className="w-4 h-4" />
            Clothing Tips
          </h3>
          <div className="space-y-1">
            {clothingSuggestions.slice(0, 2).map((suggestion, index) => (
              <div key={index} className="text-xs text-white/80 bg-blue-500/10 p-2 rounded border-l-2 border-blue-400">
                {suggestion}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Activity Recommendations - Condensed */}
      {activityRecommendations.length > 0 && (
        <Card className="glass-card p-3 border-white/20">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Coffee className="w-4 h-4" />
            Activities
          </h3>
          <div className="space-y-1">
            {activityRecommendations.slice(0, 2).map((recommendation, index) => (
              <div key={index} className="text-xs text-white/80 bg-green-500/10 p-2 rounded border-l-2 border-green-400">
                {recommendation}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
