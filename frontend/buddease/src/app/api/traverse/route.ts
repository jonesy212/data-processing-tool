// route.ts
// traverse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as fs from "fs";
import * as path from "path";

// Define the interface here (or import from shared types)
interface FileSystemItem {
  id: string;
  name: string;
  type: string;
  path: string;
  content?: string;
  draft: boolean;
  permissions?: any;
  versions?: any;
  versionData?: any;
  items?: { [key: string]: FileSystemItem };
}

async function traverseFrontendDirectory(dir: string): Promise<FileSystemItem[]> {
  // Your existing server-side traversal logic here
  const files = await fs.promises.readdir(dir);
  const result: FileSystemItem[] = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      const nested = await traverseFrontendDirectory(filePath);
      result.push(...nested);
    } else if (file.endsWith(".tsx")) {
      const fileContent = await fs.promises.readFile(filePath, "utf-8");
      
      const fileSystemItem: FileSystemItem = {
        path: filePath,
        content: fileContent,
        id: file,
        name: file,
        type: "file",
        items: {},
        draft: false,
        permissions: {
          userId: "default",
          permissions: {},
          permissionType: "read",
          canView: true,
          canEdit: false,
          read: true,
          write: false,
          delete: false,
          share: false,
          execute: false,
        },
        versionData: null,
      };

      result.push(fileSystemItem);
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
    }

    const structure = await traverseFrontendDirectory(path);
    return NextResponse.json(structure);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to traverse directory' }, { status: 500 });
  }
}

export { traverseFrontendDirectory };
