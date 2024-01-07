// AdapterDashboard.tsx
import { AnimatedComponent, AnimatedComponentRef } from '@/app/components/animations/AnimationComponent';
import useLayoutGenerator from '@/app/components/hooks/GenerateUserLayout';
import ColorPalette from '@/app/components/styling/ColorPalette';
import DashboardLoader from '@/dashboards/DashboardLoader';
import React, { ReactNode, useRef } from 'react';
import CommonLayout from '../layouts/CommonLayout';
import AdapterContent

// Import specific icons for each platform
import AndroidIcon from './icons/AndroidIcon';
import IOSIcon from './icons/IOSIcon';
import WebIcon from './icons/WebIcon';

const AdapterDashboard: React.FC = () => {
  // Placeholder URLs for mobile phone images
  const androidImageUrl = 'https://example.com/android-emulator.png';
  const iosImageUrl = 'https://example.com/ios-emulator.png';
  const webImageUrl = 'https://example.com/web-emulator.png';

  // Emulator selection state
  const [selectedEmulator, setSelectedEmulator] = React.useState('Android');

  const handleButtonClick = (platform: string) => {
    setSelectedEmulator(platform);
    // Additional logic if needed
  };

  const animatedComponentRef = useRef<AnimatedComponentRef>(null);

  const toggleAnimatedComponent = () => animatedComponentRef.current?.toggleActivation();

  const { toggleActivation } = useLayoutGenerator({
    condition: () => true,  // Adjust the condition as needed
    cleanup: () => {},      // Adjust the cleanup logic as needed
    layoutEffect: () => {},  // Adjust the layout effect logic as needed
  });

  // Dynamically select the appropriate icon based on the platform
  const PlatformIcon = () => {
    switch (selectedEmulator) {
      case 'Android':
        return <AndroidIcon />;
      case 'iOS':
        return <IOSIcon />;
      case 'Web':
        return <WebIcon />;
      default:
        return null;
    }
  };

  return (
    <CommonLayout>
      <body onClick={toggleActivation}>
        <header>
          <h1>Your Application</h1>
        </header>

        {/* Page content */}
        <main>
          <h1>Responsive AdapterDashboard</h1>

          {/* Display the emulator icon for the selected platform */}
          {PlatformIcon()}

          {/* Buttons for different platforms */}
          <button onClick={() => handleButtonClick('Android')}>Android</button>
          <button onClick={() => handleButtonClick('iOS')}>iOS</button>
          <button onClick={() => handleButtonClick('Web')}>Web</button>

          {/* Connect to AdapterContent for additional functionality */}
          <AdapterContent />

          {/* Color Palette for managing app branding */}
          <ColorPalette
            swatches={[
              { key: 0, color: '#ff5733', style: { backgroundColor: '#ff5733', width: '50px', height: '50px' } },
              { key: 1, color: '#33ff57', style: { backgroundColor: '#33ff57', width: '50px', height: '50px' } },
            ]}
            colorCodingEnabled={true}
            brandingSwatches={[
              { key: 2, color: '#3366ff', style: { backgroundColor: '#3366ff', width: '50px', height: '50px' } },
              { key: 3, color: '#ff3366', style: { backgroundColor: '#ff3366', width: '50px', height: '50px' } },
            ]}
          />

          {/* Animated Component */}
          <AnimatedComponent ref={animatedComponentRef} animationClass={''} />

          {/* Dashboard Loader */}
          <DashboardLoader dashboardConfig={{
            title: 'Dashboard Title',
              content:  {} as ReactNode
          }} />
        </main>

        {/* Common footer */}
        <footer>Footer content</footer>
      </body>
    </CommonLayout>
  );
};


export default AdapterDashboard;
