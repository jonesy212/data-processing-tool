import {
  ProjectAttachment,
  ProjectEntity,
  ProjectIncludedFields,
  ProjectK,
  ProjectMeta
} from '@/app/components/models/ProjectModel';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseData } from '@/app/models/data/Data';
import { Task } from "@/app/models/tasks/Task";
import { ProjectPhase } from '@/app/projects/projectManagement/ProjectManager';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { Logger } from "./activityLogger";
import { ProjectConversionResult, ProjectConverter } from "./projectConverter";

// -------------------- Project Data --------------------

export type ProjectDataManagement = ProjectData<
  BaseData<any>,
  BaseData<any>,
  StructuredMetadata<any, any>,
  Attachment,
  never,
  keyof BaseData<any>
>;

export interface ProjectManagementOptions {
  enableLogging?: boolean;
  autoSave?: boolean;
  validationStrict?: boolean;
}

export class ProjectManager<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>{
  private projects: Map<string, ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = new Map();
  private options: ProjectManagementOptions;

  constructor(options: ProjectManagementOptions = {}) {
    this.options = {
      enableLogging: true,
      autoSave: true,
      validationStrict: false,
      ...options
    };
  }

  /**
   * Create a new project
   */
  createProject(
    initialData: Partial<ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {},
    projectId?: string
  ): ProjectDataManagement {
    const id = projectId || `project-${Date.now()}`;
    
    const project: ProjectDataManagement = {
      id,
      currentPhase: ProjectPhase.PHASE_1,
      tasks: [],
      created: new Date(),
      updated: new Date(),
      ...initialData
    };

    this.projects.set(id, project);

    if (this.options.enableLogging) {
      Logger.log("PROJECT_CREATED", `New project created`, {
        projectId: id,
        phase: project.currentPhase,
        taskCount: project.tasks.length
      });
    }

    return project;
  }

  /**
   * Get project by ID
   */
  getProject(projectId: string): ProjectDataManagement | undefined {
    return this.projects.get(projectId);
  }

  /**
   * Get all projects
   */
  getAllProjects(): ProjectDataManagement[] {
    return Array.from(this.projects.values());
  }

  /**
   * Update project phase
   */
  updateProjectPhase(projectId: string, newPhase: ProjectPhase): boolean {
    const project = this.projects.get(projectId);
    
    if (!project) {
      if (this.options.enableLogging) {
        Logger.error("PHASE_UPDATE_ERROR", `Project not found: ${projectId}`);
      }
      return false;
    }

    const previousPhase = project.currentPhase;
    project.currentPhase = newPhase;
    project.updated = new Date();

    if (this.options.enableLogging) {
      Logger.log("PHASE_UPDATED", `Project phase updated`, {
        projectId,
        from: previousPhase,
        to: newPhase
      });
    }

    return true;
  }

  /**
   * Advance to next phase
   */
  advanceToNextPhase(projectId: string): boolean {
    const project = this.projects.get(projectId);
    
    if (!project) {
      return false;
    }

    const nextPhase = this.getNextPhase(project.currentPhase);
    return this.updateProjectPhase(projectId, nextPhase);
  }

  /**
   * Rollback to previous phase
   */
  rollbackToPreviousPhase(projectId: string): boolean {
    const project = this.projects.get(projectId);
    
    if (!project) {
      return false;
    }

    const previousPhase = this.getPreviousPhase(project.currentPhase);
    return this.updateProjectPhase(projectId, previousPhase);
  }

  /**
   * Add task to project
   */
  addTask(projectId: string, taskData: Partial<Task<any, any>>): Task<any, any> | null {
    const project = this.projects.get(projectId);
    
    if (!project) {
      return null;
    }

    const task: Task<any, any> = {
      id: taskData.id || `task-${Date.now()}`,
      description: taskData.description || 'New task',
      completed: taskData.completed || false,
      created: new Date(),
      ...taskData
    };

    project.tasks.push(task);
    project.updated = new Date();

    if (this.options.enableLogging) {
      Logger.log("TASK_ADDED", `Task added to project`, {
        projectId,
        taskId: task.id,
        taskDescription: task.description
      });
    }

    return task;
  }

  /**
   * Mark task as complete
   */
  markTaskAsComplete(projectId: string, taskId: string): boolean {
    const project = this.projects.get(projectId);
    
    if (!project) {
      return false;
    }

    const task = project.tasks.find(t => t.id === taskId);
    if (!task) {
      return false;
    }

    task.completed = true;
    project.updated = new Date();

    if (this.options.enableLogging) {
      Logger.log("TASK_COMPLETED", `Task marked as complete`, {
        projectId,
        taskId,
        taskDescription: task.description
      });
    }

    return true;
  }

  /**
   * Convert and import snapshot as project
   */
  importSnapshotAsProject(
    snapshot: any,
    projectId?: string
  ): ProjectConversionResult {
    const conversionResult = ProjectConverter.convertSnapshotToProject(snapshot, projectId);
    
    if (conversionResult.success && conversionResult.projectData) {
      this.projects.set(conversionResult.projectData.id, conversionResult.projectData);
      
      if (this.options.enableLogging) {
        Logger.log("SNAPSHOT_IMPORTED", `Snapshot imported as project`, {
          projectId: conversionResult.projectData.id,
          snapshotId: snapshot.id
        });
      }
    }

    return conversionResult;
  }

  /**
   * Batch import snapshots as projects
   */
  batchImportSnapshots(
    snapshots: any[],
    projectIdPrefix?: string
  ): {
    successful: ProjectDataManagement[];
    failed: { snapshot: any; error: string }[];
  } {
    const { successful, failed } = ProjectConverter.batchConvertSnapshots(snapshots, projectIdPrefix);
    
    // Add successful conversions to projects map
    successful.forEach(project => {
      this.projects.set(project.id, project);
    });

    if (this.options.enableLogging) {
      Logger.log("BATCH_IMPORT_COMPLETED", `Batch import completed`, {
        total: snapshots.length,
        successful: successful.length,
        failed: failed.length
      });
    }

    return { successful, failed };
  }

  /**
   * Get project statistics
   */
  getProjectStatistics(projectId: string): {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    currentPhase: ProjectPhase;
  } | null {
    const project = this.projects.get(projectId);
    
    if (!project) {
      return null;
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.completed).length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      completionPercentage,
      currentPhase: project.currentPhase
    };
  }

  /**
   * Get next phase in sequence
   */
  private getNextPhase(currentPhase: ProjectPhase): ProjectPhase {
    const phases = Object.values(ProjectPhase);
    const currentIndex = phases.indexOf(currentPhase);
    return phases[(currentIndex + 1) % phases.length];
  }

  /**
   * Get previous phase in sequence
   */
  private getPreviousPhase(currentPhase: ProjectPhase): ProjectPhase {
    const phases = Object.values(ProjectPhase);
    const currentIndex = phases.indexOf(currentPhase);
    return phases[(currentIndex - 1 + phases.length) % phases.length];
  }

  /**
   * Clear all projects (for testing/reset)
   */
  clearAllProjects(): void {
    this.projects.clear();
    
    if (this.options.enableLogging) {
      Logger.log("PROJECTS_CLEARED", "All projects cleared");
    }
  }
}


// -------------------- Default Project Manager Instance --------------------
export const defaultProjectManager = new ProjectManager<ProjectEntity,
ProjectK,
ProjectMeta,
ProjectAttachment,
never,
ProjectIncludedFields
>();