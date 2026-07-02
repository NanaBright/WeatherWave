'use client';

import { useState, useEffect, useCallback } from 'react';

const BASE_URL = 'https://api.openweathermap.org';
const API_KEY = '604b70cea2c7eedbd5e229712b80004d';

interface Coordinates {
  lat: number;
  lon: number;
}

export const useWeather = (initialLocation: Coordinates) => {
  const [location, setLocation] = useState<Coordinates>(initialLocation);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (loc: Coordinates) => {
    setIsLoading(true);
    setError(null);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${BASE_URL}/data/2.5/weather?lat=${loc.lat}&lon=${loc.lon}&appid=${API_KEY}&units=metric`),
        fetch(`${BASE_URL}/data/2.5/forecast?lat=${loc.lat}&lon=${loc.lon}&appid=${API_KEY}&units=metric`),
      ]);
      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      if (!weatherRes.ok) throw new Error(weatherData.message || 'Weather data unavailable');
      if (!forecastRes.ok) throw new Error(forecastData.message || 'Forecast data unavailable');
      setCurrentWeather(weatherData);
      setForecast(forecastData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(location);
  }, [location, fetchWeather]);

  // Search any city name via OWM geocoding — works for Accra, Tokyo, anywhere
  const searchByCity = useCallback(async (cityName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const geoRes = await fetch(
        `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoRes.json();
      if (!Array.isArray(geoData) || geoData.length === 0) {
        throw new Error(`"${cityName}" not found. Try a different spelling.`);
      }
      const { lat, lon } = geoData[0];
      setLocation({ lat, lon });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // Jump directly to coordinates (used when user picks from autocomplete)
  const searchByCoords = useCallback((coords: Coordinates) => {
    setLocation(coords);
  }, []);

  return { currentWeather, forecast, isLoading, error, searchByCity, searchByCoords };
};
