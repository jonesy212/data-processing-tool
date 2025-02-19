interface SecureField<T = any> {
  value: T;
  isSensitive: boolean;
  allowUserAccess?: boolean;
  allowedRoles?: string[];
  canView: boolean
}

interface SecureMetadata {
  [key: string]: SecureField<any>;
}



export type { SecureMetadata, SecureField }