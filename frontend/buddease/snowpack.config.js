// snowpack.config.js
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
  };
  