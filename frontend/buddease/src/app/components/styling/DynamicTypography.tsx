// components/DynamicTypography.tsx
import React from 'react';

interface BodyTextProps {
  fontSize?: string;
  fontFamily: string;
}

interface HeadingProps {
  fontSize: string;
  fontFamily: string;
}

interface DynamicTypographyProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}

const DynamicTypography: React.FC<DynamicTypographyProps & (BodyTextProps | HeadingProps)> = (props) => {
  const { dynamicContent, ...rest } = props;

  return (
    <div>
      <h2>{dynamicContent ? 'Dynamic' : 'Static'} Typography</h2>
      {dynamicContent ? renderDynamicContent(rest) : renderStaticContent()}
      {/* Add more dynamic/static content examples as needed */}
    </div>
  );
};

const renderStaticContent = () => {
  return (
    <div>
      <h3>Static Typography Example</h3>
      <p style={{ fontSize: '16px', fontFamily: 'Arial, sans-serif' }}>Static Body Text</p>
    </div>
  );
};

const renderDynamicContent = (props: BodyTextProps | HeadingProps) => {
  if ("fontSize" in props && "fontFamily" in props) {
    if ("fontSize" in props) {
      // Dynamic rendering of BodyText component
      return (
        <p style={{ fontSize: props.fontSize, fontFamily: props.fontFamily }}>
          Dynamic Body Text
        </p>
      );
    } else {
      // Dynamic rendering of Heading component
      return (
        <h3 style={{ fontSize: props.fontSize, fontFamily: props.fontFamily }}>
          Dynamic Heading
        </h3>
      );
    }
  }
};

export default DynamicTypography;
