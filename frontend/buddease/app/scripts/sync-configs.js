// sync-configs.js
const fs = require('fs');
const path = require('path');
const { generateAliases } = require('@/configs/alias-config');

function updateVitestConfig() {
  const vitestConfigPath = path.join(__dirname, '..', 'vitest.config.js');
  
  if (!fs.existsSync(vitestConfigPath)) {
    console.log('⚠️  vitest.config.js not found, skipping...');
    return;
  }
  
  let vitestConfig = fs.readFileSync(vitestConfigPath, 'utf8');
  const aliases = generateAliases(__dirname, 'vite');
  
  // Convert aliases to proper JavaScript object string
  const aliasesString = Object.entries(aliases)
    .map(([key, value]) => `      '${key}': '${value}'`)
    .join(',\n');
  
  // Replace or add alias section
  if (vitestConfig.includes('alias:')) {
    vitestConfig = vitestConfig.replace(
      /alias: \{[\s\S]*?\},/,
      `alias: {\n${aliasesString}\n    },`
    );
  } else {
    // Insert alias section if it doesn't exist
    vitestConfig = vitestConfig.replace(
      /resolve: \{/,
      `resolve: {\n    alias: {\n${aliasesString}\n    },`
    );
  }
  
  fs.writeFileSync(vitestConfigPath, vitestConfig);
  console.log('✅ Updated vitest.config.js');
}

function updateJestConfig() {
  const jestConfigPath = path.join(__dirname, '..', 'jest.config.js');
  
  if (!fs.existsSync(jestConfigPath)) {
    console.log('⚠️  jest.config.js not found, skipping...');
    return;
  }
  
  let jestConfig = fs.readFileSync(jestConfigPath, 'utf8');
  const aliases = generateAliases(__dirname, 'jest');
  
  // Convert aliases to proper Jest moduleNameMapping format
  const aliasesString = Object.entries(aliases)
    .map(([key, value]) => `    '${key}': '${value}'`)
    .join(',\n');
  
  // Replace or add moduleNameMapping section
  if (jestConfig.includes('moduleNameMapping:')) {
    jestConfig = jestConfig.replace(
      /moduleNameMapping: \{[\s\S]*?\},/,
      `moduleNameMapping: {\n${aliasesString}\n  },`
    );
  } else {
    // Insert moduleNameMapping if it doesn't exist
    const insertPoint = jestConfig.includes('moduleFileExtensions:') 
      ? jestConfig.indexOf('moduleFileExtensions:')
      : jestConfig.indexOf('testMatch:');
    
    if (insertPoint !== -1) {
      jestConfig = jestConfig.slice(0, insertPoint) + 
        `moduleNameMapping: {\n${aliasesString}\n  },\n\n  ` + 
        jestConfig.slice(insertPoint);
    }
  }
  
  fs.writeFileSync(jestConfigPath, jestConfig);
  console.log('✅ Updated jest.config.js');
}

function updateBabelConfig() {
  const babelConfigPath = path.join(__dirname, '..', 'babel.config.js');
  
  if (!fs.existsSync(babelConfigPath)) {
    console.log('⚠️  babel.config.js not found, skipping...');
    return;
  }
  
  let babelConfig = fs.readFileSync(babelConfigPath, 'utf8');
  const aliases = generateAliases(__dirname, 'object');
  
  // Convert aliases to proper module-resolver format
  const aliasesString = Object.entries(aliases)
    .map(([key, value]) => `          '${key}': '${value}'`)
    .join(',\n');
  
  // Find and replace the alias section in module-resolver
  const moduleResolverRegex = /\[\s*'module-resolver',\s*\{[\s\S]*?alias:\s*\{[\s\S]*?\}[\s\S]*?\}\s*\]/;
  
  if (moduleResolverRegex.test(babelConfig)) {
    babelConfig = babelConfig.replace(
      /alias:\s*\{[\s\S]*?\},/,
      `alias: {\n${aliasesString}\n        },`
    );
  } else {
    console.log('⚠️  module-resolver plugin not found in babel.config.js');
  }
  
  fs.writeFileSync(babelConfigPath, babelConfig);
  console.log('✅ Updated babel.config.js');
}

function updateTypeScriptConfig() {
  const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
  
  if (!fs.existsSync(tsConfigPath)) {
    console.log('⚠️  tsconfig.json not found, skipping...');
    return;
  }
  
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  const paths = generateAliases(__dirname, 'typescript');
  
  // Ensure compilerOptions exists
  if (!tsConfig.compilerOptions) {
    tsConfig.compilerOptions = {};
  }
  
  tsConfig.compilerOptions.paths = paths;
  fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  console.log('✅ Updated tsconfig.json');
}

function createConfigIfMissing() {
  const configs = [
    { name: 'vitest.config.js', template: getVitestTemplate() },
    { name: 'jest.config.js', template: getJestTemplate() },
    { name: 'babel.config.js', template: getBabelTemplate() }
  ];
  
  configs.forEach(({ name, template }) => {
    const configPath = path.join(__dirname, '..', name);
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, template);
      console.log(`📁 Created ${name}`);
    }
  });
}

function getVitestTemplate() {
  return `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/platform/**'
    ]
  },
  resolve: {
    alias: {
      // Aliases will be auto-populated
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs']
  }
});`;
}

function getJestTemplate() {
  return `module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/src/test/setup.js'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-native-.*)/)'
  ],
  moduleNameMapping: {
    // Aliases will be auto-populated
  }
};`;
}

function getBabelTemplate() {
  return `module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
          // Aliases will be auto-populated
        }
      }
    ]
  ]
};`;
}

// Run synchronization
console.log('🔄 Synchronizing configuration files...\n');

createConfigIfMissing();
updateTypeScriptConfig();
updateBabelConfig();
updateVitestConfig();
updateJestConfig();

console.log('\n🎉 All configuration files synchronized!');
console.log('📋 Summary of aliases synchronized:');
console.log(`   - ${Object.keys(require('../configs/alias-config').ALIASES).length} path aliases`);
console.log('   - 4 configuration files updated');