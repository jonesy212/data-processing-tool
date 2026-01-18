// lint-staged.config.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,md,mdx,css,html,yml,yaml}': [
    'prettier --write',
  ],
  '*.{ts,tsx}': [
    () => 'tsc --noEmit --skipLibCheck',
  ],
};