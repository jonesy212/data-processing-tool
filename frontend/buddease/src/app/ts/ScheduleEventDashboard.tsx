import { Button, Space } from "antd";
import React from "react";
import { ProjectManagementActions } from "@/app/actions/ProjectManagementActions";
import { ButtonGenerator, useButtonGeneratorProps } from "@/app/generators/GenerateButtons";
import ScheduleEventModal from "./ScheduleEventModal";

const ScheduleEventDashboard: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  // Use the new hook to get button props
  const { buttonProps, currentPhase, lifecycleManager } = useButtonGeneratorProps();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Customize button props for schedule event functionality
  const scheduleButtonProps = {
    ...buttonProps,
    onSubmit: showModal, // Set onSubmit handler to showModal function
    onOpenDashboard: (dashboard: any) => console.log(`Opened Dashboard: ${dashboard}`),
    label: {
      ...buttonProps.label,
      submit: "Schedule Event",
      cancel: "Cancel Scheduling"
    }
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
      <ButtonGenerator {...scheduleButtonProps} />
      <ScheduleEventModal visible={isModalVisible} onCancel={handleCancel} />
    </div>
  );
};

export default ScheduleEventDashboard;