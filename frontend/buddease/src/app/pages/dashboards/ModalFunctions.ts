// ModalFunctions.ts
import { useState } from "react";

interface ModalFunctions {
  isModalOpen: boolean;
  handleCloseModal: () => void;
  handleFileUpload: (files: FileList | null) => void;
  uploadedFiles: string[];
  successMessage: string | null;
  errorMessage: string | null;
  clearMessages: () => void;
  setSuccessMessage: (message: string | null) => void; 
  setErrorMessage: (message: string | null) => void; 
  setIsModalOpen: (isOpen: boolean) => void;
  setModalContent: (content: JSX.Element) => void;
}



const useModalFunctions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null); // Step 1: Define state variable

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
      // Show success message
      setSuccessMessage("Files uploaded successfully.");
    } else {
      // Show error message if no files selected
      setErrorMessage("Please select files to upload.");
    }
  };

  const clearMessages = () => {
    // Clear success and error messages
    setSuccessMessage(null);
    setErrorMessage(null);
  };


    // Step 2: Create function to set modal content
    const setContent = (content: JSX.Element) => {
      setModalContent(content);
      setIsModalOpen(true); // Optionally open the modal when setting content
    };
  

  return {
    isModalOpen,
    handleCloseModal,
    handleFileUpload,
    uploadedFiles,
    successMessage,
    errorMessage,
    clearMessages,
    setSuccessMessage,
    setErrorMessage,  
    setIsModalOpen,
    setModalContent: setContent,
  };

};

export default useModalFunctions;
