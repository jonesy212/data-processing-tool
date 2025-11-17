// setup-lint.js
// lint/scripts/setup-lint.js
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up linting configuration...');

// Create .eslintrc.js
const eslintConfig = `
const path = require('path');

module.exports = {
  root: true,
  extends: [
    './lint/configs/react-native.js',
  ],
  rules: {
    'import-path-aliases': [
      'error',
      {
        aliases: {
          '@': path.resolve(__dirname, 'src'),
          '@/app': path.resolve(__dirname, 'src/app'),
          '@/components': path.resolve(__dirname, 'src/app/components'),
          '@/utils': path.resolve(__dirname, 'src/utils'),
          '@/hooks': path.resolve(__dirname, 'src/app/hooks'),
          '@/types': path.resolve(__dirname, 'src/app/typings'),
        },
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      files: ['**/*.js', '**/*.jsx'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
`;

fs.writeFileSync(path.join(process.cwd(), '.eslintrc.js'), eslintConfig.trim());
console.log('✅ Created .eslintrc.js');

// Create .eslintignore
const eslintIgnore = `
node_modules/
dist/
build/
.coverage/
.next/
out/
*.min.js
*.bundle.js
`;
fs.writeFileSync(path.join(process.cwd(), '.eslintignore'), eslintIgnore.trim());
console.log('✅ Created .eslintignore');

console.log('🎉 Linting setup complete!');
console.log('📝 Next steps:');
console.log('   1. Run: pnpm lint');
console.log('   2. Run: pnpm lint:fix');
console.log('   3. Add linting to your pre-commit hooks');