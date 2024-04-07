import { useAuth } from '@/app/components/auth/AuthContext';
import { sanitizeData, validateUserData } from '@/app/components/security/SanitizationFunctions';
import { NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';
import React, { useEffect } from 'react';
import { AppDevelopmentPhase } from '../../components/phases/AppDevelopmentPhase';
import TempUserData from './OnboardingPhase';
import { AxiosError } from 'axios'; // Import AxiosError
import { User } from '@/app/components/users/User';
import DynamicForm from '../forms/DynamicForm';


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

      if (validationErrors.length === 0) {
        // Data is valid, proceed with submission
        onSubmit(sanitizedData as TempUserData);
      } else {
        // Notify user about validation errors
        validationErrors.forEach((error: any) => {
          notify(
            "ValidationSubmitError",
            `Something happened causing an error when trying to submit your information. Please try again and advise the ${appName} team if the problem persists.`,
            error.errorMessage,
            new Date(),
            NotificationTypeEnum.OperationError);
        });
      }
    } catch (error) {
      // Handle Axios errors
      if (error instanceof AxiosError) {
        console.error("Axios error:", error.response?.data);
        // Notify user or handle the error as needed
      } else {
        console.error("Unexpected error:", error);
        // Handle other unexpected errors
      }
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