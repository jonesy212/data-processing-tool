// ApiUserPreferences.ts
import internalApiService from '@/core/api/ApiClient';
import { endpointPreferences } from "@/core/api/ApiPreferencesEndpoints";
import { NotificationPreferences } from "@/core/cards/modal/ChatSettingsModal";
import { UserPreferences } from "@/core/config/UserPreferences";
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import type { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useNotification } from "@/core/state/context/NotificationContext";

type ApiUserPreferences = {
  fetchUserPreferences: () => Promise<UserPreferences>;
  updateUserPreferences: (updatedPreferences: UserPreferences) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  setIdeationPhase: (ideationPhase: string) => Promise<void>;
  deleteUserPreferences: () => Promise<void>;
  setBrainstormingPhase: (brainstormingPhase: string) => Promise<void>;
  setLaunchPhase: (launchPhase: string) => Promise<void>;
  setDataAnalysisPhase: (dataAnalysisPhase: string) => Promise<void>;
  setFontSize: (fontSize: string) => Promise<void>;
  saveNotificationPreferencesToBackend: (
    notificationPreferences: NotificationPreferences
  ) => Promise<void>;
};
const useApiUserPreferences = (): ApiUserPreferences => {
  const { notify } = useNotification(); // Use the useNotification hook

  const fetchUserPreferences = async (): Promise<UserPreferences> => {
    try {
      const response = await internalApiService.get(endpointPreferences.userPreferences.fetchUserPreferences);
      return response.data.preferences;
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      notify({
        id: `error${"Error fetching user preferences".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.FETCHING_PREFERENCES_ERROR,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Error fetching user preferences"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  };

  const updateUserPreferences = async (
    updatedPreferences: UserPreferences
  ): Promise<void> => {
    try {
      await internalApiService.put(endpointPreferences.userPreferences.updateUserPreferences, updatedPreferences);
      notify({
        id: `success${"User preferences updated successfully".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.USER_PREFERENCE_UPDATED_SUCCESS,
        data: { 
          extra: {
            operation: "Update user preferences"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      notify({
        id: `error${"Error updating user preferences".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.USER_PREFERENCE_UPDATED_FAILED,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Error updating user preferences"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  };

  const setTheme = async (theme: string): Promise<void> => {
    try {
      await internalApiService.put(endpointPreferences.userPreferences.setTheme, { theme });
      notify({
        id: `success${"Theme set successfully".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.THEME_SET_SUCCESSFULLY,
        data: { 
          extra: {
            theme,
            operation: "Set theme"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      console.error("Error setting theme:", error);
      notify({
        id: `error${"Error setting theme".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.THEME_SETTING_FAILED,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Error setting theme",
            theme
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  };

  const setFontSize = async (fontSize: string): Promise<void> => {
    try {
      await internalApiService.put(endpointPreferences.userPreferences.setFontSize, { fontSize });
    } catch (error) {
      console.error("Error setting font size:", error);
      notify({
        id: `error${"Error setting font size".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.FONT_SIZE_SETTING_FAILED,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Error setting font size",
            fontSize
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
    }
  };

  const setIdeationPhase = async (ideationPhase: string): Promise<void> => {
    try {
      await internalApiService.put(endpointPreferences.userPreferences.setIdeationPhase, { ideationPhase });
      notify({
        id: `success${"IdeationPhaseSetSuccess".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.IDEATION_PHASE_SET_SUCCESSFULLY,
        data: { 
          extra: {
            ideationPhase,
            operation: "Set ideation phase"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      console.error("Error setting ideation phase:", error);
      notify({
        id: `error${"Error setting ideation phase".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.IDEATION_PHASE_SETTING_FAILED,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Error setting ideation phase",
            ideationPhase
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  };

  const deleteUserPreferences = async (): Promise<void> => {
    try {
      await internalApiService.delete(endpointPreferences.userPreferences.deleteUserPreferences);
      notify({
        id: `success${"UserPreferencesDeleteSuccessful".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.USER_PREFERENCES_DELETED_SUCCESSFULLY,
        data: { 
          extra: {
            operation: "Delete user preferences"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      console.error("Error deleting user preferences:", error);
      notify({
        id: `error${"Error deleting user preferences".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.USER_PREFERENCES_DELETION_FAILED,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Error deleting user preferences"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  };

  const setBrainstormingPhase = async (brainstormingPhase: string): Promise<void> => {
    try {
      await internalApiService.put(endpointPreferences.userPreferences.setBrainstormingPhase, { brainstormingPhase });
      notify({
        id: `success${"brainistormingPhaseSetSuccess".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.BRAINSTORMING_PHASE_SET_SUCCESSFULLY,
        data: { 
          extra: {
            brainstormingPhase,
            operation: "Set brainstorming phase"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      console.error("Error setting brainstorming phase:", error);
      notify({
        id: `error${"Error setting brainstorming phase".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.BRAINSTORMING_PHASE_SETTING_FAILED,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Error setting brainstorming phase",
            brainstormingPhase
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  };

  const setLaunchPhase = async (launchPhase: string): Promise<void> => {
    try {
      await internalApiService.put(endpointPreferences.userPreferences.setLaunchPhase, { launchPhase });
      notify({
        id: `success${"launchPhaseSetSuccessfully".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.LAUNCH_PHASE_SET_SUCCESSFULLY,
        data: { 
          extra: {
            launchPhase,
            operation: "Set launch phase"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      console.error("Error setting launch phase:", error);
      notify({
        id: `error${"SettingLaunchPhaseError".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.LAUNCH_PHASE_SETTING_FAILED,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to set launch phase",
            launchPhase
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  };

  const setDataAnalysisPhase = async (dataAnalysisPhase: string): Promise<void> => {
    try {
      await internalApiService.put(endpointPreferences.userPreferences.setDataAnalysisPhase, { dataAnalysisPhase });
      notify({
        id: `success${"DataAnalysisPhaseSetSuccessfully".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.DATA_ANALYSIS_PHASE_SET_SUCCESSFULLY,
        data: { 
          extra: {
            dataAnalysisPhase,
            operation: "Set data analysis phase"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      console.error("Error setting data analysis phase:", error);
      notify({
        id: `error${"settingDataAnalysisPhaseError".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.DATA_ANALYSIS_PHASE_SETTING_FAILED,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to set data analysis phase",
            dataAnalysisPhase
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
      throw error;
    }
  };

  const saveNotificationPreferencesToBackend = async (
    notificationPreferences: NotificationPreferences
  ): Promise<void> => {
    try {
      await internalApiService.put(endpointPreferences.userPreferences.setNotificationPreferences, { notificationPreferences });
      notify({
        id: `success${"NotificationPreferencesSavedSuccessfully".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.NOTIFICATION_PREFERENCES_SAVED_SUCCESSFULLY,
        data: { 
          extra: {
            operation: "Save notification preferences"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success'
      });
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      notify({
        id: `error${"ErrorSavingNotificationPreferences".replace(/\s+/g, '')}`,
        message: NOTIFICATION_MESSAGES.UserPreferences.NOTIFICATION_PREFERENCES_SAVING_FAILED,
        data: { 
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to save notification preferences"
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error'
      });
    }
  };

  return {
    fetchUserPreferences,
    updateUserPreferences,
    setTheme,
    setFontSize,
    setIdeationPhase,
    deleteUserPreferences,
    setBrainstormingPhase,
    setLaunchPhase,
    setDataAnalysisPhase,
    saveNotificationPreferencesToBackend,
  };
};

export default useApiUserPreferences;