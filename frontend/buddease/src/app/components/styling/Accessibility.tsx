// components/Accessibility.tsx
import React, { ReactNode } from "react";

interface AccessibleComponentProps {
  label: string;
}

interface StaticAccessibleComponentProps {
  label: string;
}

interface AccessibilityProps {
  examples: ReactNode[];
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}

const Accessibility: React.FC<AccessibilityProps> = ({
  examples,
  dynamicContent,
}) => {
  return (
    <div>
      <h2>{dynamicContent ? "Dynamic" : "Static"} Accessibility</h2>
      {dynamicContent
        ? renderDynamicContent(examples)
        : renderStaticContent(examples)}
    </div>
  );
};

const renderStaticContent = (examples: ReactNode[]) => {
  return (
    <div>
      {examples.map((example, index) => {
        if (React.isValidElement(example)) {
          return <StaticAccessibleComponent key={index} {...example.props} />;
        }
      })}
    </div>
  );
};

const renderDynamicContent = (examples: ReactNode[]) => {
  return (
    <div>
      {examples.map((example, index) => {
        if (React.isValidElement(example)) {
          return <DynamicAccessibleComponent key={index} {...example.props} />;
        }
      })}
    </div>
  );
};

const StaticAccessibleComponent: React.FC<StaticAccessibleComponentProps> = ({
  label,
}) => {
  return <button aria-label={label}>Accessible Button</button>;
};

const DynamicAccessibleComponent: React.FC<AccessibleComponentProps> = ({
  label,
}) => {
  return <button aria-label={label}>Accessible Button</button>;
};

const AccessibleComponent: React.FC<AccessibleComponentProps> = ({ label }) => {
  return <button aria-label={label}>Accessible Button</button>;
};

export { Accessibility, AccessibleComponent };
