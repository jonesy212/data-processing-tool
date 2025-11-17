/** @type {import('next').NextConfig} */

import { rollup } from 'rollup';
import rollupConfig from './rollup.config.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Fix turbopack configuration
  turbopack: {
      root: __dirname, 
  },
  
  // Fix webpack configuration - remove the duplicate webpack function
  webpack: (config, { isServer, dev, buildId }) => {
    // Apply your custom webpack config for production
    if (isServer || !dev) {
      try {
        const customConfig = require('./webpack.config.js')('production');
        Object.assign(config, customConfig);
      } catch (error) {
        console.warn('Custom webpack config not found, using default');
      }
    }
    
    // Add resolve.modules to allow imports from specified paths
    config.resolve.modules.push(process.cwd());
    
    // Server-side specific configuration
    if (isServer) {
      // Bundle Rollup configuration with the server-side bundle
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('Bundle Rollup', async () => {
            try {
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
            } catch (error) {
              console.error('Rollup bundling error:', error);
            }
          });
        },
      });

      // Ensure that the 'fs' module is treated as external
      config.externals = [...(config.externals || []), 'fs'];
      
      // Exclude the 'fs' module from the webpack build
      config.node = {
        fs: 'empty'
      };
    }
    
    return config;
  },
  
  
  // Redirects
  async redirects() {
    return [
      { source: '/old-route', destination: '/new-route', permanent: true },
    ];
  },
  
  // Rewrites
  async rewrites() {
    return [
      { source: '/api/old-endpoint', destination: '/api/new-endpoint' },
    ];
  },
  
  // Headers
  async headers() {
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

export default nextConfig;