// GenerateInterfaces.ts
import * as fs from 'fs';

export function generateInterfaces(backendModelPaths: string[]): void {
  backendModelPaths.forEach((backendModelPath) => {
    const modelName = extractModelName(backendModelPath);

    // Check if the interface is already in the cache
    const cache = readCache();
    if (!cache[modelName]) {
      // If not, generate the interface code
      const interfaceCode = generateInterfaceCode(modelName);

      // Save the interface code to the file
      const interfacePath = `./src/app/interfaces/${modelName}.ts`;
      fs.writeFileSync(interfacePath, interfaceCode);

      // Update the cache with the interface id
      cache[modelName] = generateUniqueId();
      writeCache(cache);
    }
  });
}

function extractModelName(backendModelPath: string): string {
  // Extract the model name from the path
  // You might need to adjust this based on your actual backend model structure
  return backendModelPath.split('/').pop()!.replace('.ts', '');
}

function generateInterfaceCode(modelName: string): string {
  // Generate the interface code based on the model name
  return `export interface ${modelName} {\n  // Define your properties here\n}\n`;
}

function generateUniqueId(): string {
  // Generate a unique identifier (you can use a library like uuid)
  // For simplicity, using a timestamp in this example
  return Date.now().toString();
}
