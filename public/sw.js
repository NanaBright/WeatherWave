const CACHE_NAME = 'weatherwave-v1';
const STATIC_ASSETS = [
  '/',
  '/widget',
  '/manifest.json',
  '/1.jpg',
  '/2.jpg',
  '/3.jpg',
  '/4.jpg',
  '/5.jpg',
  '/6.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback for offline
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Background sync for weather updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'weather-update') {
    event.waitUntil(updateWeatherData());
  }
});

async function updateWeatherData() {
  // Update weather data in the background
  try {
    const position = await getCurrentPosition();
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=604b70cea2c7eedbd5e229712b80004d&units=metric`
    );
    const data = await response.json();
    
    // Store in IndexedDB or send notification
    self.registration.showNotification('Weather Update', {
      body: `Current temperature: ${Math.round(data.main.temp)}°C`,
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    });
  } catch (error) {
    console.error('Background weather update failed:', error);
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
