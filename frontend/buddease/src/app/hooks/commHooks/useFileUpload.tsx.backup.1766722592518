// useFileUpload.tsx
import axiosInstance from '@/app/api/csrfToken';
import { endpoints } from '@/app/api/endpointConfigurations';
import headersConfig from "@/app/api/headers/HeadersConfig";
import CustomFile from "@/app//documents/File";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import { FileLogger } from "@/app/logging/Logger";
import { generateCSRFToken } from "@/app/server/security/csrfTokenGenerator";
import { useErrorHandling } from "@/app/hooks/useErrorHandling";
import { useNotification } from '@/app/state/context/NotificationContext';
import { NotificationType, NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { ChangeEvent, useState } from "react";

// Don't call hooks conditionally or outside of components
// const { notify } = useNotification();
// const { handleError } = useErrorHandling();

type UploadResult = { error: Error } | { uploadedFile: CustomFile<T> };

interface FileUploadProps {
  inputValue: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChanges?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

  const useFileUpload = <T extends BaseDataEntity = BaseDataEntity>({ 
    inputValue,
    handleInputChange
  }: FileUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<CustomFile<T> | null>(null);
    const { notify } = useNotification(); // Move hook inside component
    const { handleError } = useErrorHandling(); // Move hook inside component

    const handleFileChanges = (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (selectedFile) {
        setSelectedFile(selectedFile as CustomFile<T>);
        handleInputChange(event);
      }
    };

  const uploadFile = async (): Promise<UploadResult> => {
    if (!selectedFile) {
      handleError("No file selected for upload");
      return { error: new Error("No file selected") };
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Get the upload endpoint
      const uploadEndpoint = endpoints?.data?.uploadData;
      if (!uploadEndpoint) {
        throw new Error("Upload endpoint not configured");
      }

      // Generate CSRF token if needed
      if (!headersConfig["X-CSRF-Token"]) {
        const csrfToken = generateCSRFToken();
        headersConfig["X-CSRF-Token"] = csrfToken;
      }

      const response = await axiosInstance.post(uploadEndpoint, formData, {
        headers: headersConfig,
      });

      console.log("Response:", response.data);

      if (response.status === 200) {
        // CORRECT: Pass data according to NotificationDataPayload interface
        notify({
          id: "uploadFileSuccess",
          message: NOTIFICATION_MESSAGES.Data.UPLOAD_DATA_SUCCESS,
          data: {
            // Use one of the properties defined in NotificationDataPayload
            extra: { fileName: selectedFile.name }, // Put custom data in 'extra'
            entityId: response.data.id || selectedFile.name, // Use entityId if you have one
            entityType: "file", // Specify the entity type
            // Or use count if appropriate
            // count: 1
          } as NotificationDataPayload<{ fileName: string }>,
          date: new Date(),
          type: "success" as NotificationType
        });

        FileLogger.logToFile(
          `File uploaded: ${selectedFile.name}`,
          "file_upload_log.txt"
        );

        return { uploadedFile: selectedFile };
      } else {
        handleError("Failed to upload file");
        return { error: new Error("Failed to upload file") };
      }
    } catch (error) {
      // You can also notify about the error
      if (notify) {
        notify({
          id: "uploadFileError",
          message: NOTIFICATION_MESSAGES.Data.UPLOAD_DATA_ERROR || "Failed to upload file",
          data: {
            originalError: error instanceof Error ? error.message : String(error),
            entityType: "file",
            extra: { fileName: selectedFile?.name }
          } as NotificationDataPayload<{ fileName: string }>,
          date: new Date(),
          type: "error" as NotificationType
        });
      }
      
      handleError("Failed to upload file");
      console.error("Error uploading file:", error);
      return { error: error as Error };
    }
  };

  const uploadFilesToStorage = async (files: CustomFile<T>[]): Promise<{ uploadedFiles: CustomFile<T>[]; error?: Error }> => {
    try {
      const uploadedFiles: CustomFile<T>[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadEndpoint = endpoints?.data?.uploadData;
        if (!uploadEndpoint) {
          throw new Error("Upload endpoint not configured");
        }

        if (!headersConfig["X-CSRF-Token"]) {
          const csrfToken = generateCSRFToken();
          headersConfig["X-CSRF-Token"] = csrfToken;
        }

        const response = await axiosInstance.post(uploadEndpoint, formData, {
          headers: headersConfig,
        });

        console.log("Response:", response.data);

        if (response.status === 200) {
          // CORRECT: Pass a single object to notify
          notify({
            id: "uploadFileSuccess",
            message: NOTIFICATION_MESSAGES.Data.UPLOAD_DATA_SUCCESS,
            data: { fileName: file.name },
            date: new Date(),
            type: "success" as NotificationType
          });

          uploadedFiles.push(file);
        } else {
          console.error("Failed to upload file:", response.data.error);
          return { uploadedFiles: [], error: new Error(response.data.error) };
        }

        FileLogger.logToFile(
          `File uploaded: ${file.name}`,
          "file_upload_log.txt"
        );
      }

      return { uploadedFiles };
    } catch (error: any) {
      console.error("Error uploading files:", error);
      return { uploadedFiles: [], error };
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