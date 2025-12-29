// FileHelpers.ts
import fs from 'fs';
import path from 'path';

export function getDirectorySize(dir: string): number {
  try {
    const files = fs.readdirSync(dir, { recursive: true } as any);
    let totalSize = 0;

    files.forEach(file => {
      const filePath = path.join(dir, String(file));
      try {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) {
          totalSize += stat.size;
        }
      } catch {
        // Skip inaccessible files
      }
    });

    return totalSize;
  } catch {
    return 0;
  }
}

export function getSourceFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...getSourceFiles(fullPath));
      } else if (
        item.endsWith('.ts') ||
        item.endsWith('.tsx') ||
        item.endsWith('.js') ||
        item.endsWith('.jsx')
      ) {
        files.push(fullPath);
      }
    });
  } catch (error) {
    console.warn(`Could not read directory ${dir}:`, error);
  }

  return files;
}
