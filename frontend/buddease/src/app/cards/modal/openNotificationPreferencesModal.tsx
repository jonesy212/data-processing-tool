import { ChatSettingsModal, ModalGenerator } from "@/app/generators/GenerateModal";
import React, { useState } from "react";
// import { ModalGenerator, ModalProps, ChatSettingsModal } from "./ModalComponents"; // Import the modal components

const openNotificationPreferencesModal = async () => {
  return new Promise((resolve, reject) => {
    // Define state to manage modal visibility
    const [isModalOpen, setIsModalOpen] = useState(true);

    // Handler for closing the modal without saving
    const handleCloseModal = () => {
      reject(new Error("User cancelled")); // Reject the promise if the user cancels
      setIsModalOpen(false); // Close the modal
    };

    // Handler for saving user preferences
    const handleSavePreferences = () => {
      // Here, you can collect the user preferences from the form fields or modal content
      // For simplicity, let's assume userPreferences is an object containing the preferences
      // You might need to adjust this based on your actual implementation
      const userPreferences = {}; // Get user preferences from the form or modal content
      resolve(userPreferences);
      setIsModalOpen(false); // Close the modal
    };

    return (
      <ModalGenerator
        isOpen={{isModalOpen}}
        closeModal={handleCloseModal}
        modalComponent={ChatSettingsModal} // Use the ChatSettingsModal component
        title="Notification Preferences"
        onFileUpload={(files: FileList) => {
          // Handle file upload if needed
        }}
      >
        {/* Optional children content */}
        <h2>Notification Preferences</h2>
        {/* Your form fields here */}
        <button onClick={handleSavePreferences}>Save Preferences</button>
        <button onClick={handleCloseModal}>Cancel</button>
      </ModalGenerator>
    );
  });
};

export { openNotificationPreferencesModal };