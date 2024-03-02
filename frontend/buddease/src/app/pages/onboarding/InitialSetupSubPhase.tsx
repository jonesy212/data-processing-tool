import { useAuth } from '@/app/components/auth/AuthContext';
import { sanitizeData, validateUserData } from '@/app/components/security/SanitizationFunctions';
import { useNotification } from '@/app/components/support/NotificationContext';
import React, { useEffect } from 'react';
import { AppDevelopmentPhase } from '../../components/phases/AppDevelopmentPhase';
import TempUserData from './OnboardingPhase';

interface InitialSetupSubPhaseProps {
  onSubmit: (data: any) => void;
  userData: TempUserData; // Add userData prop to the props interface
  setCurrentSubPhase: React.Dispatch<React.SetStateAction<AppDevelopmentPhase>>;
}

const InitialSetupSubPhase: React.FC<InitialSetupSubPhaseProps> = ({ onSubmit, userData, setCurrentSubPhase }) => {
  const { state: authState } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    // Check user authentication status on component mount
    if (!authState.isAuthenticated) {
      // Redirect unauthenticated users to the login page
      setCurrentSubPhase(AppDevelopmentPhase.AUTHENTICATION);
    }
  }, [authState.isAuthenticated, setCurrentSubPhase]);

  const handleSubmit = (data: any) => {
    // Sanitize user input before submission
    const sanitizedData = sanitizeData(data);

    // Validate user data
    const validationErrors = validateUserData(sanitizedData);

    if (validationErrors.length === 0) {
      // Data is valid, proceed with submission
      onSubmit(sanitizedData);
    } else {
      // Notify user about validation errors
      validationErrors.forEach((error) => {
        notify('Validation Error', error.message, new Date(), NotificationType.Error);
      });
    }
  };

  return (
    <div>
      {/* Your component UI and form elements */}
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
    </div>
  );
};

export default InitialSetupSubPhase;




