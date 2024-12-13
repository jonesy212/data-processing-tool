import { View, Text, StyleSheet } from 'react-native';
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
    <View style={{ margin: margin as any, padding: padding as any, borderWidth: border as any }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        {dynamicContent ? 'Dynamic' : 'Static'} Spacing and Layout
      </Text>

      {dynamicContent
        ? renderDynamicContent({ margin, padding, border }, Object.values(documents), deviceType)
        : renderStaticContent({ margin, padding, border })}
    </View>
  );
};
// Static content rendering function
const renderStaticContent = ({ margin, padding, border }: SpacingAndLayoutProps) => {
  return (
    <View style={{ margin: margin as any, padding: padding as any, borderWidth: border as any }}>
      <Text style={{ fontSize: 16 }}>Static Spacing and Layout</Text>
      <View style={{ margin: margin as any, padding: padding as any, borderWidth: border as any, backgroundColor: '#f0f0f0', height: 100 }}>
        <Text>Static content with spacing and layout</Text>
      </View>
    </View>
  );
};

// Dynamic content rendering function
const renderDynamicContent = (
  { margin, padding, border }: SpacingAndLayoutProps,
  documents: any[],
  deviceType: string
) => {
  return (
    <View style={{ margin: margin as any, padding: padding as any, borderWidth: border as any }}>
      <Text style={{ fontSize: 16 }}>Dynamic Spacing and Layout</Text>
      <View style={{ backgroundColor: '#e0e0e0', padding: 10 }}>
        {/* Render documents dynamically */}
        <Text>Documents:</Text>
        {documents.map((doc, index) => (
          <Text key={index}>{JSON.stringify(doc)}</Text>
        ))}

        {/* Render additional content based on the user's device type */}
        {deviceType === 'android' && <AndroidSpecificContent />}
        {deviceType === 'ios' && <IOSSpecificContent />}
        {/* Add logic for tablet or other platforms as needed */}
      </View>
    </View>
  );
};

// Android-specific content component
const AndroidSpecificContent = () => {
  return (
    <View>
      <Text style={{ fontSize: 14, color: 'green' }}>Android Specific Content</Text>
      <Text>Additional content for Android users.</Text>
    </View>
  );
};

// iOS-specific content component
const IOSSpecificContent = () => {
  return (
    <View>
      <Text style={{ fontSize: 14, color: 'blue' }}>iOS Specific Content</Text>
      <Text>Additional content for iOS users.</Text>
    </View>
  );
};

export default DynamicSpacingAndLayout;