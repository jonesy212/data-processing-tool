import { NotificationTypeEnum } from '@/app/components/support/NotificationContext';
import { useNotification } from "../../components/support/NotificationContext"; // Update import
import NOTIFICATION_MESSAGES from "../../components/support/NotificationMessages";
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
};




// Define the asynchronous functions for user preferences operations
const useApiUserPreferences = (): ApiUserPreferences => {
  const { notify } = useNotification(); // Use the useNotification hook

  const fetchUserPreferences = async (): Promise<UserPreferences> => {
    try {
      const response = await axiosInstance.get(
        endpointPreferences.userPreferences.fetchUserPreferences
      );
      return response.data.preferences;
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      notify("Error fetching user preferences", NOTIFICATION_MESSAGES.Preferences.FETCH_PREFERENCES_ERROR, new Date, NotificationTypeEnum.OperationError);

      throw error;
    }
  };




  const updateUserPreferences = async (
    updatedPreferences: UserPreferences
  ): Promise<void> => {
    try {
      await axiosInstance.put(
        endpointPreferences.userPreferences.updateUserPreferences,
        updatedPreferences
      );
      notify("User preferences updated successfully",  NOTIFICATION_MESSAGES.Preferences.UPDATE_PREFERENCES_SUCCESS, new Date, NotificationTypeEnum.OperationSuccess)
    } catch (error) {
      console.error("Error updating user preferences:", error);
      notify("Error updating user preferences", NOTIFICATION_MESSAGES.Preferences.UPDATE_PREFERENCES_ERROR, new Date, NotificationTypeEnum.OperationError);
      throw error;
    }
  };

  const setTheme = async (theme: string): Promise<void> => {
    try {
      await axiosInstance.put(
        endpointPreferences.userPreferences.setTheme,
        { theme }
      );
      notify("Theme set successfully", NOTIFICATION_MESSAGES.Theme.FETCH_THEME_SUCCESS, new Date, NotificationTypeEnum.OperationSuccess)
    } catch (error) {
      console.error("Error setting theme:", error);
      notify("Error setting theme", NOTIFICATION_MESSAGES.Theme.FETCH_THEME_SUCCESS, new Date, NotificationTypeEnum.OperationError);
      throw error;
    }
  };

  const setIdeationPhase = async (ideationPhase: string): Promise<void> => {
    try {
      await axiosInstance.put(
        endpointPreferences.userPreferences.setIdeationPhase,
        { ideationPhase }
      );
      notify("Ideation phase set successfully",  NOTIFICATION_MESSAGES.Brainstorming.DEFAULT_IdeationPhase_SUCCESS, new Date, NotificationTypeEnum.OperationSuccess)
    } catch (error) {
      console.error("Error setting ideation phase:", error);
      notify("Error setting ideation phase", NOTIFICATION_MESSAGES.Brainstorming.DEFAULT_IdeationPhase_FAILURE, new Date, NotificationTypeEnum.OperationError); // Notify error
      throw error;
    }
  };

  const deleteUserPreferences = async (): Promise<void> => {
    try {
      await axiosInstance.delete(endpointPreferences.userPreferences.deleteUserPreferences);
      notify("User preferences deleted successfully",  NOTIFICATION_MESSAGES.Preferences.SUCCESS_REMOVING_PREFERENCES, new Date, NotificationTypeEnum.OperationSuccess); // Notify succs
    } catch (error) {
      console.error("Error deleting user preferences:", error);
      notify("Error deleting user preferences",  NOTIFICATION_MESSAGES.Preferences.ERROR_REMOVING_PREFERENCES, new Date, NotificationTypeEnum.OperationError); // Notify success
      throw error;
    }
  };


  const setBrainstormingPhase = async (brainstormingPhase: string): Promise<void> => {
    try {
      await axiosInstance.put(
        endpointPreferences.userPreferences.setBrainstormingPhase,
        { brainstormingPhase }
      );
      notify("Brainstorming phase set successfully", NOTIFICATION_MESSAGES.Brainstorming.SET_BRAINSTORMING_PHASE_SUCCESS, new Date(), NotificationTypeEnum.OperationSuccess)
    } catch (error) {
      console.error("Error setting brainstorming phase:", error);
      notify("Error setting brainstorming phase", NOTIFICATION_MESSAGES.Brainstorming.SET_BRAINSTORMING_PHASE_ERROR, new Date(), NotificationTypeEnum.OperationError);
      throw error;
    }
  };
  
  const setLaunchPhase = async (launchPhase: string): Promise<void> => {
    try {
      await axiosInstance.put(
        endpointPreferences.userPreferences.setLaunchPhase,
        { launchPhase }
      );
      notify("Launch phase set successfully", NOTIFICATION_MESSAGES.Launch.SET_LAUNCH_PHASE_SUCCESS, new Date(), NotificationTypeEnum.OperationSuccess)
    } catch (error) {
      console.error("Error setting launch phase:", error);
      notify("Error setting launch phase", NOTIFICATION_MESSAGES.Launch.SET_LAUNCH_PHASE_ERROR, new Date(), NotificationTypeEnum.OperationError);
      throw error;
    }
  };
  
  const setDataAnalysisPhase = async (dataAnalysisPhase: string): Promise<void> => {
    try {
      await axiosInstance.put(
        endpointPreferences.userPreferences.setDataAnalysisPhase,
        { dataAnalysisPhase }
      );
      notify("Data analysis phase set successfully", NOTIFICATION_MESSAGES.DataAnalysis.SET_DATA_ANALYSIS_PHASE_SUCCESS, new Date(), NotificationTypeEnum.OperationSuccess)
    } catch (error) {
      console.error("Error setting data analysis phase:", error);
      notify("Error setting data analysis phase", NOTIFICATION_MESSAGES.DataAnalysis.SET_DATA_ANALYSIS_PHASE_ERROR, new Date(), NotificationTypeEnum.OperationError);
      throw error;
    }
  };

  // Add more functions for other user preferences operations as needed...

  return {
    fetchUserPreferences,
    updateUserPreferences,
    setTheme,
    setIdeationPhase,
    deleteUserPreferences,
    setBrainstormingPhase,
    setLaunchPhase,
    setDataAnalysisPhase,
  };
};

export default useApiUserPreferences;
