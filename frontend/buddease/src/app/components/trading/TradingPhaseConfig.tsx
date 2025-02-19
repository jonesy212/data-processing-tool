import VerificationProcess from "../phases/crypto/VerificationProcess";

let verificationDone: boolean = false;
// TradingPhaseConfig.ts
export interface TradingPhaseConfig {
    name: string;
    component: React.ComponentType<any>;
    completionCondition: () => boolean;
  }
  
  export const tradingPhases: TradingPhaseConfig[] = [
      // Define trading phases here

    {
      name: "Verification",
      component: VerificationProcess,
      completionCondition: () => verificationDone,
    },
    // Add other phases as needed
  ];
  