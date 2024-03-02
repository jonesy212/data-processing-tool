// useFileUpload.tsx
import { endpoints } from '@/app/api/ApiEndpoints';
import { ChangeEvent, useState } from 'react';
import axiosInstance from '../../security/csrfToken';

const useFileUpload = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        setSelectedFile(selectedFile);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      console.error('No file selected for upload');
      return;
    }
  
    try {
      // Logic to upload the file using Axios or any other method
      console.log('Uploading file:', selectedFile.name);
      // Example: Upload file using Axios
      const formData = new FormData();
      formData.append('file', selectedFile);
  
      // Construct the upload file endpoint dynamically using endpoints.data.uploadData
      const uploadEndpoint = endpoints.data.uploadData;
  
      const response = await axiosInstance.post(
        'YOUR_UPLOAD_ENDPOINT', // Replace 'YOUR_UPLOAD_ENDPOINT' with your actual upload endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Include authorization token
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      notify('Success', 'File uploaded successfully', 'success');
      // Handle additional logic based on the response if needed
      // Use Axios or any other method to make the API call to upload the file
      // await axiosInstance.post(uploadEndpoint, formData);
  
      console.log('File uploaded successfully');
    } catch (error) {
      notify('Error', 'Failed to upload file', 'error');
      console.error('Error uploading file:', error);
    }
  };
  return {
    selectedFile,
    handleFileChange,
    uploadFile,
  };
};

export default useFileUpload;
