// useFileUpload.tsx
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from "@/app/api/headers/HeadersConfig";
import CustomFile from "@/app/components/documents/File";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { FileLogger } from "@/app/libraries/logging/Logger";
import { generateCSRFToken } from "@/app/security/csrfTokenGenerator";
import useErrorHandling from "@/app/useErrorHandling";
import {
    NotificationType,
    useNotification,
} from '@/app/state/context/NotificationContext';
import dotProp from "dot-prop";
import { ChangeEvent, useState } from "react";
const { notify } = useNotification();
const { handleError } = useErrorHandling(); // Use useErrorHandling for error handling


type UploadResult = { error: Error } | { uploadedFile: CustomFile };



interface FileUploadProps {
  inputValue: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChanges?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const useFileUpload = ({ inputValue, handleInputChange }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<CustomFile | null>(null);

  const handleFileChanges = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setSelectedFile(selectedFile as CustomFile);
      // Call handleInputChange to update inputValue
      handleInputChange(event);
    }
  };

  const uploadFile = async (): Promise<UploadResult> => {
    if (!selectedFile) {
      handleError("No file selected for upload"); // Handle error if no file selected
      return { error: new Error("No file selected") };
    }

    try {
      // Logic to upload the file using Axios or any other method
      console.log("Uploading file:", selectedFile.name);
      // Example: Upload file using Axios
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Construct the upload file endpoint dynamically using dotProp
      const uploadEndpoint = dotProp.getProperty(endpoints, "data.uploadData");
      if (typeof uploadEndpoint === "string") {
        // Check if CSRF token exists in headersConfig, if not generate and add it
        if (!headersConfig["X-CSRF-Token"]) {
          const csrfToken = generateCSRFToken();
          headersConfig["X-CSRF-Token"] = csrfToken;
        }

        const response = await axiosInstance.post(uploadEndpoint, formData, {
          headers: headersConfig, // Use headersConfig for headers
        });

        // Log the response data for debugging purposes
        console.log("Response:", response.data);

        // You can also perform additional logic based on the response, if needed
        // For example, check response status codes or data and handle accordingly
        if (response.status === 200) {
          // Handle success
          notify(
            "uploadFileSuccess",
            "File uploaded successfully",
            NOTIFICATION_MESSAGES.Data.UPLOAD_DATA_SUCCESS,
            new Date(),
            "uploadFileSuccess" as NotificationType
          );
          // Use response.data to get the uploaded file data
          // Use response.data.data to get the uploaded file data
          // Use response.data.message to get the uploaded file message
          // Use response.data.status to get the uploaded file status
          // Use response.data.timestamp to get the uploaded file timestamp

          // Handle additional logic based on the response if needed
          // Use Axios or any other method to make the API call to upload the file
          await axiosInstance.post(uploadEndpoint, formData);
          console.log("File uploaded successfully");
        } else {
          // Handle error
          handleError("Failed to upload file");
        }
      }
      // Log to file
      FileLogger.logToFile(
        `File uploaded: ${selectedFile?.name}`,
        "file_upload_log.txt"
      );
    } catch (error) {
      handleError("Failed to upload file");
      console.error("Error uploading file:", error);
    }
    return { uploadedFile: selectedFile };
  };






    // Function to upload multiple files to storage
    // Function to upload multiple files to storage
const uploadFilesToStorage = async (files: CustomFile[]): Promise<{ uploadedFiles: CustomFile[]; error?: Error }> => {
  try {
    const uploadedFiles: CustomFile[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadEndpoint = dotProp.getProperty(endpoints, "data.uploadData");
      if (typeof uploadEndpoint === "string") {
        if (!headersConfig["X-CSRF-Token"]) {
          const csrfToken = generateCSRFToken();
          headersConfig["X-CSRF-Token"] = csrfToken;
        }

        const response = await axiosInstance.post(uploadEndpoint, formData, {
          headers: headersConfig,
        });

        console.log("Response:", response.data);

        if (response.status === 200) {
          notify(
            "uploadFileSuccess",
            "File uploaded successfully",
            NOTIFICATION_MESSAGES.Data.UPLOAD_DATA_SUCCESS,
            new Date(),
            "uploadFileSuccess" as NotificationType
          );

          uploadedFiles.push(file); // Add the uploaded file to the list
          console.log("File uploaded successfully");
        } else {
          // Handle error
          console.error("Failed to upload file:", response.data.error);
          return { uploadedFiles: [], error: new Error(response.data.error) };
        }
      }

      FileLogger.logToFile(
        `File uploaded: ${file.name}`,
        "file_upload_log.txt"
      );
    }

    return { uploadedFiles }; // Return the uploaded files
  } catch (error: any) {
    console.error("Error uploading files:", error);
    return { uploadedFiles: [], error }; // Return the error
  }
};

  

  return {
    selectedFile,
    handleFileChanges,
    uploadFile,
    uploadFilesToStorage
  };
};

export default useFileUpload;
const { 
  selectedFile,
  handleFileChanges,
  uploadFile,
  uploadFilesToStorage } = useFileUpload({
    inputValue: '',
    handleInputChange: () => { },
    handleFileChanges(event) {
      // Call handleInputChange to update inputValue
      this.handleInputChange(event);
    },
    
  })