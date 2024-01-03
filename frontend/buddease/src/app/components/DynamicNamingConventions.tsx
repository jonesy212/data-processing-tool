// components/DynamicNamingConventions.tsx
import React from 'react';
import configurationService from '../configs/ConfigurationService';
import { NamingConventionsError } from '../shared/shared-error-handling';
import { useDynamicComponents } from './DynamicComponentsContext';
import { useNotification } from './support/NotificationContext';
import NOTIFICATION_MESSAGES from './support/NotificationMessages';
interface DynamicNamingConventionsProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}



const notify = useNotification();

const handleNamingConventionsErrors = (
  error: NamingConventionsError,
  details?: string
) => {
  let errorDetails = details;
  if (!errorDetails) {
    errorDetails = "";
  }
  const errorMessage = NOTIFICATION_MESSAGES.NamingConventionsError.DEFAULT(
    error.message, // Pass error message instead of error object
    errorDetails
  );
  notify(errorMessage, "error");
};

const DynamicNamingConventions: React.FC<DynamicNamingConventionsProps> = ({
  dynamicContent,
}) => {

  const { dynamicConfig, setDynamicConfig } = useDynamicComponents();

  try {
    if (!dynamicConfig) {
      throw new NamingConventionsError(
        "DynamicConfig is not available.",
        `details`
      );
    }

    const conventions =
      dynamicConfig.namingConventions ||
      configurationService.getConfigurationOptions().namingConventions;

    const handleDynamicContentClick = () => {
      setDynamicConfig({
        ...dynamicConfig,
        namingConventions: [
          "Updated Dynamic Convention 1",
          "Updated Dynamic Convention 2",
        ],
      });
    };

    return (
      <div>
        <h2 onClick={handleDynamicContentClick}>
          {dynamicContent ? "Dynamic" : "Static"} Naming Conventions
        </h2>
        {dynamicContent
          ? renderDynamicContent(conventions)
          : renderStaticContent()}
      </div>
    );
  } catch (error: any) {
    console.error(error);
    if(error instanceof NamingConventionsError){
      handleNamingConventionsErrors(error);
    } else {
      notify(NOTIFICATION_MESSAGES.Error.DEFAULT('SomeErrorType'), 'error');
    }
    handleNamingConventionsErrors(error);}
    return null;
};





const renderStaticContent = () => { 
  // Provide default static naming conventions
  const staticConventions = ['Static Convention 1', 'Static Convention 2', 'Static Convention 3'];
  return (
    <ul>
      {staticConventions.map((convention, index) => (
        <li key={index}>{convention}</li>
      ))}
    </ul>
  );
};
  
const renderDynamicContent = (conventions?: string[]) => {

  try {
    
    if (!conventions || conventions.length === 0) {
      // Provide default dynamic naming conventions if not provided
      conventions = ['Dynamic Convention 1', 'Dynamic Convention 2', 'Dynamic Convention 3'];
    }
  
    return (
      <ul>
        {conventions.map((convention, index) => (
          <li key={index}>{convention}</li>
        ))}
      </ul>
    );
  } catch (error: any) {
    console.error(error instanceof NamingConventionsError ? error : 'Unknown error'); {
      handleNamingConventionsErrors(error)
    }
    return null;
  }
};

export default DynamicNamingConventions;
