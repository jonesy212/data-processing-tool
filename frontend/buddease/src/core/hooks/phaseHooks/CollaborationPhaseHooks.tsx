// CollaborationPhaseHooks.tsx

import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { DynamicHookParams } from '@/core/hooks/dynamicHooks/dynamicHookGenerator';
import DynamicPromptPhaseHookConfig, { createDynamicPromptPhaseHook } from '@/core/hooks/phaseHooks/DynamicPromptPhaseHook';
import { useNotification } from '@/core/state/context/NotificationContext';


type DynamicPromptPhaseHookConfig = {
  condition: () => boolean | Promise<boolean>;
  asyncEffect: () => Promise<() => void>;
};


export const useTeamBuildingPhase = createDynamicPromptPhaseHook({
  condition: async () => {
    // Add condition logic based on your requirements for the Team Building Phase
    const isTeamBuildingPhase = true; // Replace with your condition
    return Promise.resolve(isTeamBuildingPhase);
  },
  asyncEffect: async () => {
    try {
      // Add dynamic logic for the Team Building Phase
      console.log("useEffect triggered for Team Building Phase");

      // Your logic specific to the Team Building Phase

      return () => {
        // Cleanup logic for Team Building Phase
        console.log("Cleanup for Team Building Phase");
      };
    } catch (error: any) {
      console.error("Error during Team Building Phase:", error);
      
      // Enhanced error notification using consistent object format
      const { notify } = useNotification();
      let userMessage = "Team Building Phase Error";
      
      if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
        userMessage = "Network error during Team Building Phase";
      } else if (error.message?.includes('timeout') || error.code === 'TIMEOUT') {
        userMessage = "Team Building Phase operation timed out";
      } else if (error.message?.includes('validation') || error.code === 'VALIDATION_ERROR') {
        userMessage = "Team Building Phase validation failed";
      }
      
      notify({
        id: `team_building_phase_error_${Date.now()}`,
        message: userMessage,
        data: {
          entityType: 'team_building_phase',
          action: 'phase_execution',
          phaseName: 'Team Building Phase',
          originalError: error.message,
          errorType: 'TEAM_BUILDING_PHASE_ERROR',
          errorCode: error.code,
          stackTrace: error.stack,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const,
        metadata: {
          phaseType: 'team_building',
          isHookError: true,
          hookName: 'useTeamBuildingPhase'
        }
      });
      
      // Optional: Log to monitoring service
      logPhaseError({
        phase: 'team_building',
        error: error,
        context: 'useTeamBuildingPhase hook',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  },
} as DynamicPromptPhaseHookConfig & DynamicHookParams<void>);

// Optional: Success notification for phase completion
const useTeamBuildingPhaseWithSuccess = createDynamicPromptPhaseHook({
  condition: async () => {
    const isTeamBuildingPhase = true;
    return Promise.resolve(isTeamBuildingPhase);
  },
  asyncEffect: async () => {
    try {
      console.log("useEffect triggered for Team Building Phase");
      
      // Your logic here
      const result = await executeTeamBuildingLogic();
      
      // Success notification
      const { notify } = useNotification();
      notify({
        id: `team_building_phase_success_${Date.now()}`,
        message: "Team Building Phase completed successfully",
        data: {
          entityType: 'team_building_phase',
          action: 'phase_completion',
          phaseName: 'Team Building Phase',
          result: result,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      
      return () => {
        console.log("Cleanup for Team Building Phase");
      };
    } catch (error: any) {
      console.error("Error during Team Building Phase:", error);
      
      const { notify } = useNotification();
      notify({
        id: `team_building_phase_error_${Date.now()}`,
        message: "Team Building Phase failed",
        data: {
          entityType: 'team_building_phase',
          action: 'phase_execution',
          phaseName: 'Team Building Phase',
          originalError: error.message,
          errorType: 'TEAM_BUILDING_PHASE_ERROR',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
      
      throw error;
    }
  },
});

// Helper function (optional)
export const executeTeamBuildingLogic = async (): Promise<any> => {
  // Your team building logic here
  return { success: true };
};

// Error logging function (optional)
export const logPhaseError = (errorInfo: any): void => {
  console.log('[Phase Error Logged]:', errorInfo);
  // Could send to monitoring service like Sentry
  sentry.captureException(errorInfo.error, { extra: errorInfo });
};







// Brainstorming Phase Hook
export const useBrainstormingPhase = createDynamicPromptPhaseHook({
  condition: () => {
    // Add condition logic based on your requirements for the Brainstorming Phase
    const isBrainstormingPhase = true; // Replace with your condition
    return isBrainstormingPhase;
  },
  asyncEffect: async () => {
    try {
      // Add dynamic logic for the Brainstorming Phase
      console.log("useEffect triggered for Brainstorming Phase");

      // Your logic specific to the Brainstorming Phase

      return () => {
        // Cleanup logic for Brainstorming Phase
        console.log("Cleanup for Brainstorming Phase");
      };
    } catch (error) {
      console.error("Error during Brainstorming Phase:", error);
      // Handle errors or log them as needed
      return () => {
        // Cleanup logic in case of error
        console.log("Cleanup for Brainstorming Phase (Error)");
      };
    }
  },
} as DynamicPromptPhaseHookConfig & DynamicHookParams<void>);











// Project Management Phase Hook
export const useProjectManagementPhase = createDynamicPromptPhaseHook({
  condition: () => {
    // Add condition logic based on your requirements for the Project Management Phase
    const isProjectManagementPhase = true; // Replace with your condition
    return isProjectManagementPhase;
  },
  asyncEffect: async () => {
    try {
      // Add dynamic logic for the Project Management Phase
      console.log('useEffect triggered for Project Management Phase');
      
      // Your logic specific to the Project Management Phase

      return () => {
        // Cleanup logic for Project Management Phase
        console.log('Cleanup for Project Management Phase');
      };
    } catch (error) {
      console.error('Error during Project Management Phase:', error);
      // Handle errors or log them as needed
      return () => {
        // Cleanup logic in case of error
        console.log('Cleanup for Project Management Phase (Error)');
      };
    }
  },
}as DynamicPromptPhaseHookConfig &  DynamicHookParams<void>);












// Meetings Phase Hook
export const useMeetingsPhase = createDynamicPromptPhaseHook({
  condition: () => {
    // Add condition logic based on your requirements for the Meetings Phase
    const isMeetingsPhase = true; // Replace with your condition
    return isMeetingsPhase;
  },
  asyncEffect: async () => {
    try {
      // Add dynamic logic for the Meetings Phase
      console.log('useEffect triggered for Meetings Phase');
      
      // Your logic specific to the Meetings Phase

      return () => {
        // Cleanup logic for Meetings Phase
        console.log('Cleanup for Meetings Phase');
      };
    } catch (error) {
      console.error('Error during Meetings Phase:', error);
      // Handle errors or log them as needed
      return () => {
        // Cleanup logic in case of error
        console.log('Cleanup for Meetings Phase (Error)');
      };
    }
  },
}as DynamicPromptPhaseHookConfig &  DynamicHookParams<void>);










// Collaboration Phase Hook
export const useCollaborationPhase = createDynamicPromptPhaseHook({
  condition: () => {
    // Add condition logic based on your requirements for the Collaboration Phase
    const isCollaborationPhase = true; // Replace with your condition
    return isCollaborationPhase;
  },
  asyncEffect: async () => {
    try {
      // Add dynamic logic for the Collaboration Phase
      console.log('useEffect triggered for Collaboration Phase');
      
      // Your logic specific to the Collaboration Phase

      return () => {
        // Cleanup logic for Collaboration Phase
        console.log('Cleanup for Collaboration Phase');
      };
    } catch (error) {
      console.error('Error during Collaboration Phase:', error);
      // Handle errors or log them as needed
      return () => {
        // Cleanup logic in case of error
        console.log('Cleanup for Collaboration Phase (Error)');
      };
    }
  },
} as DynamicPromptPhaseHookConfig &  DynamicHookParams<void>);