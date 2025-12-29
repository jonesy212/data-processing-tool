// app/models/TreeNode.ts

export interface TreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  lastModified?: Date;
  children?: TreeNode[];
  parent?: TreeNode;
  metadata?: {
    lines?: number;
    functions?: number;
    complexity?: number;
    [key: string]: any;
  };
}