import React from "react";
import { useCalendarManagerStore } from "../state/stores/CalendarStore";
import useTodoManagerStore from "../state/stores/TodoStore";
import ToolbarItem from "./ToolbarItem";

const ProjectManagementToolbar: React.FC = () => {
  const toolbarOptions = {
    tasks: ["Task List", "Create Task", "Assign Task"],
    milestones: ["Milestone List", "Create Milestone"],
    issues: ["Issue Tracker", "Create Issue"],
    documents: ["Document Library", "Create Document"],
    calendar: ["View Calendar", "Schedule Event", "Manage Calendar"],
    todos: ["View Todos", "Add Todo", "Manage Todos"],

    // Add more project management options as needed
  };


  
const handleOptionClick = (option: string) => {
  // Logic to handle option click based on the active dashboard
  console.log(`Clicked ${option} in Project Management dashboard`);

  switch (option) {
    case "Task List":
      // Logic for handling task list option
      console.log("Handling Task List option");
      break;
    case "Create Task":
      // Logic for handling create task option
      console.log("Handling Create Task option");
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
      // Call MobX action to fetch calendar events
      useCalendarManagerStore().fetchEventsRequest()
      break;
    case "Schedule Event":
      // Call MobX action to open a modal or navigate to a page for scheduling events
      CalendarStore.openScheduleEventModal();
      break;
    case "Manage Calendar":
      // Call MobX action to manage calendar settings or preferences
      CalendarStore.openCalendarSettingsPage();
      break;
    case "View Todos":
      // Call MobX action to fetch todos
      TodoStore.fetchTodos();
      break;
    case "Add Todo":
      // Call MobX action to add a new todo
      TodoStore.addTodo();
      break;
    case "Manage Todos":
      // Call MobX action to manage todo settings or preferences
      useTodoManagerStore().openTodoSettingsPage();
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
              onClick={() => handleOptionClick(option)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManagementToolbar;
