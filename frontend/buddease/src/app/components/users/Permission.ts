// Permission.ts
interface Permission {
  userId: string;
  permissions: string[];
}

interface EncryptionSetting {
  enabled: boolean;
  algorithm: string;
}

interface PrivacyCompliance {
  policyVersion: string;
  complianceDate: string;
}

export type { EncryptionSetting, Permission, PrivacyCompliance };
