// chatUtils.ts
import { ChatApi } from "@/app/api/ChatApi";
import useApiUserPreferences from "@/app/api/preferences/ApiUserPreferences";
import { getUserPreferences } from "@/app/configs/UserPreferences";
import configureCollaborationPreferences from "@/app/pages/community/configureCollaborationPreferences";
import { DocumentActions } from "@/app/tokens/DocumentActions";
import RichTextEditor from "@/documents/RichTextEditor";
import { useParams } from "next/navigation";
import { CollaborationActions } from "../../actions/CollaborationActions";
import { openNotificationPreferencesModal } from "../../cards/modal/openNotificationPreferencesModal";
import { CollaborationPreferences } from "../../interfaces/settings/CollaborationPreferences";
import { showErrorMessage, showToast } from "../../models/display/ShowToast";
import { isValidNotificationPreferences } from "../../security/validationRulesCode";
import { PrivacySettings } from "../../settings/PrivacySettings";
import { configureSecuritySettings } from "../../settings/configureSecuritySettings";
import { saveSecuritySettings } from "../../settings/saveSecuritySettings";
import {
  NotificationContextProps,
  NotificationType,
} from "../../support/NotificationContext";
import { useSecureDocumentId } from "../../utils/useSecureDocumentId";
import { useSecureUserId } from "../../utils/useSecureUserId";
import VideoAPI from "../../video/VideoAPI";
import { openPrivacySettingsMenu } from "../../video/openPrivacySettingsMenu";
import { openVideoOptionsMenu } from "../../video/openVideoOptionsMenu";
import {
  AudioOptions,
  ChatSettingsModal,
  NotificationPreferences,
  VideoOptions,
} from "./ChatSettingsModal";
import { DocumentEditingPermissions } from '../../users/Permissions'
import openAudioOptionsMenu from "./features/openAudioOptionsMenu";
import { saveToLocalStorage } from "../../hooks/useLocalStorage";
import { useContext } from "react";

type SidebarController = {
  close: () => void;
};

interface SpeechToTextEngine {
  dispose: () => void;
  // Other properties and methods
}

