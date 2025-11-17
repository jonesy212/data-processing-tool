// lint/rules/no-console-in-production.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow console statements in production',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'console'
        ) {
          context.report({
            node,
            message: 'Unexpected console statement. Remove in production.',
            fix(fixer) {
              return fixer.remove(node);
            },
          });
        }
      },
    };
  },
};