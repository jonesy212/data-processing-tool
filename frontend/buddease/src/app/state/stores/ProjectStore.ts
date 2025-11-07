import { makeAutoObservable, reaction } from "mobx";
import { v4 as uuid } from "uuid";
import { Project } from "@/app/models/projects/Project";
import Task from "@/app/components/models/tasks/Task";
import Milestone from "@/app/components/calendar/CalendarSlice";
import { NotificationData } from "@/app/hooks/useNotificationSystem";
import { Progress } from "@/app/components/models/tracker/ProgressBar";



/**
 * Coordinator store for Projects
 * Handles orchestration and overall project management
 */

/**
 * ProjectStore is a MobX store for managing projects, tasks, milestones,
 * notifications, and progress tracking in a reactive way.
 */

export class ProjectStore {
  projects: Project[] = [];
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
    min: '',
    done: '',
  };
  loading: boolean = false;

  taskStore: TaskStore;
  milestoneStore: MilestoneStore;
  notificationStore: NotificationStore;

  constructor(
    taskStore?: TaskStore,
    milestoneStore?: MilestoneStore,
    notificationStore?: NotificationStore
  ) {
    this.taskStore = taskStore || new TaskStore();
    this.milestoneStore = milestoneStore || new MilestoneStore();
    this.notificationStore = notificationStore || new NotificationStore();

    makeAutoObservable(this);

    // Example reaction: log tasks count whenever it changes
    reaction(
      () => Object.keys(this.taskStore.tasks).length,
      (count) => console.log(`Total tasks: ${count}`)
    );
  }

  // -------------------
  // Project Methods
  // -------------------
  addProject(project: Omit<Project, "id">) {
    const newProject = { ...project, id: uuid() };
    this.projects.push(newProject);

    this.notificationStore.addNotification({
      id: uuid(),
      message: `Project created: ${project.name}`,
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
  tasks: Record<string, Task> = {};

  constructor() {
    makeAutoObservable(this);

    reaction(() => this.tasks, (tasks) => {
      console.log("Tasks updated", tasks);
    });
  }

  addTask(task: Task) {
    this.tasks[task.id] = task;
  }

  removeTask(taskId: string) {
    delete this.tasks[taskId];
  }

  updateTask(task: Task) {
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
export class NotificationStore {
  notifications: Record<string, NotificationData> = {};

  constructor() {
    makeAutoObservable(this);
  }

  addNotification(notification: NotificationData) {
    this.notifications[notification.id] = notification;
  }

  removeNotification(id: string) {
    delete this.notifications[id];
  }
}

// -------------------
// RootStores Integration
// -------------------
export const taskStore = new TaskStore();
export const milestoneStore = new MilestoneStore();
export const notificationStore = new NotificationStore();
export const projectStore = new ProjectStore(taskStore, milestoneStore, notificationStore);
