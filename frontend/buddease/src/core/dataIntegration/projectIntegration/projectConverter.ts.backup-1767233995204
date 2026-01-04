// projectConverter.ts
import { Logger } from '@/core/dataIntegration/projectIntegration/activityLogger';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { ProjectDataManagement, ProjectPhase } from "@/core/projects/projectManagement/ProjectManager";
import type { Snapshot } from '@/core/snapshots/Snapshot';

export interface ProjectConversionResult<T = any> {
  success: boolean;
  projectData?: ProjectDataManagement;
  error?: string;
  warnings?: string[];
}

export class ProjectConverter {
  /**
   * Convert snapshot data to project format
   */
  static convertSnapshotToProject<
    T extends BaseData<any>,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = never,
    IncludedFields extends keyof T = keyof T
  >(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    projectId?: string
  ): ProjectConversionResult<ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    try {
      Logger.log("PROJECT_CONVERSION", `Converting snapshot to project format`, {
        snapshotId: snapshot.id,
        projectId
      });

      // Extract project data from snapshot
      const projectData = this.extractProjectData(snapshot);
      
      if (!projectData) {
        return {
          success: false,
          error: "Unable to extract project data from snapshot"
        };
      }

      // Validate project structure
      const validationResult = this.validateProjectStructure(projectData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `Invalid project structure: ${validationResult.errors.join(", ")}`
        };
      }

      // Enhance with metadata
      const enhancedProject = this.enhanceWithProjectMetadata(
        projectData, 
        snapshot, 
        projectId
      );

      Logger.log("PROJECT_CONVERSION", "Snapshot successfully converted to project", {
        projectId: enhancedProject.id,
        phase: enhancedProject.currentPhase
      });

      return {
        success: true,
        projectData: enhancedProject,
        warnings: validationResult.warnings
      };

    } catch (error) {
      Logger.error("PROJECT_CONVERSION_ERROR", "Failed to convert snapshot to project", {
        error: error instanceof Error ? error.message : String(error),
        projectId,
        snapshotId: snapshot.id
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Conversion failed"
      };
    }
  }

  /**
   * Extract project data from snapshot
   */
  private static extractProjectData(snapshot: Snapshot<any, any, any, any, any, any>): ProjectDataManagement | null {
    try {
      // Check if snapshot has project data directly
      if ((snapshot as any).projectData) {
        return (snapshot as any).projectData as ProjectDataManagement;
      }

      // Check if snapshot data itself is project data
      if (this.isProjectData(snapshot.data)) {
        return snapshot.data as ProjectDataManagement;
      }

      // Try to extract from nested structure
      const nestedProjectData = this.findNestedProjectData(snapshot.data);
      if (nestedProjectData) {
        return nestedProjectData;
      }

      return null;
    } catch (error) {
      Logger.error("EXTRACTION_ERROR", "Failed to extract project data from snapshot", error);
      return null;
    }
  }

  /**
   * Check if data matches project data structure
   */
  private static isProjectData(data: any): data is ProjectDataManagement {
    return (
      data &&
      typeof data === 'object' &&
      'currentPhase' in data &&
      'tasks' in data &&
      Array.isArray(data.tasks)
    );
  }

  /**
   * Recursively search for project data in nested structures
   */
  private static findNestedProjectData(data: any): ProjectDataManagement | null {
    if (!data || typeof data !== 'object') return null;

    // Check current level
    if (this.isProjectData(data)) {
      return data;
    }

    // Recursively search in nested objects and arrays
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        
        if (this.isProjectData(value)) {
          return value;
        }
        
        if (Array.isArray(value)) {
          for (const item of value) {
            const result = this.findNestedProjectData(item);
            if (result) return result;
          }
        } else if (typeof value === 'object' && value !== null) {
          const result = this.findNestedProjectData(value);
          if (result) return result;
        }
      }
    }

    return null;
  }

  /**
   * Validate project structure
   */
  private static validateProjectStructure(projectData: ProjectDataManagement): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!projectData.id) {
      errors.push("Project ID is required");
    }

    if (!projectData.currentPhase) {
      errors.push("Current phase is required");
    } else if (!Object.values(ProjectPhase).includes(projectData.currentPhase)) {
      errors.push(`Invalid project phase: ${projectData.currentPhase}`);
    }

    if (!Array.isArray(projectData.tasks)) {
      errors.push("Tasks must be an array");
    }

    // Warning checks
    if (!projectData.tasks || projectData.tasks.length === 0) {
      warnings.push("Project has no tasks");
    }

    const incompleteTasks = projectData.tasks?.filter(task => !task.completed) || [];
    if (incompleteTasks.length > 10) {
      warnings.push(`Project has ${incompleteTasks.length} incomplete tasks`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Enhance project data with metadata
   */
  private static enhanceWithProjectMetadata(
    projectData: ProjectDataManagement,
    snapshot: Snapshot<any, any, any, any, any, any>,
    projectId?: string
  ): ProjectDataManagement {
    const enhancedProject = {
      ...projectData,
      id: projectId || projectData.id || `project-${Date.now()}`,
      metadata: {
        ...projectData.metadata,
        convertedFromSnapshot: true,
        snapshotId: snapshot.id,
        conversionTimestamp: new Date().toISOString(),
        originalSnapshotType: snapshot.type
      },
      // Ensure tasks have required structure
      tasks: projectData.tasks?.map(task => ({
        id: task.id || `task-${Date.now()}-${Math.random()}`,
        description: task.description || 'Unnamed task',
        completed: task.completed || false,
        ...task
      })) || []
    };

    return enhancedProject;
  }

  /**
   * Batch convert multiple snapshots
   */
  static batchConvertSnapshots(
    snapshots: Snapshot<any, any, any, any, any, any>[],
    projectIdPrefix?: string
  ): {
    successful: ProjectDataManagement[];
    failed: { snapshot: Snapshot<any, any, any, any, any, any>; error: string }[];
  } {
    const successful: ProjectDataManagement[] = [];
    const failed: { snapshot: Snapshot<any, any, any, any, any, any>; error: string }[] = [];

    Logger.log("BATCH_CONVERSION", `Starting batch conversion of ${snapshots.length} snapshots`, {
      projectIdPrefix
    });

    snapshots.forEach((snapshot, index) => {
      const projectId = projectIdPrefix ? `${projectIdPrefix}-${index}` : undefined;
      const result = this.convertSnapshotToProject(snapshot, projectId);

      if (result.success && result.projectData) {
        successful.push(result.projectData);
      } else {
        failed.push({
          snapshot,
          error: result.error || "Unknown conversion error"
        });
      }
    });

    Logger.log("BATCH_CONVERSION", `Batch conversion completed`, {
      successful: successful.length,
      failed: failed.length
    });

    return { successful, failed };
  }
}