// AccessControlEntry.ts
import { PermissionLevel, VisibilityLevel } from './PermissionEnums';

export interface AccessControlEntry {
  userId?: string;       // User-specific access
  groupId?: string;      // Group-specific access
  permission: PermissionLevel;
  visibility: VisibilityLevel;
  inherited?: boolean;   // True if permission is inherited from a parent resource
  expiration?: Date;     // Optional expiration date
  notes?: string;        // Optional notes about the access
}
