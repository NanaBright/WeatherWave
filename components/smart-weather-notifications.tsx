'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';

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

interface SmartNotification {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  action?: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

interface SmartWeatherNotificationsProps {
  currentWeather: WeatherData | null;
  isWidget?: boolean;
}

export function SmartWeatherNotifications({ currentWeather, isWidget = false }: SmartWeatherNotificationsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const generateSmartNotifications = (weather: WeatherData) => {
    const newNotifications: SmartNotification[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Morning recommendations (6 AM - 10 AM)
    if (hour >= 6 && hour <= 10) {
      if (weather.main.temp < 5) {
        newNotifications.push({
          id: 'morning-cold',
          type: 'warning',
          title: 'Chilly Morning',
          message: 'Bundle up before heading out! Consider wearing extra layers.',
          action: 'Set Reminder',
          timestamp: now,
          priority: 'medium'
        });
      } else if (weather.main.temp > 25) {
        newNotifications.push({
          id: 'morning-hot',
          type: 'info',
          title: 'Warm Start',
          message: 'Perfect weather for morning activities! Don\'t forget sunscreen.',
          action: 'Plan Activity',
          timestamp: now,
          priority: 'low'
        });
      }

      if (weather.weather[0].main.toLowerCase().includes('rain')) {
        newNotifications.push({
          id: 'morning-rain',
          type: 'warning',
          title: 'Rain Expected',
          message: 'Grab an umbrella before leaving home!',
          action: 'Weather Radar',
          timestamp: now,
          priority: 'high'
        });
      }
    }

    // Evening recommendations (5 PM - 9 PM)
    if (hour >= 17 && hour <= 21) {
      if (weather.wind.speed > 15) {
        newNotifications.push({
          id: 'evening-wind',
          type: 'warning',
          title: 'Windy Evening',
          message: 'Strong winds expected. Secure outdoor items.',
          action: 'Check Forecast',
          timestamp: now,
          priority: 'medium'
        });
      }
    }

    // Health-based notifications
    if (weather.main.humidity > 85 && weather.main.temp > 25) {
      newNotifications.push({
        id: 'health-humidity',
        type: 'warning',
        title: 'High Heat Index',
        message: 'Hot and humid conditions. Stay hydrated and take breaks.',
        action: 'Health Tips',
        timestamp: now,
        priority: 'high'
      });
    }

    // Air quality simulation (in real app, you'd get this from API)
    const simulatedAQI = Math.floor(Math.random() * 200);
    if (simulatedAQI > 150) {
      newNotifications.push({
        id: 'air-quality',
        type: 'warning',
        title: 'Poor Air Quality',
        message: 'Consider wearing a mask outdoors and limit outdoor exercise.',
        action: 'AQI Details',
        timestamp: now,
        priority: 'high'
      });
    }

    // Positive notifications
    if (weather.weather[0].main === 'Clear' && weather.main.temp >= 18 && weather.main.temp <= 26) {
      newNotifications.push({
        id: 'perfect-weather',
        type: 'success',
        title: 'Perfect Weather!',
        message: 'Ideal conditions for outdoor activities. Make the most of it!',
        action: 'Find Activities',
        timestamp: now,
        priority: 'low'
      });
    }

    setNotifications(newNotifications);
  };

  const dismissNotification = (id: string) => {
    setDismissed(new Set([...dismissed, id]));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-orange-400/50 bg-orange-400/10';
      case 'info':
        return 'border-blue-400/50 bg-blue-400/10';
      case 'success':
        return 'border-green-400/50 bg-green-400/10';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  useEffect(() => {
    if (currentWeather) {
      generateSmartNotifications(currentWeather);
    }
  }, [currentWeather]);

  const activeNotifications = notifications.filter(n => !dismissed.has(n.id));

  if (!currentWeather || activeNotifications.length === 0) return null;

  // Widget version - show only high priority notifications
  if (isWidget) {
    const highPriorityNotifications = activeNotifications.filter(n => n.priority === 'high');
    if (highPriorityNotifications.length === 0) return null;

    return (
      <div className="space-y-2">
        {highPriorityNotifications.slice(0, 2).map((notification) => (
          <Card key={notification.id} className={`glass-card p-3 border ${getBorderColor(notification.type)}`}>
            <div className="flex items-start gap-2">
              {getIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                <p className="text-xs text-white/80 mt-1">{notification.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="h-6 w-6 p-0 text-white/60 hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Full version for main app
  return (
    <Card className="glass-card p-4 border-white/20">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="w-5 h-5 text-white" />
        <h3 className="text-lg font-semibold text-white">Smart Alerts</h3>
        {activeNotifications.length > 0 && (
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
            {activeNotifications.length}
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {activeNotifications.map((notification) => (
          <div key={notification.id} className={`p-3 rounded border ${getBorderColor(notification.type)}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                {getIcon(notification.type)}
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
                  <p className="text-sm text-white/80 mt-1">{notification.message}</p>
                  {notification.action && (
                    <Button variant="ghost" size="sm" className="mt-2 h-auto p-1 text-xs text-blue-300 hover:text-blue-100">
                      {notification.action}
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="h-6 w-6 p-0 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-white/50 mt-2">
              {notification.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
