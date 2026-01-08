const { execSync } = require('child_process');

try {
  console.log('Running TypeScript check...');
  const output = execSync(
    'npx tsc --noEmit --isolatedModules --verbatimModuleSyntax 2>&1',
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );
  console.log('Output (first 1000 chars):');
  console.log(output.substring(0, 1000));
  
  // Count type import errors
  const typeImportErrors = output.split('\n').filter(line => 
    line.includes('is a type and must be imported')
  );
  console.log(`\nFound ${typeImportErrors.length} type import errors`);
  
  if (typeImportErrors.length > 0) {
    console.log('\nFirst 5 errors:');
    typeImportErrors.slice(0, 5).forEach(err => console.log(`  ${err}`));
  }
} catch (error) {
  if (error.stdout) {
    console.log('TypeScript errors found:');
    const output = error.stdout.toString();
    console.log(output.substring(0, 2000));
  } else {
    console.error('Error:', error.message);
  }
}
