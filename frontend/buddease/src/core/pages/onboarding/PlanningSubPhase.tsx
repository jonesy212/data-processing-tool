// PlanningSubPhase.tsx
import {
    Attachment,
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta,
    PhaseData,
    SubPhase,
    SubPhaseImpl
} from '@/core/typings/entities/PhaseEntity';

export class PlanningSubPhase<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SubPhaseImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  private planningData: PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  constructor(
    planningData: PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    options?: Partial<SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) {
    super({
      id: `planning_${Date.now()}`,
      name: "Planning SubPhase",
      description: "Planning phase for project initialization",
      type: "planning",
      level: 1,
      riskLevel: 'medium',
      ...options
    });
    this.planningData = planningData;
  }

  // Method to initiate the planning phase
  public initiatePlanning(): void {
    console.log("Starting Planning SubPhase...");
    this.setupPlanningEnvironment();
    this.isActive = true;
    this.status = 'active';
  }

  // Method to set up the planning environment
  private setupPlanningEnvironment(): void {
    console.log("Setting up the planning environment...");
    // Initializing resources, team assignments, etc.
    if (this.planningData.resources) {
      console.log("Resources available:", this.planningData.resources);
    }
  }

  // Method to validate planning data
  public validatePlanningData(): boolean {
    console.log("Validating planning data...");
    
    const validation = this.validate();
    if (!validation.isValid) {
      console.error("SubPhase validation errors:", validation.errors);
      return false;
    }
    
    // Additional planning-specific validation
    const isValid = this.planningData && 
                    this.planningData.projectScope && 
                    this.planningData.timeline;
    
    if (!isValid) {
      console.error("Invalid planning data. Please review your inputs.");
    }
    
    return isValid;
  }

  // Method to execute the planning phase
  public executePlanning(): void {
    if (this.validatePlanningData()) {
      console.log("Executing planning...");
      this.defineProjectScope();
      this.assignTasks();
      this.setTimeline();
      this.calculateEstimatedEffort();
    } else {
      console.error("Planning execution failed due to validation errors.");
      this.status = 'blocked';
    }
  }

  // Method to complete planning
  public completePlanning(): void {
    this.executePlanning();
    this.isComplete = true;
    this.isActive = false;
    this.status = 'completed';
    this.endDate = new Date();
    this.progress = 100;
    console.log("Planning SubPhase completed successfully.");
  }

  // Additional methods for planning tasks
  private defineProjectScope(): void {
    console.log("Defining project scope...");
    if (this.planningData.projectScope) {
      // Logic for defining project scope
      this.data = { 
        ...this.data, 
        projectScope: this.planningData.projectScope,
        planningData: this.planningData 
      };
    }
  }

  private assignTasks(): void {
    console.log("Assigning tasks...");
    if (this.planningData.teamMembers) {
      // Logic for assigning tasks to team members
      this.members = this.planningData.teamMembers.map((member: any) => ({
        ...member,
        assignedTasks: this.planningData.initialTasks || []
      }));
    }
  }

  private setTimeline(): void {
    console.log("Setting project timeline...");
    if (this.planningData.timeline) {
      this.startDate = this.planningData.timeline.startDate;
      this.endDate = this.planningData.timeline.endDate;
      this.duration = this.calculateDuration();
    }
  }

  private calculateDuration(): number {
    if (this.startDate && this.endDate) {
      const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
    }
    return 0;
  }

  private calculateEstimatedEffort(): void {
    // Simple estimation: 8 hours per task day
    this.estimatedEffort = (this.tasks?.length || 0) * 8;
    console.log(`Estimated effort: ${this.estimatedEffort} hours`);
  }

  // Override parent methods if needed
  override validate(): { isValid: boolean; errors: string[] } {
    const parentValidation = super.validate();
    
    // Add planning-specific validation
    if (!this.planningData) {
      parentValidation.errors.push("Planning data is required");
    }
    
    if (this.planningData && !this.planningData.projectScope) {
      parentValidation.errors.push("Project scope is required for planning");
    }
    
    parentValidation.isValid = parentValidation.errors.length === 0;
    return parentValidation;
  }

  // Additional planning-specific methods
  public createProjectPlan(): Record<string, any> {
    return {
      projectScope: this.planningData.projectScope,
      timeline: this.planningData.timeline,
      estimatedEffort: this.estimatedEffort,
      startDate: this.startDate,
      endDate: this.endDate,
      tasks: this.tasks,
      members: this.members,
      createdAt: new Date()
    };
  }

  public updatePlanningData(
    newData: Partial<PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    this.planningData = { ...this.planningData, ...newData };
    console.log("Planning data updated");
  }

  public getPlanningProgress(): number {
    const completedTasks = this.tasks?.filter(task => task.isComplete) || [];
    const totalTasks = this.tasks?.length || 0;
    
    if (totalTasks === 0) return 0;
    
    return (completedTasks.length / totalTasks) * 100;
  }
}

// Factory function for creating PlanningSubPhase with proper types
export function createPlanningSubPhase<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  planningData: PhaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  options?: Partial<SubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): PlanningSubPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return new PlanningSubPhase(planningData, options);
}


const planningData: PhaseData<ProjectEntity> = {
  id: "planning_1",
  projectScope: "Build a new web application",
  timeline: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-01')
  },
  resources: ['developers', 'designers', 'servers'],
  teamMembers: [
    { id: '1', name: 'John', role: 'Developer' },
    { id: '2', name: 'Jane', role: 'Designer' }
  ]
};

const planningSubPhase = createPlanningSubPhase(planningData, {
  name: "Initial Project Planning",
  description: "Detailed planning phase for the web application",
  riskLevel: 'low'
});

planningSubPhase.initiatePlanning();
planningSubPhase.executePlanning();