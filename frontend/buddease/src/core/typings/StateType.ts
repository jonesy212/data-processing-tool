// StateType.ts

import { Project } from "@/core/models/projects/Project";
import type { Task } from "@/core/models/tasks/Task";
import { Settings } from '@/core/state/hybrid/SettingsManagerStore';
import type { NotificationState } from "@/core/state/redux/slices/NotificationSlice";
import type { SettingsState } from "@/core/state/redux/slices/SettingsSlice";
import type { TaskState } from "@/core/state/redux/slices/TaskSlice";
import type { UserManagerState } from '@/core/state/redux/slices/UserSlice';
import { User } from "@/core/users/User";
// Define the StateType interface
interface StateType {
    projects: Project[];
    users: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
