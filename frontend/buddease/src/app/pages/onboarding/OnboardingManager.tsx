// OnboardingManager.tsx
import ProfileSetupPhase from '@/app/components/phases/onboarding/ProfileSetupPhase';
import React, { useState } from 'react';
import { OnboardingPhase } from './OnboardingPhase';
import RegistrationPhase from './RegistrationPhase';
import WelcomePage from './WelcomePage';

const OnboardingManager: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(OnboardingPhase.WELCOME);

  const handleNextPhase = () => {
    switch (currentPhase) {
      case OnboardingPhase.WELCOME:
        setCurrentPhase(OnboardingPhase.REGISTER);
        break;
      case OnboardingPhase.REGISTER:
        // Handle registration completion and navigate to the next phase
        setCurrentPhase(OnboardingPhase.PROFILE_SETUP);
        break;
      case OnboardingPhase.PROFILE_SETUP:
        // Handle profile setup completion and navigate to the next phase
        // For example, you might redirect to the main application after onboarding
        break;
      default:
        break;
    }
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case OnboardingPhase.WELCOME:
        return <WelcomePage />;
      case OnboardingPhase.REGISTER:
        return <RegistrationPhase />;
      case OnboardingPhase.PROFILE_SETUP:
        return <ProfileSetupPhase onSubmit={handleNextPhase} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderCurrentPhase()}
      <button onClick={handleNextPhase}>Next</button>
    </div>
  );
};

export default OnboardingManager;
