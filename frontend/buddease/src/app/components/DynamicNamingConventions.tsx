// components/DynamicNamingConventions.tsx
import React from 'react';
import configurationService from '../configs/ConfigurationService';
import { NamingConventionsError } from '../shared/shared-error-handling';
import { useDynamicComponents } from './DynamicComponentsContext';
import { NotificationTypeEnum, useNotification } from './support/NotificationContext';
import NOTIFICATION_MESSAGES from './support/NotificationMessages';
import { NOTIFICATION_TYPES } from './support/NotificationTypes';
interface DynamicNamingConventionsProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}


const { notify } = useNotification();  // Destructure notify from useNotification

const handleNamingConventionsErrors = (
  error: NamingConventionsError,
  details?: string
) => {
  let errorDetails = details;
  if (!errorDetails) {
    errorDetails = "";
  }
  const errorMessage = NOTIFICATION_MESSAGES.NamingConventionsError.DEFAULT(
    error.message,  
    errorDetails
  );
  //todo fix error message
  notify("", errorMessage, "Error", new Date, NotificationTypeEnum.Error);
};

const DynamicNamingConventions: React.FC<DynamicNamingConventionsProps> = ({
  dynamicContent,
}) => {

  const { dynamicConfig,  updateDynamicConfig, setDynamicConfig } = useDynamicComponents();

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
      if (dynamicConfig) {

        setDynamicConfig({
          ...dynamicConfig,
          namingConventions: [
            "Updated Dynamic Convention 1",
            "Updated Dynamic Convention 2",
          ],
        });
      }else {
        // Handle the case when dynamicConfig is null
        console.error("DynamicConfig is null. Unable to update naming conventions.");
    }
    };

    return (
      <div>
        <h2 onClick={handleDynamicContentClick}>
          {dynamicContent ? "Dynamic" : "Static"}
          Naming Conventions
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
      notify(
        //todo fix notification
        error.message,
        NOTIFICATION_TYPES.ERROR,
        "Error",
        new Date,
        NotificationTypeEnum.CustomNotification2
      );
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
      conventions = [
        'Trending Topics', 'Popular Posts', 'Recommended Users', // For a social media app
        'Featured Products', 'Best Sellers', 'New Arrivals', // For an e-commerce platform
        'Priority Tasks', 'Upcoming Deadlines', 'Assigned Tasks', // For a task management tool
        'Current Conditions', 'Hourly Forecast', 'Weekly Outlook', // For a weather application
        'Daily Goals', 'Workout Plans', 'Progress Tracking' // For a fitness tracker app
      ];
    }
  
    return (
      <ul>
        {conventions.map((convention, index) => (
          <li key={index}>{convention}</li>
        ))}
      </ul>
    );
  } catch (error: any) {
    console.error(error instanceof NamingConventionsError ? error : 'Unknown error');
    handleNamingConventionsErrors(error);
    return null;
  }
};


export default DynamicNamingConventions;