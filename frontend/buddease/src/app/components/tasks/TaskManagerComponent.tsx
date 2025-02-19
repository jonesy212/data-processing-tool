// TaskManagerComponent.tsx
import { checkTodoCompletion, updateTodo } from "@/app/api/ApiTodo";
import { handleTaskApiErrorAndNotify, updateTask } from "@/app/api/TasksApi";
import { ProjectDetails } from "@/app/components/projects/Project";
import { ExtendedRouter } from "@/app/pages/MyAppWrapper";
import { AxiosError } from "axios";
import { Router, useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { ProjectActions } from "../actions/ProjectActions";
import TaskAssignmentSnapshot from "../actions/TaskAssignmentSnapshot";
import { UIActions } from "../actions/UIActions";
import updateUI from "../documents/editing/updateUI";
import ContentRenderer from "../libraries/ui/ContentRenderer";
import ReusableButton from "../libraries/ui/buttons/ReusableButton";
import { Data } from "../models/data/Data";
import { PriorityTypeEnum, StatusType } from "../models/data/StatusType";
import { Task, TaskData } from "../models/tasks/Task";
import { Member } from "../models/teams/TeamMembers";
import { Phase } from "../phases/Phase";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import { Project } from "../projects/Project";
import { brandingSettings } from "../projects/branding/BrandingSettings";
import TaskProgress from "../projects/projectManagement/TaskProgress";
import TeamProgress from "../projects/projectManagement/TeamProgress";
import TodoProgress from "../projects/projectManagement/TodoProgress";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import { createMilestone } from "../state/redux/slices/TrackerSlice";
import { rootStores } from "../state/stores/RootStores";
import { useTaskManagerStore } from "../state/stores/TaskStore ";
import useTrackerStore from "../state/stores/TrackerStore";
import { Todo } from "../todos/Todo";
import { todoService } from "../todos/TodoService";
import { VideoData } from "../video/Video";

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
      timestamp: new Date() as Date,
      
      payload: null,
      type: "addTodo",
      status: StatusType.Pending,
      done: false,
      todos: [],
      priority: PriorityTypeEnum.High,
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
      snapshot: {} as Snapshot<Data, Data>,
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
      name: "Task 1",
      title: "Task 1",
      description: "Description for Task 1",
      assignedTo: null,
      assigneeId: "",
      dueDate: new Date(),
      payload: null,
      type: "addTask",
      status: "todo",
      priority: PriorityTypeEnum.High,
      done: false,
      data: {} as TaskData,
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
      name: "Task 2",
      title: "Task 2",
      description: "Description for Task 2",
      assignedTo: null,
      assigneeId: "",
      dueDate: new Date(),
      payload: null,
      type: "addTask",
      status: "inProgress",
      priority: PriorityTypeEnum.Low,
      done: false,
      data: {} as TaskData,
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
      name: "Task",
      title: "Task 3",
      description: "Description for Task 3",
      assignedTo: null,
      assigneeId: "",
      dueDate: new Date(),
      payload: null,
      type: "addTask",
      status: "completed",
      priority: PriorityTypeEnum.Low,
      done: false,
      data: {} as TaskData,
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
              progress: {
                max: 100,
                min: 0,
                percentage: todo.progress?.percentage || 0,
                value: newProgress,
                label: todo.progress?.label || "",
                id: todo.progress?.id || "",
                current: todo.progress?.current || 0,
                name: todo.progress?.name || "",
                color: todo.progress?.color || "",
                description: todo.progress?.description || "",
                done: false,
              },
            }
          : todo
      )
    )
    
  };

  const handleUpdateTask =  (
    taskId: string,
    newTitle: string
  ): Promise<Task | void> => {
    return new Promise<Task | void>(async (resole, reject) => {
      try {
        const updatedTask = await updateTask(Number(taskId), newTitle);
        // Optimistically update local task data
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, title: newTitle } : task
          )
        );
        return resole(updatedTask);
      } catch (error) {
        console.error("Error updating task:", error);
        handleTaskApiErrorAndNotify(
          error as AxiosError<unknown>,
          "Failed to update task",
          "FETCH_UPDATED_TASK_ERROR"
        )
        reject(error);
        throw error;
      }
    }
  )
    
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
  const handleTodoClick = (todoId: Todo['id']): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      todoService
        .fetchTodoDetails(todoId)
        .then((todoDetails) => {
          UIActions.updateUIWithTodoDetails({
            todoId: todoId,
            todoDetails: {
              title: todoDetails.title,
              description: todoDetails.description,
            },
          });

          console.log(`Todo clicked: ${todoId}`);
          resolve();
        })
        .catch((error) => {
          console.error("Error handling todo click:", error);
          reject(error);
        });
    });
  };

  const updateUIWithProjectDetails = async (projectId: {
    projectId: string;
    project: Project;
    projectDetails:  ProjectDetails;
  }) => {
    // Update UI with project details
    const projectDetails = ProjectActions.fetchProjectDetails(projectId);
    updateUI(projectDetails);
  };

  const handleProjectClick = async (
    projectId: {
      projectId: string;
      project: Project;
      projectDetails: ProjectDetails;
      completion: number;
      pending: boolean;
    },
    type: string
  ) => {
    try {
      // Call API to update project
      ProjectActions.updateProject({
        projectId: projectId.projectId,
        project: projectId.project,
        type: type,
      }); // Optimistically update local project data
      updateUIWithProjectDetails(projectId);
      // Additional use case: Optimistically check project completion
      if (projectId.project.done !== undefined) {
        // Assuming done is a property of project
        // Map over the previous project details array and update the done property for the matching projectId
        updateUIWithProjectDetails({
          projectId: projectId.projectId,
          project: projectId.project,
          projectDetails: projectId.projectDetails,
        });
      }

      // Call function to check project completion asynchronously
      ProjectActions.checkProjectCompletion(projectId);
      if (type === "complete") {
        // Mark project as complete
        ProjectActions.updateProjectCompletion(projectId);
      }
      if (type === "pending") {
        // Mark project as pending
        ProjectActions.updateProjectPending(projectId);
      }

      // Assuming you have a function to fetch the project details based on its ID
      const updatedProjectDetails =   ProjectActions.fetchProjectDetails(
        projectId
      );

      // Update UI with updated project details
      ProjectActions.updateUIWithProjectDetails(updatedProjectDetails);
      // Log a message to the console
      console.log(`Project details updated: ${projectId.projectId}`);
    } catch (error: any) {
      console.error("Error fetching project details:", error);
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

  const handleTaskClick = async (task: Task) => {
    // Assuming you have a function to fetch the taskId details based on its ID
    const taskDetails = fetchTaskDetails(task.id);

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
    const taskTitleElement = document.getElementById("taskTitle");
    const taskDescriptionElement = document.getElementById("taskDescription");
  
    if (taskTitleElement && taskDescriptionElement) {
      taskTitleElement.innerText = taskDetails.title;
      taskDescriptionElement.innerText = taskDetails.description;
    }
  
    // Dispatch the updateUI action with task details payload
    UIActions.updateUI({
      state: {
        taskDetails: taskDetails
      }
    });
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
      startDate: new Date("2024-01-01"),
      dueDate: new Date("2024-03-21"),
      description: "Initiating the project",
    };
    dispatch(createMilestone(milestoneData));
  };

  useEffect(() => {
    // Update global state when local state changes
    taskManagerStore.updateTaskTitle(
      taskManagerStore.taskId || "",
      taskManagerStore.taskTitle,
    );
  }, [localState, taskManagerStore]);

  return (
    <div>
      <ContentRenderer
        dynamicContent={tasks} // Assuming tasks is an array of tasks
        handleTaskClick={handleTaskClick}
        handleTodoClick={handleTodoClick}
        handleProjectClick={handleProjectClick}
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
                handleUpdateTask(String(taskId), String(newTitle));
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
