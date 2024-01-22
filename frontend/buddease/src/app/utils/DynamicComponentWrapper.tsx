// DynamicComponentWrapper.tsx
import React from 'react';
import { DynamicComponentsProvider, useDynamicComponents } from '../components/DynamicComponentsContext';
import ChatComponent from '../components/communications/chat/ChatComponent';
import DynamicSelectionControls from '../components/libraries/animations/DynamicSelectionControls';
import { DappProps } from '../components/web3/dAppAdapter/DAppAdapterConfig';

const DynamicComponentWrapper: React.FC = () => {
    const { setDynamicConfig } = useDynamicComponents(); // Use the context hook

  // Defineyour dynamic selection options
  const dynamicSelectionOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    // Add more options as needed
  ];

  return (
      <DynamicComponentsProvider
          dynamicConfig
          setDynamicConfig={(config) => {
            // Update dynamic config state
            setDynamicConfig(config);
          }}
      >
      <div>
        {/* Render dynamic selection controls */}
        <DynamicSelectionControls options={dynamicSelectionOptions} controlType="checkbox" />

        {/* Add your design dashboard content here */}
        <h1>Design Dashboard</h1>
        {/* ... other design dashboard elements ... */}

        {/* Example: Integrate with ChatComponent */}
        <ChatComponent dappProps={{ /* Pass props to ChatComponent */ } as DappProps} />
      </div>
    </DynamicComponentsProvider>
  );
};

export default DynamicComponentWrapper;
