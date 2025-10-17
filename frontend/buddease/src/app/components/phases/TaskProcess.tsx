// TaskProcess.tsx
import TaskReportGenerator, { TaskReport } from "@/app/generators/TaskReportGenerator";
import React, { useState } from "react";
import { Task } from "@/app/models/tasks/Task";
import TaskForm from "@/app/components/tasks/TaskForm";
import TaskService from "@/app/services/TaskService";
import TaskLoop from "./TaskLoop";

// Default alias for Task
type DefaultTask = Task<any, any, any, any>;

enum TaskPhaseEnum {
    TASK_SELECTION = "TASK_SELECTION",
    TASK_CREATING = "TASK_CREATING",
    TASK_PROCESSING = "TASK_PROCESSING",
    TASK_ANALYSIS = "TASK_ANALYSIS",
    TASK_REPORTING = "TASK_REPORTING",
    EXECUTION = "EXECUTION",  
    TASK_MANAGEMENT = 'TASK_MANAGEMENT',
}

const TaskProcess: React.FC = () => {
  const [taskData, setTaskData] = useState<DefaultTask[]>([]); // use DefaultTask
  const [taskType, setTaskType] = useState<string>("text"); 
  const [currentPhase, setCurrentPhase] = useState<TaskPhaseEnum>(
    TaskPhaseEnum.TASK_MANAGEMENT
  );

  const handleSubmitTask = (task: DefaultTask) => { // use DefaultTask
    setTaskData([...taskData, task]);
  };

  const handleProcessTask = () => {
    setCurrentPhase(TaskPhaseEnum.TASK_PROCESSING);

    const taskService = TaskService.getInstance();
    taskService.processTasks(taskData, taskType);

    const taskReport: TaskReport = TaskReportGenerator.generateTaskReport(taskData);
    console.log(taskReport);

    setCurrentPhase(TaskPhaseEnum.TASK_REPORTING);
  };

  return (
    <div>
      <h1>Task Management and Reporting</h1>
      {currentPhase === TaskPhaseEnum.TASK_MANAGEMENT && (
        <>
          <TaskForm onSubmit={handleSubmitTask} />
          <button onClick={handleProcessTask}>Process Tasks</button>
        </>
      )}
      {currentPhase === TaskPhaseEnum.TASK_REPORTING && (
        <>
          {/* Render task report or its components here */}
          <hr />
        </>
      )}

      <h2>Task Loop</h2>
      {taskData.map((task, index) => (
        <TaskLoop
          key={index}
          task={task}
          taskType={taskType}
        />
      ))}
    </div>
  );
};

export default TaskProcess;
export { TaskPhaseEnum };
