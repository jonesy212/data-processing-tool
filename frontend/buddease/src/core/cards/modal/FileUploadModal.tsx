// FileUploadModal.tsx
import React, { useRef } from "react";


interface FileUploadModalProps {
  onFileUpload: (files: FileList) => void;
  close?: () => void;
  // Add specific props for FileUploadModal
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ onFileUpload }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = () => {
    // Check if the file input ref is available
    if (fileInputRef.current && fileInputRef.current.files) {
      // Call the onFileUpload callback with the selected files
      onFileUpload(fileInputRef.current.files);
    }
  };

  return (
    <div>
      <h2>File Upload Modal</h2>
      {/* Add specific content for FileUploadModal */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} />
    </div>
  );
};

export default FileUploadModal;
export type { FileUploadModalProps };
