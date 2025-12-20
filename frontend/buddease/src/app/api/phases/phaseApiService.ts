// /app/api/phases/phaseApiService.ts
import internalApiService from '@/app/api/ApiClient';
import { AppPhase } from '@/app/typings/entities/PhaseEntity';
import { UnifiedPhaseType } from '@/app/typings/phaseTypes';
import { ProjectPhaseTypeEnum, ProgressPhase, DocumentPhaseTypeEnum } from '@/app/models/tracker/ProgressBar';

// Define the structure for phase data initialization
interface PhaseInitialData {
  [key: string]: any;
  status?: string;
  progress?: number;
  startDate?: Date;
  endDate?: Date;
  metadata?: Record<string, any>;
  tasks?: any[];
  documents?: any[];
  teamMembers?: any[];
  checklist?: Array<{ id: string; label: string; completed: boolean }>;
}

export const phaseApiService = {
  // Server communication methods using ApiClient
  fetchPhaseData: async (phaseId: string): Promise<any> => {
    try {
      const response = await internalApiService.get(`/api/phases/${phaseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching phase ${phaseId}:`, error);
      throw new Error(`Failed to fetch phase data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
loadPhaseFromDatabase: async (phaseId: string): Promise<AppPhase> => {
  try {
    const phaseData = await phaseApiService.fetchPhaseData(phaseId);
    
    // Validate phase data and ensure it's not a Promise-like object
    if (!phaseData || typeof phaseData !== 'object') {
      throw new Error('Invalid phase data received');
    }
    
    // Check if phaseData looks like a Promise
    if (typeof (phaseData as any).then === 'function') {
      throw new Error('Received Promise-like object instead of phase data');
    }
    
    // Transform to AppPhase with runtime fields
    const appPhase: AppPhase = {
      ...phaseData,
      phaseType: normalizePhaseType(phaseData.phaseType),
      component: getPhaseComponent(phaseData.phaseType || phaseData.type),
      hooks: getPhaseHooks(phaseData.id),
      data: initializePhaseData(phaseData),
      // Ensure required fields exist
      createdAt: phaseData.createdAt || new Date(),
      updatedAt: phaseData.updatedAt || new Date(),
      version: phaseData.version || 1
    };
    
    return appPhase;
  } catch (error) {
    console.error(`Error loading phase ${phaseId} from database:`, error);
    throw error;
  }
},


  savePhase: async (phase: AppPhase): Promise<void> => {
    try {
      // Prepare phase data for saving (remove runtime fields)
      const phaseToSave = {
        ...phase,
        component: undefined,
        hooks: undefined,
        data: undefined
      };
      
      await internalApiService.post('/api/phases', phaseToSave);
    } catch (error) {
      console.error('Error saving phase:', error);
      throw error;
    }
  },

  updatePhase: async (phaseId: string, updates: Partial<AppPhase>): Promise<void> => {
    try {
      // Remove runtime fields from updates
      const { component, hooks, data, ...validUpdates } = updates;
      
      await internalApiService.put(`/api/phases/${phaseId}`, validUpdates);
    } catch (error) {
      console.error(`Error updating phase ${phaseId}:`, error);
      throw error;
    }
  },

  deletePhase: async (phaseId: string): Promise<void> => {
    try {
      await internalApiService.delete(`/api/phases/${phaseId}`);
    } catch (error) {
      console.error(`Error deleting phase ${phaseId}:`, error);
      throw error;
    }
  },

  getPhasesByProject: async (projectId: string): Promise<AppPhase[]> => {
    try {
      const response = await internalApiService.get(`/api/projects/${projectId}/phases`);
      const phasesData = response.data;
      
      if (!Array.isArray(phasesData)) {
        throw new Error('Invalid phases data received');
      }
      
      // Transform each to AppPhase
      return phasesData.map((data: any) => ({
        ...data,
        phaseType: normalizePhaseType(data.phaseType),
        component: getPhaseComponent(data.phaseType || data.type),
        hooks: getPhaseHooks(data.id),
        data: initializePhaseData(data),
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        version: data.version || 1
      }));
    } catch (error) {
      console.error(`Error fetching phases for project ${projectId}:`, error);
      throw error;
    }
  }
};

// Helper function to normalize phase types
const normalizePhaseType = (phaseType: any): UnifiedPhaseType => {
  if (!phaseType) return undefined;
  
  // Check if it's already a valid enum value
  if (
    Object.values(ProjectPhaseTypeEnum).includes(phaseType) ||
    Object.values(ProgressPhase).includes(phaseType) ||
    Object.values(DocumentPhaseTypeEnum).includes(phaseType)
  ) {
    return phaseType;
  }
  
  // Try to map string to enum
  const phaseTypeStr = String(phaseType).toLowerCase();
  
  // Map to ProjectPhaseTypeEnum
  if (phaseTypeStr.includes('ideation')) return ProjectPhaseTypeEnum.Ideation;
  if (phaseTypeStr.includes('draft')) return ProjectPhaseTypeEnum.Draft;
  if (phaseTypeStr.includes('team')) return ProjectPhaseTypeEnum.TeamFormation;
  if (phaseTypeStr.includes('brainstorm')) return ProjectPhaseTypeEnum.ProductBrainstorming;
  if (phaseTypeStr.includes('launch')) return ProjectPhaseTypeEnum.Launch;
  if (phaseTypeStr.includes('data') || phaseTypeStr.includes('analysis')) return ProjectPhaseTypeEnum.DataAnalysis;
  if (phaseTypeStr.includes('review')) return ProjectPhaseTypeEnum.Review;
  if (phaseTypeStr.includes('final')) return ProjectPhaseTypeEnum.Final;
  if (phaseTypeStr.includes('test')) return ProjectPhaseTypeEnum.Test;
  if (phaseTypeStr.includes('create')) return ProjectPhaseTypeEnum.CreatePhase;
  if (phaseTypeStr.includes('previous')) return ProjectPhaseTypeEnum.Previous;
  if (phaseTypeStr.includes('register')) return ProjectPhaseTypeEnum.Register;
  if (phaseTypeStr.includes('planning')) return ProjectPhaseTypeEnum.Planning;
  if (phaseTypeStr.includes('development')) return ProjectPhaseTypeEnum.Development;
  
  // Return as string if no match
  return phaseType;
};

// Initialize phase data based on phase type
const initializePhaseData = (phaseData: any): PhaseInitialData => {
  const baseData: PhaseInitialData = {
    status: phaseData.status || 'pending',
    progress: phaseData.progress || 0,
    startDate: phaseData.startDate ? new Date(phaseData.startDate) : new Date(),
    endDate: phaseData.endDate ? new Date(phaseData.endDate) : undefined,
    metadata: phaseData.metadata || {},
    tasks: phaseData.tasks || [],
    documents: phaseData.documents || [],
    teamMembers: phaseData.teamMembers || [],
    checklist: phaseData.checklist || []
  };
  
  const phaseType = normalizePhaseType(phaseData.phaseType || phaseData.type);
  
  // Add type-specific initialization
  switch (phaseType) {
    case ProjectPhaseTypeEnum.Ideation:
    case ProgressPhase.Ideation:
      return {
        ...baseData,
        ideas: phaseData.ideas || [],
        brainstormingNotes: phaseData.brainstormingNotes || '',
        targetAudience: phaseData.targetAudience || '',
        problemStatement: phaseData.problemStatement || ''
      };
      
    case ProjectPhaseTypeEnum.Draft:
    case ProgressPhase.Draft:
      return {
        ...baseData,
        draftContent: phaseData.draftContent || '',
        revisions: phaseData.revisions || 0,
        lastReviewed: phaseData.lastReviewed || null,
        reviewerComments: phaseData.reviewerComments || []
      };
      
    case ProjectPhaseTypeEnum.TeamFormation:
    case ProgressPhase.TeamFormation:
      return {
        ...baseData,
        requiredRoles: phaseData.requiredRoles || [],
        assignedRoles: phaseData.assignedRoles || {},
        teamSize: phaseData.teamSize || 0,
        recruitmentStatus: phaseData.recruitmentStatus || 'pending'
      };
      
    case ProjectPhaseTypeEnum.DataAnalysis:
    case ProgressPhase.DataAnalysis:
      return {
        ...baseData,
        metrics: phaseData.metrics || [],
        analysisResults: phaseData.analysisResults || {},
        insights: phaseData.insights || [],
        recommendations: phaseData.recommendations || []
      };
      
    case ProjectPhaseTypeEnum.Launch:
      return {
        ...baseData,
        launchDate: phaseData.launchDate || null,
        launchChecklist: phaseData.launchChecklist || [],
        marketingMaterials: phaseData.marketingMaterials || [],
        postLaunchPlan: phaseData.postLaunchPlan || ''
      };
      
    case ProjectPhaseTypeEnum.Development:
      return {
        ...baseData,
        developmentTasks: phaseData.developmentTasks || [],
        techStack: phaseData.techStack || [],
        deploymentPlan: phaseData.deploymentPlan || '',
        testingStatus: phaseData.testingStatus || 'pending'
      };
      
    case DocumentPhaseTypeEnum.Review:
      return {
        ...baseData,
        reviewers: phaseData.reviewers || [],
        reviewDeadline: phaseData.reviewDeadline || null,
        reviewComments: phaseData.reviewComments || [],
        approvalStatus: phaseData.approvalStatus || 'pending'
      };
      
    default:
      return baseData;
  }
};

// Get the appropriate React component for the phase type
const getPhaseComponent = (phaseType: any): any => {
  const normalizedType = normalizePhaseType(phaseType);
  
  // Map phase types to components
  const componentMap: Record<string, string> = {
    [ProjectPhaseTypeEnum.Ideation]: 'IdeationPhaseComponent',
    [ProjectPhaseTypeEnum.Draft]: 'DraftPhaseComponent',
    [ProjectPhaseTypeEnum.TeamFormation]: 'TeamFormationComponent',
    [ProjectPhaseTypeEnum.DataAnalysis]: 'DataAnalysisComponent',
    [ProjectPhaseTypeEnum.Launch]: 'LaunchPhaseComponent',
    [ProjectPhaseTypeEnum.Development]: 'DevelopmentPhaseComponent',
    [DocumentPhaseTypeEnum.Review]: 'ReviewPhaseComponent',
    [DocumentPhaseTypeEnum.Approved]: 'ApprovedPhaseComponent',
    [ProgressPhase.Ideation]: 'IdeationProgressComponent',
    [ProgressPhase.TeamFormation]: 'TeamProgressComponent'
  };
  
  return componentMap[normalizedType] || 'GenericPhaseComponent';
};

// Get hooks for the phase
const getPhaseHooks = (phaseId: string): any => {
  return {
    usePhaseData: () => ({
      // Hook implementation would go here
      phaseId,
      isLoading: false,
      error: null,
      refetch: () => {}
    }),
    usePhaseActions: () => ({
      // Action hooks
      updatePhase: (updates: any) => console.log('Update phase', phaseId, updates),
      completePhase: () => console.log('Complete phase', phaseId),
      resetPhase: () => console.log('Reset phase', phaseId)
    })
  };
};