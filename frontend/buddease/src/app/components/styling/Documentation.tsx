//Documentation.tsx
import React from 'react';

// Interface for documented components
interface DocumentedComponentProps {
  name: string;
  description: string;
}

// Dynamic Documented Component
const DynamicDocumentedComponent: React.FC<DocumentedComponentProps> = ({ name, description }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  );
};

// Static Documented Component
const StaticDocumentedComponent: React.FC<DocumentedComponentProps> = ({ name, description }) => {
  return (
    <div>
      <h3>Static {name}</h3>
      <p>{description}</p>
    </div>
  );
};

interface DocumentationProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}

const Documentation: React.FC<DocumentationProps> = ({ dynamicContent }) => {
  // Example of documented components
  const documentedComponents: DocumentedComponentProps[] = [
    { name: 'Documented Component 1', description: 'This component does something important.' },
    { name: 'Documented Component 2', description: 'This is another important component.' },
    // Add more documented component examples as needed
  ];

  return (
    <div>
      <h2>{dynamicContent ? 'Dynamic' : 'Static'} Documentation</h2>
      {dynamicContent
        ? renderDynamicContent(documentedComponents)
        : renderStaticContent(documentedComponents)}
    </div>
  );
};

const renderStaticContent = (documentedComponents: DocumentedComponentProps[]) => {
  return (
    <div>
      {documentedComponents.map((component, index) => (
        <StaticDocumentedComponent key={index} {...component} />
      ))}
    </div>
  );
};

const renderDynamicContent = (documentedComponents: DocumentedComponentProps[]) => {
  return (
    <div>
      {documentedComponents.map((component, index) => (
        <DynamicDocumentedComponent key={index} {...component} />
      ))}
    </div>
  );
};

export default Documentation;
