registrationTypes.ts
app/features/registration/types/registration.ts
export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
}

export interface RegistrationResult {
  success: boolean;
  user?: any;
  message?: string;
}