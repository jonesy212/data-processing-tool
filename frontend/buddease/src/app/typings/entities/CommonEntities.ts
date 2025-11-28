// CommonEntities.ts
import { BackendStructure } from '@/app/config/appStructure/IBackendStructure';
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import { NotificationData } from '@/app/hooks/useNotificationSystem';
import { Document } from '@/app/state/stores/DocumentStore';
import { AppAttachment, AppEntity, AppExcludedFields, AppIncludedFields, AppK, AppMeta } from "@/app/typings/entities/AppEntity";
import FrontendStructure from '@/app/config/appStructure/FrontendStructure';

// Create helper types for common patterns
type AppDocument = Document<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppDocumentData = DocumentData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppNotificationData = NotificationData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppFrontendStructure = FrontendStructure<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppBackendStructure = BackendStructure<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;

export type {
  AppBackendStructure, AppDocument,
  AppDocumentData, AppFrontendStructure, AppNotificationData
};
