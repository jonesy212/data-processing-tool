// Mock draft-js to prevent CSS loading
export async function resolve(specifier, context, nextResolve) {
  console.log(`Mock resolver: ${specifier}`);
  
  // Intercept draft-js
  if (specifier === 'draft-js' || specifier.startsWith('draft-js/')) {
    console.log(`Mocking: ${specifier}`);
    return {
      url: `data:text/javascript,export default {}`,
      shortCircuit: true
    };
  }
  
  // Intercept CSS
  if (specifier.endsWith('.css')) {
    console.log(`Skipping CSS: ${specifier}`);
    return {
      url: `data:text/css,export default {}`,
      shortCircuit: true
    };
  }
  
  return nextResolve(specifier);
}

export async function load(url, context, nextLoad) {
  if (url.includes('data:text/javascript') || url.includes('data:text/css')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};'
    };
  }
  
  return nextLoad(url);
}
