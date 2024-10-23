// TaskProcess.tsx
import TaskReportGenerator, { TaskReport } from "@/app/generators/TaskReportGenerator";
import React, { useState } from "react";
import { Task } from "../models/tasks/Task";
import TaskForm from "../models/tasks/TaskForm";
import TaskService from "../tasks/TaskService";
import TaskLoop from "./TaskLoop";

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
  const [taskData, setTaskData] = useState<Task[]>([]);
  const [taskType, setTaskType] = useState<string>("text"); // Default task type 
  const [currentPhase, setCurrentPhase] = useState<TaskPhaseEnum>(
    TaskPhaseEnum.TASK_MANAGEMENT
  );

  const handleSubmitTask = (task: Task) => {
    // Add the submitted task to the data array
    setTaskData([...taskData, task]);
  };

  const handleProcessTask = () => {
    // Change phase to task processing
    setCurrentPhase(TaskPhaseEnum.TASK_PROCESSING);

    // Process the task data
    const taskService = TaskService.getInstance();
    taskService.processTasks(taskData, taskType);

    // Generate task report
    const taskReport: TaskReport = TaskReportGenerator.generateTaskReport(taskData);
    console.log(taskReport); // Example: Log the task report

    // Change phase to task reporting
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
      {/* Render individual tasks using TaskLoop */}
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
