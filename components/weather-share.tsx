'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Download, Copy, Camera } from 'lucide-react';

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
  name: string;
  dt: number;
}

interface WeatherShareProps {
  currentWeather: WeatherData | null;
  forecast?: any;
}

export function WeatherShare({ currentWeather, forecast }: WeatherShareProps) {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate shareable weather snapshot
  const generateWeatherSnapshot = async () => {
    if (!currentWeather) return;

    setIsGenerating(true);
    
    // Create a weather summary text
    const weatherSummary = createWeatherSummary();
    
    // In a real app, you might generate an image or use a service
    // For now, we'll create a shareable text with URL
    const currentUrl = window.location.origin;
    const shareableUrl = `${currentUrl}?weather=${encodeURIComponent(weatherSummary)}`;
    
    setShareUrl(shareableUrl);
    setIsGenerating(false);
  };

  const createWeatherSummary = (): string => {
    if (!currentWeather) return '';

    const temp = Math.round(currentWeather.main.temp);
    const condition = currentWeather.weather[0].description;
    const location = currentWeather.name;
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `🌤️ Weather in ${location} on ${date}:
${temp}°C - ${condition}
Feels like ${Math.round(currentWeather.main.feels_like)}°C
Humidity: ${currentWeather.main.humidity}%
Wind: ${currentWeather.wind.speed} m/s

Check out WeatherWave for smart weather insights! 🌊`;
  };

  // Share to social media
  const shareToSocial = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const weatherText = createWeatherSummary();
    const currentUrl = window.location.origin;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(weatherText)}&url=${encodeURIComponent(currentUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(weatherText)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(weatherText + '\n\n' + currentUrl)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    const weatherText = createWeatherSummary();
    try {
      await navigator.clipboard.writeText(weatherText);
      // You could show a toast notification here
      alert('Weather summary copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Generate and download weather image (placeholder)
  const downloadWeatherImage = () => {
    if (!currentWeather) return;
    
    // Create a canvas element for the weather image
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Create gradient background based on weather
    const weather = currentWeather.weather[0].main.toLowerCase();
    let gradient;
    
    if (weather === 'clear') {
      gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#FFA500');
    } else if (weather === 'rain') {
      gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#4A5568');
      gradient.addColorStop(1, '#2D3748');
    } else {
      gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#718096');
      gradient.addColorStop(1, '#4A5568');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add weather information
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(currentWeather.main.temp)}°C`, canvas.width / 2, 200);
    
    ctx.font = '24px Arial';
    ctx.fillText(currentWeather.weather[0].description, canvas.width / 2, 250);
    ctx.fillText(currentWeather.name, canvas.width / 2, 300);
    
    ctx.font = '18px Arial';
    ctx.fillText(`Feels like ${Math.round(currentWeather.main.feels_like)}°C`, canvas.width / 2, 350);
    ctx.fillText(`Humidity: ${currentWeather.main.humidity}%`, canvas.width / 2, 380);
    ctx.fillText(`Wind: ${currentWeather.wind.speed} m/s`, canvas.width / 2, 410);
    
    // Add date
    const date = new Date().toLocaleDateString();
    ctx.font = '16px Arial';
    ctx.fillText(date, canvas.width / 2, 480);
    
    // Add branding
    ctx.font = 'bold 20px Arial';
    ctx.fillText('WeatherWave 🌊', canvas.width / 2, 550);
    
    // Download the image
    const link = document.createElement('a');
    link.download = `weather-${currentWeather.name}-${date.replace(/\//g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Share via Web Share API (mobile)
  const shareViaWebAPI = async () => {
    if (!navigator.share) {
      copyToClipboard();
      return;
    }

    const weatherText = createWeatherSummary();
    
    try {
      await navigator.share({
        title: 'Weather Update',
        text: weatherText,
        url: window.location.origin
      });
    } catch (err) {
      console.error('Error sharing:', err);
      copyToClipboard();
    }
  };

  if (!currentWeather) return null;

  return (
    <Card className="glass-card p-3 border-white/20">
      <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        Share Weather
      </h3>
      
      <div className="space-y-2">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={shareViaWebAPI}
            variant="ghost"
            size="sm"
            className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 h-8"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
          
          <Button
            onClick={copyToClipboard}
            variant="ghost"
            size="sm"
            className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 h-8"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
        </div>

        {/* Download Weather Image */}
        <Button
          onClick={downloadWeatherImage}
          variant="ghost"
          size="sm"
          className="w-full text-xs text-white/80 hover:text-white bg-purple-500/20 hover:bg-purple-500/30 h-8"
        >
          <Camera className="w-3 h-3 mr-1" />
          Download Image
        </Button>
      </div>
    </Card>
  );
}
