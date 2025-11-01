// MainApplicationLogic.tsx
import { NotificationData } from '@/app/hooks/useNotificationSystem';
import ExtendedAppLogic from "@/app/pages/ExtendedAppLogic";
import OnboardingPage from "@/app/pages/onboarding/OnboardingPage";
import UserJourneyManager from "@/app/pages/personas/UserJourney";
import { useAuth } from "@/context/AuthContext";
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
