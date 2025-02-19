// CustomizationOptions.tsx 
import React from 'react';

// imports for layout and multimedia content customization components
import LayoutCustomization from '@/app/configs/LayoutCustomization';
import MultimediaContentCustomization, { MultimediaContentCustomizationProps } from '@/app/pages/content/MultimediaContentCustomization';
import { useThemeCustomization } from '../../hooks/useThemeCustomization';
import ThemeCustomization from '../../hooks/userInterface/ThemeCustomization';
import { ThemeState } from '../../state/redux/slices/ThemeSlice';
import { AnimatedComponentProps } from '../../styling/AnimationsAndTansitions';




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
