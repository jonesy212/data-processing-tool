// ControlPanel.tsx
import SpeedOutlined from "@ant-design/icons"; // Import SpeedOutlined icon from Ant Design icons
import { Button, Dropdown, Menu, Slider, Space } from "antd"; // Import Slider and Button components from Ant Design
import React, { useState } from "react";
import { CustomEventExtension } from "../components/event/BaseCustomEvent";
import { createCustomEvent } from "../components/event/EventService";
import ThemeCustomization from "../components/hooks/userInterface/ThemeCustomization";
import AnimationDial from "../components/libraries/animations/AnimationDial";
import FadeInAnimation from "../components/libraries/animations/FadeInAnimation";
import RotateAnimation from "../components/libraries/animations/RotateAnimation";
import SlideUpAnimation from "../components/libraries/animations/SlideUpAnimation";
import CustomizableTimersComponent from "../components/stopwatches/CustomizableTimersComponent";
import responsiveDesignStore from "../components/styling/ResponsiveDesign";
import {
  NotificationContextProps,
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "../components/support/NotificationContext";
import {
  ButtonGenerator,
  buttonGeneratorProps,
} from "../generators/GenerateButtons";
import { themeConfig } from "../pages/_app";
import apiNotificationsService from "../api/NotificationsService";
import { notificationStoreInstance, useNotificationStore } from "../components/state/stores/NotificationStore";
import { action } from "mobx";
import { usePresetPercentages } from "../generators/presetPercentages";

interface ControlPanelProps {
  speed: number; // Current speed of the automated processes
  onChangeSpeed: (newSpeed: number) => void; // Callback function to handle speed changes
  container: NotificationContextProps; // Update the type
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  speed,
  onChangeSpeed,
  container
}) => {
  const [newSpeed, setNewSpeed] = useState(speed);
  const [animationSpeed, setAnimationSpeed] = useState(speed);
  const { sendNotification } = useNotification();




// Inside ControlPanel component

const notificationStoreContainer: NotificationService = notificationStore.useContainer(container.toString());
// Check if notificationStoreContainer is not null before accessing its properties
const notifications = notificationStoreContainer.notifications || [];
const setNotifications = notificationStoreContainer.setNotifications || (() => {});

  
  const handleSpeedChange = (
    event: React.ChangeEvent<HTMLInputElement> | number
  ) => {
    if (typeof event === "number") {
      setNewSpeed(event);
    } else {
      const newSpeedValue = parseInt(event.target.value);
      setNewSpeed(newSpeedValue);
    }
  };

  const applySpeedChange = () => {
    setAnimationSpeed(newSpeed);
    onChangeSpeed(newSpeed);
  };

  const handlePresetPercentage = (percentage: number) => {
    const newSpeedValue = (percentage / 100) * 10;
    setNewSpeed(newSpeedValue);
    applySpeedChange();
  };

  const { percentages, handleNumPercentagesChange } = usePresetPercentages();

  const presetMenu = (
    <Menu>
      {percentages.map((percentage) => (
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
    const customEvent: CustomEventExtension = createCustomEvent(
      `customEventId`,
      `customEvenTitle`,
      `description`,
      new Date(),
      new Date()
    );
    customEvent.dispatchEvent!(customEvent);
  };

  const handleNotificationClick = () => {
    sendNotification(
      "Info" as NotificationType,
      "Speed Changed",
      `New speed set to ${newSpeed}`
    );
  };

  const updateBreakpoint = (
    breakpoint: keyof typeof responsiveDesignStore.responsiveProps.breakpoints,
    value: number
  ) => {
    responsiveDesignStore.updateBreakpoint(breakpoint, value);
  };

  return (
    <div>
      <h2>Control Panel</h2>
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

      <Slider min={1} max={10} value={newSpeed} onChange={handleSpeedChange} />

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

      <Dropdown overlay={presetMenu}>
        <Button>Select Percentage</Button>
      </Dropdown>

      <FadeInAnimation duration={animationSpeed * 100} />

      <SlideUpAnimation duration={animationSpeed * 100} />

      <RotateAnimation angle={90} duration={animationSpeed * 200} />
      <h2>Customizable Timers</h2>
      <CustomizableTimersComponent initialTime={60} />
      <h2>Theme Customization</h2>
      <ThemeCustomization
        themeState={themeConfig}
        setThemeState={() => {}}
        notificationState={{
          notifications: notifications || [],
          setNotifications: setNotifications,
          notify: (id: string, message: string, content: any, date: Date = new Date(), type: NotificationType = NotificationTypeEnum.INFO) => Promise.resolve(apiNotificationsService.notify(id, message, content, date, type)),
          sendPushNotification: sendPushNotification,

          sendAnnouncement: /* function to send announcements */,
          handleButtonClick: /* function to handle button clicks */,
          dismissNotification,
          addNotification,
          removeNotification,
          clearNotifications,
        }}
      />
      <h2>Custom Event</h2>
      <button onClick={handleCustomEvent}>Dispatch Custom Event</button>

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
      <ButtonGenerator {...buttonGeneratorProps} />
    </div>
  );
};

export default ControlPanel
export type { ControlPanelProps };
