// CustomizationOptions.tsx
import React from 'react';

// imports for layout and multimedia content customization components
import LayoutCustomization from '@/core/components/configs/LayoutCustomization';
import { AnimatedComponentProps } from '@/core/components/styling/AnimationsAndTansitions';
import { useThemeCustomization } from '@/core/hooks/useThemeCustomization';
import ThemeCustomization from '@/core/hooks/userInterface/ThemeCustomization';
import type { MultimediaContentCustomizationProps } from '@/core/pages/content/MultimediaContentCustomization';
import MultimediaContentCustomization from '@/core/pages/content/MultimediaContentCustomization';
import { ThemeState } from '@/core/state/redux/slices/ThemeSlice';




interface CustomizationOptionsProps extends MultimediaContentCustomizationProps{
  updateTheme: (theme: ThemeState) => void;

}


const CustomizationOptions: React.FC<CustomizationOptionsProps> = (props) => {
  const {infoColor, themeState, notificationState, setNotificationState, setThemeState} = useThemeCustomization();


  const handleAnimationSettingsChange = (
    settings: AnimatedComponentProps[]
  ) => {
    // Handle change in animation settings
    props.handleAnimationSettingsChange(settings);
  };


  return (
    <div>
      <h2>Customization Options</h2>
      {/* Include the ThemeCustomization component */}
      <ThemeCustomization
          infoColor={infoColor}
              themeState={themeState}
              setThemeState={setThemeState}
              notificationState={notificationState}
          />

      {/* Include the LayoutCustomization component */}
      <LayoutCustomization
      />

      {/* Include the MultimediaContentCustomization component */}
      <MultimediaContentCustomization
        handleAnimationSettingsChange={handleAnimationSettingsChange}
      />
    </div>
  );
};

export default CustomizationOptions;
