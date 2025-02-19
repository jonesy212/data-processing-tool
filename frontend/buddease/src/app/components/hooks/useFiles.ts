// useFiles.ts
import { useState } from "react";

// Define the useFiles hook
const useFiles = () => {
  // State to store uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null);

  // Function to handle file upload
  const handleFileUpload = (files: FileList | null) => {
    setUploadedFiles(files);
  };

  // Return the uploaded files and the file upload handler
  return { files: uploadedFiles, handleFileUpload };
};

export default useFiles;
