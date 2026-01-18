// ComponentConfig.ts
// For individual component instances (new)
import { ComponentsConfig } from '@/core/config/ComponentsConfig';
export type ComponentType = keyof ComponentsConfig;

export interface ComponentConfig {
  id: number;
  name: string;
  type: keyof ComponentType;
  props?: Record<string, any>;
  children?: ComponentConfig[];
  position?: { x: number; y: number }; // For drag-and-drop
  size?: { width: number; height: number }; // For layout
  parentId?: number | null; // For hierarchy
  // Add other instance properties as needed
}