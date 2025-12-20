// AppDevelopmentPhase.tsx
import { useAuth } from "@/app/state/context/AuthContext";
import generateTimeBasedCode from "@/app/models/realtime/TimeBasedCodeGenerator";
import FeatureImplementationSubPhase from "@/app/pages/onboarding/FeatureImplementationSubPhase";
import InitialSetupSubPhase from "@/app/pages/onboarding/InitialSetupSubPhase";
import TempUserData from "@/app/pages/onboarding/OnboardingPhase";
import { useNotification } from '@/app/state/context/NotificationContext';
import React, { useState } from "react";
// Import other sub-phase components as needed

interface InitialSetupSubPhaseProps {
  onSubmit: (data: any) => void;
  userData: TempUserData;
  setCurrentSubPhase: React.Dispatch<React.SetStateAction<AppDevelopmentPhase>>;
  customNotify: (id: string, message: string, content: any, date: Date, type: string, notificationPosition?: any) => Promise<void>; // Keep original name and type
  appName?: string;
}

export enum AppDevelopmentPhase {
  AUTHENTICATION,
  INITIAL_SETUP,
  PLANNING, // Add a new planning phase
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

  // Function to handle submission logic for Initial Setup Sub Phase
  const handleInitialSetupSubmit = async (data: any) => {
    try {
      // Perform data validation here if needed
  
      // Call a function to submit the data to the database
      await saveDataToDatabase(data);
  
      // Notify the user about successful submission using proper notify pattern
      notify({
        id: 'initial-setup-success',
        message: 'Initial setup submitted successfully!',
        data: {
          entityId: userData.id || 'unknown',
          entityType: 'user',
          extra: { 
            data,
            phase: 'initial-setup'
          }
        },
        timestamp: new Date(),
        type: 'success', // Assuming this matches your NotificationTypeEnum
        level: 'success' as const
      });
    } catch (error) {
      // Handle errors gracefully
      handleSubmissionError(error, 'Initial setup submission failed.');
    }
  };
  
  // Function to handle submission logic for Feature Implementation Sub Phase
  const handleFeatureImplementationSubmit = async (data: any) => {
    try {
      // Perform data validation here if needed
  
      // Call a function to submit the data to the database
      await saveDataToDatabase(data);
  
      // Notify the user about successful submission using proper notify pattern
      notify({
        id: 'feature-implementation-success',
        message: 'Feature implementation submitted successfully!',
        data: {
          entityId: userData.id || 'unknown',
          entityType: 'user',
          extra: { 
            data,
            phase: 'feature-implementation'
          }
        },
        timestamp: new Date(),
        type: 'success',
        level: 'success' as const
      });
    } catch (error) {
      // Handle errors gracefully
      handleSubmissionError(error, 'Feature implementation submission failed.');
    }
  };
  
  // Function to save data to the database (dummy implementation for demonstration)
  const saveDataToDatabase = async (data: any) => {
    // Dummy database operation
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate asynchronous operation
    console.log('Data saved to database:', data); // Log the saved data
  };
  
  // Function to handle submission errors and notify the user
  const handleSubmissionError = (error: any, message: string) => {
    console.error('Submission error:', error); // Log the error
    
    // Use proper notify pattern for errors
    notify({
      id: 'submission-error',
      message: message,
      data: {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        entityId: userData.id || 'unknown',
        entityType: 'user',
        extra: { 
          error,
          userData 
        }
      },
      timestamp: new Date(),
      type: 'error',
      level: 'error' as const
    });
  };


  const customNotifyWrapper = (id: string, message: string, content: any, date: Date, type: string) => {
  notify({
    id,
    message,
    data: {
      entityId: userData.id || 'unknown',
      entityType: 'user',
      extra: { content }
    },
    timestamp: date,
    type,
    level: type === 'error' ? 'error' as const : 'success' as const
  });
};
  
  // Add more handlers for other sub-phases as needed

  return (
    <div>
      {currentSubPhase === AppDevelopmentPhase.INITIAL_SETUP && (
        <InitialSetupSubPhase
          onSubmit={handleInitialSetupSubmit}
          userData={userData}
          customNotify={notify}
          setCurrentSubPhase={setCurrentSubPhase} />
      )}
      {currentSubPhase === AppDevelopmentPhase.PLANNING && (
        <PlanningSubPhase setCurrentSubPhase={setCurrentSubPhase} />
      )}
      {currentSubPhase === AppDevelopmentPhase.FEATURE_IMPLEMENTATION && (
        <FeatureImplementationSubPhase
          onSubmit={handleFeatureImplementationSubmit}
          userData={userData}
          customNotify={customNotifyWrapper}
          setCurrentSubPhase={setCurrentSubPhase} />
      )}
      {/* Add more sub-phase components as needed */}
    </div>
  );
};

export default AppDevelopmentPhaseManager;