// ToggleSwitchContainer.tsx
import type { toggleTask } from "@/core/api/TasksApi";
import Task from "@/core/components/models/tasks/Task";
import ToggleSwitch from "@/core/libraries/menu/ToggleSwitch";
import type { RootState } from "@/core/state/redux/slices/RootSlice";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

const ToggleSwitchContainer: React.FC<{ taskId: string }> = ({ taskId }) => {
  const dispatch = useDispatch();
  const task = useSelector((state: RootState) =>
    state.taskManager.find((task: Task) => task.id === taskId)
  );

  const handleToggle = async (checked: boolean) => {
    const result = await dispatch(toggleTask({ taskId, checked }));
    if (result instanceof Task) {
      // Handle successful toggle
    } else {
      // Handle error case
    }
  };

  if (!task) {
    return null; // or some fallback UI
  }

  return (
    <ToggleSwitch
      label={`task-${taskId}`}
      checked={task.completed}
      onChange={handleToggle}
    />
  );
};

export default ToggleSwitchContainer;
