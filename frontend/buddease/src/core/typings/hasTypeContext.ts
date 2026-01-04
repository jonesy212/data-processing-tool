hasTypeContext.ts
More type guards if you have additional usage types
function isFunctionUsage(usage: any): usage is { 
  file: string; 
  line: number; 
  params: string[]; 
  returnType: string 
} {
  return 'params' in usage && 'returnType' in usage;
}

function isClassUsage(usage: any): usage is { 
  file: string; 
  line: number; 
  className: string; 
  extends?: string;
  implements?: string[];
} {
  return 'className' in usage;
}

function isInterfaceUsage(usage: any): usage is { 
  file: string; 
  line: number; 
  interfaceName: string; 
  members: string[];
} {
  return 'interfaceName' in usage;
}

const hasTypeContext = allUsages.some(usage => {
  if (isPropertyUsage(usage)) {
    // Property usage
    return usage.context.includes(':') || 
           usage.context.includes('interface') ||
           usage.type.includes(':') ||
           usage.context.includes('as ') ||
           usage.context.includes('satisfies');
  }
  
  if (isMethodUsage(usage)) {
    // Method usage
    return usage.signature.includes(':') || 
           usage.signature.includes('=>') ||
           usage.signature.includes('<') ||
           usage.returnType.includes(':') ||
           usage.returnType.includes('<');
  }
  
  if (isFunctionUsage(usage)) {
    // Function usage
    return usage.returnType.includes(':') ||
           usage.params.some((param: string) => param.includes(':'));
  }
  
  if (isClassUsage(usage)) {
    // Class usage
    return !!usage.extends || 
           (usage.implements && usage.implements.length > 0);
  }
  
  if (isInterfaceUsage(usage)) {
    // Interface usage - always has type context
    return true;
  }
  
  if ('type' in usage) {
    // Generic usage with type property
    const type = usage.type;
    return type.includes(':') || 
           type.includes('=>') ||
           type.includes('<') ||
           type.includes('interface');
  }
  
  if ('genericTypes' in usage) {
    // Has generic type annotations
    return usage.genericTypes.length > 0;
  }
  
  if ('typeConstraints' in usage) {
    // Has type constraints
    return usage.typeConstraints.length > 0;
  }
  
  // Check for TypeScript-specific type patterns
  if ('source' in usage && typeof usage.source === 'string') {
    return usage.source.includes(':') || 
           usage.source.includes('as ') ||
           usage.source.includes('satisfies') ||
           usage.source.includes('extends ') ||
           usage.source.includes('implements ');
  }
  
  return false;
});