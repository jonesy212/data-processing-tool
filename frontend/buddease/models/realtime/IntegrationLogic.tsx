// IntegrationLogic.ts

import ControlPanel from "@/app/utils/ControlPanel";
import RealTimeVisualization from "./RealTimeVisualization";
import Calendar from '../../src/app/components/calendar/Calendar';

// Define a function to integrate existing components into the real-time visualization and control panel
const integrateComponents = () => {
  // Initialize existing components
  const controlPanel = new ControlPanel();
  const taskManager = new TaskManager();
  const calendar = new Calendar();

    

      // Integrate components
  const realtimeVisualization = <RealTimeVisualization />; 

  // Integrate components
  realtimeVisualization.setControlPanel(controlPanel);
  realtimeVisualization.setTaskManager(taskManager);
  controlPanel.setTaskManager(taskManager);
  controlPanel.setCalendar(calendar);

  // Optionally, return integrated components for further use
  return {
    realtimeVisualization,
    controlPanel,
    taskManager,
    calendar,
  };
};

export default integrateComponents;


