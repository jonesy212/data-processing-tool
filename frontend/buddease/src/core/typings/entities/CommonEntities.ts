// CommonEntities.ts
import FrontendStructure from '@/core/config/appStructure/FrontendStructure';
import type { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import type { NotificationData } from '@/core/hooks/useNotificationSystem';
import BackendStructure from '@/core/server/database/BackendStructure';
import type { Document } from '@/core/state/stores/DocumentStore';
import type { AppAttachment, AppEntity, AppExcludedFields, AppIncludedFields, AppK, AppMeta } from "@/core/typings/entities/AppEntity";

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

