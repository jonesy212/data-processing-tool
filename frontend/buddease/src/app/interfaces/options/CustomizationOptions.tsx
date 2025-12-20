// CustomizationOptions.tsx 
import React from 'react';

// imports for layout and multimedia content customization components
import LayoutCustomization from '@/app/components/configs/LayoutCustomization';
import MultimediaContentCustomization, { MultimediaContentCustomizationProps } from '@/app/pages/content/MultimediaContentCustomization';
import { useThemeCustomization } from '@/app/hooks/useThemeCustomization';
import ThemeCustomization from '@/app/hooks/userInterface/ThemeCustomization';
import { ThemeState } from '@/app/state/redux/slices/ThemeSlice';
import { AnimatedComponentProps } from '@/app/components/styling/AnimationsAndTansitions';




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
