// components/DynamicSpacingAndLayout.tsx
import React from 'react';

interface SpacingAndLayoutProps {
  margin?: string;
  padding?: string;
  border?: string;
}

interface DynamicSpacingAndLayoutProps extends SpacingAndLayoutProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}

const DynamicSpacingAndLayout: React.FC<DynamicSpacingAndLayoutProps> = ({ dynamicContent, margin, padding, border }) => {
  return (
    <div>
      <h2>{dynamicContent ? 'Dynamic' : 'Static'} Spacing and Layout</h2>
      {dynamicContent ? renderDynamicContent({ margin, padding, border }) : renderStaticContent({ margin, padding, border })}
      {/* Add more examples for dynamic spacing and layout */}
    </div>
  );
};

const renderStaticContent = ({ margin, padding, border }: SpacingAndLayoutProps) => {
  return (
    <div>
      <h3>Static Spacing and Layout</h3>
      <div style={{ margin, padding, border }}>
        {/* Static content with spacing and layout */}
      </div>
    </div>
  );
};

const renderDynamicContent = ({ margin, padding, border }: SpacingAndLayoutProps) => {
  return (
    <div>
      <h3>Dynamic Spacing and Layout</h3>
      <div style={{ margin, padding, border }}>
        {/* Dynamic content with spacing and layout */}
      </div>
    </div>
  );
};

export default DynamicSpacingAndLayout;
