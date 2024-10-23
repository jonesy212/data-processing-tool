module.exports = {
    mount: {
      public: '/',
      src: '/_dist_',
    },
    plugins: [
      '@snowpack/plugin-react',
      '@snowpack/plugin-dotenv',
    ],
    packageOptions: {
      knownEntrypoints: ['react', 'react-dom'],
    },
    devOptions: {
      /* ... */
    },
    buildOptions: {
      /* ... */
    },
    optimize: {
      bundle: true,
      minify: true,
      target: 'es2018', // or any target version you prefer
    },
    routes: [
      /* Define custom routes if needed */
    ],
  };
  