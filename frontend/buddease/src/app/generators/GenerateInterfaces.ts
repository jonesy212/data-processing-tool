import { readCache, writeCache } from '../utils/ReadAndWriteCache';
import { generateUniqueApiId } from './generateNewApiConfig';
import { CacheData } from '../generators/GenerateCache'; // Import CacheData type

export async function generateInterfaces(backendModelPaths: string[]): Promise<void> {
  backendModelPaths.forEach(async (backendModelPath) => {
    const modelName = extractModelName(backendModelPath);

    try {
      // Check if the interface is already in the cache
      let cache: CacheData = await readCache();

      if (!cache[modelName]) {
        // If not, generate the interface code
        const interfaceCode = generateInterfaceCode(modelName);

        // Example usage - log the interface code instead of writing to a file
        console.log(interfaceCode);

        // Update the cache with the interface id
        cache[modelName] = generateUniqueApiId(); // Use generateUniqueApiId function here
        await writeCache(cache);
      }
    } catch (error) {
      console.error('Error generating interface:', error);
    }
  });
}

// Function to extract the model name from the backend model path
function extractModelName(backendModelPath: string): string {
  // Extract the model name from the path
  // Adjust this based on your actual backend model structure
  return backendModelPath.split('/').pop()!.replace('.py', '');
}

// Function to generate the interface code based on the model name
function generateInterfaceCode(modelName: string): string {
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
