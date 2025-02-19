// AdapterContent.tsx
import React, { useState } from "react";
import NavigationGenerator from "../../hooks/userInterface/NavigationGenerator";
import DraggableAnimation from "../../libraries/animations/DraggableAnimation";
import Link from "../../routing/Link";
import {
  AnimatedComponentProps,
} from "../../styling/AnimationsAndTansitions";
import ColorPalette, { ColorSwatchProps } from "../../styling/ColorPalette";
import { AnimatedComponent } from "../../libraries/animations/AnimationComponent";
import { Card } from "antd";
interface ScreenElementProps {
  id: string;
  // Add other properties as needed, such as styles, content, etc.
}
interface AdapterContentProps {
  selectedDevice: string;
  animationSettings: AnimatedComponentProps[];
  handleAnimationSettingsChange: (settings: AnimatedComponentProps[]) => void;
  handleBrandingSwatchesChange: (swatches: ColorSwatchProps[]) => void;
  headerElements: ScreenElementProps[];
  footerElements: ScreenElementProps[];
  panelElements: ScreenElementProps[];
  buttonElements: ScreenElementProps[];
  layoutElements: ScreenElementProps[];
  linkElements: ScreenElementProps[];
  cardElements: ScreenElementProps[];
  // Add any additional props as needed
}

const AdapterContent: React.FC<AdapterContentProps> = ({
  selectedDevice,
  animationSettings,
  handleAnimationSettingsChange,
  handleBrandingSwatchesChange,
  headerElements,
  footerElements,
  panelElements,
  buttonElements,
    layoutElements,
    linkElements,
  cardElements,
  // Destructure other props as needed
}) => {
  // State for managing branding and content settings
  const [brandingSwatches, setBrandingSwatches] = useState<ColorSwatchProps[]>(
    []
  );
  const [dynamicContent, setDynamicContent] = useState<string>("");

  // Function to update branding swatches
  const handleBrandingSwatchesChangeLocal = (swatches: ColorSwatchProps[]) => {
    setBrandingSwatches(swatches);
    handleBrandingSwatchesChange(swatches); // Call the prop function to notify parent components
    // Additional logic if needed
  };

  // Placeholder array for new color swatches
  const newSwatches: ColorSwatchProps[] = [
    {
      key: 0,
      color: "#ff0000",
      style: { backgroundColor: "#ff0000", width: "50px", height: "50px" },
    },
    {
      key: 1,
      color: "#00ff00",
      style: { backgroundColor: "#00ff00", width: "50px", height: "50px" },
    },
    // Add more swatches as needed
  ];

  // Function to update dynamic content
  const handleDynamicContentChange = (content: string) => {
    setDynamicContent(content);
    // Additional logic if needed
  };

  return (
    <div>
      <h2>Adapter Content</h2>

      {/* Device Selection */}
      <div>
        <h3>Select Device:</h3>
        <p>Selected Device: {selectedDevice}</p>
        {/* Additional UI for device selection */}
        {/* Header Elements */}
        <div>
          <h3>Header Elements:</h3>
          {/* Render header elements based on the props */}
          {headerElements.map((element) => (
            <div key={element.id}>
              {/* Render header element content/style/etc. */}
            </div>
          ))}
        </div>

        {/* Footer Elements */}
        <div>
          <h3>Footer Elements:</h3>
          {/* Render footer elements based on the props */}
          {footerElements.map((element) => (
            <div key={element.id}>
              {/* Render footer element content/style/etc. */}
            </div>
          ))}
        </div>

        {/* Panel Elements */}
        <div>
          <h3>Panel Elements:</h3>
          {/* Render panel elements based on the props */}
          {panelElements.map((element) => (
            <div key={element.id}>
              {/* Render panel element content/style/etc. */}
            </div>
          ))}
        </div>

        {/* Button Elements */}
        <div>
          <h3>Button Elements:</h3>
          {/* Render button elements based on the props */}
          {buttonElements.map((element) => (
            <div key={element.id}>
              {/* Render button element content/style/etc. */}
            </div>
          ))}
        </div>

        {/* Layout Elements */}
        <div>
          <h3>Layout Elements:</h3>
          {/* Render layout elements based on the props */}
          {layoutElements.map((element) => (
            <div key={element.id}>
              {/* Render layout element content/style/etc. */}
            </div>
          ))}
              </div>


              {/* Navigation Generator */}
      <NavigationGenerator
        onNavigationChange={(newItems) => {
          // Handle navigation changes if needed
          console.log('Navigation items changed:', newItems);
        }}
        defaultNavigationItems={[
          { label: 'Example Page', path: '/example', icon: <ExampleIcon /> },
          // Add more default items as needed
        ]}
      />
                {/* Link Elements */}
      <div>
        <h3>Link Elements:</h3>
        {/* Render link elements based on the props */}
        {linkElements.map((element) => (
          <Link key={element.id} id={element.id} />
        ))}
      </div>

      {/* Card Elements */}
      <div>
        <h3>Card Elements:</h3>
        {/* Render card elements based on the props */}
        {cardElements.map((element) => (
          <Card key={element.id} id={element.id} />
        ))}
      </div>
        {/* ... (Other sections) */}
      </div>

      {/* Color Palette for Branding */}
      <div>
        <h3>Brand Color Palette:</h3>
        <ColorPalette
          swatches={brandingSwatches}
          colorCodingEnabled={true}
          brandingSwatches={brandingSwatches}
        />
        {/* Add functionality to update branding swatches */}
        <button onClick={() => handleBrandingSwatchesChangeLocal(newSwatches)}>
          Update Branding
        </button>
        {/* Add functionality to update branding swatches */}
        {/* e.g., <button onClick={() => handleBrandingSwatchesChange(newSwatches)}>Update Branding</button> */}
      </div>

      {/* Animated Component Settings */}
      <div>
        <h3>Animated Component Settings:</h3>
        <AnimatedComponent
          animationClass={
            animationSettings.length > 0
              ? animationSettings[0].animationClass
              : ""
          }
        />
        {/* Add functionality to update animation settings */}
        <button
          onClick={() =>
            handleAnimationSettingsChange([
              ...animationSettings,
              {
                animationClass: "newAnimation",
              },
            ])
          }
        >
          Add New Animation
        </button>
      </div>

      {/* Draggable Animation Example */}
      <div>
        <h3>Draggable Animation:</h3>
        <button
          onClick={() => handleDynamicContentChange("Dynamic Content Updated!")}
        >
          Update Dynamic Content
        </button>
        <button onClick={() => handleDynamicContentChange("")}>
          Clear Dynamic Content
        </button>
        <DraggableAnimation
          onDragStart={() => console.log("Drag started")}
          onDragEnd={() => console.log("Drag ended")}
          draggableId="exampleId"
          index={0}
        >
          <div>Draggable Content</div>
        </DraggableAnimation>
        {/* Display dynamic content if available */}
        {dynamicContent && <p>Dynamic Content: {dynamicContent}</p>}
      </div>

      {/* Additional features/components can be added as needed */}
    </div>
  );
};

//todo update and use the right icon here
const ExampleIcon: React.FC = () => <span>🌐</span>; // Replace with your actual icon

export default AdapterContent;
