// Update import statements as needed
import { ModalGenerator } from "@/app/generators/GenerateModal";
import useModalFunctions from "@/app/pages/dashboards/ModalFunctions";
import React from "react";
import FileUploadModal from "./FileUploadModal";

interface FileUploadModalLauncherProps {
  onCloseFileUploadModal: () => void;
}

const FileUploadModalLauncher: React.FC<FileUploadModalLauncherProps> = ({
  onCloseFileUploadModal,
}) => {
  const { isModalOpen, handleCloseModal, handleFileUpload, uploadedFiles } = useModalFunctions(); // Use useModalFunctions

  const openFileUploadModal = () => {
    // You can perform any additional logic here before opening the modal
    handleFileUpload(null); // For demonstration purposes, let's call handleFileUpload with null
  };

  const closeFileUploadModal = () => {
    // You can perform any cleanup logic here before closing the modal
    handleCloseModal();
    onCloseFileUploadModal();
  };

  return (
    <div>
      {/* Other component content */}
      <button onClick={openFileUploadModal}>Open File Upload Modal</button>

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <div>
          <h3>Uploaded Files:</h3>
          <ul>
            {uploadedFiles.map((fileName, index) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Include the modal generator where needed */}
      <ModalGenerator
        title="File Upload Modal"
        isOpen={{isModalOpen}}
        closeModal={closeFileUploadModal}
        modalComponent={FileUploadModal}
        onFileUpload={handleFileUpload}
        children={null} // Placeholder for children
        // Pass additional props to the FileUploadModal
      />
    </div>
  );
};

export default FileUploadModalLauncher;
