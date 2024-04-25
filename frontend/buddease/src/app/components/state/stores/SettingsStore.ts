// SettingsStore.ts
import {
    NotificationTypeEnum,
    useNotification,
} from "@/app/components/support/NotificationContext";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import useErrorHandling from "../../hooks/useErrorHandling";
import axiosInstance from "../../security/csrfToken";

// Define the interface for different types of settings
export interface Settings {
    id: string;
    filter: (key: keyof Settings) => void;
    appName: string;
  // Define common properties and methods for settings if needed
}


// Add other setting interfaces as needed

// Define the store interface
export interface SettingManagerStore {
  // Define methods for handling different types of settings
  fetchSettings: () => void;
  updateSettings: (settings: Settings) => void;
  deleteSettings: (settingsId: string) => void;

  // Add more methods for other setting types as needed
}

// Define the setting manager store
const useSettingManagerStore = (): SettingManagerStore => {
    const { error, handleError, clearError, parseDataWithErrorHandling } =
        useErrorHandling();

    const [settings, setSettings] = useState<Settings | null>(null); // Store settings state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { notify } = useNotification();

    const fetchSettings = async () => {
        setIsLoading(true);
        clearError(); // Clear any existing errors
        try {
            // Fetch settings from the server using Axios
            const response = await axiosInstance.get("/settings");
            const data = response.data;
            // Set the fetched settings to the state
            setSettings(data);
        } catch (error: any) {
            handleError("fetching settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSettings = async (updatedSettings: Settings) => {
        try {
            // Update settings on the server using Axios
            await axiosInstance.put("/settings", updatedSettings);
            // Update the settings state with the updated settings
            setSettings(updatedSettings);
            notify(
                "updateSettingsSuccess",
                "Settings updated successfully",
                "Settings updated",
                new Date(),
                NotificationTypeEnum.OperationSuccess
            );
        } catch (error: any) {
            handleError("updating settings", error);
        }
    };const deleteSettings = async (settingsId: string) => {
        try {
            // Delete settings on the server using Axios
            await axiosInstance.delete(`/settings/${settingsId}`);
            // Check if the deleted setting matches the current settings state
            if (settings && settings.id === settingsId) {
                // If the deleted setting matches, set the settings state to null
                setSettings(null);
            }
        } catch (error: any) {
            handleError("deleting settings", error);
        }
    }
    

  const store: SettingManagerStore = makeAutoObservable({
    settings,
    isLoading,
    fetchSettings,
    updateSettings,
    deleteSettings,
  });

  return store;
};

export default useSettingManagerStore;
