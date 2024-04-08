module.exports = function (webpackEnv) {
  // Environment checks
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';
  const isEnvDevelopmentProfile = isEnvDevelopment && process.argv.includes('--profile');

  // Source map configuration
  const shouldUseSourceMap = true; // Always generate source maps

  // Image inline size limit
  const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000');

  // Define your Webpack configuration
  const webpackConfig = {
    // Other Webpack configuration options...
    module: {
      rules: [
        // Other rules...
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                '@babel/preset-react',
                '@babel/preset-typescript', // Add TypeScript preset
              ],
            },
          },
        },
      ],
    },
  };

  return webpackConfig;
};
