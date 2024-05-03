// StateType.ts

import { Task } from "../models/tasks/Task";
import { Project } from "../projects/Project";
import { User } from "../users/User";
import { Settings } from '../state/stores/SettingsStore';
import { UserManagerState } from '../users/UserSlice';
import { TaskState  } from "../state/redux/slices/TaskSlice";
import { NotificationState } from "../state/redux/slices/NotificationSlice";
import { SettingsState } from "../state/redux/slices/SettingsSlice";
// Define the StateType interface
interface StateType {
    projects: Project[];
    users: User[];
    tasks: Task[];
    notifications: Notification[];
    settings: Settings;
    errors: Error[];
    // Add additional state types
    userState: UserManagerState;
    taskState: TaskState ;
    notificationState: NotificationState;
    settingsState: SettingsState;
    errorState: ErrorState;
  }
  

// Export the StateType interface
export type { StateType };
