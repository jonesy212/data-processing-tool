// configureSecuritySettings.ts

import SecurityAPI from "@/apwp/api/SecurityAPI";
import { isEqual } from "lodash";
import { openSecuritySettingsModal } from "../cards/modal/openSecuritySettingsModal";
 
const configureSecuritySettings = async (securitySettings: SecuritySettings): Promise<
  SecuritySettings | undefined
> => {
  try {
    // Get current security settings
    const currentSettings = await SecurityAPI.getSecuritySettings();

      const updatedSettings = {...currentSettings};
    // Open security settings modal
    const newSettings = await openSecuritySettingsModal(currentSettings,updatedSettings);

    // Check if newSettings is of type SecuritySettings or undefined
    if (newSettings === undefined || isSecuritySettings(newSettings)) {
      // Update security settings if changed
      if (!isEqual(currentSettings, updatedSettings)) {
        await SecurityAPI.updateSecuritySettings(updatedSettings);
      }
      return updatedSettings;
    } else {
      console.error("Invalid security settings data:", updatedSettings);
      return undefined;
    }
  } catch (error) {
    console.error("Error updating security settings:", error);
    throw error;
  }
};


// Helper function to check if the value is of type SecuritySettings
function isSecuritySettings(value: any): value is SecuritySettings {
  return (
    typeof value === "object" &&
    value !== null &&
    "enableTwoFactorAuth" in value &&
    "passwordPolicy" in value
    // Check for other properties of SecuritySettings
  );
}

export { configureSecuritySettings };
