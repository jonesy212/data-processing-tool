// ControlPanel.tsx
import SpeedOutlined from "@ant-design/icons"; // Import SpeedOutlined icon from Ant Design icons
import { Button, Dropdown, Menu, Slider, Space } from "antd"; // Import Slider and Button components from Ant Design
import React, { useState } from "react";
import { CustomEventExtension } from "../components/event/CustomEvent";
import { createCustomEvent } from "../components/event/EventService";
import ThemeCustomization from "../components/hooks/userInterface/ThemeCustomization";
import AnimationDial from "../components/libraries/animations/AnimationDial";
import FadeInAnimation from "../components/libraries/animations/FadeInAnimation";
import RotateAnimation from "../components/libraries/animations/RotateAnimation";
import SlideUpAnimation from "../components/libraries/animations/SlideUpAnimation";
import CustomizableTimersComponent from "../components/stopwatches/CustomizableTimersComponent";
import responsiveDesignStore from "../components/styling/ResponsiveDesign";
import {
  NotificationType,
  useNotification,
} from "../components/support/NotificationContext";
import {
  ButtonGenerator,
  buttonGeneratorProps,
} from "../generators/GenerateButtons";

interface ControlPanelProps {
  speed: number; // Current speed of the automated processes
  onChangeSpeed: (newSpeed: number) => void; // Callback function to handle speed changes
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  speed,
  onChangeSpeed,
}) => {
  const [newSpeed, setNewSpeed] = useState(speed);
  const [animationSpeed, setAnimationSpeed] = useState(speed);
  const { sendNotification } = useNotification();

  const presetPercentages = [0, 25, 50, 75, 100]; // Define preset percentages

  const handleSpeedChange = (
    event: React.ChangeEvent<HTMLInputElement> | number
  ) => {
    if (typeof event === "number") {
      // If the value is directly passed as a number, update the newSpeed directly
      setNewSpeed(event);
    } else {
      // If it's an event, extract the value from the event and update newSpeed
      const newSpeedValue = parseInt(event.target.value);
      setNewSpeed(newSpeedValue);
    }
  };

  const applySpeedChange = () => {
    setAnimationSpeed(newSpeed);
    onChangeSpeed(newSpeed);
  };

  const handlePresetPercentage = (percentage: number) => {
    const newSpeedValue = (percentage / 100) * 10; // Calculate speed based on percentage
    setNewSpeed(newSpeedValue);
    applySpeedChange();
  };

  const presetMenu = (
    <Menu>
      {presetPercentages.map((percentage) => (
        <Menu.Item
          key={percentage}
          onClick={() => handlePresetPercentage(percentage)}
        >
          {percentage}%
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleCustomEvent = () => {
    // Use the CustomEventExtensionConstructor for creating custom events
    const customEvent: CustomEventExtension = createCustomEvent(
      `customEventId`,
      `customEvenTitle`,
      `description`,
      new Date(),
      new Date()
    );

    // Dispatch the custom event
    customEvent.dispatchEvent(customEvent);
  };

  const handleNotificationClick = () => {
    sendNotification(
      "Info" as NotificationType,
      "Speed Changed",
      `New speed set to ${newSpeed}`
    );
  };

  // Function to update breakpoints using the responsiveDesignStore
  const updateBreakpoint = (
    breakpoint: keyof typeof responsiveDesignStore.responsiveProps.breakpoints,
    value: number
  ) => {
    responsiveDesignStore.updateBreakpoint(breakpoint, value);
  };

  return (
    <div>
      <h2>Control Panel</h2>
      {/* Animation speed dial */}
      <AnimationDial
        label="Animation Speed"
        min={1}
        max={10}
        value={animationSpeed}
        onChange={(newSpeed) => setNewSpeed(newSpeed)}
      />

      <div>
        <label htmlFor="speedRange">Speed: {newSpeed}</label>
        <input
          type="range"
          id="speedRange"
          min="1"
          max="10"
          value={newSpeed}
          onChange={handleSpeedChange}
        />
      </div>
      <button onClick={applySpeedChange}>Apply Speed</button>

      {/* Ant Design Slider for animation speed */}
      <Slider min={1} max={10} value={newSpeed} onChange={handleSpeedChange} />

      {/* Button to apply speed change */}
      <Button type="primary" onClick={applySpeedChange}>
        Apply Speed
      </Button>

      <Button type="primary" onClick={handleNotificationClick}>
        Send Notification
      </Button>

      <Space>
        <SpeedOutlined />
        <span>{newSpeed}</span>
      </Space>

      {/* Dropdown for preset percentages */}
      <Dropdown overlay={presetMenu}>
        <Button>Select Percentage</Button>
      </Dropdown>

      {/* Fade in animation */}
      <FadeInAnimation duration={animationSpeed * 100} />

      {/* Slide up animation */}
      <SlideUpAnimation duration={animationSpeed * 100} />

      {/* Rotate animation */}
      <RotateAnimation angle={90} duration={animationSpeed * 200} />
      <h2>Customizable Timers</h2>
      <CustomizableTimersComponent initialTime={60} />
      <h2>Theme Customization</h2>
      <ThemeCustomization />
      <h2>Custom Event</h2>
      <button onClick={handleCustomEvent}>Dispatch Custom Event</button>

      {/* Add controls to update breakpoints */}
      <Button onClick={() => updateBreakpoint("small", 480)}>
        Update Small Breakpoint
      </Button>
      <Button onClick={() => updateBreakpoint("medium", 800)}>
        Update Medium Breakpoint
      </Button>
      <Button onClick={() => updateBreakpoint("large", 1200)}>
        Update Large Breakpoint
      </Button>

      <h2>Control Panel</h2>
      {/* Use ButtonGenerator to render buttons with predefined functionalities */}
      <ButtonGenerator {...buttonGeneratorProps} />
    </div>
  );
};

export default ControlPanel;
