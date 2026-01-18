// DomainObject.ts
typings/DomainObject.ts
export interface DomainObject {
  id: string;
  type: string;
  data: any;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    synced?: boolean;
    queuedForSync?: boolean;
    syncError?: string;
      lastSyncAttempt?: Date;
        lastUpdated?: string; // ADD THIS

  };
}