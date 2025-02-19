// SecuritySettings.tsx
import { Permission } from "@/app/components/users/Permission";

interface SecuritySettings {
  twoFactorAuthentication: boolean;
  securityQuestions: string[],
  passwordPolicy: string;
  passwordExpirationDays: number;
  passwordStrength: string;
  permission: Permission
    passwordComplexityRequirements: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireDigits: boolean;
      requireSpecialCharacters: boolean;
    };
    accountLockoutPolicy: {
      enabled: boolean;
      maxFailedAttempts: number;
      lockoutDurationMinutes: number;
    };
    accountLockoutThreshold: number;
  }
  
  const defaultSecuritySettings: SecuritySettings = {
    twoFactorAuthentication: false,
    securityQuestions: ["What is your pet's name?"],
    
    passwordPolicy: 'StandardPolicy',
    passwordExpirationDays: 90,
    passwordStrength: 'Strong',
    permission: {
      userId: "",
      permissions: {},
      permissionType: "read"
    },
    passwordComplexityRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireDigits: true,
      requireSpecialCharacters: false,
    },
    accountLockoutPolicy: {
      enabled: true,
      maxFailedAttempts: 5,
      lockoutDurationMinutes: 15,
    },
    accountLockoutThreshold: 5, // TODO: Implement account lockout threshold
  };
  


  export default defaultSecuritySettings;

  export type { SecuritySettings }