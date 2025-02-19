// saveSecuritySettings.ts

import SecurityAPI from "@/app/api/SecurityAPI";
import { showToast } from "../models/display/ShowToast";

export const saveSecuritySettings = async (updatedSettings: SecuritySettings) => { 
    try {
        await SecurityAPI.updateSecuritySettings(updatedSettings);
        showToast({ content: "Security settings updated successfully" });
    } catch (error) {
        console.error("Error updating security settings:", error);
        showToast({ content: "Failed to update security settings" });
        throw error;
    }
}