// TaskManagementPhase.tsx
import React, { useState } from "react";
import { Task } from "@/app/models/tasks/Task";
import LaunchPhase from "@/app/components/phases/onboarding/LaunchPhase";
import DataAnalysisPhase from "@/app/projects/DataAnalysisPhase/DataAnalysisPhase";
import TaskManagerComponent from '@/app/components/tasks/TaskManagerComponent';
import PlanningPhase from "@/app/components/phases/DevelopmentPhase";
import TestingPhase from "@/app/components/phases/TestingPhase";
import ExecutionPhase from "@/app/components/phases/ExecutionPhase";
import CompletionPhase from "@/app/components/phases/CompletionPhase";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';

export enum TaskManagementPhase {
  LAUNCH= "LAUNCH",
  DATA_ANALYSIS= "DATA_ANALYSIS",
  PLANNING = "PLANNING",
  EXECUTION = "EXECUTION",
  TESTING = "TESTING",
  COMPLETION = "COMPLETION",
  TEAM_PLANNING = 'TEAM_PLANNING'
}

interface TaskManagementManagerProps<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> {
  taskId: () => string;
  newTitle: () => string;
  task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

const TaskManagementManager = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>({
  taskId,
  newTitle,
  task,
}: TaskManagementManagerProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
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
        task={{} as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>}
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