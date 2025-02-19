import { NotificationPreferences } from "@/app/components/communications/chat/ChatSettingsModal";
import { NotificationTypeEnum, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import dotProp from 'dot-prop';
import { UserPreferences } from "../../configs/UserPreferences";
import { endpointPreferences } from "../ApiPreferencesEndpoints";
import axiosInstance from "../axiosInstance";

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
  ) => Promise<void>
};

const useApiUserPreferences = (): ApiUserPreferences => {
  const { notify } = useNotification(); // Use the useNotification hook

  const fetchUserPreferences = async (): Promise<UserPreferences> => {
    try {
      const response = await axiosInstance.get(
        dotProp.getProperty(endpointPreferences, 'userPreferences.fetchUserPreferences')
      );
      return response.data.preferences;
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      notify(
        "Error fetching user preferences",
        "Failed to fetch user preferences",
        NOTIFICATION_MESSAGES.UserPreferences.FETCHING_PREFERENCES_ERROR,
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  };

  const updateUserPreferences = async (
    updatedPreferences: UserPreferences
  ): Promise<void> => {
    try {
      await axiosInstance.put(
        dotProp.getProperty(endpointPreferences, 'userPreferences.updateUserPreferences'),
        updatedPreferences
      );
      notify(
        "User preferences updated successfully",
        "User preferences updated successfully",
        NOTIFICATION_MESSAGES.UserPreferences.USER_PREFERENCE_UPDATED_SUCCESS,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error updating user preferences:", error);
      notify(
        "Error updating user preferences",
        "Failed to update user preferences",
        NOTIFICATION_MESSAGES.UserPreferences.USER__PREFERENCE_UPDATED_FAILED,
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  };

  const setTheme = async (theme: string): Promise<void> => {
    try {
      await axiosInstance.put(
        dotProp.getProperty(endpointPreferences, 'userPreferences.setTheme'),
        { theme }
      );
      notify(
        "Theme set successfully",
        "Theme set successfully",
        NOTIFICATION_MESSAGES.UserPreferences.THEME_SET_SUCCESSFULLY,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error setting theme:", error);
      notify(
        "Error setting theme",
        "Failed to set theme",
        NOTIFICATION_MESSAGES.UserPreferences.THEME_SETTING_FAILED,
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  };

  const setFontSize = async (fontSize: string): Promise<void> => {
    try {
      await axiosInstance.put(
        dotProp.getProperty(endpointPreferences, 'userPreferences.setFontSize'),
        { fontSize }
      );
    } catch (error) { 
      console.error("Error setting font size:", error);
      notify(
        "Error setting font size",
        "Failed to set font size",
        NOTIFICATION_MESSAGES.UserPreferences.FONT_SIZE_SETTING_FAILED,
        new Date(),
        NotificationTypeEnum.OperationError
      );
    }
  }

  const setIdeationPhase = async (ideationPhase: string): Promise<void> => {
    try {
      await axiosInstance.put(
        dotProp.getProperty(endpointPreferences, 'userPreferences.setIdeationPhase'),
        { ideationPhase }
      );
      notify(
        "IdeationPhaseSetSuccess",
        "Ideation phase set successfully",
        NOTIFICATION_MESSAGES.UserPreferences.IDEATION_PHASE_SET_SUCCESSFULLY,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error setting ideation phase:", error);
      notify(
        "Error setting ideation phase",
        "Failed to set ideation phase",
        NOTIFICATION_MESSAGES.UserPreferences.IDEATION_PHASE_SETTING_FAILED,
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  };

  const deleteUserPreferences = async (): Promise<void> => {
    try {
      await axiosInstance.delete(
        dotProp.getProperty(endpointPreferences, 'userPreferences.deleteUserPreferences')
      );
      notify(
        "UserPreferencesDeleteSuccessful",
        "User preferences deleted successfully",
        NOTIFICATION_MESSAGES.UserPreferences.USER_PREFERENCES_DELETED_SUCCESSFULLY,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error deleting user preferences:", error);
      notify(
        "Error deleting user preferences",
        "Failed to delete user preferences",
        NOTIFICATION_MESSAGES.UserPreferences.USER_PREFERENCES_DELETION_FAILED,
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  };


  const setBrainstormingPhase = async (brainstormingPhase: string): Promise<void> => {
    try {
      await axiosInstance.put(
        dotProp.getProperty(endpointPreferences, 'userPreferences.setBrainstormingPhase'),
        { brainstormingPhase }
      );
      notify(
        "brainistormingPhaseSetSuccess",
        "Brainstorming phase set successfully",
        NOTIFICATION_MESSAGES.UserPreferences.BRAINSTORMING_PHASE_SET_SUCCESSFULLY,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error setting brainstorming phase:", error);
      notify(
        "Error setting brainstorming phase",
        "Failed to set brainstorming phase",
        NOTIFICATION_MESSAGES.UserPreferences.BRAINSTORMING_PHASE_SETTING_FAILED,
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  };
  
  const setLaunchPhase = async (launchPhase: string): Promise<void> => {
    try {
      await axiosInstance.put(
        dotProp.getProperty(endpointPreferences, 'userPreferences.setLaunchPhase'),
        { launchPhase }
      );
      notify(
        "launchPhaseSetSuccessfully",
        "Launch phase set successfully",
        NOTIFICATION_MESSAGES.UserPreferences.LAUNCH_PHASE_SET_SUCCESSFULLY,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error setting launch phase:", error);
      notify(
        "SettingLaunchPhaseError",
        "Failed to set launch phase",
        NOTIFICATION_MESSAGES.UserPreferences.LAUNCH_PHASE_SETTING_FAILED,
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  };
  
  const setDataAnalysisPhase = async (dataAnalysisPhase: string): Promise<void> => {
    try {
      await axiosInstance.put(
        dotProp.getProperty(endpointPreferences, 'userPreferences.setDataAnalysisPhase'),
        { dataAnalysisPhase }
      );
      notify(
        "DataAnalysisPhaseSetSuccessfully",
        "Data analysis phase set successfully",
        NOTIFICATION_MESSAGES.UserPreferences.DATA_ANALYSIS_PHASE_SET_SUCCESSFULLY,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      );
    } catch (error) {
      console.error("Error setting data analysis phase:", error);
      notify(
        "settingDataAnalysisPhaseError",
        "Failed to set data analysis phase",
        NOTIFICATION_MESSAGES.UserPreferences.DATA_ANALYSIS_PHASE_SETTING_FAILED,
        new Date(),
        NotificationTypeEnum.OperationError
      );
      throw error;
    }
  };



  const saveNotificationPreferencesToBackend = async (notificationPreferences: NotificationPreferences): Promise<void> => {
    try {
      await axiosInstance.put(
        dotProp.getProperty(endpointPreferences, 'userPreferences.setNotificationPreferences'),
        { notificationPreferences }
      );

      notify(
        "NotificationPreferencesSavedSuccessfully",
        "Notification preferences saved successfully",
        NOTIFICATION_MESSAGES.UserPreferences.NOTIFICATION_PREFERENCES_SAVED_SUCCESSFULLY,
        new Date(),
        NotificationTypeEnum.OperationSuccess
      )
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      notify(
        "ErrorSavingNotificationPreferences",
        "Failed to save notification preferences",
        NOTIFICATION_MESSAGES.UserPreferences.NOTIFICATION_PREFERENCES_SAVING_FAILED,
        new Date(),
        NotificationTypeEnum.OperationError
      )
    }
  }

  // Add more functions for other user preferences operations as needed...

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
    saveNotificationPreferencesToBackend
  };
};

export default useApiUserPreferences;
