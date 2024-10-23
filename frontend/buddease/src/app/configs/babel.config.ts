// babel.config.ts
export default function (api: any) {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ];

  const plugins = [
    '@babel/plugin-transform-runtime',
    // Add any additional Babel plugins you need
  ];

  return {
    presets,
    plugins,
  };
}
