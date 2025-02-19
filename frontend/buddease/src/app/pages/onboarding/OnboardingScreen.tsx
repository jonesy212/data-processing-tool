// OnboardingScreen.tsx
import React from 'react';
import  { TwoFactorSetupPhase } from './UserJourneyManager';

const OnboardingScreen: React.FC = () => {
  // State to track whether two-factor setup is completed
  const [twoFactorSetupCompleted, setTwoFactorSetupCompleted] = React.useState(false);

  // Callback to handle two-factor setup completion
  const handleTwoFactorSetupComplete = () => {
    // Set the state to indicate that two-factor setup is completed
    setTwoFactorSetupCompleted(true);
  };

  return (
    <div>
      {/* Render different components based on two-factor setup completion */}
      {twoFactorSetupCompleted ? (
        // Render UserJourneyManager if two-factor setup is completed
        <UserJourneyManager />
      ) : (
        // Render TwoFactorSetupPhase if two-factor setup is not completed
        <TwoFactorSetupPhase onSetupComplete={handleTwoFactorSetupComplete} />
      )}
    </div>
  );
};

export default OnboardingScreen;
