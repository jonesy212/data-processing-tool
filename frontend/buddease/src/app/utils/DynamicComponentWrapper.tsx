import React from "react";
import DynamicConfigActionType, {
  DynamicComponentsProvider,
  DynamicConfigType,
  useDynamicComponents,
} from "../components/DynamicComponentsContext";
import ChatComponent from "../components/communications/chat/ChatComponent";
import useErrorHandling from "../components/hooks/useErrorHandling";
import DynamicSelectionControls, {
  Option,
} from "../components/libraries/animations/DynamicSelectionControls";
import Logger, { ComponentLogger } from "../components/logging/Logger";
import { DappProps } from "../components/web3/dAppAdapter/DAppAdapterConfig";

interface DynamicComponentProps {
  component: React.ReactNode; // Define the type of the component prop
}

const DynamicComponentWrapper: React.FC<DynamicComponentProps> = ({
  component,
}) => {
  const { setDynamicConfig, updateDynamicConfig } = useDynamicComponents(); // Use the context hook
  const { handleError } = useErrorHandling();

  // Define a function to generate dynamic selection options
  const generateDynamicSelectionOptions = (optionsData: Option[]) => {
    return optionsData.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  };

  // Example data for dynamic options
  const optionsData: Option[] = [
    { label: "Dynamic Option 1", value: "dynamicOption1" },
    { label: "Dynamic Option 2", value: "dynamicOption2" },
    // Add more dynamic options as needed
  ];

  // Generate dynamic selection options using the function
  const dynamicSelectionOptions = generateDynamicSelectionOptions(optionsData);

  return (
    <DynamicComponentsProvider
      updateDynamicConfig={(newConfig: DynamicConfigType) => {
        setDynamicConfig(newConfig);
      }}
      dynamicConfig={{
        prop1: "",
        prop2: "",
        namingConventions: [],
      }} // Provide an object of type DynamicConfigType
      setDynamicConfig={(config) => {
        // Update dynamic config state
        updateDynamicConfig(config);
      }}
      setDynamicConfigAction={(action: DynamicConfigActionType) => {
        switch (action.type) {
          case "UPDATE_PROP1":
            // Logic to update prop1 in dynamicConfig
            setDynamicConfig((prevConfig) => ({
              ...prevConfig,
              prop1: action.payload,
            }));
            break;
          case "UPDATE_PROP2":
            // Logic to update prop2 in dynamicConfig
            setDynamicConfig((prevConfig) => ({
              ...prevConfig,
              prop2: action.payload,
            }));
            break;
          // Add more cases as needed
          default:
            // Handle unknown action types
            console.error("Unknown action type:", action.type);
        }
      }}
    >
      <div>
        {/* Render dynamic selection controls */}
        <DynamicSelectionControls
          options={dynamicSelectionOptions}
          controlType="checkbox"
        />

        {/* Add your design dashboard content here */}
        <h1>Design Dashboard</h1>
        {/* ... other design dashboard elements ... */}

        {/* Render the component passed as prop */}
        {component}

      </div>
      {/* Example usage of Logger */}
      <button onClick={() => Logger.log("Clicked the button")}>Click Me</button>

      {/* Example usage of Logger */}
      <button
        onClick={() => ComponentLogger.log("User", "Clicked the button", "123")}
      >
        Click Me
      </button>
      {/* Example usage of handleError */}
      <button onClick={() => handleError("An error occurred")}>
        Simulate Error
      </button>
    </DynamicComponentsProvider>
  );
};

export default DynamicComponentWrapper;
