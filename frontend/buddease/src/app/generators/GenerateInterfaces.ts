// GenerateInterfaces.ts
import * as fs from 'fs';
import { readCache, writeCache } from '../utils/ReadAndWriteCache';
import { generateUniqueId } from './generateNewApiConfig';

export function generateInterfaces(backendModelPaths: string[]): void {
  backendModelPaths.forEach(async (backendModelPath) => {
    const modelName = extractModelName(backendModelPath);

    // Check if the interface is already in the cache
    const cache: { [key: string]: string } = await readCache();
    if (cache && !cache[modelName]) {
      // If not, generate the interface code
      const interfaceCode = generateInterfaceCode(modelName);

      // Save the interface code to the file
      const interfacePath = `./src/app/interfaces/${modelName}.ts`;
      fs.writeFileSync(interfacePath, interfaceCode);

      // Update the cache with the interface id
      cache[modelName] = generateUniqueId();
      await writeCache(cache);
    }
  });
}



function extractModelName(backendModelPath: string): string {
  // Extract the model name from the path
  // Adjust this based on your actual backend model structure
  return backendModelPath.split('/').pop()!.replace('.py', '');
}

function generateInterfaceCode(modelName: string): string {
  // Generate the interface code based on the model name
  return `export interface ${modelName} {\n` +
         `  id: number;\n` +
         `  name: string;\n` +
         `  description: string;\n` +
         `  assignedTo: User[];\n` +
         `  dueDate: Date;\n` +
         `  status: 'todo' | 'inProgress' | 'completed';\n` +
         `  priority: 'low' | 'medium' | 'high';\n` +
         `  estimatedHours: number | null;\n` +
         `  actualHours: number | null;\n` +
         `  startDate: Date | null;\n` +
         `  completionDate: Date | null;\n` +
         `  tags: string[];\n` +
         `  dependencies: Task[];\n` +
         `}\n`;
}
