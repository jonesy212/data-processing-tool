import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react";
import path from 'path';


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Root aliases
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './configs'),
      
      // Platform aliases
      '@platform': path.resolve(__dirname, './platform'),
      '@android': path.resolve(__dirname, './platform/android'),
      '@ios': path.resolve(__dirname, './platform/ios'),
      '@web': path.resolve(__dirname, './platform/web'),
      '@tablet': path.resolve(__dirname, './platform/tablet'),
      '@platformShared': path.resolve(__dirname, './platform/shared'),
      
      // App structure aliases
      '@app': path.resolve(__dirname, './src/app'),
      '@components': path.resolve(__dirname, './src/app/components'),
      '@hooks': path.resolve(__dirname, './src/app/hooks'),
      '@utils': path.resolve(__dirname, './src/app/utils'),
      '@services': path.resolve(__dirname, './src/app/services'),
      '@types': path.resolve(__dirname, './src/app/typings'),
      '@models': path.resolve(__dirname, './src/app/models'),
      '@api': path.resolve(__dirname, './src/app/api'),
      '@state': path.resolve(__dirname, './src/app/state'),
      '@context': path.resolve(__dirname, './src/app/context'),
      '@layouts': path.resolve(__dirname, './src/app/layouts'),
      
      // Feature-based aliases
      '@communications': path.resolve(__dirname, './src/app/communications'),
      '@calendar': path.resolve(__dirname, './src/app/calendar'),
      '@documents': path.resolve(__dirname, './src/app/documents'),
      '@events': path.resolve(__dirname, './src/app/events'),
      '@users': path.resolve(__dirname, './src/app/users'),
      '@snapshots': path.resolve(__dirname, './src/app/snapshots'),
      '@versions': path.resolve(__dirname, './src/app/versions'),
      '@subscriptions': path.resolve(__dirname, './src/app/subscriptions'),
      '@libraries': path.resolve(__dirname, './src/app/libraries'),
      
      // Utility aliases
      '@accessibility': path.resolve(__dirname, './src/accessibility'),
      '@configs': path.resolve(__dirname, './src/configs'),
      '@shared': path.resolve(__dirname, './src/app/shared'),
      '@content': path.resolve(__dirname, './src/app/content'),
      '@dataIntegration': path.resolve(__dirname, './src/app/dataIntegration'),
      
      // Special directories
      '@providers': path.resolve(__dirname, './src/app/Provider.tsx'),
      '@lazy': path.resolve(__dirname, './src/LazyLoadScript.tsx'),
      '@middleware': path.resolve(__dirname, './src/app/middleware'),
      '@generators': path.resolve(__dirname, './src/app/generators'),
      '@prompts': path.resolve(__dirname, './src/app/prompts'),
      '@tests': path.resolve(__dirname, './src/app/tests'),
    },
  },

  // mount
  publicDir: 'public',
  root: '.',

  // Development server
  server: {
    port: 3000,
    open: true,
  },

  // Build configuration (Snowpack buildOptions equivalent)
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2018',
    
    // Rollup options (replaces your rollup.config.js)
    rollupOptions: {
      external: ['fs'], // Keep fs external like in your Next.js config
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  // Optimize options (Snowpack optimize equivalent)
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },

  // Environment variables (replaces @snowpack/plugin-dotenv)
  define: {
    'process.env.PROJECT_ID': JSON.stringify(process.env.PROJECT_ID || "defaultProject"),
  },
});