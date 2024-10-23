import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native'; // Import Platform from react-native

import useDocumentStore from '../state/stores/DocumentStore';

interface SpacingAndLayoutProps {
  margin?: string;
  padding?: string;
  border?: string;
}

interface DynamicSpacingAndLayoutProps extends SpacingAndLayoutProps {
  dynamicContent?: boolean; // Use this prop to determine dynamic or static rendering
}

const DynamicSpacingAndLayout: React.FC<DynamicSpacingAndLayoutProps> = ({ dynamicContent, margin, padding, border }) => {
  const { documents, fetchDocuments } = useDocumentStore(); // Use the hook

  // State to track the user's device type
  const [deviceType, setDeviceType] = useState<string>('');

  useEffect(() => {
    // Fetch documents when component mounts
    fetchDocuments();

    // Detect the user's device type
    const device = Platform.OS; // Platform.OS returns the user's device type (e.g., "android", "ios")
    setDeviceType(device);
  }, [fetchDocuments]);

  return (
    <div>
      <h2>{dynamicContent ? 'Dynamic' : 'Static'} Spacing and Layout</h2>
      {dynamicContent ? renderDynamicContent({ margin, padding, border }, documents, deviceType) : renderStaticContent({ margin, padding, border })}
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

const renderDynamicContent = ({ margin, padding, border }: SpacingAndLayoutProps, documents: any, deviceType: string) => {
  return (
    <div>
      <h3>Dynamic Spacing and Layout</h3>
      <div style={{ margin, padding, border }}>
        {/* Dynamic content with spacing and layout */}
        {JSON.stringify(documents)}

        {/* Render additional content based on the user's device type */}
        {deviceType === 'android' && <AndroidSpecificContent />}
        {deviceType === 'ios' && <IOSSpecificContent />}
        {/* Add logic for tablet-specific content if needed */}
      </div>
    </div>
  );
};


// Additional components for Android and iOS specific content
const AndroidSpecificContent = () => {
  return (
    <div>
      <h4>Android Specific Content</h4>
      {/* Add Android-specific content here */}
    </div>
  );
};

const IOSSpecificContent = () => {
  return (
    <div>
      <h4>iOS Specific Content</h4>
      {/* Add iOS-specific content here */}
    </div>
  );
};

export default DynamicSpacingAndLayout;
