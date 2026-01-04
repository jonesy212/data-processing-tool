// configs/alias-config.js
const path = require('path');
const { resolve } = require('path');

const ALIASES = {
  // Core paths - exactly matching your tsconfig.json
  "@/*": "src/*",
  "@/api/*": "src/core/api/*",
  "@/analyzers/*": "src/core/generators/corrections/analyzers/*",
  "@/components/*": "src/core/components/*",
  "@/config/*": "src/core/config/*",
  "@/context/*": "src/core/context/*",
  "@/hooks/*": "src/core/hooks/*",
  "@/models/*": "src/core/models/*",
  "@/pages/*": "src/core/pages/*",
  "@/libraries/*": "src/core/libraries/*",
  "@/documents/*": "src/core/documents/*",
  "@/calendar/*": "src/core/browser/calendar/*",
  "@/browser/*": "src/core/browser/*",
  "@/actions/*": "src/core/actions/*",
  "@/generators/*": "src/core/generators/*",
  "@/features/*": "src/core/features/*",
  "@/data/*": "src/core/data/*",
  "@/platform/*": "platform/*",
  "@/types/*": "src/core/types/*",
  "@/utils/*": "src/utils/*",
  "@/stores/*": "src/core/stores/*",
  "@/state/*": "src/core/state/*",
  "@/shared/*": "src/core/shared/*",
  
  // Specific component categories
  "@/ui/*": "src/core/components/ui/*",
  "@/forms/*": "src/core/components/forms/*",
  "@/cards/*": "src/core/components/cards/*",
  "@/navigation/*": "src/core/components/navigation/*",
  "@/charts/*": "src/core/components/charts/*",
  "@/tables/*": "src/core/components/tables/*",
  "@/modals/*": "src/core/components/modals/*",
  
  // Domain-specific paths
  "@/auth/*": "src/core/components/auth/*",
  "@/chat/*": "src/core/components/communications/chat/*",
  "@/crypto/*": "src/core/components/crypto/*",
  "@/projects/*": "src/core/components/projects/*",
  "@/quality/*": "src/core/quality/*",
  "@/scripts/*": "src/core/scripts/*",
  "@/tasks/*": "src/core/components/tasks/*",
  "@/teams/*": "src/core/components/teams/*",
  "@/users/*": "src/core/components/users/*",
  "@/video/*": "src/core/components/video/*",
  "@/web3/*": "src/core/components/web3/*",
  "@/phases/*": "src/core/components/phases/*",
  
  // Layout and theming
  "@/layout/*": "src/core/components/layout/*",
  "@/theming/*": "src/core/components/styling/*",
  
  // Legacy/compatibility paths
  "@/core/shared/shared_error_handling": "src/core/config/declarations/global.d.ts",
  "@/drawingLibrary": "src/core/config/declarations/global.d.ts",
  "@/backendStructure/*": "src/core/config/appStructure/*",
  "@/frontendStructure/*": "src/core/config/appStructure/*",
  "@/core/documents/*": "src/core/documents/*",
  "@/support/*": "src/core/features/support/*",
  "@/animations/*": "src/core/libraries/animations/*",
  "@/typings/*": "src/core/types/*",
  "@/versions/*": "src/core/config/versions/*",
  "@/configs/*": "src/core/config/*",
  "@/snapshot/*": "src/core/api/snapshots/*",
  "@/management/*": "src/core/components/management/*",
  "@/onboarding/*": "src/core/components/onboarding/*",
  "@/dashboards/*": "src/core/components/dashboards/*",
  "@/searches/*": "src/core/components/search/*",
  "@/tracker/*": "src/core/components/tracker/*",
  "@/menu/*": "src/core/libraries/menu/*"
};

function generateAliases(baseDir = __dirname, format = 'object') {
  const aliases = {};
  
  Object.entries(ALIASES).forEach(([alias, target]) => {
    // Remove trailing /* for directory resolution
    const cleanTarget = target.replace(/\/\*$/, '');
    const resolvedPath = resolve(baseDir, cleanTarget);
    
    if (format === 'object' || format === 'vite') {
      // For object format (Babel, Vite) - point to directory
      aliases[alias] = resolvedPath;
    } else if (format === 'jest') {
      // Jest format needs regex patterns
      if (alias.endsWith('/*')) {
        const jestPattern = `^${alias.replace('/*', '')}/(.*)$`;
        const jestTarget = `<rootDir>/${cleanTarget}/$1`;
        aliases[jestPattern] = jestTarget;
      } else {
        // For non-wildcard aliases (like @/drawingLibrary)
        const jestPattern = `^${alias}$`;
        const jestTarget = `<rootDir>/${cleanTarget}`;
        aliases[jestPattern] = jestTarget;
      }
    } else if (format === 'typescript') {
      // TypeScript paths format
      aliases[alias] = [`./${target}`];
    }
  });
  
  return aliases;
}

// Export for sync script
module.exports = {
  ALIASES,
  generateAliases
};