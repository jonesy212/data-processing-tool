SubPhase.ts (add to your existing Phase.ts or create a new file)
import { FC } from "react";

// Base SubPhase interface
export interface SubPhase<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  parentPhaseId?: string;
  parentPhase?: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  level?: number; // Depth in the hierarchy (0 = root, 1 = subphase, 2 = sub-subphase, etc.)
  dependencies?: string[]; // IDs of other subphases this depends on
  prerequisites?: string[]; // IDs of subphases that must complete before this one
  estimatedEffort?: number; // Estimated hours/days
  actualEffort?: number; // Actual hours/days spent
  riskLevel?: 'low' | 'medium' | 'high';
  isParallel?: boolean; // Can run in parallel with other subphases
  blockers?: string[]; // IDs of blocking subphases
}

// SubPhase Implementation
export class SubPhaseImpl<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends PhaseImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
  implements SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  parentPhaseId?: string = "";
  parentPhase?: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  level: number = 1;
  dependencies: string[] = [];
  prerequisites: string[] = [];
  estimatedEffort?: number = 0;
  actualEffort?: number = 0;
  riskLevel?: 'low' | 'medium' | 'high' = 'low';
  isParallel: boolean = false;
  blockers: string[] = [];
  
  // SubPhase specific methods
  constructor(options: Partial<SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {}) {
    super(options);
    Object.assign(this, options);
  }

  // Method to check if all prerequisites are met
  arePrerequisitesMet(completedSubPhaseIds: string[]): boolean {
    if (this.prerequisites.length === 0) return true;
    
    return this.prerequisites.every(prerequisiteId => 
      completedSubPhaseIds.includes(prerequisiteId)
    );
  }

  // Method to check for blockers
  hasBlockers(blockedSubPhaseIds: string[]): boolean {
    return blockedSubPhaseIds.some(blockedId => 
      this.blockers.includes(blockedId)
    );
  }

  // Method to validate subphase data
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.name) {
      errors.push("SubPhase name is required");
    }
    
    if (!this.parentPhaseId && !this.parentPhase) {
      errors.push("SubPhase must belong to a parent phase");
    }
    
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
      errors.push("Start date cannot be after end date");
    }
    
    // Check for circular dependencies
    if (this.dependencies.includes(this.id)) {
      errors.push("SubPhase cannot depend on itself");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Method to calculate progress based on tasks
  calculateProgressFromTasks(): number {
    if (!this.tasks || this.tasks.length === 0) return 0;
    
    const completedTasks = this.tasks.filter(task => task.isComplete);
    return (completedTasks.length / this.tasks.length) * 100;
  }

  // Method to check if subphase is ready to start
  isReadyToStart(completedSubPhaseIds: string[], blockedSubPhaseIds: string[]): boolean {
    if (this.isComplete) return false;
    if (this.isActive) return true;
    
    const prerequisitesMet = this.arePrerequisitesMet(completedSubPhaseIds);
    const hasBlockers = this.hasBlockers(blockedSubPhaseIds);
    
    return prerequisitesMet && !hasBlockers;
  }

  // Method to get subphase dependencies as objects
  getDependencyObjects(allSubPhases: SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): 
    SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return allSubPhases.filter(subPhase => 
      this.dependencies.includes(subPhase.id)
    );
  }

  // Method to create a child subphase (nested hierarchy)
  createChildSubPhase(name: string, description?: string): SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    const childSubPhase = new SubPhaseImpl({
      id: `${this.id}_${Date.now()}`,
      name,
      description,
      parentPhaseId: this.parentPhaseId,
      level: this.level + 1,
      startDate: new Date(),
      projectId: this.projectId
    });
    
    return childSubPhase;
  }

  // Method to estimate completion date based on remaining effort
  estimateCompletionDate(): Date | null {
    if (!this.startDate || !this.estimatedEffort || this.actualEffort === undefined) {
      return null;
    }
    
    const remainingEffort = this.estimatedEffort - this.actualEffort;
    if (remainingEffort <= 0) {
      return this.endDate || new Date();
    }
    
    // Assuming 8 hours per day of work
    const workDays = remainingEffort / 8;
    const completionDate = new Date(this.startDate);
    completionDate.setDate(completionDate.getDate() + workDays);
    
    return completionDate;
  }

  // Method to clone subphase with new ID
  clone(newName?: string): SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return new SubPhaseImpl({
      ...this,
      id: `${this.id}_clone_${Date.now()}`,
      name: newName || `${this.name} (Copy)`,
      isActive: false,
      isComplete: false,
      startDate: undefined,
      endDate: undefined,
      actualEffort: 0,
      progress: 0
    });
  }
}

