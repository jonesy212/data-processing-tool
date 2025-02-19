// metro.config.tsimport { getDefaultConfig } from 'metro-config';

export default (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-typescript-transformer'),
    },
    resolver: {
      assetExts: [...assetExts, 'svg'],
      sourceExts: [...sourceExts, 'ts', 'tsx'],
    },
  };
})();
