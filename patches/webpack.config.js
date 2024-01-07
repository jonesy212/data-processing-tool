export default function (webpackEnv) {
  // Environment checks
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';
  const isEnvDevelopmentProfile = isEnvDevelopment && process.argv.includes('--profile');

  // Source map configuration
  const shouldUseSourceMap = true; // Always generate source maps

  // Image inline size limit
  const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000');

  // Rest of the webpack configuration...
};
