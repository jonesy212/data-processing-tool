import SettingsAPI from "@/core/api/SettingsAPI";
import VideoAPI from "@/core/api/videos/VideoAPI";
import { displayPrivacySettingsModal } from "@/core/cards/modal/displayPrivacySettingsModal";
import { showToast } from "@/core/models/display/ShowToast";
import { PrivacySettings } from "@/core/settings/PrivacySettings";


// Define a type guard function to check if an object conforms to PrivacySettings interface
function isPrivacySettings(obj: any): obj is PrivacySettings {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "hidePersonalInfo" in obj &&
      "enablePrivacyMode" in obj &&
      "enableTwoFactorAuth" in obj &&
      "restrictVisibilityToContacts" in obj &&
      "restrictFriendRequests" in obj &&
      "hideOnlineStatus" in obj &&
      "showLastSeenTimestamp" in obj &&
      "allowTaggingInPosts" in obj &&
      "enableLocationPrivacy" in obj &&
      "hideVisitedProfiles" in obj &&
      "restrictContentSharing" in obj &&
      "enableIncognitoMode" in obj
    );
  }

  export const openPrivacySettingsMenu = async (
    videoId: string,
    selectedSettings: PrivacySettings,
    privacySettings: PrivacySettings
    // updatedSettings: PrivacySettings
  ) => {
    try {
      // Get current user privacy settings
      const currentSettingsFromAPI = await VideoAPI.getPrivacySettings(videoId);
  
      // Map the current settings to PrivacySettings interface
      const currentSettings: PrivacySettings = {
        isDataSharingEnabled: currentSettingsFromAPI?.currentSettingsFromAPI ?? false,
        dataSharing: currentSettingsFromAPI?.currentSettingsFromAPI ?? false,
        thirdPartyTracking: currentSettingsFromAPI?.currentSettingsFromAPI ?? false,
       
        hidePersonalInfo: currentSettingsFromAPI?.hidePersonalInfo ?? false,
        enablePrivacyMode: currentSettingsFromAPI?.enablePrivacyMode ?? false,
        enableTwoFactorAuth: currentSettingsFromAPI?.enableTwoFactorAuth ?? false,
        restrictVisibilityToContacts:
          currentSettingsFromAPI?.restrictVisibilityToContacts ?? false,
        restrictFriendRequests:
          currentSettingsFromAPI?.restrictFriendRequests ?? false,
        hideOnlineStatus: currentSettingsFromAPI?.hideOnlineStatus ?? false,
        showLastSeenTimestamp:
          currentSettingsFromAPI?.showLastSeenTimestamp ?? false,
        allowTaggingInPosts: currentSettingsFromAPI?.allowTaggingInPosts ?? false,
        enableLocationPrivacy:
          currentSettingsFromAPI?.enableLocationPrivacy ?? false,
        hideVisitedProfiles: currentSettingsFromAPI?.hideVisitedProfiles ?? false,
        restrictContentSharing:
          currentSettingsFromAPI?.restrictContentSharing ?? false,
        enableIncognitoMode: currentSettingsFromAPI?.enableIncognitoMode ?? false,
      };
  
      // Display privacy settings modal
      const updatedSettingsFromModal = await displayPrivacySettingsModal(
        currentSettings,
        selectedSettings
      );
  
      // Check if the updated settings from the modal conform to PrivacySettings interface
      if (isPrivacySettings(updatedSettingsFromModal)) {
        // Save updated settings using updatedSettings
        await SettingsAPI.savePrivacySettingsToBackend(
          selectedSettings,
          videoId,
          updatedSettingsFromModal
        );
  
        // Show success message
        showToast({ content: "Privacy settings updated successfully!" });
  
        return updatedSettingsFromModal;
      } else {
        // Handle case where updatedSettingsFromModal does not conform to PrivacySettings interface
        console.error("Error: Updated settings from modal do not conform to PrivacySettings interface");
        showToast({
          content: "Failed to update privacy settings. Please try again later.",
        });
        return null;
      }
    } catch (error) {
      console.error("Error opening privacy settings menu:", error);
      showToast({
        content: "Failed to open privacy settings menu. Please try again later.",
      });
      return null;
    }
  };