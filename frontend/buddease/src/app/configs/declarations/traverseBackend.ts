import * as path from 'path';
import { AppStructureItem } from '../appStructure/AppStructure';

interface BackendStructure {
  // Define the structure for the backend
}

const backendStructure: AppStructureItem[] = [];

export const traverseBackendDirectory = async (dir: string): Promise<AppStructureItem[]> => {
  const files: string[] = await fetchFilesInDirectory(dir);
  const result: AppStructureItem[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const isDirectory = await isDirectoryAsync(filePath);

    if (isDirectory) {
      // Recursively traverse directories and push the result into the current result array
      const directoryResult = await traverseBackendDirectory(filePath);
      result.push(...directoryResult);
    } else {
      // Logic to parse file and update backendStructure accordingly
      // Example: if (file.endsWith('.js')) { /* update backendStructure */ }
      const content = await fetchFileContent(filePath);
      const appStructureItem: AppStructureItem = {
        // Populate with relevant properties
        path: filePath,
        content: content,
        // ... other properties
      };
      result.push(appStructureItem);
    }
  }
  return result;
};

// Function to fetch files in a directory
const fetchFilesInDirectory = async (dir: string): Promise<string[]> => {
  // Implement logic to fetch file names from the server
  // Example using fetch API:
  const response = await fetch(`/listFiles?dir=${encodeURIComponent(dir)}`);
  const files = await response.json();
  return files;
};

// Function to check if a path is a directory
const isDirectoryAsync = async (filePath: string): Promise<boolean> => {
  // Implement logic to check if the path is a directory
  // Example using fetch API:
  const response = await fetch(`/isDirectory?path=${encodeURIComponent(filePath)}`);
  const isDirectory = await response.json();
  return isDirectory;
};

// Function to fetch content of a file
const fetchFileContent = async (filePath: string): Promise<string> => {
  // Implement logic to fetch file content from the server
  // Example using fetch API:
  const response = await fetch(`/getFileContent?path=${encodeURIComponent(filePath)}`);
  const content = await response.text();
  return content;
};

// todo #review update your file path so we can create your backend structure
const backendStructureResult = await traverseBackendDirectory('/path/to/your/project/backend');
backendStructure.push(...backendStructureResult); // Update the backendStructure with the result

console.log(backendStructure);