// Factory function to create subphases
export const createSubPhase = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  options: Partial<SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return new SubPhaseImpl(options);
};

// SubPhase Manager for handling multiple subphases
export class SubPhaseManager<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  private subPhases: Map<string, SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = new Map();
  
  constructor(subPhases?: SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) {
    if (subPhases) {
      subPhases.forEach(subPhase => this.addSubPhase(subPhase));
    }
  }

  // Add a subphase
  addSubPhase(subPhase: SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void {
    const validation = subPhase.validate();
    if (!validation.isValid) {
      throw new Error(`Invalid subphase: ${validation.errors.join(', ')}`);
    }
    this.subPhases.set(subPhase.id, subPhase);
  }

  // Get a subphase by ID
  getSubPhase(id: string): SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    return this.subPhases.get(id);
  }

  // Get all subphases
  getAllSubPhases(): SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return Array.from(this.subPhases.values());
  }

  // Get subphases by parent phase
  getSubPhasesByParent(parentPhaseId: string): SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    return this.getAllSubPhases().filter(subPhase => 
      subPhase.parentPhaseId === parentPhaseId
    );
  }

  // Get ready-to-start subphases
  getReadySubPhases(): SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
    const completedIds = this.getAllSubPhases()
      .filter(sp => sp.isComplete)
      .map(sp => sp.id);
    
    const blockedIds = this.getAllSubPhases()
      .filter(sp => sp.status === 'blocked')
      .map(sp => sp.id);
    
    return this.getAllSubPhases().filter(subPhase => 
      subPhase.isReadyToStart(completedIds, blockedIds)
    );
  }

  // Calculate overall progress for a parent phase
  calculateParentPhaseProgress(parentPhaseId: string): number {
    const subPhases = this.getSubPhasesByParent(parentPhaseId);
    if (subPhases.length === 0) return 0;
    
    const totalProgress = subPhases.reduce((sum, subPhase) => {
      return sum + (subPhase.progress || 0);
    }, 0);
    
    return totalProgress / subPhases.length;
  }

  // Check for circular dependencies
  hasCircularDependencies(): { hasCircular: boolean; cycles: string[][] } {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (subPhaseId: string, path: string[] = []): boolean => {
      if (recursionStack.has(subPhaseId)) {
        cycles.push([...path, subPhaseId]);
        return true;
      }
      
      if (visited.has(subPhaseId)) return false;
      
      visited.add(subPhaseId);
      recursionStack.add(subPhaseId);
      path.push(subPhaseId);
      
      const subPhase = this.getSubPhase(subPhaseId);
      if (subPhase) {
        for (const depId of subPhase.dependencies) {
          if (dfs(depId, [...path])) {
            return true;
          }
        }
      }
      
      recursionStack.delete(subPhaseId);
      path.pop();
      return false;
    };
    
    for (const subPhaseId of this.subPhases.keys()) {
      if (!visited.has(subPhaseId)) {
        dfs(subPhaseId);
      }
    }
    
    return {
      hasCircular: cycles.length > 0,
      cycles
    };
  }

  // Generate Gantt chart data
  generateGanttData(): Array<{
    id: string;
    name: string;
    start: Date;
    end: Date;
    progress: number;
    dependencies: string[];
    level: number;
  }> {
    return this.getAllSubPhases().map(subPhase => ({
      id: subPhase.id,
      name: subPhase.name,
      start: subPhase.startDate || new Date(),
      end: subPhase.endDate || new Date(),
      progress: subPhase.progress || 0,
      dependencies: subPhase.dependencies,
      level: subPhase.level || 1
    }));
  }
}