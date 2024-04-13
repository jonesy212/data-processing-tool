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

      // Add resolve.modules to allow imports from specified paths
      config.resolve.modules.push(__dirname);

      // Bundle Rollup configuration with the server-side bundle
      // Update to use config.plugins.push()
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('Bundle Rollup', async () => {
            const bundle = await rollup.rollup({
              input: './src/server/server.js',
              output: {
                file: './dist/server/server.js',
                format: 'cjs',
              },
              plugins: rollupConfig.plugins,
              external: ['fs'],
            });
            await bundle.write({
              file: './dist/server/server.js',
              format: 'cjs',
            });
          });
        },
      });

      // Ensure that the 'fs' module is treated as external
      config.externals = [...(config.externals || []), 'fs'];
      
      // Exclude the 'fs' module from the webpack build
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
};

module.exports = nextConfig;
