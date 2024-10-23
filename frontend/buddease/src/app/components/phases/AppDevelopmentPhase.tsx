import { useNotification } from '@/app/components/support/NotificationContext';
import React, { useState } from "react";
import FeatureImplementationSubPhase from "../../pages/onboarding/FeatureImplementationSubPhase";
import InitialSetupSubPhase from "../../pages/onboarding/InitialSetupSubPhase";
import TempUserData from "../../pages/onboarding/OnboardingPhase";
import { useAuth } from "../auth/AuthContext";
import generateTimeBasedCode from "../models/realtime/TimeBasedCodeGenerator";
// Import other sub-phase components as needed

const { notify } = useNotification(); // Destructure notify from useNotification
 
interface InitialSetupSubPhaseProps {
  onSubmit: (data: any) => void;
  userData: TempUserData;
  setCurrentSubPhase: React.Dispatch<React.SetStateAction<AppDevelopmentPhase>>;
  notify: (id: string, message: string, content: any, date: Date, type: NotificationType, notificationPosition?: NotificationPosition) => Promise<void>; // Keep original name and type
  appName: string;
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

  useNotification().notify(  "string",  "string",   "",)

  // Additional logic specific to the App Development Phase


  // Function to handle submission logic for Initial Setup Sub Phase
  const handleInitialSetupSubmit = async (data: any) => {
    try {
      // Perform data validation here if needed
  
      // Call a function to submit the data to the database
      await saveDataToDatabase(data);
  
      // Notify the user about successful submission
      notify(
        'initial-setup-success',  // Unique ID for the notification
        'Initial setup submitted successfully!',
        '',  // Content can be empty or include additional details
        new Date(),  // Current date
        'success'  // Notification type
      );
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
  
      // Notify the user about successful submission
      notify(
        'feature-implementation-success', // Unique ID for the notification
        'Feature implementation submitted successfully!',
        '',  // Content can be empty or include additional details
        new Date(),  // Current date
        'success'  // Notification type
      );
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
      notify(
        'submission-error', // Unique ID for the error notification
        message,
        '',  // Content can be empty or include additional details
        new Date(),  // Current date
        'error'  // Notification type
      );
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
          customNotify={notify}
          etCurrentSubPhase={setCurrentSubPhase} />
      )}
      {/* Add more sub-phase components as needed */}
    </div>
  );
};

export default AppDevelopmentPhaseManager;
