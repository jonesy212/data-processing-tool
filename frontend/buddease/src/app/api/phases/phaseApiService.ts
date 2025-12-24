// /app/api/phases/phaseApiService.ts
import internalApiService from '@/app/api/ApiClient';
import { AppPhase } from '@/app/typings/entities/PhaseEntity';
import { UnifiedPhaseType } from '@/app/typings/phaseTypes';
import { ProgressPhase } from '@/app/models/tracker/ProgressBar';
import { ProjectPhaseTypeEnum } from "@/app/models/data/StatusType";
import { DocumentPhaseTypeEnum } from '@/app/documents/editing/DocumentPhaseType'

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


const DEFAULT_PHASE_TYPE = ProjectPhaseTypeEnum.Ideation;


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
    console.log('Testing AppPhase type:', {
      hasThen: 'then' in ({} as AppPhase),
      prototype: Object.getPrototypeOf({} as AppPhase)
    });
    
    const phaseData = await phaseApiService.fetchPhaseData(phaseId);
    console.log('Phase data type:', typeof phaseData, 'has then?', typeof (phaseData as any).then
  );
      
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
  // Handle null/undefined/empty
  if (!phaseType) {
    return DEFAULT_PHASE_TYPE;
  }
  
  // Handle string conversion safely
  const phaseTypeStr = String(phaseType).trim();
  if (!phaseTypeStr) {
    return DEFAULT_PHASE_TYPE;
  }
  
  // Check if it's already a valid enum value
  const allEnumValues = [
    ...Object.values(ProjectPhaseTypeEnum),
    ...Object.values(ProgressPhase),
    ...Object.values(DocumentPhaseTypeEnum)
  ];
  
  if (allEnumValues.includes(phaseType as any)) {
    return phaseType;
  }
  
  // Normalize the string for comparison
  const normalizedStr = phaseTypeStr.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Use a map for better maintainability
  const phaseTypeMap: Record<string, UnifiedPhaseType> = {
    ideation: ProjectPhaseTypeEnum.Ideation,
    draft: ProjectPhaseTypeEnum.Draft,
    team: ProjectPhaseTypeEnum.TeamFormation,
    brainstorm: ProjectPhaseTypeEnum.ProductBrainstorming,
    launch: ProjectPhaseTypeEnum.Launch,
    data: ProjectPhaseTypeEnum.DataAnalysis,
    analysis: ProjectPhaseTypeEnum.DataAnalysis,
    review: ProjectPhaseTypeEnum.Review,
    final: ProjectPhaseTypeEnum.Final,
    test: ProjectPhaseTypeEnum.Test,
    create: ProjectPhaseTypeEnum.CreatePhase,
    previous: ProjectPhaseTypeEnum.Previous,
    register: ProjectPhaseTypeEnum.Register,
    planning: ProjectPhaseTypeEnum.Planning,
    development: ProjectPhaseTypeEnum.Development
  };
  
  // Find matching phase type
  for (const [key, value] of Object.entries(phaseTypeMap)) {
    if (normalizedStr.includes(key)) {
      return value;
    }
  }
  
  // Return the original as fallback
  return phaseType as UnifiedPhaseType;
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