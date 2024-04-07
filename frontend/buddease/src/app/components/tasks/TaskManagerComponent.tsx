// TaskManagerComponent.tsx
import { fetchTasks, updateTask } from "@/app/api/TasksApi";
import { ExtendedRouter } from "@/app/pages/MyAppWrapper";
import { Router, useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DynamicRenderer from "../libraries/ui/DynamicRenderer";
import ReusableButton from "../libraries/ui/buttons/ReusableButton";
import { Data } from "../models/data/Data";
import { PriorityStatus, StatusType } from "../models/data/StatusType";
import { Task } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { Phase } from "../phases/Phase";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { brandingSettings } from "../projects/branding/BrandingSettings";
import TaskProgress from "../projects/projectManagement/TaskProgress";
import TeamProgress from "../projects/projectManagement/TeamProgress";
import TodoProgress from "../projects/projectManagement/TodoProgress";
import { Snapshot } from "../snapshots/SnapshotStore";
import { createMilestone } from "../state/redux/slices/TrackerSlice";
import { rootStores } from "../state/stores/RootStores";
import { useTaskManagerStore } from "../state/stores/TaskStore ";
import useTrackerStore from "../state/stores/TrackerStore";
import { Todo } from "../todos/Todo";
import { VideoData } from "../video/Video";
import TaskAssignmentSnapshot from "./TaskAssignmentSnapshot";
import { checkTodoCompletion, updateTodo } from "@/app/api/ApiTodo";
import TaskList from "../lists/TaskList";

interface TaskAssignmentProps {
  taskId: () => string;
  newTitle: (newTitle: string) => string;
  task: Task;
}

const TaskManagerComponent: React.FC<TaskAssignmentProps> = ({
  taskId,
  newTitle,
}) => {
  const router = useRouter(); // Get the router object using useRouter hook
  const taskManagerStore = useTaskManagerStore();
  const [localState, setLocalState] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([
    {
      _id: "todoData",
      id: "1",
      title: "Todo 1",
      description: "Description for Todo 1",
      assignedTo: null,
      assigneeId: "",
      dueDate: new Date() as Date,
      payload: null,
      type: "addTodo",
      status: StatusType.Pending,
      done: false,
      todos: [],
      priority: PriorityStatus.High,
      assignee: null,
      projectId: "",
      milestoneId: "",
      phaseId: "",
      taskId: "",
      teamId: "",
      creatorId: "",
      parentId: null,
      order: 0,
      isDeleted: false,
      isCompleted: false,
      isArchived: false,
      createdAt: new Date() as Date,
      updatedAt: new Date() as Date,
      assignedUsers: [],
      collaborators: [],
      labels: [],
      comments: [],
      attachments: [],
      checklists: [],
      startDate: new Date() as Date,
      elapsedTime: 0,
      timeEstimate: 0,
      timeSpent: 0,
      recurring: null,
      dependencies: [],
      subtasks: [],
      snapshot: {} as Snapshot<Data>,
      analysisType: AnalysisTypeEnum.DEFAULT,
      analysisResults: {} as DataAnalysisResult[],
      videoData: {} as VideoData,
      save: () => Promise.resolve(),
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      _id: "taskData", // Example value
      id: "1",
      title: "Task 1",
      description: "Description for Task 1",
      assignedTo: null,
      assigneeId: "",
      dueDate: new Date(),
      payload: null,
      type: "addTask",
      status: "todo",
      priority: "low",
      done: false,
      data: {} as Data,
      source: "user",
      some: () => false,
      then: () => {},
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      tags: [],
      analysisType: AnalysisTypeEnum.DEFAULT,
      analysisResults: [],
      videoThumbnail: "",
      videoDuration: 0,
      videoUrl: "",
      previouslyAssignedTo: [] as Member[],
      [Symbol.iterator]: () => {
        // Add more tasks as needed
        return {
          next: () => {
            return {
              done: true,
              value: {
                _id: "taskData", // Example value
                phase: {} as Phase,
                videoData: {} as VideoData,
              },
            };
          },
        };
      },
      videoData: {} as VideoData,
    },
    {
      _id: "taskData", // Example value
      id: "2",
      title: "Task 2",
      description: "Description for Task 2",
      assignedTo: null,
      assigneeId: "",
      dueDate: new Date(),
      payload: null,
      type: "addTask",
      status: "inProgress",
      priority: "low",
      done: false,
      data: {} as Data,
      source: "user",
      some: () => false,
      then: () => {},
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      tags: [],
      analysisType: AnalysisTypeEnum.DEFAULT,
      analysisResults: [],
      videoThumbnail: "",
      videoDuration: 0,
      videoUrl: "",
      previouslyAssignedTo: [] as Member[],
      [Symbol.iterator]: () => {
        // Add more tasks as needed
        return {
          next: () => {
            return {
              done: true,
              value: {
                _id: "taskData", // Example value
                phase: {} as Phase,
                videoData: {} as VideoData,
              },
            };
          },
        };
      },
      videoData: {} as VideoData,
    },
    {
      _id: "taskData", // Example value
      id: "3",
      title: "Task 3",
      description: "Description for Task 3",
      assignedTo: null,
      assigneeId: "",
      dueDate: new Date(),
      payload: null,
      type: "addTask",
      status: "completed",
      priority: "low",
      done: false,
      data: {} as Data,
      source: "user",
      some: () => false,
      then: () => {},
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
      tags: [],
      analysisType: AnalysisTypeEnum.TREND,
      analysisResults: {} as DataAnalysisResult[],
      videoThumbnail: "",
      videoDuration: 0,
      videoUrl: "",
      previouslyAssignedTo: [] as Member[],
      [Symbol.iterator]: () => {
        // Add more tasks as needed
        return {
          next: () => {
            return {
              done: true,
              value: {
                _id: "taskData", // Example value
                phase: {} as Phase,
                videoData: {} as VideoData,
              },
            };
          },
        };
      },
      videoData: {} as VideoData,
    },
  ]);

  // Use Tracker Store
  const { dispatch } = useTrackerStore(rootStores);

  // Function to update task progress
  const updateTaskProgress = (taskId: string, newProgress: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, progress: newProgress } : task
      )
    );
  };

  const updateTodoProgress = (todoId: string, newProgress: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo._id === todoId
          ? {
              ...todo,
              progress: { value: newProgress, label: todo.progress?.label || '' },
            }
          : todo)
    );
  };

  const handleUpdateTask = async (taskId: number, newTitle: string) => {
    try {
      await updateTask(taskId, newTitle);
      // Fetch tasks again to update the list
      const updatedTasks = await fetchTasks();
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleUpdateTodo = async (
    todoId: string,
    updatedFields: Partial<Todo>
  ) => {
    try {
      // Call API to update todo
      await updateTodo(Number(todoId), updatedFields);

      // Optimistically update local todo data
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === todoId ? { ...todo, ...updatedFields } : todo
        )
      );

      // Additional use case: Optimistically check todo completion
      if (updatedFields.done !== undefined) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo._id === todoId && updatedFields.done
              ? { ...todo, done: true }
              : todo
          )
        );

        // Call function to check todo completion asynchronously
        await checkTodoCompletion(todoId);
      }

      // Additional use case: Call any other functions needed (e.g., update UI)
      // updateUI();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Define handleTodoClick with the correct signature
  const handleTodoClick = async (todoId: Todo) => {
    try {
      // Assuming you have a function to fetch the todo details based on its ID
      const todoDetails = await fetchTodoDetails(todoId);

      // Assuming you have a function to update the UI or perform any other action
      updateUIWithTodoDetails(todoDetails);

      // Log a message to the console
      console.log(`Todo clicked: ${todoId}`);
    } catch (error) {
      console.error("Error handling todo click:", error);
    }
  };

  // Function to fetch todo details from the server
  const fetchTodoDetails = async (todoId: Todo) => {
    // Simulated fetch operation, replace this with your actual API call
    return {
      id: todoId,
      title: "Sample Todo Title",
      description: "Sample Todo Description",
      dueDate: "2024-03-21",
      // Other properties...
    };
  };

  // Function to update the UI with todo details
  const updateUIWithTodoDetails = (todoDetails: any) => {
    // Assuming you have logic to update the UI with todo details
    // For example:
    // document.getElementById("todoTitle").innerText = todoDetails.title;
    // document.getElementById("todoDescription").innerText = todoDetails.description;
    // Update UI as per your application's requirements
  };

  const handleTaskClick = async (taskId: Task) => {
    // Assuming you have a function to fetch the taskId details based on its ID
    const taskDetails = fetchTaskDetails(await taskId);

    // Assuming you have a function to update the UI or perform any other action
    updateUIWithTaskDetails(taskDetails);

    // Log a message to the console
    console.log(`Task clicked: ${taskId}`);
  };

  // Function to fetch task details from the server
  const fetchTaskDetails = (taskId: string) => {
    // Simulated fetch operation, replace this with your actual API call
    return {
      id: taskId,
      title: "Sample Task Title",
      description: "Sample Task Description",
      dueDate: "2024-03-21",
      // Other properties...
    };
  };

  // Function to update the UI with task details
  const updateUIWithTaskDetails = (taskDetails: any) => {
    // Assuming you have logic to update the UI with task details
    // For example:
    // document.getElementById("taskTitle").innerText = taskDetails.title;
    // document.getElementById("taskDescription").innerText = taskDetails.description;
    // Update UI as per your application's requirements
  };

  // Component-specific logic using localState
  const handleLocalStateChange = (newValue: string) => {
    setLocalState(newValue);
  };
  // Simulate creating a milestone
  const createProjectMilestone = () => {
    const milestoneData = {
      id: "milestone1",
      title: "Project Kickoff",
      date: new Date(),
      description: "Initiating the project",
    };
    dispatch(createMilestone(milestoneData));
  };

  useEffect(() => {
    // Update global state when local state changes
    taskManagerStore.updateTaskTitle(taskManagerStore.taskTitle);
  }, [localState, taskManagerStore]);

  return (
    <div>
      <DynamicRenderer
        dynamicContent={tasks} // Assuming tasks is an array of tasks
        handleTaskClick={handleTaskClick}
        handleTodoClick={handleTodoClick}
      />
      <input
        type="text"
        value={localState}
        onChange={(e) => handleLocalStateChange(e.target.value.toString())}
      />
      <p>Task Title: {taskManagerStore.taskTitle}</p>
      <button onClick={createProjectMilestone}>Create Project Milestone</button>
      <TeamProgress /> {/* Display Team Progress component */}
      <TaskAssignmentSnapshot taskId={taskId()} />
      {/* JSX for the rest of the component */}
      <h2>Task Manager</h2>
      <div>
        {tasks.map((task) => (
          <div key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <TaskProgress
              selectedTask={task.selectedTask}
              newProgress={task.progress}
              onTaskClick={handleTaskClick}
              taskProgress={task.progress}
              onUpdateProgress={(newProgress) =>
                updateTaskProgress(task.id, newProgress)
              }
            />
            <ReusableButton
              label="Update Task"
              onEvent={(event: React.MouseEvent<HTMLButtonElement>) => {
                const taskId = event.currentTarget.dataset.taskid;
                const newTitle = event.currentTarget.dataset.newtitle;
                handleUpdateTask(Number(taskId), String(newTitle));
              }}
              data-taskid={task.id}
              data-newtitle={task.title}
              router={router as ExtendedRouter & Router}
              brandingSettings={brandingSettings}
            />
            Update Task
          </div>
        ))}
      </div>
      <h2>Todo Manager</h2>
      {/* Render TodoProgress component */}
      {todos.map((todo) => (
        <div key={todo.id}>
          <h3>{todo.title}</h3>
          <p>{todo.description}</p>
          <TodoProgress
            selectedTodo={todo.selectedTodo}
            newProgress={typeof todo.progress === "number" ? todo.progress : 0}
            onTodoClick={handleTodoClick}
            todoProgress={Array.isArray(todo.progress) ? todo.progress : []}
            onUpdateProgress={(newProgress) =>
              updateTodoProgress(String(todo.id), Number(newProgress))
            }
          />
          <ReusableButton
            label="Update Task"
            onEvent={(event: React.MouseEvent<HTMLButtonElement>) => {
              const todoId = event.currentTarget.dataset.todoid;
              const newTitle = event.currentTarget.dataset.newtitle;
              handleUpdateTodo(String(todoId), { title: newTitle });
            }}
            data-todoid={todo.id}
            data-newtitle={todo.title}
            router={router as ExtendedRouter & Router}
            brandingSettings={brandingSettings}
          />
          Update Todo
        </div>
      ))}
    </div>
  );
};

export default TaskManagerComponent;
