// StateType.ts

import { Task } from "@/app/models/tasks/Task";
import { Project } from "@/app/models/projects/Project";
import { User } from "@/app/users/User";
import { Settings } from '@/app/state/stores/SettingsStore';
import { UserManagerState } from '../users/UserSlice';
import { TaskState  } from "@/app/state/redux/slices/TaskSlice";
import { NotificationState } from "@/app/state/redux/slices/NotificationSlice";
import { SettingsState } from "@/app/state/redux/slices/SettingsSlice";
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
