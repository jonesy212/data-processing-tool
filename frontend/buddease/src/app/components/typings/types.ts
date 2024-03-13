// @/types.ts

import { NestedEndpoints } from "@/app/api/ApiEndpoints";
import { Task } from "../models/tasks/Task";
import Team from "../models/teams/Team";
import { Phase } from "../phases/Phase";
import Project from "../projects/Project";
import BrowserCheckStore from "../state/stores/BrowserCheckStore";
import {
  CalendarEvent,
  CalendarManagerStore,
} from "../state/stores/CalendarEvent";
import { IconStore } from "../state/stores/IconStore";
import { TaskManagerStore } from "../state/stores/TaskStore ";
import { TodoManagerStore } from "../state/stores/TodoStore";
import { TrackerStore } from "../state/stores/TrackerStore";
import { Todo } from "../todos/Todo";

// Define the structure of YourResponseType based on the actual response from the backend
interface YourResponseType {
  data: {
    id: number;
    projectName: Project["name"];
    description: Project["description"];
    teamMembers: Team["members"];
    communication: {
      audio: boolean;
      video: boolean;
      text: boolean;
    };
    collaborationOptions: {
      brainstorming: boolean;
      fileSharing: boolean;
      realTimeEditing: boolean;
    };
    calendarEvents: CalendarEvent[]; // Assuming CalendarEvent is a type/interface for calendar events
    todos: Todo[]; // Assuming Todo is a type/interface for todos
    tasks: Task[]; // Assuming Task is a type/interface for tasks
    currentPhase: Phase | null; // Assuming a string representing the current project phase

    // Add field from RootStores
    browserCheckStore: BrowserCheckStore;
    trackerStore: TrackerStore;
    todoStore: TodoManagerStore;
    taskManagerStore: TaskManagerStore;
    iconStore: typeof IconStore;
    calendarStore: CalendarManagerStore;
    prototype: any;
    browsers: any;

    // Additional properties
    metadata: {
      createdBy: string;
      createdAt: Date;
      updatedBy: string;
      updatedAt: Date;
    };

      // Include endpoints from NestedEndpoints
      endpoints: NestedEndpoints;
    // Add more fields as needed based on your actual response structure
  };
  // Add other properties if necessary
}

export type { YourResponseType };
