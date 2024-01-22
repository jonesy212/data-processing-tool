// OnboardingManager.tsx
import ProfileSetupPhase from '@/app/components/phases/onboarding/ProfileSetupPhase';
import React, { useState } from 'react';
import { OnboardingPhase } from './OnboardingPhase';
import RegistrationPhase from './RegistrationPhase';
import WelcomePage from './WelcomePage';

const OnboardingManager: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<OnboardingPhase>(OnboardingPhase.WELCOME);

  const getNextPhase = (currentPhase: OnboardingPhase): OnboardingPhase => {
    switch (currentPhase) {
      case OnboardingPhase.WELCOME:
        return OnboardingPhase.REGISTER;
      case OnboardingPhase.REGISTER:
        return OnboardingPhase.OFFER;
      case OnboardingPhase.OFFER:
        return OnboardingPhase.PROFILE_SETUP;
      case OnboardingPhase.PROFILE_SETUP:
        // Handle the last phase or redirect to the main application
        return OnboardingPhase.WELCOME;
      default:
        return OnboardingPhase.WELCOME;
    }
  };

  const handleNextPhase = () => {
    const nextPhase = getNextPhase(currentPhase);
    setCurrentPhase(nextPhase);
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case OnboardingPhase.WELCOME:
        return <WelcomePage />;
      case OnboardingPhase.REGISTER:
        return <RegistrationPhase onSuccess={handleNextPhase} />;
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
