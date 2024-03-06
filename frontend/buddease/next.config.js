/** @type {import('next').NextConfig} */
const nextConfig = {
    // Add your Next.js configuration options here
    reactStrictMode: true, // Enable React strict mode for better development practices
    experimental: {
      // Enable experimental features if needed
      optimizeFonts: true, // Optimize font loading
      optimizeImages: true, // Optimize image loading
      eslint: true, // Enable ESLint for linting JavaScript/TypeScript files
    },
    webpack(config, { isServer }) {
      // Customize webpack configuration as needed
      if (isServer) {
        // Server-side webpack configuration
      } else {
        // Client-side webpack configuration
      }
      return config;
    },
    async redirects() {
      // Define custom redirects for specific routes
      return [
        { source: '/old-route', destination: '/new-route', permanent: true },
      ];
    },
    async rewrites() {
      // Define custom rewrites for specific routes
      return [
        { source: '/api/old-endpoint', destination: '/api/new-endpoint' },
      ];
    },
    async headers() {
      // Define custom headers for specific routes
      return [
        {
          source: '/api/*',
          headers: [
            { key: 'Cache-Control', value: 'no-cache' },
            { key: 'X-Custom-Header', value: 'Value' },
          ],
        },
      ];
    },
    async redirects() {
      // Define custom redirects for specific routes
      return [
        { source: '/old-route', destination: '/new-route', permanent: true },
      ];
    },
    async headers() {
      // Define custom headers for specific routes
      return [
        {
          source: '/api/*',
          headers: [
            { key: 'Cache-Control', value: 'no-cache' },
            { key: 'X-Custom-Header', value: 'Value' },
          ],
        },
      ];
    },
    async rewrites() {
      // Define custom rewrites for specific routes
      return [
        { source: '/old-route', destination: '/new-route' },
      ];
    },
  }
  
  module.exports = nextConfig;
  