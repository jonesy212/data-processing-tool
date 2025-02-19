// ToggleSwitchContainer.tsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ToggleSwitch from "./../../components/libraries/menu/ToggleSwitch"
import { toggleTask } from "@/app/api/TasksApi"
import Task from "@/app/components/models/tasks/Task";
import { RootState } from "../state/redux/slices/RootSlice";

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
