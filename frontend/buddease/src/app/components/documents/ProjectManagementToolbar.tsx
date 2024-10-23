import * as snapshotApi from '@/app/api/SnapshotApi';
import ProjectEventEmitter from "@/app/ts/EventEmitter";
import React from "react";
import { Task } from "../models/tasks/Task";
import {
  CalendarEvent,
  useCalendarManagerStore,
} from "../state/stores/CalendarEvent";
import { rootStores } from "../state/stores/RootStores";
import { useTaskManagerStore } from "../state/stores/TaskStore ";
import { useTeamManagerStore } from "../state/stores/TeamStore";
import useTodoManagerStore, { TodoManagerStoreProps } from "../state/stores/TodoStore";
import useTrackerStore from "../state/stores/TrackerStore";
import TodoImpl, { Todo } from "../todos/Todo";
import ToolbarItem from "./ToolbarItem";
import { showModalOrNotification } from "../hooks/commHooks/idleTimeoutUtils";
import useSecureStoreId from '../utils/useSecureStoreId';

const ProjectManagementToolbar: React.FC<{ task: Task }> = ({ task }) => {
  const toolbarOptions = {
    tasks: ["Task List", "Create Task", "Assign Task"],
    milestones: ["Milestone List", "Create Milestone"],
    issues: ["Issue Tracker", "Create Issue"],
    documents: ["Document Library", "Create Document"],
    calendar: ["View Calendar", "Schedule Event", "Manage Calendar"],
    todos: ["View Todos", "Add Todo", "Manage Todos"],

    // Add more project management options as needed
  };

  function getScheduleEventContent(): JSX.Element {
    // Define the content for scheduling an event, such as form fields, buttons, etc.
    return (
      <div>
        {/* Add your scheduling event content here */}
        <h2>Schedule Event</h2>
        <form>{/* Form fields for scheduling an event */}</form>
      </div>
    );
  }

  const handleOptionClick = async (option: string, index: number, task: Task, props?: TodoManagerStoreProps) => {
    // Logic to handle option click based on the active dashboard
    console.log(`Clicked ${option} in Project Management dashboard`);

    const rootStore = rootStores
    const trackerStore = useTrackerStore(rootStore);


    const initialStoreId = useSecureStoreId()
    if(!props){
      throw Error("props is undefined")
    }
    const events: Record<string, CalendarEvent[]> = {}; // Initialize an empty object
    switch (option) {
      case "Task List":
        // Logic for handling task list option
        console.log("Handling Task List option");
        break;
      case "Create Task":
        // Logic for handling create task option
        console.log("Handling Create Task option");
        useTaskManagerStore().addTask(task);
        break;
      case "Assign Task":
        // Logic for handling assign task option
        console.log("Handling Assign Task option");
        break;
      case "Milestone List":
        // Logic for handling milestone list option
        console.log("Handling Milestone List option");
        break;
      case "Create Milestone":
        // Logic for handling create milestone option
        console.log("Handling Create Milestone option");
        break;
      case "View Calendar":
        const projects = new ProjectEventEmitter();
        const eventIds = projects.getEventIds();
        // Call MobX action to fetch calendar events with the extracted event IDs
        useCalendarManagerStore().fetchEventsRequest(eventIds, events);
        break;
      case "Schedule Event":
        const content = getScheduleEventContent();
        // Call MobX action to open a modal or navigate to a page for scheduling events
        useCalendarManagerStore().openScheduleEventModal(content);
        break;
      case "Manage Calendar":
        // Call MobX action to manage calendar settings or preferences
        useCalendarManagerStore().openCalendarSettingsPage();
        break;
      case "View Todos":
        // Call MobX action to fetch todos
        useTodoManagerStore(props).fetchTodosRequest();
        break;
      case "Add Todo":
          const todo: Todo = new TodoImpl(); // Initialize todo with a new Todo object
          useTodoManagerStore(props).addTodo(todo);
        break;
      case "Manage Todos":
        const todoId = (await useTodoManagerStore(props)).getTodoId
        if(!initialStoreId){
          throw new Error("initialStoreId is undefined")
        }
        const teamId = (await useTeamManagerStore(initialStoreId)).getTeamId
        // Call MobX action to manage todo settings or preferences
        useTodoManagerStore(props).openTodoSettingsPage(todoId as unknown as number, teamId as unknown as number);
        break;
      case "Issue Tracker":
        const issueTracker = trackerStore.getTrackers({
          // Filter the trackers based on the active dashboard
          name: "Issue Tracker",
        })[0]

        if (issueTracker) {

          // logic for handling issue tracker option using the retrieved tracker
          useTrackerStore(rootStore).addTracker(issueTracker)
          // useNotification().
          showModalOrNotification("Issue Tracker found")
        } else {
          // Handle the case where no issue tracker is found
          console.log("No issue tracker found")
        }
        useTrackerStore(rootStore).addTracker(issueTracker)
        // Logic for handling issue tracker option
        console.log("Handling Issue Tracker option");
        break;
      case "Create Issue":
        // Logic for handling create issue option
        console.log("Handling Create Issue option");
        break;
      case "Document Library":
        // Logic for handling document library option
        console.log("Handling Document Library option");
        break;
      case "Create Document":
        // Logic for handling create document option
        console.log("Handling Create Document option");
        break;
      default:
        console.log("Option not recognized");
        break;    
    
    }
  };

  return (
    <div className="toolbar">
      <h2>Project Management Toolbar</h2>
      <ul>
        {toolbarOptions.tasks.map((option: string, index: number) => (
          <li key={index}>
            <ToolbarItem
              id={`project-management-toolbar-item-${index}`}
              label={option}
              onClick={() => handleOptionClick(option, index, task)}
            />
          </li>
        ))}
      </ul>
      <ProjectManagementToolbar task={task} />
    </div>
  );
};

export default ProjectManagementToolbar;
