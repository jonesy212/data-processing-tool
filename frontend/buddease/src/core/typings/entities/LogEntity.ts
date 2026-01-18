// LogEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { LogData } from '@/core/models/LogData';

// 1. Base Log Entity
export interface BaseLogEntity extends BaseDataEntity {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  source: string;
  userId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
  duration?: number; // for performance logs
  stackTrace?: string; // for error logs
}

// 2. Type definitions with 6 parameters for Logs
type LogEntity = BaseLogEntity;
type LogK = BaseLogEntity;
type LogMeta = DefaultMeta<BaseLogEntity, LogK>;
type LogAttachment = Attachment;
type LogExcludedFields = DefaultExcludedFields<BaseLogEntity>;
type LogIncludedFields = keyof BaseLogEntity;

// 3. Log-specific types
type LogDataEntity = LogData<BaseLogEntity, LogK, LogMeta, LogAttachment, LogExcludedFields, LogIncludedFields>;


export type {
    LogAttachment, LogDataEntity, LogEntity, LogExcludedFields,
    LogIncludedFields, LogK,
    LogMeta
};