// Function to send a chat message
export const sendChatMessage = async (roomId: string, message: string) => {
  try {
    // Replace this with the actual API call or WebSocket logic to send a chat message
    const response = await fetch("https://example.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId, message }),
    });

    if (response.ok) {
      console.log("Message sent successfully");
    } else {
      console.error("Failed to send message");
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Function to create a rich text editor
export const createRichTextEditor = () => {
  // Replace this with the actual library or component instantiation for a rich text editor
  console.log("Rich text editor created");
  // Example: Instantiate and return the rich text editor component/library
  // Replace this with the actual code for creating a rich text editor
  const richTextEditor = RichTextEditor();
  return richTextEditor;
};

// Function to send a chat notification
export const sendChatNotification = (
  message: string,
  sendNotification: NotificationContextProps["sendNotification"]
) => {
  // Replace this with the actual logic to send a notification (e.g., using a notification library)
  console.log(`Notification sent: ${message}`);
  // Example: Use a notification library to send a notification
  return sendNotification("Notification sent: " as NotificationType);
};

// Function to get the unread message count
export const getUnreadMessageCount = async (roomId: string) => {
  try {
    // Replace this with the actual API call to get the unread message count
    const response = await fetch(
      `https://example.com/api/chat/rooms/${roomId}/unread-count`
    );

    if (response.ok) {
      const count = await response.json();
      return count;
    } else {
      console.error("Failed to get unread message count");
      return 0;
    }
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return 0;
  }
};

// Function to open the emoji picker
export const openEmojiPicker = () => {
  // Replace this with the actual library or component to open an emoji picker
  console.log("Emoji picker opened");
  // Define a variable to track the state of the emoji picker
  let isOpen = true;

  // Define a function to close the emoji picker
  const close = () => {
    isOpen = false;
    console.log("Emoji picker closed");
  };

  // Return an object with the close method
  return {
    close,
    isOpen,
  };
};

// Function to open the chat sidebar
export const openChatSidebar = (
  setIsChatSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsChatSidebarOpen(true);
  console.log("Chat sidebar opened");
};

// Function to initialize speech-to-text using the Web Speech API
export const initializeSpeechToText = () => {
  // Check if the browser supports speech recognition
  if ("webkitSpeechRecognition" in window) {
    // Create a new instance of SpeechRecognition
    const recognition = new window.webkitSpeechRecognition();

    // Set properties or event listeners if needed
    recognition.continuous = true;
    recognition.lang = "en-US";

    // Add event listeners for speech recognition events
    recognition.onstart = () => {
      console.log("Speech recognition started");
    };

    recognition.onresult = (event) => {
      // Handle speech recognition results
      const transcript = event.results[0][0].transcript;
      console.log("Speech recognition result:", transcript);
    };

    recognition.onerror = (event) => {
      // Handle speech recognition errors
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
    };

    // Start speech recognition
    recognition.start();
  } else {
    console.error("Speech recognition is not supported in this browser");
  }
};

// Function to leave the chat room
export const leaveChatRoom = async (roomId: string) => {
  try {
    // Replace this with the actual API call or WebSocket logic to leave the chat room
    const response = await fetch(
      `https://example.com/api/chat/rooms/${roomId}/leave`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      console.log(`Left chat room: ${roomId}`);
    } else {
      console.error("Failed to leave chat room");
    }
  } catch (error) {
    console.error("Error leaving chat room:", error);
  }
};

// Function to open the file upload modal
export const openFileUploadModal = (
  handleFileUpload: (files: FileList | null) => void
) => {
  // Replace this with the actual library or component to open a file upload modal
  // For demonstration purposes, let's assume you have a modal component named FileUploadModal
  // and you need to call handleFileUpload when the user uploads files
  console.log("File upload modal opened");

  // Simulate opening the file upload modal
  // This could involve showing a modal UI component or rendering a file upload form
  // For example:
  const filesInput = document.createElement("input");
  filesInput.type = "file";
  filesInput.multiple = true;
  filesInput.accept = ".pdf,.doc,.docx"; // Set accepted file types if needed
  filesInput.addEventListener("change", (event) => {
    const fileList = (event.target as HTMLInputElement).files;
    handleFileUpload(fileList);
  });
  filesInput.click();
};





// Function to open the chat settings modal
export const openChatSettingsModal = async (): Promise<ChatSettingsModal> => {
  // Code to open the modal and get user preferences
  const userPreferences: unknown = await getUserPreferences(); // Assuming getUserPreferences is an asynchronous function

  // Type guard function to check if an object conforms to the NotificationPreferences interface
  const isNotificationPreferences = (
    obj: any
  ): obj is NotificationPreferences => {
    return (
      typeof obj === "object" &&
      typeof obj.emailNotifications === "boolean" &&
      typeof obj.pushNotifications === "boolean"
      // Add additional checks for other properties if needed
    );
  };

  // Perform type assertion to ensure userPreferences is of type NotificationPreferences
  if (!isNotificationPreferences(userPreferences)) {
    throw new Error("Invalid notification preferences");
  }

  const modalContainer = document.createElement("div");
  modalContainer.style.position = "fixed";
  modalContainer.style.top = "0";
  modalContainer.style.left = "0";
  modalContainer.style.width = "100%";
  modalContainer.style.height = "100%";
  modalContainer.style.background = "rgba(0, 0, 0, 0.5)";
  modalContainer.style.display = "flex";
  modalContainer.style.alignItems = "center";
  modalContainer.style.justifyContent = "center";

  const modalContent = document.createElement("div");
  modalContent.style.background = "#fff";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "8px";

  modalContent.innerHTML = `
        <h3>Chat Settings</h3>
        <p>Add your chat settings form or content here</p>
        <button id="closeModalBtn">Close</button>
      `;

  const closeModalBtn = modalContent.querySelector("#closeModalBtn");
  closeModalBtn?.addEventListener("click", () => {
    document.body.removeChild(modalContainer);
  });

  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  console.log("Chat settings modal opened");

  return {
    isOpen: () => true,
  
    setNotificationPreferences: async (
      notificationPreferences: NotificationPreferences
    ) => {
      try {
        // Open a modal or form where users can set their notification preferences
        const userPreferences = await openNotificationPreferencesModal();
    
        // Ensure that the data retrieved is of type NotificationPreferences
        if (!isValidNotificationPreferences(userPreferences)) {
          throw new Error("Invalid notification preferences data");
        }
    
        // Save the notification preferences to localStorage
        saveToLocalStorage<NotificationPreferences>(
          "notificationPreferences",
          userPreferences
        );
    
        // Display a success message to indicate that the preferences have been saved
        showToast({ content: "Notification preferences saved" });
      } catch (error) {
        // Handle errors if saving fails
        showErrorMessage(
          "Failed to save notification preferences. Please try again later."
        );
        console.error("Error saving notification preferences:", error);
      }
    },
    
    setAudioOptions: async (
      selectedOptions: AudioOptions,
      audioOptions: AudioOptions,
      roomId: string
    ): Promise<void> => {
      try {
        // Provide a dropdown or toggle buttons for users to select audio options
        const selectedOptions = await openAudioOptionsMenu(roomId);
    
        // Save the selected audio options to localStorage
        saveToLocalStorage<AudioOptions>("audioOptions", selectedOptions!);
    
        // Display a success message to indicate that the options have been saved
        showToast({ content: "Audio options saved successfully!" });
      } catch (error) {
        // Handle errors if saving fails
        showErrorMessage(
          "Failed to save audio options. Please try again later."
        );
        console.error("Error saving audio options:", error);
      }
    },
    
    //

    setVideoOptions: async (
      selectedOptions: VideoOptions | boolean,
      videoOptions: VideoOptions,
      roomId: string
    ): Promise<void> => {
      try {
        // Provide a modal or form where users can set their video options
        const selectedOptions = await openVideoOptionsMenu();

        // Save the selected video options to localStorage
        if (selectedOptions !== null && typeof selectedOptions === "object") {
          saveToLocalStorage<VideoOptions>("videoOptions", selectedOptions);
        } else if (typeof selectedOptions === "boolean") {
          saveToLocalStorage<boolean>("videoEnabled", selectedOptions);
        }

        // Display a success message to indicate that the options have been saved
        showToast({ content: "Video options saved successfully!" });
      } catch (error) {
        // Handle errors if saving fails
        showErrorMessage(
          "Failed to save video options. Please try again later."
        );
        console.error("Error saving video options:", error);
      }
    },
    
    setPrivacySettings: async (
      videoId: string,
      initialSelectedSettings: PrivacySettings,
      privacySettings: PrivacySettings
    ) => {
      try {
        // Provide a modal or form where users can set their privacy settings
        const updatedSelectedSettings = await openPrivacySettingsMenu(
          videoId,
          initialSelectedSettings,
          privacySettings
        );
    
        if (updatedSelectedSettings) {
          // Save the updated privacy settings to localStorage
          saveToLocalStorage<PrivacySettings>(
            "privacySettings",
            updatedSelectedSettings
          );
    
          // Display a success message to indicate that the settings have been saved
          showToast({ content: "Privacy settings saved successfully!" });
        }
      } catch (error) {
        // Handle errors if saving fails
        showErrorMessage(
          "Failed to save privacy settings. Please try again later."
        );
        console.error("Error saving privacy settings:", error);
      }
    },


    setSecuritySettings: async (securitySettings: SecuritySettings) => {
      try {
        if (securitySettings) {
          // Provide a UI where users can configure their security settings
          const configuredSettings = await configureSecuritySettings(
            securitySettings
          ) as SecuritySettings;

          // Save the configured settings to the backend or local storage
          await saveSecuritySettings(configuredSettings);

          // Display a success message to indicate that the settings have been saved
          showToast({ content: "Security settings saved successfully!" });
        } else {
          showErrorMessage(
            "Security settings are undefined. Please provide valid settings."
          );
        }
      } catch (error) {
        // Handle errors if saving fails
        showErrorMessage(
          "Failed to save security settings. Please try again later."
        );
        console.error("Error saving security settings:", error);
      }
    },

    setDocumentEditingPermissions: async (
      permissions: DocumentEditingPermissions[]
    ) => {
      const userId = useSecureUserId()!.toString();
      const id = parseInt(useSecureDocumentId()!, 10);
      try {
        // Provide a UI where users can set their document editing permissions
        const selectedPermissions = {
          id,
          userId,
          permissions,
        };

        // Save the selected permissions to the backend or local storage
        DocumentActions.saveDocumentEditingPermissions(selectedPermissions);

        // Display a success message to indicate that the permissions have been saved
        showToast({
          content: "Document editing permissions saved successfully!",
        });
      } catch (error) {
        // Handle errors if saving fails
        showErrorMessage(
          "Failed to save document editing permissions. Please try again later."
        );
        console.error("Error saving document editing permissions:", error);
      }
    },

    setCollaborationPreferences: async (
      preferences: CollaborationPreferences
    ) => {
      try {
        // Provide a UI where users can configure their collaboration preferences
        const configuredPreferences = await configureCollaborationPreferences();

        // Save the configured preferences to the backend or local storage
        CollaborationActions.saveCollaborationPreferences(
          configuredPreferences
        );

        // Display a success message to indicate that the preferences have been saved
        showToast({ content: "Collaboration preferences saved successfully!" });
      } catch (error) {
        // Handle errors if saving fails
        showErrorMessage(
          "Failed to save collaboration preferences. Please try again later."
        );
        console.error("Error saving collaboration preferences:", error);
      }
    },

    close: () => {
      document.body.removeChild(modalContainer);
    },
  };
};

export type { SidebarController, SpeechToTextEngine };
