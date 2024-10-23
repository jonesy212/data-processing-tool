// SettingsAPI.ts

import { PrivacySettings } from "../components/settings/PrivacySettings";
import axiosInstance from "./axiosInstance";

export default class SettingsAPI {
    private static API_BASE_URL = "https://example.com/api"; // Update with your API base URL

    static async savePrivacySettingsToBackend(
        selectedSettings: PrivacySettings,
        videoId: string,
        privacySettings: PrivacySettings,
        updatedSettings?: PrivacySettings,
        roomId?: string | number,
    ): Promise<void> {
        try {
            await axiosInstance.patch(`${this.API_BASE_URL}/rooms/${roomId}/privacy-settings`, {
                privacySettings: updatedSettings ?? privacySettings // Use updatedSettings if available, otherwise use privacySettings
            });
        } catch (error) {
            console.error('Error saving privacy settings to backend:', error);
            throw error;
        }
    }
}
