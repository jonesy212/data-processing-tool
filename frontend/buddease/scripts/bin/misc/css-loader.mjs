// Minimal CSS loader - skip all CSS files
export async function resolve(specifier, context, nextLoad) {
  if (specifier.endsWith('.css')) {
    return {
      url: 'data:text/css,',
      shortCircuit: true
    };
  }
  return nextLoad(specifier);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('data:text/css')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};'
    };
  }
  return nextLoad(url);
}