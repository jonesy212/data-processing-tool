import { AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields } from "@/app/typings/entities/AppEntity";
import { Document } from '@/app/state/stores/DocumentStore';
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import { NotificationData } from "@/app/state/redux/slices/NofiticationsSlice";
import BackendStructure from '@/config/appStructure/BackendStructure';
import FrontendStructure from '@/config/appStructure/FrontendStructure';

// Create helper types for common patterns
type AppDocument = Document<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppDocumentData = DocumentData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppNotificationData = NotificationData<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppFrontendStructure = FrontendStructure<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;
type AppBackendStructure = BackendStructure<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>;

export type {
  AppDocument,
  AppDocumentData,
  AppNotificationData,
  AppFrontendStructure,
  AppBackendStructure
}