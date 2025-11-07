// FileTreeService.ts
import fs from "fs";
import path from "path";

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  size?: number;
  modified?: Date;
  children?: FileTreeNode[];
}

export class FileTreeService {
  private static readonly IGNORE = [
    'node_modules', '.git', 'dist', 'build', '.next', 
    '.DS_Store', 'coverage', '.env', '*.log'
  ];

  /**
   * Generate complete file tree for the project
   */
  static generateFileTree(rootDir: string = process.cwd()): FileTreeNode[] {
    const tree: FileTreeNode[] = [];
    
    try {
      const items = fs.readdirSync(rootDir, { withFileTypes: true });
      
      for (const item of items) {
        if (this.shouldIgnore(item.name)) continue;
        
        const fullPath = path.join(rootDir, item.name);
        const node: FileTreeNode = {
          id: this.generateId(fullPath),
          name: item.name,
          path: fullPath,
          type: item.isDirectory() ? 'directory' : 'file',
        };

        // Add file-specific properties
        if (item.isFile()) {
          const stats = fs.statSync(fullPath);
          node.extension = path.extname(item.name);
          node.size = stats.size;
          node.modified = stats.mtime;
        }

        // Recursively process directories
        if (item.isDirectory()) {
          try {
            node.children = this.generateFileTree(fullPath);
          } catch (error) {
            console.warn(`Cannot access directory: ${fullPath}`, error);
            node.children = [];
          }
        }

        tree.push(node);
      }
    } catch (error) {
      console.error('Error generating file tree:', error);
    }

    return tree;
  }

  /**
   * Search files by name, extension, or content
   */
  static searchFiles(
    tree: FileTreeNode[], 
    query: string, 
    searchInContent: boolean = false
  ): FileTreeNode[] {
    const results: FileTreeNode[] = [];
    const searchTerm = query.toLowerCase();

    const searchNode = (node: FileTreeNode) => {
      const matchesName = node.name.toLowerCase().includes(searchTerm);
      const matchesExtension = node.extension?.toLowerCase().includes(searchTerm);
      
      let matchesContent = false;
      if (searchInContent && node.type === 'file') {
        matchesContent = this.fileContainsText(node.path, searchTerm);
      }

      if (matchesName || matchesExtension || matchesContent) {
        results.push(node);
      }

      if (node.children) {
        node.children.forEach(searchNode);
      }
    };

    tree.forEach(searchNode);
    return results;
  }

  /**
   * Get file content for viewing
   */
  static getFileContent(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  /**
   * Filter tree by file type
   */
  static filterByType(tree: FileTreeNode[], type: 'file' | 'directory'): FileTreeNode[] {
    const results: FileTreeNode[] = [];

    const filterNode = (node: FileTreeNode) => {
      if (node.type === type) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(filterNode);
      }
    };

    tree.forEach(filterNode);
    return results;
  }

  /**
   * Get files by extension
   */
  static filterByExtension(tree: FileTreeNode[], extensions: string[]): FileTreeNode[] {
    const results: FileTreeNode[] = [];
    const extSet = new Set(extensions.map(ext => ext.toLowerCase()));

    const filterNode = (node: FileTreeNode) => {
      if (node.type === 'file' && node.extension && extSet.has(node.extension.toLowerCase())) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(filterNode);
      }
    };

    tree.forEach(filterNode);
    return results;
  }

  /**
   * Get tree statistics
   */
  static getTreeStats(tree: FileTreeNode[]): { files: number; directories: number; totalSize: number } {
    let files = 0;
    let directories = 0;
    let totalSize = 0;

    const countNode = (node: FileTreeNode) => {
      if (node.type === 'file') {
        files++;
        totalSize += node.size || 0;
      } else {
        directories++;
      }
      if (node.children) {
        node.children.forEach(countNode);
      }
    };

    tree.forEach(countNode);
    return { files, directories, totalSize };
  }

  private static shouldIgnore(name: string): boolean {
    return this.IGNORE.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(name);
      }
      return name === pattern;
    });
  }

  private static fileContainsText(filePath: string, searchText: string): boolean {
    try {
      const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
      return content.includes(searchText);
    } catch {
      return false;
    }
  }

  private static generateId(filePath: string): string {
    return Buffer.from(filePath).toString('base64');
  }
}