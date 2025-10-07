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