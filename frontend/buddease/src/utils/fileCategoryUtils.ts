import { getFileFromTree } from './appUtils';
import { getFileContent } from '@/app/server/fsOperations';
import { AppTree } from "@/app/generators/generateAppTree";

// Define file category types
export type FileCategory = 
  | 'component' 
  | 'page' 
  | 'hook' 
  | 'util' 
  | 'type' 
  | 'style' 
  | 'config' 
  | 'test' 
  | 'unknown';

// Define enhanced metadata type
export interface FileMetadata {
  viewType: string;
  operation: string;
  fileCategory: FileCategory;
  selectionMethod: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  lastModified?: Date;

  exports?: string[];     // Keep existing
  path: string;           // Keep existing
  name?: string;          // Add new
  type?: string;          // Add new  
  size?: number;          // Add new
  extension?: string;     // Add new
}

// Main function to get file category
export const getFileCategory = (
  fileNameOrType: string,
  appTree?: AppTree
): FileCategory => {
  // Extract extension if given a full filename
  const fileName = fileNameOrType.includes('.') 
    ? fileNameOrType 
    : fileNameOrType;
  
  const extension = getFileExtension(fileName);
  const baseName = getFileNameWithoutExtension(fileName);
  
  // Check based on file patterns
  return determineFileCategory(baseName, extension, appTree);
};

// Helper: Extract file extension
const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

// Helper: Get filename without extension
const getFileNameWithoutExtension = (fileName: string): string => {
  return fileName.split('.').slice(0, -1).join('.');
};

// Main categorization logic
const determineFileCategory = (
  baseName: string,
  extension: string,
  appTree?: AppTree
): FileCategory => {
  // 1. Check by extension first
  const extensionCategory = getCategoryByExtension(extension);
  if (extensionCategory !== 'unknown') {
    return extensionCategory;
  }
  
  // 2. Check by naming patterns
  const patternCategory = getCategoryByPattern(baseName);
  if (patternCategory !== 'unknown') {
    return patternCategory;
  }
  
  // 3. If we have appTree, check tree structure
  if (appTree) {
    const treeCategory = getCategoryByTreeLocation(baseName, appTree);
    if (treeCategory !== 'unknown') {
      return treeCategory;
    }
  }
  
  return 'unknown';
};

// Categorize by file extension
const getCategoryByExtension = (extension: string): FileCategory => {
  const extensionMap: Record<string, FileCategory> = {
    // Components
    'tsx': 'component',
    'jsx': 'component',
    
    // Pages
    'page.tsx': 'page',
    'page.jsx': 'page',
    'route.tsx': 'page',
    'route.jsx': 'page',
    
    // Hooks
    'ts': 'hook',
    'js': 'hook',
    
    // Types
    'd.ts': 'type',
    'types.ts': 'type',
    
    // Styles
    'css': 'style',
    'scss': 'style',
    'sass': 'style',
    'less': 'style',
    'styled.ts': 'style',
    'styles.ts': 'style',
    
    // Config
    'json': 'config',
    'config.ts': 'config',
    'config.js': 'config',
    'env': 'config',
    
    // Tests
    'test.ts': 'test',
    'test.tsx': 'test',
    'test.js': 'test',
    'spec.ts': 'test',
    'spec.tsx': 'test',
  };
  
  return extensionMap[extension] || 'unknown';
};

// Categorize by naming patterns
const getCategoryByPattern = (baseName: string): FileCategory => {
  const patterns: Array<[RegExp, FileCategory]> = [
    // Components
    [/^[A-Z][a-zA-Z]*$/, 'component'], // PascalCase
    [/Component$/, 'component'],
    [/\.component$/, 'component'],
    
    // Pages
    [/Page$/, 'page'],
    [/\.page$/, 'page'],
    [/Route$/, 'page'],
    
    // Hooks
    [/^use[A-Z][a-zA-Z]*$/, 'hook'], // useSomething
    [/Hook$/, 'hook'],
    [/\.hook$/, 'hook'],
    
    // Utils
    [/^[a-z]+Utils?$/, 'util'],
    [/Utils?$/, 'util'],
    [/Helper$/, 'util'],
    [/^[a-z]+Helper$/, 'util'],
    
    // Types
    [/Types?$/, 'type'],
    [/^[A-Z][a-zA-Z]*Type$/, 'type'],
    [/Interface$/, 'type'],
    
    // Styles
    [/Styles?$/, 'style'],
    [/Theme$/, 'style'],
    [/Colors$/, 'style'],
  ];
  
  for (const [pattern, category] of patterns) {
    if (pattern.test(baseName)) {
      return category;
    }
  }
  
  return 'unknown';
};

// Categorize by location in AppTree
const getCategoryByTreeLocation = (
  fileName: string, 
  appTree: AppTree
): FileCategory => {
  // Try to get file content from tree
  const fileContent = getFileFromTree(appTree, fileName);
  
  if (fileContent) {
    // Analyze content for hints
    const content = fileContent.toLowerCase();
    
    if (content.includes('react') && content.includes('export default')) {
      return 'component';
    }
    
    if (content.includes('export const') && content.includes('use')) {
      return 'hook';
    }
    
    if (content.includes('interface') || content.includes('type ')) {
      return 'type';
    }
    
    if (content.includes('export const') && !content.includes('use')) {
      return 'util';
    }
  }
  
  // Check folder structure in appTree
  const folder = getFolderFromTree(appTree, 'components');
  if (folder && fileName in folder) {
    return 'component';
  }
  
  const pagesFolder = getFolderFromTree(appTree, 'pages');
  if (pagesFolder && fileName in pagesFolder) {
    return 'page';
  }
  
  const hooksFolder = getFolderFromTree(appTree, 'hooks');
  if (hooksFolder && fileName in hooksFolder) {
    return 'hook';
  }
  
  return 'unknown';
};

// Enhanced metadata generation
export const generateFileMetadata = (
  fileName: string,
  operation: string = "file_selection",
  selectionMethod: string = "user_click",
  appTree?: AppTree,
  filePath?: string
): FileMetadata => {
  const fileCategory = getFileCategory(fileName, appTree);
  
  const metadata: FileMetadata = {
    viewType: "enhanced_tree",
    operation,
    fileCategory,
    selectionMethod,
    fileName,
    fileType: getFileExtension(fileName),
  };
  
  // Add file system info if path provided
  if (filePath) {
    try {
      const fileContent = getFileContent(filePath);
      metadata.fileSize = fileContent.length;
      // Add lastModified from fs.stats if needed
    } catch (error) {
      console.warn(`Could not read file stats for ${filePath}:`, error);
    }
  }
  
  return metadata;
};

// Usage example
export const exampleUsage = () => {
  const appTree: AppTree = { 
    components: { 
      'Button.tsx': 'export default function Button() {}',
      'useCounter.ts': 'export const useCounter = () => {}',
      'types.ts': 'export interface User {}'
    } 
  };
  
  // Example 1: Basic usage
  const category1 = getFileCategory('Button.tsx', appTree); // 'component'
  const category2 = getFileCategory('useCounter.ts', appTree); // 'hook'
  
  // Example 2: Enhanced metadata
  const metadata = generateFileMetadata(
    'Button.tsx',
    'file_selection',
    'user_click',
    appTree,
    '/path/to/Button.tsx'
  );
  
  return {
    metadata: {
      viewType: "enhanced_tree",
      operation: "file_selection",
      fileCategory: getFileCategory('Button.tsx'),
      selectionMethod: "user_click",
    },
    enhancedMetadata: metadata
  };
};