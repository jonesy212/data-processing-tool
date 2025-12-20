// PhaseHooks.ts

import IdeationPhaseComponent from '@/app/components/phases/IdeationPhaseComponent';
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import configData from "@/app/config/endpoints/configData";
import { ipfsConfig } from '@/app/config/ipfsConfig';
import userSettings from '@/app/config/UserSettings';
import { Attachment } from '@/app/documents/attachment/Attachment';
import createDynamicHook from '@/app/hooks/dynamicHooks/dynamicHookGenerator';
import { BrainstormingSettings } from '@/app/interfaces/settings/BrainstormingSettings';
import { CollaborationPreferences } from '@/app/interfaces/settings/CollaborationPreferences';
import { TeamBuildingSettings } from '@/app/interfaces/settings/TeamBuildingSettings';
import BrandingSettings from '@/app/libraries/theme/BrandingService';
import { ProjectPhaseTypeEnum } from '@/app/models/data/StatusType';
import { CustomPhaseHooks, Phase } from '@/app/models/phases/Phase';
import { Progress } from '@/app/models/tracker/ProgressBar';
import { useAuth } from '@/app/state/context/AuthContext';
import { PhaseAttachment, PhaseEntity, PhaseExcludedFields, PhaseIncludedFields, PhaseK, PhaseMeta } from '@/app/typings/entities/PhaseEntity';
import {
  ExtendedDAppAdapter,
  ExtendedDappProps
} from "@/utils/web3/dAppAdapter/IPFS";
import { useEffect } from "react";
import { TestPhaseHookConfig, TestScenario, TestResult, TestPhaseHooks, ValidationResult, TransitionTestResult } from '@/app/hooks/useTestPhaseHooks'
import { 
  AppPhaseEntity, 
  PhaseK, 
  PhaseMeta, 
  PhaseAttachment, 
  PhaseExcludedFields, 
  PhaseIncludedFields 
} from '@/app/typings/entities/PhaseEntity';

const phaseHooks: { [key: string]: CustomPhaseHooks<PhaseEntity, PhaseK, PhaseMeta, PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields> } = {};
let idleTimeoutId: ReturnType<typeof setTimeout> | null = null;
let startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;


 export interface PhaseHookConfig<
  T extends BaseDataEntity = PhaseEntity, 
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = PhaseMeta, 
  AttachmentType extends Attachment = PhaseAttachment,
  ExcludedFields extends keyof T = PhaseExcludedFields,
  IncludedFields extends keyof T = PhaseIncludedFields
> {
  name: string;
  progressCallbacks?: (progress: Progress) => void;
  condition: (idleTimeoutDuration: number) => Promise<boolean>;
  canTransitionTo?: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  handleTransitionTo?: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
  duration: string | undefined;
  isActive?: boolean;
  initialStartIdleTimeout?: (timeoutDuration: number, onTimeout: () => void) => void;
  resetIdleTimeout?: () => Promise<void>;
  idleTimeoutId?: NodeJS.Timeout | null;
  clearIdleTimeout?: () => void;
  onPhaseStart?: () => void;
  onPhaseEnd?: () => void;
  startIdleTimeout: (
    timeoutDuration: number,
    onTimeout: () => void | undefined
  ) => void | undefined;
   
  cleanup?: (() => void) | undefined;
  startAnimation?: () => void;
  stopAnimation?: () => void;
  animateIn?: () => void;
  toggleActivation?: (accessToken?: string | null | undefined) => void;
  asyncEffect: ({
    idleTimeoutId,
    startIdleTimeout
  }: {
    idleTimeoutId: NodeJS.Timeout | null;
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => void;
  }) => Promise<() => void>;
  phaseType?: string | ProjectPhaseTypeEnum;
  customProp1?: string;
  customProp2?: number;
}



