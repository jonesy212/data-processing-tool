// RealtimeDataEntity.ts
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { RealtimeData, RealtimeDataItem } from '@/app/typings/realtimeTypes';

export interface RealtimeDataEntity extends BaseDataEntity {
  // Core realtime data properties
  id: string;
  name: string;
  value: string | number | boolean;
  type: string;
  
  // Timestamps and versioning
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  
  // Data source and context
  source: 'sensor' | 'user' | 'system' | 'external' | 'calculation';
  category: string;
  tags: string[];
  
  // Data quality and validation
  quality: 'high' | 'medium' | 'low' | 'unknown';
  confidence: number; // 0-1 scale
  isValid: boolean;
  validationErrors?: string[];
  
  // Relationships and context
  parentId?: string;
  relatedIds: string[];
  context: Record<string, any>;
  
  // Real-time specific properties
  isStreaming: boolean;
  updateFrequency: number; // milliseconds
  lastProcessed?: Date;
  processingLatency?: number; // milliseconds
  
  // Storage and persistence
  isPersisted: boolean;
  retentionPeriod?: number; // days
  compression: 'none' | 'gzip' | 'lz4';
  
  // Access control and security
  accessLevel: 'public' | 'private' | 'shared';
  encryption: 'none' | 'aes-256' | 'rsa';
  encryptedValue?: string;
  
  // Metadata and analytics
  metadata: {
    unit?: string;
    minValue?: number;
    maxValue?: number;
    averageValue?: number;
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    anomalyScore?: number;
    predictions?: Array<{
      timestamp: Date;
      predictedValue: number;
      confidence: number;
    }>;
  };
  
  // Historical data references
  previousValues?: Array<{
    timestamp: Date;
    value: string | number | boolean;
    version: number;
  }>;
  
  // Alerting and notifications
  alerts: Array<{
    id: string;
    type: 'threshold' | 'anomaly' | 'trend';
    condition: string;
    isActive: boolean;
    triggeredAt?: Date;
  }>;
}




// Complete type parameter definitions
export type RealtimeDataK = RealtimeDataEntity;
export type RealtimeDataMeta = DefaultMeta<RealtimeDataEntity, RealtimeDataK>;
export type RealtimeDataAttachment = Attachment;
export type RealtimeDataExcludedFields = 'encryptedValue' | 'previousValues' | 'validationErrors';
export type RealtimeDataIncludedFields = keyof RealtimeDataEntity;

// RealtimeData type with all 6 parameters
export type AppRealtimeData = RealtimeData<
  RealtimeDataEntity,
  RealtimeDataK,
  RealtimeDataMeta,
  RealtimeDataAttachment,
  RealtimeDataExcludedFields,
  RealtimeDataIncludedFields
>;

// RealtimeDataItem type with all 6 parameters
export type AppRealtimeDataItem = RealtimeDataItem<
  RealtimeDataEntity,
  RealtimeDataK,
  RealtimeDataMeta,
  RealtimeDataAttachment,
  RealtimeDataExcludedFields,
  RealtimeDataIncludedFields
>;

// Factory function for creating realtime data instances
export const createRealtimeDataEntity = (
  partial?: Partial<RealtimeDataEntity>
): RealtimeDataEntity => ({
  id: '',
  name: '',
  value: '',
  type: 'unknown',
  timestamp: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
  source: 'system',
  category: 'general',
  tags: [],
  quality: 'unknown',
  confidence: 1.0,
  isValid: true,
  relatedIds: [],
  context: {},
  isStreaming: false,
  updateFrequency: 1000,
  isPersisted: true,
  compression: 'none',
  accessLevel: 'private',
  encryption: 'none',
  metadata: {
    trend: 'stable'
  },
  alerts: [],
  ...partial
});

// Usage example
export const realtimeData = {} as RealtimeData<
  RealtimeDataEntity,
  RealtimeDataK,
  RealtimeDataMeta,
  RealtimeDataAttachment,
  RealtimeDataExcludedFields,
  RealtimeDataIncludedFields
>;