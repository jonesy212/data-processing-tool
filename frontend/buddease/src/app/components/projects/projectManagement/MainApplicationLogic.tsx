// MainApplicationLogic.tsx
import { useAuth } from "@/app/components/auth/AuthContext";
import ExtendedAppLogic from "@/app/pages/ExtendedAppLogic";
import OnboardingPage from "@/app/pages/onboarding/OnboardingPage";
import UserJourneyManager from "@/app/pages/personas/UserJourney";
import React, { useState } from "react";
import { NotificationData } from "../../support/NofiticationsSlice";

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
