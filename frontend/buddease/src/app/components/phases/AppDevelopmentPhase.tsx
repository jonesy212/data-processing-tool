import React, { useState } from "react";
import generateTimeBasedCode from "../../../../models/realtime/TimeBasedCodeGenerator";
import FeatureImplementationSubPhase from "../../pages/onboarding/FeatureImplementationSubPhase";
import InitialSetupSubPhase from "../../pages/onboarding/InitialSetupSubPhase";
import TempUserData from "../../pages/onboarding/OnboardingPhase";
import { useAuth } from "../auth/AuthContext";
 import { useNotification } from '@/app/components/support/NotificationContext';
// Import other sub-phase components as needed

export enum AppDevelopmentPhase {
  AUTHENTICATION,
  INITIAL_SETUP,
  FEATURE_IMPLEMENTATION,
  // Add more sub-phases as needed
}

const AppDevelopmentPhaseManager: React.FC = () => {
  const { state } = useAuth();
  const { notify } = useNotification();
  const [currentSubPhase, setCurrentSubPhase] = useState<AppDevelopmentPhase>(
    AppDevelopmentPhase.INITIAL_SETUP // Initial sub-phase
  );


  const timeBasedCode = generateTimeBasedCode();
  let userData: TempUserData = {
    id: state.user?.data?.id ?? "", // Use optional chaining and nullish coalescing operator to handle undefined id
    timeBasedCode: timeBasedCode ?? "", // Assign timeBasedCode to TempUserData
    ...(state.user?.data || {}),
    questionnaireResponses: {
      // Add questionnaireResponses to TempUserData
      ...(state.user?.data?.questionnaireResponses || {}),
    },
    // Define any additional properties needed for the phase
  };

  useNotification().notify(  "string",  "string",   "",)

  // Additional logic specific to the App Development Phase

  const handleInitialSetupSubmit = (data: any) => {
    // Handle submission logic for Initial Setup Sub Phase
  };

  const handleFeatureImplementationSubmit = (data: any) => {
    // Handle submission logic for Feature Implementation Sub Phase
  };

  // Add more handlers for other sub-phases as needed

  return (
    <div>
      {currentSubPhase === AppDevelopmentPhase.INITIAL_SETUP && (
        <InitialSetupSubPhase onSubmit={handleInitialSetupSubmit} userData={userData} notify={notify} setCurrentSubPhase={setCurrentSubPhase} />
      )}
      {currentSubPhase === AppDevelopmentPhase.FEATURE_IMPLEMENTATION && (
        <FeatureImplementationSubPhase onSubmit={handleFeatureImplementationSubmit} userData={userData} notify={notify} setCurrentSubPhase={setCurrentSubPhase} />
      )}
      {/* Add more sub-phase components as needed */}
    </div>
  );
};

export default AppDevelopmentPhaseManager;
