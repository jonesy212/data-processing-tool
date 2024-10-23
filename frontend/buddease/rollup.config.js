// rollup.config.js
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts', // Adjust the input file path as per your project structure
  output: {
    dir: 'dist', // Adjust the output directory as needed
    format: 'cjs', // CommonJS format for Node.js compatibility
  },
  plugins: [
    resolve(), // Resolve node_modules dependencies
    commonjs(), // Convert CommonJS modules to ES modules
  ],
  external: ['react', 'react-dom'], // Specify external dependencies
};
