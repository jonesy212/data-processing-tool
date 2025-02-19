import { Button, Space } from "antd";
import React from "react";
import { ProjectManagementActions } from "../components/actions/ProjectManagementActions";
import { ButtonGenerator, ButtonGeneratorProps } from "../generators/GenerateButtons";
import ScheduleEventModal from "./ScheduleEventModal";

const ScheduleEventDashboard: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Define buttonGeneratorProps
  const buttonGeneratorProps: ButtonGeneratorProps = {
    onSubmit: showModal, // Set onSubmit handler to showModal function
    onOpenDashboard: (dashboard: any) => console.log(`Opened Dashboard: ${dashboard}`), // Set onOpenDashboard handler
    // Add other handlers as needed
  };

  return (
    <div>
      <h1>Schedule Event Dashboard</h1>
      <Space direction="vertical">
        {/* Existing buttons for scheduling specific project management actions */}
        <Button type="primary" onClick={showModal}>
          Schedule New Event
        </Button>
        <Button onClick={() => scheduleAction(ProjectManagementActions.fetchDevelopers)}>
          Schedule Fetch Developers Action
        </Button>
        <Button onClick={() => scheduleAction(ProjectManagementActions.bidOnProject)}>
          Schedule Bid On Project Action
        </Button>
        {/* Add more buttons for other project management actions */}
      </Space>
      {/* Render buttons using ButtonGenerator component */}
      <ButtonGenerator {...buttonGeneratorProps} />
      <ScheduleEventModal visible={isModalVisible} onCancel={handleCancel} />
    </div>
  );
};

export default ScheduleEventDashboard;
