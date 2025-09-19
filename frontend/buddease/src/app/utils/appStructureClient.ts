// appStructureClient.ts
// Client-side file 
import AppStructure, { FileSystemService } from '@/app/config/AppStructure';

// Browser-compatible file system (using API calls)
export const browserFileSystem: FileSystemService = {
  readdir: async (dir) => {
    const response = await fetch(`/api/files?path=${encodeURIComponent(dir)}`);
    const data = await response.json();
    return data.files;
  },
  stat: async (filePath) => {
    const response = await fetch(`/api/file-stat?path=${encodeURIComponent(filePath)}`);
    const data = await response.json();
    return { isDirectory: data.isDirectory };
  },
  readFile: async (filePath) => {
    const response = await fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`);
    return await response.text();
  },
  exists: async (filePath) => {
    try {
      const response = await fetch(`/api/file-exists?path=${encodeURIComponent(filePath)}`);
      const data = await response.json();
      return data.exists;
    } catch {
      return false;
    }
  }
};

export function createClientAppStructure(type: "backend" | "frontend" = "frontend"): AppStructure {
  return new AppStructure(type, browserFileSystem);
}