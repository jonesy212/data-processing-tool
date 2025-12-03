// StateType.ts

import { Project } from "@/app/models/projects/Project";
import { Task } from "@/app/models/tasks/Task";
import { NotificationState } from "@/app/state/redux/slices/NotificationSlice";
import { SettingsState } from "@/app/state/redux/slices/SettingsSlice";
import { TaskState } from "@/app/state/redux/slices/TaskSlice";
import { UserManagerState } from '@/app/state/redux/slices/UserSlice';
import { User } from "@/app/users/User";
import { Settings } from 'app/state/hybrid/SettingsManagerStore';
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
