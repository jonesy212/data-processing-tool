// mergeConfigurations.ts

/**
 * Merge configurations ensuring no property is overwritten.
 * @param baseConfig - The base configuration object.
 * @param newConfig - The new configuration object to merge.
 * @returns Merged configuration object.
 */
const mergeConfigurations = (baseConfig: any, newConfig: any): any => {
  return Object.keys(newConfig).reduce((acc, key) => {
    if (!acc[key]) {
      acc[key] = newConfig[key];
    }
    return acc;
  }, { ...baseConfig });
};


export default mergeConfigurations;