// components/DynamicNamingConventions.tsx
import configServiceInstance from '@/configs/ConfigurationService';
import React from 'react';
import { NamingConventionsError } from '../shared/shared_error';
import { useDynamicComponents } from './DynamicComponentsContext';
import { NotificationTypeEnum, useNotification } from './support/NotificationContext';
import NOTIFICATION_MESSAGES, { handleDynamicNotificationMessage } from './support/NotificationMessages';
import { NOTIFICATION_TYPES } from './support/NotificationTypes';

interface DynamicNamingConventionsProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}

const { notify } = useNotification();  // Destructure notify from useNotification

const handleNamingConventionsErrors = (
  error: NamingConventionsError,
  details?: string
) => {
  let errorDetails = details || "";

  const errorMessage = handleDynamicNotificationMessage(
    NOTIFICATION_MESSAGES.NamingConventionsError.DEFAULT,
    error.message,
    errorDetails
  );

  notify(
    "An error occurred while retrieving naming conventions.",
    errorMessage,
    NOTIFICATION_MESSAGES.NamingConventionsError.DEFAULT,
    new Date(),
    NotificationTypeEnum.Error
  );
};

const DynamicNamingConventions: React.FC<DynamicNamingConventionsProps> = ({
  dynamicContent,
}) => {

  const { dynamicConfig, updateDynamicConfig } = useDynamicComponents();

  try {
    if (!dynamicConfig) {
      throw new NamingConventionsError(
        "DynamicConfig is not available.",
        `details`
      );
    }

    const conventions =
      dynamicConfig.namingConventions ||
      configServiceInstance.getConfigurationOptions().namingConventions;

    const handleDynamicContentClick = () => {
      if (dynamicConfig) {

        updateDynamicConfig({
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
        {dynamicContent ? renderDynamicContent(conventions) : renderStaticContent()}
      </div>
    );
  } catch (error: any) {
    console.error(error);
    handleNamingConventionsErrors(error, "Error rendering dynamic content");
    return null;
  }
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
      conventions = [
        // Naming conventions for various categories
        // Social Media
        'Trending Topics', 'Popular Posts', 'Recommended Users', 
        // E-commerce
        'Featured Products', 'Best Sellers', 'New Arrivals', 
        // Task Management
        'Priority Tasks', 'Upcoming Deadlines', 'Assigned Tasks', 
        // Weather Application
        'Current Conditions', 'Hourly Forecast', 'Weekly Outlook', 
        // Fitness Tracker
        'Daily Goals', 'Workout Plans', 'Progress Tracking', 
        // Cryptocurrency and Trading
        'Trending Cryptocurrencies',
        'Popular Trading Strategies',
        'Recommended Exchanges',
        'Featured ICOs (Initial Coin Offerings)',
        'Best Performing Altcoins',
        'New Token Listings',
        'Priority Technical Analysis',
        'Upcoming Events (e.g., conferences, webinars)',
        'Assigned Portfolio Management',
        'Current Market Conditions',
        'Hourly Price Forecast',
        'Weekly Market Outlook',
        'Daily Trading Goals',
        'Trading Plans',
        'Performance Tracking',
        // Project Management
        'Project Roadmap', 'Task Assignments', 'Milestones', 
        // Video Management
        'Featured Videos', 'Top Rated Videos', 'New Releases',
      ];
    }

  


     // Organize conventions into different categories for better readability

     const socialMediaConventions = conventions.slice(0, 3);
     const eCommmerceConventions = conventions.slice(3, 6);
     const taskManagementConventions = conventions.slice(6, 9);
     const weatherConventions = conventions.slice(9, 12);
     const fitnessTrackerConventions = conventions.slice(12, 15);
     const cryptoTradingConventions = conventions.slice(15, 30); // Adjusted index for crypto/trading
     const projectManagementConventions = conventions.slice(30, 33); // Added project management conventions
     const videoManagementConventions = conventions.slice(33); // Added video management conventions
 
     return (
      <div>
        <h3>Social Media</h3>
        {renderList(socialMediaConventions)}
        
        <h3>E-commerce</h3>
        {renderList(eCommmerceConventions)}
        
        <h3>Task Management</h3>
        {renderList(taskManagementConventions)}
        
        <h3>Weather Application</h3>
        {renderList(weatherConventions)}
        
        <h3>Fitness Tracker</h3>
        {renderList(fitnessTrackerConventions)}
        
        <h3>Cryptocurrency and Trading</h3>
        {renderList(cryptoTradingConventions)}

        <h3>Project Management</h3>
        {renderList(projectManagementConventions)} // Added project management conventions
        
        <h3>Video Management</h3>
        {renderList(videoManagementConventions)} // Added video management conventions
      </div>
    );
  } catch (error: any) {
    console.error(
      error instanceof NamingConventionsError ? error : 'Unknown error'
    );
    handleNamingConventionsErrors(error);
    return null;
  }
};


const renderList = (items: string[]) => (
  <ul>
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);


export default DynamicNamingConventions;