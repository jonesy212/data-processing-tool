// src/components/Teams/TeamComponent.tsx

import React, { useEffect, useState } from "react";
import TaskProgress from "../../projects/projectManagement/TaskProgress";
import TodoProgress from "../../projects/projectManagement/TodoProgress";
import { DetailsItem } from "../../state/stores/DetailsListStore";
import { Todo } from "../../todos/Todo";
import { Data } from "../data/Data";
import { Task } from "../tasks/Task";
import { Team as BackendTeam } from "./Team";

interface TeamComponentProps {
  teamId: string;
}

const TeamComponent: React.FC<TeamComponentProps> = ({ teamId }) => {
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<BackendTeam | null>(null);
  const [taskProgress, setTaskProgress] = useState<DetailsItem<Data>[]>([]);
  const [todoProgress, setTodoProgress] = useState<DetailsItem<Data>[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // State for selected task




  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);

        const fetchedTeam = await teamService.getTeamById(teamId);

        setTeam(fetchedTeam);
        // Fetch and set task progress
        const fetchedTaskProgress = await getTaskProgress(teamId);
        setTaskProgress(fetchedTaskProgress);
        // Fetch and set todo progress
        const fetchedTodoProgress = await getTodoProgress(teamId);
        setTodoProgress(fetchedTodoProgress);
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [teamId]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task); // Update selected task when clicked
  };

  const handleTodoClick = (todo: Todo) => {
    console.log("Todo clicked:", todo);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!team) {
    return <div>Team not found.</div>;
  }

  const handleTaskProgressUpdate = (newProgress: number) => {
    if (selectedTask) {
      // Ensure the new progress value is within the valid range (0 to 100)
      const progressValue = Math.min(Math.max(newProgress, 0), 100);

      // Update the task's progress value
      selectedTask.progress = progressValue;

      // Check if the task is completed
      if (progressValue === 100) {
        // Update task status and completion date
        selectedTask.status = "completed";
        selectedTask.completionDate = new Date();
      } else {
        // If not completed, set task status to 'in progress'
        selectedTask.status = "in progress";
      }

      // Perform any other necessary actions related to task progress update
      // For example, trigger a notification or update UI components
      console.log(
        `Task '${selectedTask.title}' progress updated to ${progressValue}%`
      );
    }
  };

  const handleTodoProgressUpdate = (todo: Todo, newProgress: number) => {
    // Ensure progress value is within the valid range (0 to 100)
    const progressValue = Math.min(Math.max(newProgress, 0), 100);

    // Update todo progress
    todo.progress = progressValue;
    // Optionally, you can also update other properties or perform additional actions based on the progress update

    // For example, if the todo is marked as completed when progress reaches 100%, you can do:
    if (progressValue === 100) {
      todo.status = "completed";
      todo.completionDate = new Date();
    } else {
      todo.status = "in progress";
    }
    // Perform any other necessary actions related to todo progress update

    // Example: Trigger a notification or update UI components
    console.log(`Todo '${todo.title}' progress updated to ${progressValue}%`);
  };

  return (
    <div>
      <h1>{team.teamName}</h1>
      {/* Render other team details as needed */}
      {/* Render TaskProgress component */}
      {selectedTask && (
        <TaskProgress
          taskProgress={taskProgress}
          newProgress={selectedTask.progress} // Pass newProgress as prop
          onUpdateProgress={handleTaskProgressUpdate}
          selectedTask={selectedTask} // Pass selectedTask as prop
          onTaskClick={handleTaskClick} // Pass click handler to update selectedTask
        />
      )}
      {/* Render TodoProgress component */}
      <TodoProgress
        todoProgress={todoProgress}
        newProgress={selectedTask?.todo.progress}
        onUpdateProgress={handleTodoProgressUpdate}
        selectedTodo={selectedTask?.todo} // Pass selectedTodo as prop
        onTodoClick={handleTodoClick} // Pass click handler to update selectedTask
      />
    </div>
  );
};

export default TeamComponent;
