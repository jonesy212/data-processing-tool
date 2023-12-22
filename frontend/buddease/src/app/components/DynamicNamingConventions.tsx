// components/DynamicNamingConventions.tsx
import React from 'react';
import { useDynamicComponents } from './DynamicComponentsContext';

import configurationService from '../configs/ConfigurationService';
interface DynamicNamingConventionsProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}

const DynamicNamingConventions: React.FC<DynamicNamingConventionsProps> = ({
  dynamicContent,
}) => {
  const { dynamicConfig, setDynamicConfig } = useDynamicComponents();

  // Add type checking for dynamicConfig
  if (!dynamicConfig) {
    return null;
  }

  const conventions =
    dynamicConfig.namingConventions ||
    configurationService.getConfigurationOptions().namingConventions;

  return (
    <div>
      <h2>{dynamicContent ? "Dynamic" : "Static"} Naming Conventions</h2>
      {dynamicContent
        ? renderDynamicContent(conventions)
        : renderStaticContent()}
      {/* Add more dynamic/static content examples as needed */}
    </div>
  );
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
};

export default DynamicNamingConventions;
