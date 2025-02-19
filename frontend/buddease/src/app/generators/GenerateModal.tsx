import React, { useState } from "react";

// Define different modal components (you can have more)
interface ChatSettingsModalProps {
  // Add specific props for ChatSettingsModal
}

const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ /* Add props */ }) => {
  // Modal content for ChatSettingsModal
  return (
    <div>
      <h2>Chat Settings</h2>
      {/* Add specific content for ChatSettingsModal */}
    </div>
  );
};

interface OtherModalProps {
  // Add specific props for OtherModal
}

const OtherModal: React.FC<OtherModalProps> = ({ /* Add props */ }) => {
  // Modal content for OtherModal
  return (
    <div>
      <h2>Other Modal</h2>
      {/* Add specific content for OtherModal */}
    </div>
  );
};





interface ModalProps {
  children: React.ReactNode;
  isOpen?: { isModalOpen: boolean; }
  closeModal: () => void;
  title: string;
  modalComponent: React.FC<any>; // Accept any React functional component as modalComponent
  onFileUpload: (files: FileList) => void; // Add file upload callback
  // Add other modal-specific props here
}

const [isModalOpen, setIsModalOpen] = useState(false);

const handleCloseModal = () => {
  // Implement the logic to close the modal here
  setIsModalOpen(false);
};

const handleFileUpload = (files: FileList) => {
  // Implement the logic to handle file upload here
  console.log("Files uploaded:", files);

  // For demonstration purposes, let's open the modal after file upload
  setIsModalOpen(true);
};

const ModalGenerator: React.FC<ModalProps> = ({
  isOpen,
  closeModal,
  modalComponent: ModalComponent,
  title,
  children,
  onFileUpload
}) => {
  // You can use state or props to control the content of the modal

  return (
    <div>
      {isOpen && (
        <div className="modal">
          <div className="modal-content">
            {/* Render the dynamic modal component */}
            <ModalComponent />
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export { ChatSettingsModal, ModalGenerator, OtherModal };

  export type { ModalProps };
