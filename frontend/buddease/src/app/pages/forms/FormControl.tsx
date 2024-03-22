// FormControl.tsx
import React from 'react';
import { FormLogger } from '../logging/Logger';

interface FormControlProps {
  children: React.ReactNode;
  fullWidth?: boolean; // Optional prop to set fullWidth
  formID: string; // Unique ID for the form
}

const FormControl: React.FC<FormControlProps> = ({ children, fullWidth = false, formID }) => {
  const handleFormInteraction = (eventType: string, eventData: any) => {
    // Log form events using FormLogger
    FormLogger.logFormEvent(eventType, formID, eventData);
  };

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      {/* Pass the formID to the children components */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          // Clone the child element with additional props
          return React.cloneElement(child, { formID, onFormInteraction: handleFormInteraction });
        }
        return child;
      })}
    </div>
  );
};

export default FormControl;
