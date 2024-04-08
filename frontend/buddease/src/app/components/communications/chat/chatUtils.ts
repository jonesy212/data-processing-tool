// chatUtils.ts
import RichTextEditor from "@/documents/RichTextEditor";
import {
  NotificationContextProps,
  NotificationType,
} from "../../support/NotificationContext";
import { ChatSettingsModal } from "./ChatSettingsModal";

// Function to send a chat message
export const sendChatMessage = async (message: string) => {
  try {
    // Replace this with the actual API call or WebSocket logic to send a chat message
    const response = await fetch("https://example.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
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
};

// Function to open the chat sidebar
export const openChatSidebar = () => {
  // Replace this with the actual logic to open the chat sidebar (e.g., using a state management library)
  console.log("Chat sidebar opened");
};

// Function to initialize speech-to-text
export const initializeSpeechToText = () => {
  // Replace this with the actual library or component for initializing speech-to-text
  console.log("Speech-to-text initialized");
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
export const openFileUploadModal = () => {
  // Replace this with the actual library or component to open a file upload modal
  console.log("File upload modal opened");
};

// chatUtils.ts

// Function to open the chat settings modal
export const openChatSettingsModal = (): ChatSettingsModal => {
  // Replace this with the actual logic to open a chat settings modal
  // You might use a state management library or a modal component
  // Ensure to handle the modal state and UI interactions appropriately

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

  // Add your modal content, such as form fields, buttons, etc.
  modalContent.innerHTML = `
    <h3>Chat Settings</h3>
    <p>Add your chat settings form or content here</p>
    <button id="closeModalBtn">Close</button>
  `;

  // Handle close button click
  const closeModalBtn = modalContent.querySelector("#closeModalBtn");
  closeModalBtn?.addEventListener("click", () => {
    document.body.removeChild(modalContainer);
  });

  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  console.log("Chat settings modal opened");

  return {
    isOpen: () => true,
    setNotificationPreferences: () => {
      // Implement notification preferences logic
    },
    setAudioOptions: () => {
      // Implement audio options logic
    },
    setVideoOptions: () => {
      // Implement video options logic
    },
    setPrivacySettings: () => {
      // Implement privacy settings logic
    },
    setSecuritySettings: () => {
      // Implement security settings logic
    },
    close: () => {
      document.body.removeChild(modalContainer);
    },
  };
};
