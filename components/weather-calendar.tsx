'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, AlertTriangle } from 'lucide-react';

interface WeatherEvent {
  id: string;
  title: string;
  date: Date;
  weatherCondition: string;
  temperature: number;
  description: string;
  type: 'reminder' | 'suggestion' | 'warning';
  location?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  location?: string;
  weatherImpact?: string;
}

export function WeatherCalendar() {
  const [weatherEvents, setWeatherEvents] = useState<WeatherEvent[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Generate weather-based events and reminders
  const generateWeatherEvents = () => {
    const events: WeatherEvent[] = [];
    const today = new Date();
    
    // Generate events for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Simulate weather conditions
      const conditions = ['sunny', 'rainy', 'cloudy', 'stormy', 'snowy'];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const temp = Math.floor(Math.random() * 35) + 5; // 5-40°C
      
      // Generate relevant events based on weather
      if (condition === 'rainy' && Math.random() > 0.5) {
        events.push({
          id: `rain-${i}`,
          title: 'Rain Expected - Take Umbrella',
          date,
          weatherCondition: condition,
          temperature: temp,
          description: 'Don\'t forget your umbrella and raincoat!',
          type: 'reminder'
        });
      }
      
      if (condition === 'sunny' && temp > 25) {
        events.push({
          id: `sunny-${i}`,
          title: 'Perfect Weather for Outdoor Activities',
          date,
          weatherCondition: condition,
          temperature: temp,
          description: 'Great day for hiking, picnics, or sports!',
          type: 'suggestion'
        });
      }
      
      if (condition === 'stormy') {
        events.push({
          id: `storm-${i}`,
          title: 'Storm Warning - Stay Indoors',
          date,
          weatherCondition: condition,
          temperature: temp,
          description: 'Severe weather expected. Avoid unnecessary travel.',
          type: 'warning'
        });
      }
      
      if (temp < 0) {
        events.push({
          id: `freeze-${i}`,
          title: 'Freezing Alert - Protect Pipes',
          date,
          weatherCondition: condition,
          temperature: temp,
          description: 'Temperature below freezing. Check heating and pipes.',
          type: 'warning'
        });
      }
      
      if (temp > 30) {
        events.push({
          id: `heat-${i}`,
          title: 'Heat Advisory - Stay Hydrated',
          date,
          weatherCondition: condition,
          temperature: temp,
          description: 'High temperatures expected. Drink plenty of water.',
          type: 'warning'
        });
      }
    }
    
    setWeatherEvents(events);
  };

  // Generate sample calendar events with weather impact analysis
  const generateCalendarEvents = () => {
    const events: CalendarEvent[] = [
      {
        id: '1',
        title: 'Morning Jog',
        date: new Date(Date.now() + 86400000), // Tomorrow
        location: 'Central Park',
        weatherImpact: 'Check weather conditions before heading out'
      },
      {
        id: '2',
        title: 'Outdoor Wedding',
        date: new Date(Date.now() + 2 * 86400000), // Day after tomorrow
        location: 'Garden Venue',
        weatherImpact: 'Have backup indoor plan ready'
      },
      {
        id: '3',
        title: 'Beach Picnic',
        date: new Date(Date.now() + 3 * 86400000),
        location: 'Sunset Beach',
        weatherImpact: 'Perfect weather needed for outdoor dining'
      },
      {
        id: '4',
        title: 'Golf Tournament',
        date: new Date(Date.now() + 4 * 86400000),
        location: 'Country Club',
        weatherImpact: 'Rain would require rescheduling'
      }
    ];
    
    setCalendarEvents(events);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'suggestion':
        return <Calendar className="h-4 w-4 text-green-400" />;
      default:
        return <Clock className="h-4 w-4 text-blue-400" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-red-400 bg-red-400/10';
      case 'suggestion':
        return 'border-green-400 bg-green-400/10';
      default:
        return 'border-blue-400 bg-blue-400/10';
    }
  };

  const getWeatherEmoji = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return '☀️';
      case 'rainy': return '🌧️';
      case 'cloudy': return '☁️';
      case 'stormy': return '⛈️';
      case 'snowy': return '❄️';
      default: return '🌤️';
    }
  };

  const addToCalendar = (event: WeatherEvent) => {
    // In a real app, this would integrate with the user's calendar app
    alert(`Added "${event.title}" to your calendar for ${event.date.toLocaleDateString()}`);
  };

  useEffect(() => {
    generateWeatherEvents();
    generateCalendarEvents();
  }, []);

  return (
    <div className="space-y-4">
      {/* Weather Calendar Overview */}
      <Card className="glass-card p-4 border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weather Calendar
        </h3>
        
        {/* Next 7 Days Weather Events */}
        <div className="space-y-3">
          {weatherEvents.map((event) => (
            <div key={event.id} className={`p-3 rounded border ${getEventTypeColor(event.type)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getEventTypeIcon(event.type)}
                  <div>
                    <h4 className="font-medium text-white flex items-center gap-2">
                      {getWeatherEmoji(event.weatherCondition)}
                      {event.title}
                    </h4>
                    <p className="text-sm text-white/80 mt-1">{event.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                      <span>{event.date.toLocaleDateString()}</span>
                      <span>{event.temperature}°C</span>
                      <span className="capitalize">{event.weatherCondition}</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/80 hover:text-white"
                  onClick={() => addToCalendar(event)}
                >
                  Add to Calendar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Your Events with Weather Impact */}
      <Card className="glass-card p-4 border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Your Events & Weather Impact
        </h3>
        
        <div className="space-y-3">
          {calendarEvents.map((event) => (
            <div key={event.id} className="p-3 bg-white/5 rounded border border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-white">{event.title}</h4>
                  <p className="text-sm text-white/80 mt-1">{event.weatherImpact}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                    <span>{event.date.toLocaleDateString()}</span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/80 hover:text-white"
                >
                  Weather Forecast
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Weather Actions */}
      <Card className="glass-card p-4 border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="ghost" 
            className="text-white border border-white/20 hover:bg-white/10"
          >
            Set Weather Alert
          </Button>
          <Button 
            variant="ghost" 
            className="text-white border border-white/20 hover:bg-white/10"
          >
            Plan Weekly Activities
          </Button>
          <Button 
            variant="ghost" 
            className="text-white border border-white/20 hover:bg-white/10"
          >
            Travel Weather Check
          </Button>
          <Button 
            variant="ghost" 
            className="text-white border border-white/20 hover:bg-white/10"
          >
            Clothing Suggestions
          </Button>
        </div>
      </Card>
    </div>
  );
}
