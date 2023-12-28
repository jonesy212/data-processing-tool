// MainApplicationLogic.tsx
import { useAuth } from "@/app/components/auth/AuthContext";
import OnboardingPage from '@/app/pages/onboarding/OnboardingPage';
import UserJourneyManager from '@/app/pages/personas/UserJourney';
import React from 'react';

const MainApplicationLogic: React.FC = () => {
  const { state } = useAuth();

  return (
    <div>
      {state.user ? (
        <UserJourneyManager />
      ) : (
        <OnboardingPage />
      )}
    </div>
  );
};

export default MainApplicationLogic;
