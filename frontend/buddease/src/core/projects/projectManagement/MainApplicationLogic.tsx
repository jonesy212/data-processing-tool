MainApplicationLogic.tsx
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import ExtendedAppLogic from "@/core/pages/ExtendedAppLogic";
import OnboardingPage from "@/core/pages/onboarding/OnboardingPage";
import UserJourneyManager from "@/core/pages/personas/UserJourney";
import { useAuth } from '@/core/state/context/AuthContext';
import React, { useState } from "react";

const MainApplicationLogic: React.FC = () => {
  const { state } = useAuth();

  // Initialize notificationsData and setNotifications with appropriate initial values using useState
  const [notificationsData, setNotifications] = useState<NotificationData[]>([]);

  return (
    <div>
      {state.user ? (
        <>
          <UserJourneyManager />
          <ExtendedAppLogic
            notifications={notificationsData}
            setNotifications={setNotifications}
          />
        </>
      ) : (
        <OnboardingPage />
      )}
    </div>
  );
};

export default MainApplicationLogic;
