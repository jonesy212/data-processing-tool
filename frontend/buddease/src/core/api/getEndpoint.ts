// getEndpoint.ts

// Function to recursively traverse the endpoints object
export const getEndpoint = (endpointPath: string, obj: any): string | undefined => {
    const keys = endpointPath.split('.');
    let current = obj;
  
    for (const key of keys) {
      if (typeof current !== 'object' || current === null || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }
  
    return typeof current === 'string' ? current : undefined;
  };
  