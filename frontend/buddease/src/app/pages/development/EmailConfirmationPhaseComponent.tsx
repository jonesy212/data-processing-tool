import { updateUIWithCopiedText } from '@/app/components/documents/editing/updateUI';
import useUIStore from '@/app/components/libraries/ui/useUIStore';
import React from 'react';
import * as apiData from './../../api/ApiData';

interface EmailConfirmationPhaseComponentProps {
  onSuccess: (condition: boolean, dynamicData: any) => void;
}

const EmailConfirmationPhaseComponent: React.FC<EmailConfirmationPhaseComponentProps> = ({ onSuccess }) => {
  // Get the UI store using useUIStore hook
  const store = useUIStore();

  // Implement the UI and logic for the email confirmation phase
  const handleConfirmation = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // Extract the condition from the event
    const condition = true; // Modify this to extract the actual condition from the event

    // Handle email confirmation logic
    // For example, you can call the onSuccess callback when the email is successfully confirmed
    if (condition) {
      try {
        // Fetch updated dynamic data asynchronously
        const updatedDynamicData = await apiData.fetchUpdatedDynamicData();

        // Call updateUI to update the UI with the copied text
        updateUIWithCopiedText(updatedDynamicData, store);

        // Call onSuccess callback
        onSuccess(condition, updatedDynamicData);
      } catch (error) {
        console.error('Error fetching updated dynamic data:', error);
        // Handle error if needed
      }
    }
  };

  return (
    <div>
      <h2>Email Confirmation Phase</h2>
      {/* Implement email confirmation UI */}
      <button onClick={handleConfirmation}>Confirm Email</button>
    </div>
  );
};

export default EmailConfirmationPhaseComponent;