export interface TestPhaseHooks<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  createTestPhaseHook: (
    config: TestPhaseHookConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  runTestScenarios: (
    phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    scenarios: TestScenario<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<TestResult[]>;
  
  validatePhaseForTesting: (
    phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => ValidationResult;
  
  mockPhase: (
    mockData: Partial<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  createTransitionTest: (
    fromPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    toPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<TransitionTestResult>;
}


// TestPhaseHookConfig.ts

export interface TestPhaseHookConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  name: string;
  condition: (idleTimeoutDuration: number) => Promise<boolean>
  asyncEffect: () => Promise<() => void>;
  canTransitionTo?: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  handleTransitionTo?: (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
  duration: number;
}

export const idleTimeoutDuration = 10000; 
// Implementation matching your existing structure
export const useTestPhaseHooks = <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(): TestPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {

  // Keep idleTimeoutId typed safely for browser/Node
  let idleTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const createTestPhaseHook = (
    config: TestPhaseHookConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {

    const customHooks: CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      condition: config.condition,
      
      // Your existing methods
      onStart: config.onStart || (() => {
        console.log("Test phase started");
      }),
      onEnd: config.onEnd || (() => {
        console.log("Test phase ended");
      }),

      canTransitionTo: config.canTransitionTo || ((nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => true),
      
      handleTransitionTo: config.handleTransitionTo || (async (nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        console.log(`Transitioning to phase: ${nextPhase.name}`);
        // Default implementation
      }),

      resetIdleTimeout: async () => {
        if (idleTimeoutId) {
          clearTimeout(idleTimeoutId);
          idleTimeoutId = null;
        }
      },

      isActive: false,
      progress: {} as Progress,

      // Optional lifecycle hooks
      startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
        if (idleTimeoutId) clearTimeout(idleTimeoutId);
        idleTimeoutId = setTimeout(() => {
          onTimeout();
        }, timeoutDuration);
      },
      
      clearIdleTimeout: () => {
        if (idleTimeoutId) clearTimeout(idleTimeoutId);
        idleTimeoutId = null;
      },

      // Additional test-specific methods (optional)
      asyncEffect: config.asyncEffect,
      duration: config.duration,
      retryCount: config.retryCount || 0,
      onTestError: config.onError,
      onTestSuccess: config.onSuccess,
      cleanupTest: config.cleanup,
      validateTest: config.validate,
    };

    return customHooks;
  };

  // Additional methods (optional - keep if you need them)
  const runTestScenarios = async (
    phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    scenarios: TestScenario<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): Promise<TestResult[]> => {
    const results: TestResult[] = [];
    
    for (const scenario of scenarios) {
      const startTime = Date.now();
      
      try {
        // Setup
        await scenario.setup(phase);
        
        // Execute
        const result = await scenario.execute(phase);
        
        // Validate expected result
        const success = JSON.stringify(result.data) === JSON.stringify(scenario.expectedResult);
        
        results.push({
          success,
          message: success ? `Scenario "${scenario.name}" passed` : `Scenario "${scenario.name}" failed`,
          data: result.data,
          duration: Date.now() - startTime,
          timestamp: new Date()
        });
        
        // Teardown if provided
        if (scenario.teardown) {
          await scenario.teardown(phase);
        }
        
      } catch (error: any) {
        results.push({
          success: false,
          message: `Scenario "${scenario.name}" errored: ${error.message}`,
          errors: [error.message],
          duration: Date.now() - startTime,
          timestamp: new Date()
        });
      }
    }
    
    return results;
  };

  const validatePhaseForTesting = (
    phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required validations
    if (!phase.id) {
      errors.push("Phase ID is required");
    }
    
    if (!phase.name) {
      errors.push("Phase name is required");
    }
    
    if (phase.startDate && phase.endDate && phase.startDate > phase.endDate) {
      errors.push("Start date cannot be after end date");
    }
    
    // Warning validations
    if (!phase.description) {
      warnings.push("Phase description is missing");
    }
    
    if (!phase.tasks || phase.tasks.length === 0) {
      warnings.push("Phase has no tasks assigned");
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const mockPhase = (
    mockData: Partial<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
    const basePhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: `test_phase_${Date.now()}`,
      name: "Test Phase",
      description: "A test phase for validation",
      projectId: "test_project",
      isActive: false,
      isComplete: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...mockData
    };
    
    return basePhase;
  };

  const createTransitionTest = async (
    fromPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    toPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<TransitionTestResult> => {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Validate phases
      const fromValidation = validatePhaseForTesting(fromPhase);
      const toValidation = validatePhaseForTesting(toPhase);
      
      if (!fromValidation.isValid) {
        errors.push(...fromValidation.errors.map(e => `From phase: ${e}`));
      }
      if (!toValidation.isValid) {
        errors.push(...toValidation.errors.map(e => `To phase: ${e}`));
      }
      
      // Check transition conditions
      const canTransition = errors.length === 0 && 
        fromPhase.isComplete && 
        !toPhase.isActive &&
        (!fromPhase.endDate || !toPhase.startDate || fromPhase.endDate <= toPhase.startDate);
      
      if (!canTransition && errors.length === 0) {
        errors.push("Cannot transition - phases are not in a valid state for transition");
      }
      
      return {
        success: errors.length === 0,
        canTransition,
        transitionErrors: errors,
        transitionWarnings: [...fromValidation.warnings, ...toValidation.warnings],
        duration: Date.now() - startTime
      };
      
    } catch (error: any) {
      return {
        success: false,
        canTransition: false,
        transitionErrors: [`Transition test failed: ${error.message}`],
        transitionWarnings: [],
        duration: Date.now() - startTime
      };
    }
  };

  // Return object matching your interface
  return {
    createTestPhaseHook,
    // Include additional methods as optional
    runTestScenarios,
    validatePhaseForTesting,
    mockPhase,
    createTransitionTest
  };
};

const { resetAuthState } = useAuth();

export const createPhaseHook =
  (
    idleTimeoutDuration: number,
    config: PhaseHookConfig
  ) => {
  return createDynamicHook({
    condition: async () => {
      return config.condition(idleTimeoutDuration);
    },
    asyncEffect: async (): Promise<() => void> => {
      const cleanup = await config.asyncEffect({ idleTimeoutId, startIdleTimeout });
      if (typeof cleanup === "function") {
        cleanup();
      }
      return config.asyncEffect({ idleTimeoutId, startIdleTimeout });
    },
    idleTimeoutId: null, // Initialize with null or assign a valid value
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
      // Your implementation here
      idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
    },
    resetIdleTimeout: async () => {
      if (userSettings.idleTimeout?.idleTimeoutId) {
        clearTimeout(userSettings.idleTimeout.idleTimeoutId);
      }
      if (userSettings.idleTimeout) {
        userSettings.idleTimeout.idleTimeoutId = setTimeout(() => {
          // handle idle timeout
        }, userSettings.idleTimeoutDuration);
      }
    },
    isActive: false,
    intervalId: 0, // Initialize with null or assign a valid value
    initialStartIdleTimeout: (
      timeoutDuration: number,
      onTimeout: () => void
    ) => {
      idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
    },
  });
};

const usePhaseHooks = ({ condition, asyncEffect }: PhaseHookConfig): void => {
  useEffect(() => {
    const fetchData = async () => {
      if (await condition(idleTimeoutDuration)) {
        asyncEffect({ idleTimeoutId, startIdleTimeout }).then((cleanup) => {
          if (typeof cleanup === "function") {
            cleanup();
          }
        });
              }
    };

    fetchData();
  }, [condition, asyncEffect]);
};

const phaseNames = [
  "Calendar Phase",
  "Authentication Phase",
  "Job Search Phase",
  "Recruiter Dashboard Phase",
  "Job Applications Phase",
  "Messaging System Phase",
  "Data Analysis Tools Phase",
  "Web3 Communication Phase",
  "Decentralized Storage Phase",
  // Add more phase names as needed
];

// Define additional phases based on your project
const additionalPhaseNames = [
  "Ideation Phase",
  "Team Creation Phase",
  "Product Brainstorming Phase",
  "Product Launch Phase",
  "Data Analysis Phase",
  "General Communication Features",
  // Add your additional phase names here
  "Additional Phase 1",
  "Additional Phase 2",
];

const additionalPhaseHooks: { 
  [key: string]: CustomPhaseHooks<
    AppPhaseEntity, 
    PhaseK, 
    PhaseMeta, 
    PhaseAttachment, 
    PhaseExcludedFields, 
    PhaseIncludedFields
  > 
} = {};

// First block of code
additionalPhaseNames.forEach(([phaseName, duration]) => {
  additionalPhaseHooks[phaseName.replace(/\s/g, "") + "PhaseHook"] =
    createPhaseHook(idleTimeoutDuration, {
      name: phaseName,
      duration: duration,
      condition: async () => true,
      clearIdleTimeout: () => {
        clearTimeout(idleTimeoutId!);
      },
      onPhaseStart: () => {
        console.log(`${phaseName} phase started`);
      },
      onPhaseEnd: () => {
        console.log(`${phaseName} phase ended`);
      },
      asyncEffect: async () => {
        console.log(`Transitioning to ${phaseName}`);
        return () => {
          console.log(`Cleanup for ${phaseName}`);
          resetAuthState();
        };
      },
      isActive: true,
      initialStartIdleTimeout: () => {},
      resetIdleTimeout: async () => {},
      idleTimeoutId: null,
      startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
        clearTimeout(idleTimeoutId!);
        idleTimeoutId = setTimeout(() => {
          onTimeout();
        }, timeoutDuration);
      },
      startAnimation: () => {},
      stopAnimation: () => {},
      animateIn: () => {},
      toggleActivation: () => {},
      cleanup: undefined,
    }) as CustomPhaseHooks<
      AppPhaseEntity, 
      PhaseK, 
      PhaseMeta, 
      PhaseAttachment, 
      PhaseExcludedFields, 
      PhaseIncludedFields
    >;
});


// Second block of code
additionalPhaseNames.forEach(([phaseName, duration]) => {
  additionalPhaseHooks[phaseName.replace(/\s/g, "") + "PhaseHook"] =
    createPhaseHook(idleTimeoutDuration, {
      name: phaseName,
      duration: duration,
      condition: async (idleTimeoutDuration: number) => Promise<true>,
      clearIdleTimeout: () => {
        clearTimeout(idleTimeoutId!);
      },
      onPhaseStart: () => {
        console.log(`${phaseName} phase started`);
      },
      onPhaseEnd: () => {
        console.log(`${phaseName} phase ended`);
      },
      asyncEffect: async () => {
        console.log(`Transitioning to ${phaseName}`);
        return () => {
          console.log(`Cleanup for ${phaseName}`);
          resetAuthState();
        };
      },
      phaseType: {
        name: "Ideation",
        duration: 5000,
        type: "ideaGeneration",
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + duration),
        subPhases: [],
        component: IdeationPhaseComponent,
        hooks: [ideationPhaseHook],
      } as unknown as Phase<
        AppPhaseEntity, 
        PhaseK, 
        PhaseMeta, 
        PhaseAttachment, 
        PhaseExcludedFields, 
        PhaseIncludedFields
      >,
      isActive: true,
      initialStartIdleTimeout: () => {},
      resetIdleTimeout: async () => {},
      idleTimeoutId: null,
      startIdleTimeout: (timeoutDuration: number, onTimeout: () => void) => {
        clearTimeout(idleTimeoutId!);
        idleTimeoutId = setTimeout(() => {
          onTimeout();
        }, timeoutDuration);
      },
      startAnimation: () => {},
      stopAnimation: () => {},
      animateIn: () => {},
      toggleActivation: () => {},
      cleanup: undefined,
    } as unknown as PhaseHookConfig);
});


const allPhaseHooks = {
  ...phaseHooks,
  ...additionalPhaseHooks,
};

export const {
  calendarPhaseHook,
  authenticationPhaseHook,
  jobSearchPhaseHook,
  recruiterDashboardPhaseHook,
  jobApplicationsPhaseHook,
  messagingSystemPhaseHook,
  dataAnalysisToolsPhaseHook,
  web3CommunicationPhaseHook,
  decentralizedStoragePhaseHook,
  ideationPhaseHook,
  teamCreationPhaseHook,
  productBrainstormingPhaseHook,
  productLaunchPhaseHook,
  dataAnalysisPhaseHook,
  generalCommunicationFeaturesPhaseHook,
  // Add more phase hooks as needed
} = phaseHooks;

// Additional utility functions for web3 and decentralized storage initialization
function initializeWeb3() {
  // Replace with your web3 initialization logic
  console.log("Web3 initialized");
  return {}; // Return your web3 instance
}

async function subscribeToBlockchainEvents(web3Instance: any) {
  // Replace with your blockchain event subscription logic
  console.log("Subscribed to blockchain events");
  return () => {
    // Unsubscribe logic
    console.log("Unsubscribed from blockchain events");
  };
}

async function initializeDecentralizedStorage(): Promise<{
  dappAdapter: ExtendedDAppAdapter;
}> {
  // Your existing decentralized storage initialization logic
  // ...

  // Example configuration for ExtendedDAppAdapter
  const baseConfig = {
    appName: "Progections",
    descriptions: "Extended Project Management App",
    appVersion: configData.currentAppVersion,
    ethereumRpcUrl: "https://your-ethereum-rpc-url",
    dappProps: {} as ExtendedDappProps,
  };

  const extendedConfig = {
    ...baseConfig,
    // Add any specific configuration for the ExtendedDAppAdapter
    // ...

    ipfsConfig: {
      // Specify IPFS configurations
     ...ipfsConfig
    },
    postgresConfig: {
      // Specify PostgreSQL configurations
      clientId: 'postgresql-client-id',
      clientName: 'postgresql-client-name',
      clientEmail: 'postgresql-client-email',
      notificationMessages: {
        updateClientDetailsError: 'Error updating client details',
      }
    },
  };



  // get extendedConfig

  // Create an instance of ExtendedDAppAdapter
  const extendedDApp = new ExtendedDAppAdapter(extendedConfig);

  // Perform any additional setup or initialization if needed
  // ...

  // Return the dappAdapter for further use in the application
  return { dappAdapter: extendedDApp };
}

// Additional utility functions for collaboration preferences initialization
async function initializeCollaborationPreferences() {
  // Replace with your collaboration preferences initialization logic
  console.log("Collaboration preferences initialized");

  async function projectManagement() {
    const web3 = initializeWeb3();
    const preferences = initializeCollaborationPreferences();
    const unsubscribe = await subscribeToBlockchainEvents(web3);
    const storageClient = initializeDecentralizedStorage();
    const brainstorming = await initializeCollaborationPreferences();
    const teamBuilding = await initializeCollaborationPreferences();
    const projectManagement = await initializeCollaborationPreferences();
    const meetings = await initializeCollaborationPreferences();
    const branding = await initializeCollaborationPreferences();

    return () => {
      unsubscribe();
      console.log("Cleaned up project management");
    };
  }

  async function initializeBranding() {
    // Replace with your branding preferences initialization logic
    console.log("Initializing branding preferences");

    // Example: Initialize branding preferences with default values
    return {
      logoUrl: "https://example.com/logo.png",
      primaryColor: "#3498db",
      secondaryColor: "#2ecc71",
      // Add more branding preferences as needed
    };
  }

  const branding = await initializeBranding();

  // Example: Initialize collaboration preferences with default values
  return {
    enableRealTimeUpdates: true,
    defaultFileType: "document",
    enableGroupManagement: true,
    enableTeamManagement: true,
    enableAudioChat: true,
    enableVideoChat: true,
    enableFileSharing: true,
    collaborationPreference1: "SomePreference",
    collaborationPreference2: "AnotherPreference",
    theme: "light",
    language: "en",
    fontSize: 14,
    teamBuilding: {} as TeamBuildingSettings, // Placeholder for teamBuilding
    projectManagement: {} as ProjectManagementSettings, // Placeholder for projectManagement
    meetings: {} as MeetingsSettings, // Placeholder for meetings
    brainstorming: {} as BrainstormingSettings, // Placeholder for brainstorming
    branding: {} as BrandingSettings,
  };
}

function applyCollaborationPreferences(
  preferences: CollaborationPreferences
): void {
  // Replace with your logic to apply collaboration preferences to the application
  console.log("Applying collaboration preferences to the application");

  // Example: Apply preferences to the UI or feature settings
  updateUIWithPreferences(preferences);
  enableFeaturesBasedOnPreferences(preferences);

  // Implement the logic to apply preferences, e.g., update UI, enable/disable features, etc.
}

// Example: Update UI elements with collaboration preferences
function updateUIWithPreferences(preferences: CollaborationPreferences) {
  console.log("Updating UI with collaboration preferences");
  // Implement logic to update UI elements based on preferences
  // For example, change theme, set language, adjust font size, etc.
}

// Example: Enable/disable features based on collaboration preferences
function enableFeaturesBasedOnPreferences(
  preferences: CollaborationPreferences
) {
  console.log("Enabling/Disabling features based on collaboration preferences");
  // Implement logic to enable/disable features based on preferences
  // For example, enable/disable audio chat, video chat, file sharing, etc.
}

async function teamBuilding(storageClient: any) {
  // Replace with your logic to fetch team data from decentralized storage
  console.log("Fetching team data from decentralized storage");

  // Fetch team members data
  const teamMembers = await fetchDataFromStorage(storageClient, ["members"]);

  // Fetch team projects data
  const teamProjects = await fetchDataFromStorage(storageClient, ["projects"]);

  // Fetch team chat history
  const teamChatHistory = await fetchDataFromStorage(storageClient, [
    "chatHistory",
  ]);

  return {
    teamMembers,
    teamProjects,
    teamChatHistory,
  };
}
// Utility function to fetch data from storage
async function fetchDataFromStorage(
  storageClient: any,
  keys: string[]
): Promise<{ [key: string]: any }> {
  console.log(
    `Fetching data from decentralized storage for keys: ${keys.join(", ")}`
  );

  const fetchDataPromises = keys.map(async (key) => {
    return {
      [key]: await fetchDataFromStorage(storageClient, ["PhaseStorage"]),
    };
  });

  const fetchedData = await Promise.all(fetchDataPromises);
  return Object.assign({}, ...fetchedData);
}

// Generic function for phase data fetching
async function fetchPhaseData(storageClient: any, keys: string[]) {
  return async function* () {
    console.log(`Fetching data for phase from decentralized storage`);

    const data = await fetchDataFromStorage(storageClient, keys);
    yield data;

    return () => {
      console.log(`Cleaned up phase data for keys: ${keys.join(", ")}`);
    };
  };
}


// Example: Initialize all phases in the app
export async function initializeAllPhases<
  T extends BaseDataEntity = AppPhaseEntity,
  K extends T = PhaseK,
  Meta extends DefaultMeta<T, K> = PhaseMeta,
  AttachmentType extends Attachment = PhaseAttachment,
  ExcludedFields extends keyof T = PhaseExcludedFields,
  IncludedFields extends keyof T = PhaseIncludedFields
>() {
  // Replace with your logic to initialize all phases
  console.log("Initializing all phases");

  const allPhaseNames = Object.keys(allPhaseHooks);
  
  // Example: Initialize collaboration preferences
  const collaborationPreferences = await initializeCollaborationPreferences(); // Wait for the promise to resolve
  applyCollaborationPreferences(collaborationPreferences);

  // Example: Initialize web3 and decentralized storage
  const web3Instance = initializeWeb3();
  const unsubscribeFromBlockchainEvents = subscribeToBlockchainEvents(web3Instance);
  const storageClient = initializeDecentralizedStorage();

  // Create a type for your phase hooks dictionary
  type PhaseHookDict = {
    [key: string]: CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  };

  // Cast your allPhaseHooks to the proper type
  const typedAllPhaseHooks = allPhaseHooks as PhaseHookDict;

  // Fetch data from storage for each phase
  allPhaseNames.forEach(async (phaseHookKey: string) => {
    // Remove the TypeScript error by using proper type assertion
    const phaseHook = typedAllPhaseHooks[phaseHookKey];
    if (phaseHook) {
      const fetchDataResult = await fetchDataFromStorage(storageClient, [
        ...phaseHook.keys,
      ]);

      // Assuming fetchDataResult is an object with keys, find the cleanup function
      const fetchDataCleanup: () => void = fetchDataResult.cleanup;

      // Check if asyncEffect exists and is a function before calling
      if (typeof phaseHook.asyncEffect === 'function') {
        await phaseHook.asyncEffect(); // Trigger the async effect for each phase
      }
      
      if (typeof fetchDataCleanup === 'function') {
        fetchDataCleanup(); // Cleanup after fetching data
      }
    }
  });

  // Project Management Phase
  const projectManagementKeys = [
    "projectDetails",
    "projectMembers",
    "projectFiles",
  ];
  const projectManagement = await fetchPhaseData(
    storageClient,
    projectManagementKeys
  ); // Now storageClient is properly declared

  // Meetings Phase
  const meetingsKeys = [
    "upcomingMeetings",
    "pastMeetingNotes",
    "meetingAttendees",
  ];
  const meetings = await fetchPhaseData(storageClient, meetingsKeys);

  // Brainstorming Phase
  const brainstormingKeys = ["brainstormingIdeas", "brainstormingComments"];
  const brainstorming = await fetchPhaseData(storageClient, brainstormingKeys);

  // Return all initialized data
  return {
    collaborationPreferences,
    web3Instance,
    unsubscribeFromBlockchainEvents,
    storageClient,
    projectManagement,
    meetings,
    brainstorming,
    // Return typed phase hooks for reference
    allPhaseHooks: typedAllPhaseHooks
  };
}

// Helper function to properly type allPhaseHooks
function createTypedPhaseHooks<
  T extends BaseDataEntity = AppPhaseEntity,
  K extends T = PhaseK,
  Meta extends DefaultMeta<T, K> = PhaseMeta,
  AttachmentType extends Attachment = PhaseAttachment,
  ExcludedFields extends keyof T = PhaseExcludedFields,
  IncludedFields extends keyof T = PhaseIncludedFields
>(): { [key: string]: CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> } {
  return {};
}

// Example of how to define allPhaseHooks with proper typing
const allPhaseHooks = createTypedPhaseHooks();

// Alternative: If you're getting allPhaseHooks from elsewhere, create a typed version
function getTypedAllPhaseHooks<
  T extends BaseDataEntity = AppPhaseEntity,
  K extends T = PhaseK,
  Meta extends DefaultMeta<T, K> = PhaseMeta,
  AttachmentType extends Attachment = PhaseAttachment,
  ExcludedFields extends keyof T = PhaseExcludedFields,
  IncludedFields extends keyof T = PhaseIncludedFields
>(phaseHooks: any): { [key: string]: CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> } {
  return phaseHooks as { [key: string]: CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> };
}

export default initializeDecentralizedStorage;
export { applyCollaborationPreferences, initializeCollaborationPreferences };
