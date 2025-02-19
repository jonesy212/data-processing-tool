// TaskManagementPhase.tsx
import React, { useState } from "react";
import { Task } from "../models/tasks/Task";
import LaunchPhase from "../phases/onboarding/LaunchPhase";
 import DataAnalysisPhase from "./DataAnalysisPhase/DataAnalysisPhase";
import TaskManagerComponent from '../tasks/TaskManagerComponent';
import  PlanningPhase from "@/app/pages/development/DevelopmentPhase";

export enum TaskManagementPhase {
  LAUNCH= "LAUNCH",
  DATA_ANALYSIS= "DATA_ANALYSIS",
  PLANNING= "PLANNING",
  EXECUTION ="EXECUTION",
  TESTING="TESTING",
  COMPLETION="",
}

interface TaskManagementManagerProps {
  taskId: () => string;
  newTitle: () => string;
  task: Task;
}

const TaskManagementManager: React.FC<TaskManagementManagerProps> = ({
  taskId,
  newTitle,
  task,
}) => {
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
      {currentPhase === TaskManagementPhase.PLANNING && (
        <PlanningPhase
          onSuccess={(): void => handlePhaseTransition(TaskManagementPhase.EXECUTION)}
          onSubmit={() => handlePhaseTransition(TaskManagementPhase.EXECUTION)}
        />
      )}
      {currentPhase === TaskManagementPhase.TESTING && (
        <TestingPhase
          onSubmit={() => handlePhaseTransition(TaskManagementPhase.COMPLETION)}
        />
      )}
      {currentPhase === TaskManagementPhase.EXECUTION && (
        <ExecutionPhase
          onSubmit={() => handlePhaseTransition(TaskManagementPhase.TESTING)}
        />
      )}
      {currentPhase === TaskManagementPhase.COMPLETION && (
        <CompletionPhase />
      )}
      
      {/* Add more phases as needed */}
    </div>
  );
};

export default TaskManagementManager;
export type {TaskManagementManagerProps}