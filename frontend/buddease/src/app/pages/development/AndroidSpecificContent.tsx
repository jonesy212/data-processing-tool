// AndroidSpecificContent.ts
import { useThemeConfig } from '@/app/components/hooks/userInterface/ThemeConfigContext';
import AddContent, { ContentProps } from '@/app/components/models/content/AddContent';
import ProgressBar, { Progress, ProgressBarProps, ProgressPhase } from '@/app/components/models/tracker/ProgressBar';
import { Feature } from '@/app/components/state/stores/FeatureStore';
import React from 'react';

interface AndroidSpecificContentProps {
  additionalFeatures?: Feature[]; // Define optional props
}


const AndroidSpecificContent = ({
  additionalFeatures,
}: AndroidSpecificContentProps) => {
  const { primaryColor, secondaryColor, fontSize, fontFamily } =
    useThemeConfig(); // Extract theme properties from ThemeConfigContext

  // Define default styles and content if not provided
  const backgroundColor = primaryColor || "#FF5733"; // Use primaryColor as backgroundColor
  const textColor = secondaryColor || "#FFFFFF"; // Use secondaryColor as textColor
  const content = "Custom Android branding"; // Default content

  // Define progress state
  const progress: Progress = {
    id: "android-progress",
    label: "Progress Label",
    value: 50,
    max: 100,
    current: 50,
    percentage: 0,
  };

  // Define progress bar props
  const progressBarProps: ProgressBarProps = {
    progress: progress,
    duration: 1000,
    phase: {
      type: "phaseType", 
      duration: 0,
      value: 0,
    },
    phaseType: ProgressPhase.LaunchPreparation, // Example phase
    animationID: "progress-bar-animation",
    uniqueID: "unique-progress-bar",
  };
  const contentProps: ContentProps = {
    onComplete: () => {
      // Handle completion logic
    },
  };

  return (
    <div>
      <h4>Android Specific Content</h4>
      {/* Add Android-specific content here */}
      <div
        style={{
          backgroundColor,
          color: textColor,
          padding: "10px",
          borderRadius: "5px",
          fontSize,
          fontFamily,
        }}
      >
        {/* Display Android-specific branding */}
        <p>{content}</p>
        {/* Additional features */}
        {additionalFeatures &&
          additionalFeatures.map((feature, index) => (
            <div key={index}>
              <p>{feature.title}</p>
              {/* Render additional feature content */}
              {feature.content}
            </div>
          ))}
      </div>

      {/* Render ProgressBar component */}
      <ProgressBar {...progressBarProps} />

      {/* Render AddContent component */}
      <AddContent {...contentProps} />
    </div>
  );
};

export default AndroidSpecificContent;
