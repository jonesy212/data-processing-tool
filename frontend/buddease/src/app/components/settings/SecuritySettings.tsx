// SecuritySettings.tsx
interface SecuritySettings {
  twoFactorAuthentication: boolean;
  securityQuestions: string[],
  passwordPolicy: string;
  passwordExpirationDays: number;
  passwordStrength: string;

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
  }
  
  const defaultSecuritySettings: SecuritySettings = {
    twoFactorAuthentication: false,
    securityQuestions: ["What is your pet's name?"],

    passwordPolicy: 'StandardPolicy',
    passwordExpirationDays: 90,
    passwordStrength: 'Strong',
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
  };
  