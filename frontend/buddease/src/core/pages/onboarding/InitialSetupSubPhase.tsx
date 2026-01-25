// InitialSetupSubPhase.tsx
import { AppDevelopmentPhase } from '@/core/components/phases/AppDevelopmentPhase';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { sanitizeData, validateUserData } from '@/core/models/cypto/SanitizationFunctions';
import DynamicForm from '@/core/pages/forms/DynamicForm';
import TempUserData from '@/core/pages/onboarding/OnboardingPhase';
import { useAuth } from '@/core/state/context/AuthContext';
import { useNotification } from "@/core/state/context/NotificationContext";
import type { User } from '@/core/users/User';
import { AxiosError } from 'axios'; // Import AxiosError
import React, { useEffect } from 'react';


// Conversion function to convert string to TempUserData
const stringToTempUserData = (str: string): TempUserData => {
  // Implement your conversion logic here
  // Example:
  const userData: TempUserData = JSON.parse(str); // Assuming the string is in JSON format
  return userData;
};

interface InitialSetupSubPhaseProps {
  onSubmit: (data: any) => void;
  userData: TempUserData; // Assuming TempUserData is similar to User type
  setCurrentSubPhase: React.Dispatch<React.SetStateAction<AppDevelopmentPhase>>;
  notify: React.FC<(props: AppDevelopmentPhase, state: AppDevelopmentPhase, userData: TempUserData) => void>;
  appName: string;
}

const InitialSetupSubPhase: React.FC<InitialSetupSubPhaseProps> = ({ onSubmit, userData, setCurrentSubPhase, appName }) => {
  const { state: authState } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    // Check user authentication status on component mount
    if (!authState.isAuthenticated) {
      // Redirect unauthenticated users to the login page
      setCurrentSubPhase(AppDevelopmentPhase.AUTHENTICATION);
    }
  }, [authState.isAuthenticated, setCurrentSubPhase]);

  const handleSubmit = async (data: any) => {
    try {
      // Sanitize user input before submission
      let sanitizedData: TempUserData | string = sanitizeData(data); // Assuming sanitizeData returns TempUserData or string
  
      // Convert string to TempUserData if needed
      if (typeof sanitizedData === 'string') {
        sanitizedData = stringToTempUserData(sanitizedData);
      }
  
      // Validate user data
      const validationErrors = validateUserData(sanitizedData as TempUserData & User);
  
      if (validationErrors.length > 0) {
        // Notify user about validation errors
        validationErrors.forEach((error: any) => {
          notify(
            "ValidationSubmitError",
            error.errorMessage || `Something happened causing an error when trying to submit your information. Please try again and advise the ${appName} team if the problem persists.`,
            new Date(),
            NotificationTypeEnum.OPERATION_ERROR
          );
        });
        return; // Stop further execution if there are validation errors
      }
  
      // Data is valid, proceed with submission
      await onSubmit(sanitizedData as TempUserData);
    } catch (error) {
      // Handle errors in a user-friendly way
      const errorMessage = error instanceof AxiosError ? error.response?.data.message : "An unexpected error occurred.";
      notify("SubmissionError", errorMessage, new Date(), NotificationTypeEnum.OPERATION_ERROR);
      console.error("Submission error:", error);
    }
  };


  return (
    <div>
      {/* Your component UI and form elements */}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <h1>Initial Setup Sub Phase</h1>
      <DynamicForm onSubmit={handleSubmit} setCurrentSubPhase={setCurrentSubPhase} userData={userData} />
  
      </form>
    </div>
  );
};

export default InitialSetupSubPhase;
