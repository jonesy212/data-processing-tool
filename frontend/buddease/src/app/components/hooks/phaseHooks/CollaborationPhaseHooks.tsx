
// CollaborationPhaseHooks.ts
import { NotificationTypeEnum, useNotification } from '../../support/NotificationContext';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import { DynamicHookParams } from '../dynamicHooks/dynamicHookGenerator';
import DynamicPromptPhaseHookConfig, { createDynamicPromptPhaseHook } from './DynamicPromptPhaseHook';


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
    } catch (error) {
      console.error("Error during Team Building Phase:", error);
      // Handle errors using notification service
      const { notify} = useNotification();
      notify(
        "teamBuildingPhaseError",
        "Team Building Phase Error",
        NOTIFICATION_MESSAGES.TeamBuildingPhase.CREATING_TEAM_BUILDING_PHASE_ERROR,
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  } ,
} as DynamicPromptPhaseHookConfig &  DynamicHookParams<void>);










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