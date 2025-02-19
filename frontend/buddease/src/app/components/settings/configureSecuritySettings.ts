import SecurityAPI from "@/app/api/SecurityAPI";
import { isEqual } from "lodash";
import { openSecuritySettingsModal } from "../cards/modal/openSecuritySettingsModal";

const configureSecuritySettings = async (securitySettings: SecuritySettings): Promise<
  SecuritySettings | undefined
> => {
  try {
    // Open security settings modal with the passed securitySettings
    const newSettings = await openSecuritySettingsModal(securitySettings, securitySettings);

    // Check if newSettings is of type SecuritySettings or undefined
    if (newSettings === undefined || isSecuritySettings(newSettings)) {
      // Update security settings if changed
      if (!isEqual(securitySettings, newSettings)) {
        await SecurityAPI.updateSecuritySettings(newSettings!);
      }
      return newSettings;
    } else {
      console.error("Invalid security settings data:", newSettings);
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
    "passwordPolicy" in value &&
    // Check for other properties of SecuritySettings
    "accountLockoutThreshold" in value &&
    "sessionTimeout" in value
  );
}

export { configureSecuritySettings };
