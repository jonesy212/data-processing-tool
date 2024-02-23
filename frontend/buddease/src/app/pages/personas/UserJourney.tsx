// UserJourneyManager.tsx
import React, { useState } from "react";
import OnboardingPhaseComponent from "../onboarding/OnboardingPhase";
import { OnboardingPhase } from "./UserJourneyManager";

const UserJourneyManager: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(
    OnboardingPhase.REGISTER
  );

  return (
    <OnboardingPhaseComponent
      currentPhase={currentPhase}
      setCurrentPhase={setCurrentPhase}
    />
  );
};

export default UserJourneyManager;
