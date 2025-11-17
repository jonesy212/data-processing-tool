// import-path-aliases.js
// lint/rules/import-path-aliases.js
const path = require('path');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce use of path aliases in imports',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          aliases: {
            type: 'object',
            additionalProperties: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const aliases = options.aliases || {};
    
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        
        // Check if this is a relative import that should use an alias
        if (importPath.startsWith('.')) {
          const currentFile = context.getFilename();
          const absolutePath = path.resolve(path.dirname(currentFile), importPath);
          
          for (const [alias, aliasPath] of Object.entries(aliases)) {
            if (absolutePath.includes(aliasPath)) {
              const suggestedPath = absolutePath.replace(aliasPath, alias);
              context.report({
                node: node.source,
                message: `Use path alias: "${suggestedPath}" instead of relative path`,
                fix(fixer) {
                  return fixer.replaceText(node.source, `'${suggestedPath}'`);
                },
              });
              break;
            }
          }
        }
      },
    };
  },
};