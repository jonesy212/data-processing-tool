// ModalFunctions.ts
import { useState } from "react";

const useModalFunctions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleCloseModal = () => {
    // Implement the logic to close the modal here
    setIsModalOpen(false);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      // Process the uploaded files (you can perform additional logic here)
      const fileNames = Array.from(files).map((file) => file.name);
      setUploadedFiles(fileNames);
      // For demonstration purposes, let's open the modal after file upload
      setIsModalOpen(true);
    }
  };

  return { isModalOpen, handleCloseModal, handleFileUpload, uploadedFiles };
};

export default useModalFunctions;
