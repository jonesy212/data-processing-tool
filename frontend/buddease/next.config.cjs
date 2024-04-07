/** @type {import('next').NextConfig} */
const rollup = require('rollup');
const rollupConfig = require('./rollup.config.js'); // Import the Rollup configuration

const nextConfig = {
  // Add your Next.js configuration options here
  reactStrictMode: true, // Enable React strict mode for better development practices
  experimental: {
    // Enable experimental features if needed
  },
  webpack(config, { isServer }) {
    // Customize webpack configuration as needed
    if (isServer) {
      // Server-side webpack configuration
      config.node = {
        fs: 'empty'
      };
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
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'X-Custom-Header', value: 'Value' },
        ],
      },
    ];
  },
  async afterBuild() {
    // Execute Rollup build after Next.js build completes
    const bundle = await rollup.rollup(rollupConfig);
    await bundle.write(rollupConfig.output);
  },
};

module.exports = nextConfig;