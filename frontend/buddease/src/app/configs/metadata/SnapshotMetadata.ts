interface SnapshotMetadata {
  permissionLevel: PermissionLevel;
  visibility: VisibilityLevel;
  accessControlList: AccessControlEntry[];
  externalReferences?: ExternalReference[];
  validationStatus: ValidationStatus;
}