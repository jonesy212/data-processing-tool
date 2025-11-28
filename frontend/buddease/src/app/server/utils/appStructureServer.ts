// appStructureServer.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import { FileSystemService } from '@/app/config/appStructure/AppStructure'; // Import the interface
import AppStructure from '@/app/config/appStructure/AppStructure'; // Import your AppStructure class

// Server-specific file system implementation
export const nodeFileSystem: FileSystemService = {
  readdir: fs.readdir,
  stat: async (filePath) => {
    const stat = await fs.stat(filePath);
    return { isDirectory: stat.isDirectory() };
  },
  readFile: fs.readFile,
  exists: async (filePath) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
};

// Server-side factory function
export function createServerAppStructure(type: "backend" | "frontend" = "frontend"): AppStructure {
  return new AppStructure(type, nodeFileSystem);
}

// Server-side usage example
export async function getServerAppStructure() {
  try {
    const appStructure = createServerAppStructure("frontend");
    const structure = await appStructure.getStructureAsArray();
    return structure;
  } catch (error) {
    console.error('Failed to get server app structure:', error);
    throw error;
  }
}