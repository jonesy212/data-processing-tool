// react-native.js
const reactConfig = require('./react');

module.exports = {
  ...reactConfig,
  env: {
    ...reactConfig.env,
    'react-native/react-native': true,
  },
  plugins: [
    ...reactConfig.plugins,
    'react-native',
  ],
  extends: [
    ...reactConfig.extends.filter(ext => ext !== 'plugin:react/recommended'),
    'plugin:react-native/all',
  ],
  rules: {
    ...reactConfig.rules,
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    'react-native/no-raw-text': 'error',
    'react-native/no-single-element-style-arrays': 'error',
  },
};