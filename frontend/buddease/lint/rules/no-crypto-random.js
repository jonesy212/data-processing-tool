// no-crypto-random.js
// lint/rules/no-crypto-random.js

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Math.random() for cryptographic purposes',
      category: 'Security',
      recommended: true,
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Math' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'random'
        ) {
          // Check if this is in a crypto-related file
          const filename = context.getFilename();
          if (filename.includes('crypto') || filename.includes('security')) {
            context.report({
              node,
              message: 'Use crypto.getRandomValues() instead of Math.random() for cryptographic operations',
            });
          }
        }
      },
    };
  },
};