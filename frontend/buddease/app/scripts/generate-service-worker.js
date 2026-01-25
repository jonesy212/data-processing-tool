// scripts/generate-service-worker.js
const fs = require('fs');
const path = require('path');

// 1. Find all CSS files in src directory
function findCSSFiles(dir) {
  const cssFiles = [];
  
  function walk(directory) {
    const items = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules and build directories
        if (!item.name.includes('node_modules') && !item.name.includes('build')) {
          walk(fullPath);
        }
      } else if (item.name.endsWith('.css')) {
        // Convert to public URL path
        // Example: src/components/Button.css -> /components/Button.css
        const relativePath = path.relative('src', fullPath);
        cssFiles.push(`/${relativePath.replace(/\\/g, '/')}`);
      }
    }
  }
  
  walk(dir);
  return cssFiles;
}

// 2. Generate the service worker content
const cssFiles = findCSSFiles('src');

console.log(`📊 Found ${cssFiles.length} CSS files to cache:`);
cssFiles.forEach(file => console.log(`  • ${file}`));

// 3. Create the service worker content
const serviceWorkerContent = `// AUTO-GENERATED SERVICE WORKER - DO NOT EDIT DIRECTLY
// Generated at: ${new Date().toISOString()}
// Total CSS files cached: ${cssFiles.length}

const CACHE_NAME = 'app-cache-v${Date.now()}';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Core CSS files
  '/src/core/globals.css',
  '/src/core/css/phases.css',
  // All other discovered CSS files
  ${cssFiles.map(file => `  '${file}'`).join(',\n')}
];

self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installing with', urlsToCache.length, 'files');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(error => {
        console.warn('Failed to cache some files:', error);
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Special handling for CSS files
  if (event.request.url.endsWith('.css')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached CSS if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch and cache
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  } else {
    // For non-CSS files
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

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
  
  if (event.data === 'clearCache') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('Cache cleared by user.');
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;

// 4. Write the generated service worker to public folder
fs.writeFileSync('public/service-worker.js', serviceWorkerContent);
console.log('✅ Generated service-worker.js in public/ folder');