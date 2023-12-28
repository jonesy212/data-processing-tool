// TaskManagementPhase.tsx
import React, { useState } from "react";
import TaskManagerComponent from "../models/tasks/TaskManagerComponent";
import LaunchPhase from "../phases/onboarding/LaunchPhase";
import DataAnalysisPhase from "./DataAnalysisPhase/DataAnalysisPhase";

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
      <TaskManagerComponent />
      {currentPhase === TaskManagementPhase.LAUNCH && <LaunchPhase />}
      {currentPhase === TaskManagementPhase.DATA_ANALYSIS && (
        <DataAnalysisPhase />
      )}
      {/* Add more phases as needed */}
    </div>
  );
};

export default TaskManagementManager;
