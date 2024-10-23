// UserJourneyManager.tsx
import React, { useState } from "react";
import UserJourneyManager from "../onboarding/OnboardingPhase";
import { OnboardingPhase } from "./UserJourneyManager";

const UserJourneyManager: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(
    OnboardingPhase.REGISTER
  );

  return (
    <UserJourneyManager
      currentPhase={currentPhase}
      setCurrentPhase={setCurrentPhase}
    />
  );
};

export default UserJourneyManager;
