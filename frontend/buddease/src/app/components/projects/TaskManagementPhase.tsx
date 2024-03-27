// TaskManagementPhase.tsx
import React, { useState } from "react";
import LaunchPhase from "../phases/onboarding/LaunchPhase";
import TaskManagerComponent from "../tasks/TaskManagerComponent";
import DataAnalysisPhase from "./DataAnalysisPhase/DataAnalysisPhase";
import { Task } from "../models/tasks/Task";

export enum TaskManagementPhase {
  LAUNCH,
  DATA_ANALYSIS,
}

const TaskManagementManager: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<TaskManagementPhase>(
    TaskManagementPhase.LAUNCH
  );

  const handlePhaseTransition = (nextPhase: TaskManagementPhase) => {
    // Add logic for transitioning to the next phase
    setCurrentPhase(nextPhase);
  };

  return (
    <div>
      <h1>Task Management Phase</h1>
      <TaskManagerComponent
        taskId={() => "task1"}
        newTitle={(): string => {
          return "New Task Title";
        }}
        task={{} as Task}
      />
      {currentPhase === TaskManagementPhase.LAUNCH && <LaunchPhase />}
      {currentPhase === TaskManagementPhase.DATA_ANALYSIS && (
        <DataAnalysisPhase onSubmit={() => handlePhaseTransition} />
      )}
      {/* Add more phases as needed */}
    </div>
  );
};

export default TaskManagementManager;
