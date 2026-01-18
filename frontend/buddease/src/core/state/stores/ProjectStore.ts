// ProjectStore.ts
import { Task } from "@/core/components/models/tasks/Task";
import { Phase } from '@/core/models/phases/Phase';
import { Project } from "@/core/models/projects/Project";
import { Progress } from "@/core/models/tracker/ProgressBar";
import { NotificationChannels } from '@/core/notifications/NotificationChannels';
import NotificationStore from "@/core/state/stores/NotificationStore"; // the advanced one
import { SettingsStore } from '@/core/state/stores/SettingsStore';
import type { PhaseAttachment, PhaseEntity, PhaseExcludedFields, PhaseIncludedFields, PhaseK, PhaseMeta } from '@/core/typings/entities/PhaseEntity';
import { Milestone } from "@/core/typings/milestoneTypes";
import { makeAutoObservable, reaction } from "mobx";
import { v4 as uuid } from "uuid";

/**
 * Coordinator store for Projects
 * Handles orchestration and overall project management
 */

/**
 * ProjectStore is a MobX store for managing projects, tasks, milestones,
 * notifications, and progress tracking in a reactive way.
 */

export class ProjectStore {
  projects: Project<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
  progress: Progress = {
    id: "default",
    value: 0,
    label: "",
    current: 0,
    max: 100,
    percentage: 0,
    name: '',
    color: '',
    description: '',
    min: 0,
    done: false,
  };
  loading: boolean = false;
  settingsStore: SettingsStore;
  taskStore: TaskStore;
  milestoneStore: MilestoneStore;
  notificationStore: NotificationStore;

  constructor(
    settingsStore: SettingsStore,
    taskStore?: TaskStore,
    milestoneStore?: MilestoneStore,
    notificationStore?: NotificationStore,
  ) {
    this.taskStore = taskStore || new TaskStore();
    this.milestoneStore = milestoneStore || new MilestoneStore();
    this.settingsStore = settingsStore; 
    this.notificationStore = notificationStore || new NotificationStore({
      email: { enabled: true },  
      push: { enabled: true },   
      sms: false,                // SMS disabled
      inApp: { 
        enabled: true,
        sound: true,
        popupAlerts: true,
        persistent: false,
        autoMarkAsRead: true
      },
      webhook: false,
      advanced: {
        chat: { 
          enabled: true,
          platforms: ['slack', 'teams'],
          realTimeChatEnabled, notificationEmailEnabled, enableEmojis, enableAudioChat,

        },
        videoCall: { 
          enabled: false,
          maxDuration: 3600,
          quality: 'hd'
        },
        screenShare: { 
          enabled: false,
          annotations: true
        }
      },
      deliveryStrategy: "all",
      retryPolicy: { 
        maxRetries: 3, 
        retryInterval: 5000 
      },
      quietHours: { 
        enabled: false, 
        startTime: "22:00", 
        endTime: "07:00", 
        timeZone: "UTC", 
        days: [] 
      },
    } as NotificationChannels); // Type assertion to ensure it matches the interface

    makeAutoObservable(this);

    // Example reaction: log tasks count whenever it changes
    reaction(
      () => Object.keys(this.taskStore.tasks).length,
      (count) => console.log(`Total tasks: ${count}`)
    );
  }

  private createProject(projectData: Omit<Project, "id">): Project {
  const collaborationMode = this.settingsStore.settings?.collaborationMode || "real-time";
  const visibility = this.settingsStore.settings?.projectVisibility || "private";
  
  return {
    id: uuid(),
    name: projectData.name,
    description: projectData.description,
    members: projectData.members || [],
    tasks: projectData.tasks || [],
    status: projectData.status || 'active',
    isActive: true,
    leader: projectData.leader,
    phase: {} as Phase<AppPhase>,
    phases: [],
    type: projectData.type,
    currentPhase: projectData.currentPhase,
    done: projectData.done,
    createdAt: projectData.createdAt || new Date(),
    updatedAt: projectData.updatedAt || new Date(),
    owner: projectData.owner || 'current-user',
    team: projectData.team || [],
    milestones: projectData.milestones || [],
    tags: projectData.tags || [],
    settings: projectData.settings || {},
    visibility: visibility,
    collaborationMode: collaborationMode,
    progress: projectData.progress || 0,
    startDate: projectData.startDate,
    endDate: projectData.endDate,
    budget: projectData.budget,
    priority: projectData.priority || 'medium',
    // Add any other properties from your Project interface
  };
}


  // -------------------
  // Project Methods
  // -------------------
  addProject(projectData: Omit<Project<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>, "id">) {
    const newProject = this.createProject(projectData);
    this.projects.push(newProject);

    this.notificationStore.addNotification({
      id: uuid(),
      message: `Project created: ${projectData.name}`,
      type: 'success',
      timestamp: new Date(),
      read: false
    });
    
    return newProject;
  }

  removeProject(projectId: string) {
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }

  updateProject(updated: Project) {
    this.projects = this.projects.map((p) =>
      p.id === updated.id ? updated : p
    );
  }

  // -------------------
  // Progress Methods
  // -------------------
  setProgress(progress: Partial<Progress>) {
    this.progress = { ...this.progress, ...progress };
  }
}

/**
 * Sub-store for managing tasks
 */
export class TaskStore {
  tasks: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};

  constructor() {
    makeAutoObservable(this);

    reaction(() => this.tasks, (tasks) => {
      console.log("Tasks updated", tasks);
    });
  }

  addTask(task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    this.tasks[task.id] = task;
  }

  removeTask(taskId: string) {
    delete this.tasks[taskId];
  }

  updateTask(task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    this.tasks[task.id] = task;
  }
}

/**
 * Sub-store for managing milestones
 */
export class MilestoneStore {
  milestones: Record<string, Milestone> = {};

  constructor() {
    makeAutoObservable(this);
  }

  addMilestone(milestone: Milestone) {
    this.milestones[milestone.id] = milestone;
  }

  removeMilestone(milestoneId: string) {
    delete this.milestones[milestoneId];
  }

  updateMilestone(milestone: Milestone) {
    this.milestones[milestone.id] = milestone;
  }
}

/**
 * Sub-store for managing notifications
 */
// export class NotificationStore {
//   notifications: Record<string, NotificationData> = {};

//   constructor() {
//     makeAutoObservable(this);
//   }

//   addNotification(notification: NotificationData) {
//     this.notifications[notification.id] = notification;
//   }

//   removeNotification(id: string) {
//     delete this.notifications[id];
//   }
// }

// -------------------
// RootStores Integration
// -------------------
export const taskStore = new TaskStore();
export const milestoneStore = new MilestoneStore();
export const notificationStore = new NotificationStore();
export const projectStore = new ProjectStore(taskStore, milestoneStore, notificationStore);
