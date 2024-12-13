import * as apiFile from '@/api/ApiFiles';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import * as path from 'path';
import { AppStructureItem } from '../appStructure/AppStructure';
import { frontend } from '../appStructure/FrontendStructure';
import { backend } from '../appStructure/BackendStructure';
import DocumentPermissions from '@/app/components/documents/DocumentPermissions';


interface BackendStructure {
  // Define the structure for the backend
  databaseSchema: string;

}

const backendStructure: AppStructureItem[] = [];

export const traverseBackendDirectory = async (dir: string): Promise<AppStructureItem[]> => {
  const files: string[] = await fetchFilesInDirectory(dir);
  const result: AppStructureItem[] = [];

  const docPermissions = new DocumentPermissions(true, true);

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
      const structureId = UniqueIDGenerator.generateAppStructureID.toString()
      const appStructureItem: AppStructureItem = {
        // Populate with relevant properties

        id: structureId,
        name: path.basename(file, path.extname(file)),
        type: typeof apiFile.getFileType(file),
        draft: false,
        
        path: filePath,
        content: content,
        versions: {
          backend: Promise.resolve(JSON.stringify(backend.getStructureAsArray())), // Wrap in a promise
          frontend: Promise.resolve(JSON.stringify(frontend.getStructureAsArray())) // Wrap in a promise
             
        },
        versionData: [],
        permissions: {
          read: true,
          write: true,
          delete: true,
          share: true,
          execute: true,
        },
        items: {
          // Populate items for backend routes/models etc
        }
        // ... other properties
      };
      result.push(appStructureItem);
    }
  }
  return result;
};


// If you want to allow the method to be used outside the class as well, you can do the following:
export const getStructureAsArray = (
  structure?: Record<string, AppStructureItem>
): AppStructureItem[] => {
  return structure ? Object.values(structure) : [];
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
