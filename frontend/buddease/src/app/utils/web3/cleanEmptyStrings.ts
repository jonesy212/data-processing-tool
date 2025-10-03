// cleanEmptyStrings.ts
function cleanEmptyStrings<T>(data: T): T {
    if (Array.isArray(data)) {
      return data.map(item => cleanEmptyStrings(item)) as unknown as T;
    }
  
    if (typeof data === 'object' && data !== null) {
      const cleanedObject: Record<string, any> = {};
      for (const key in data) {
        const value = data[key];
        cleanedObject[key] = value === "" ? null : cleanEmptyStrings(value);
      }
      return cleanedObject as T;
    }
  
    return data;
  }
  
  export { cleanEmptyStrings }