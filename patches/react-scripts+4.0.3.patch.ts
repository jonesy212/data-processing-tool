/// @@ -104,7 +104,7 @@ module.exports = function (webpackEnv) {
const isEnvDevelopment = webpackEn === 'development';
const isEnvProduction = webpackEnv === 'production';
const isEnvDevelopmentProfile = isEnvDevelopment && process.argv.includes('--profile');
-const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
+const shouldUseSourceMap = true;
const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);
