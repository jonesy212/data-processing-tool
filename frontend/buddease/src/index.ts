// index.ts
// Import your main application component or logic here
// Additional imports as needed
import './styles/main.css'; // Import your global styles

// Optionally, register the service worker (if applicable)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}
