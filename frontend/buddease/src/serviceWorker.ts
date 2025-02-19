import { ExtendableEvent, FetchEvent } from "./app/api/CustomFetchEvent";

// service-worker.ts
const CACHE_NAME = 'my-cache-v1';
const urlsToCache: string[] = [
  '/',
  '/index.html',
  // Add other static assets (JS, CSS, images) that you want to cache
  // Add URLs for chat messages, videos, and audio files
  '/chat-messages', // Replace with the actual URL for chat messages
  '/videos/video1.mp4', // Replace with the actual URLs for videos
  '/audio/audio1.mp3',  // Replace with the actual URLs for audio files
];

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil ? (
    caches.open(CACHE_NAME).then((cache) => {
      return cache
        ? cache.addAll(urlsToCache)
        : Promise.reject("Cache is undefined");
    })
  ) : (
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});


self.addEventListener('fetch', async (event: Event) => {
  const fetchEvent = event as FetchEvent;
  fetchEvent.respondWith(
    await caches.match(fetchEvent.request).then((response) => {
      return response || fetch(fetchEvent.request);
    })
  );
});


// Additional logic for caching dynamic content (e.g., chat messages)
self.addEventListener("message", (event: ExtendableEvent) => {
  if (event.data.action === "cacheChatMessage") {
    const chatMessageUrl: string = event.data.url;
    event.waitUntil?(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(chatMessageUrl).then((response) => {
          return cache.put(chatMessageUrl, response);
        });
      })
    ) : (
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
  if (event.data.action === 'cacheChatMessage') {
    const chatMessageUrl: string = event.data.url;
    caches.open(CACHE_NAME).then((cache) => {
      fetch(chatMessageUrl).then((response) => {
        cache.put(chatMessageUrl, response);
      });
    });
  } else if (event.data === 'clearCache') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('Cache cleared by user.');
    });
  }
});

