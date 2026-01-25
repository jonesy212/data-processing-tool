// supportTypes.ts
app/features/user-support/types/userSupport.ts
export enum UserSupportPhase {
  USER_PHASE_PLANNING = 0,
  EXECUTION = 1,
  MONITORING = 2,
  CLOSURE = 3,
}

export interface UserSupportSession {
  id: string;
  currentPhase: UserSupportPhase;
  startDate: Date;
  endDate?: Date;
  
}