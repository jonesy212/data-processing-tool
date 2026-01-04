TaskProjectDetails.tsx
import { TaskDetails } from "@/core/models/data/index";
import { observer } from "mobx-react-lite";
import React from "react";
import { useParams } from "react-router-dom";

const TaskProjectDetails: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();

  // Fetch task details based on the ID using a service or API call

  return (
    <div>
      <h2>Task Details</h2>
      <TaskDetails taskId={id} />
      {/* Render additional details or components for the task */}
    </div>
  );
});

export default TaskProjectDetails;
