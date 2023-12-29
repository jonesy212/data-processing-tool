// service-worker.js
const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Add other static assets (JS, CSS, images) that you want to cache
  // Add URLs for chat messages, videos, and audio files
  '/chat-messages', // Replace with the actual URL for chat messages
  '/videos/video1.mp4', // Replace with the actual URLs for videos
  '/audio/audio1.mp3',  // Replace with the actual URLs for audio files
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Additional logic for caching dynamic content (e.g., chat messages)
self.addEventListener('message', (event) => {
  if (event.data.action === 'cacheChatMessage') {
    const chatMessageUrl = event.data.url;
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(chatMessageUrl).then((response) => {
          return cache.put(chatMessageUrl, response);
        });
      })
    );
  }
});

// Additional logic for clearing the cache (if needed)
self.addEventListener('message', (event) => {
  if (event.data === 'clearCache') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('Cache cleared by user.');
      })
    );
  }
});
