// metro.config.ts
import { mergeConfig } from 'metro-config';
import defaultConfig from 'metro-config/src/defaults/defaults';

export default mergeConfig(defaultConfig, {
  transformer: {
    babelTransformerPath: require.resolve('react-native-typescript-transformer'),
  },
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'svg'],
    sourceExts: [...defaultConfig.resolver.sourceExts, 'ts', 'tsx'],
  },
});