// AquaState.ts
import { AquaConfig } from '@/utils/web3/webConfigs/aqua/AquaConfig';

export interface AquaSession {
  id: string;
  userId: string;
  projectId?: string;
  createdAt: Date;
  expiresAt?: Date;
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface AquaFeatures {
  realTimeUpdates: boolean;
  advancedAnalytics: boolean;
  collaborativeEditing: boolean;
  [key: string]: boolean;
}

export interface AquaState {
  config: AquaConfig;
  session: AquaSession | null;
  isActive: boolean;
  initializedAt: Date;
  lastActivity: Date;
  features: AquaFeatures;
  
  // Methods that the component might need
  saveToStorage?(): Promise<void>;
  cleanup?(): Promise<void>;
  syncIfNeeded?(): Promise<void>;
  checkForUpdates?(): Promise<void>;
  performGarbageCollection?(): Promise<void>;
}

export interface AquaStoreState {
  config: AquaConfig | null;
  session: AquaSession | null;
  isLoading: boolean;
  error: string | null;
}