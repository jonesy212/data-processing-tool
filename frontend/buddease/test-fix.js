// Test if exports is defined
console.log('Testing exports variable...');
try {
  console.log('typeof exports:', typeof exports);
  console.log('exports === undefined:', exports === undefined);
} catch (error) {
  console.log('Error accessing exports:', error.message);
}

// Test with a different variable name
const importsMap = new Map();
console.log('\nTesting importsMap variable...');
console.log('typeof importsMap:', typeof importsMap);
console.log('importsMap works:', importsMap instanceof Map);
