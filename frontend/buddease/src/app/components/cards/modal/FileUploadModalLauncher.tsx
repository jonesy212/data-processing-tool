// Update import statements as needed
import { ModalGenerator } from "@/app/generators/GenerateModal";
import React, { useState } from "react";
import FileUploadModal from "./FileUploadModal";

const FileUploadModalLauncher: React.FC = () => {
  const [isFileUploadModalOpen, setFileUploadModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const openFileUploadModal = () => {
    setFileUploadModalOpen(true);
  };

  const closeFileUploadModal = () => {
    setFileUploadModalOpen(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      // Process the uploaded files (you can perform additional logic here)
      const fileNames = Array.from(files).map((file) => file.name);
      setUploadedFiles(fileNames);
    }
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
        isOpen={isFileUploadModalOpen}
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
