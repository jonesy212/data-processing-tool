// FileImportData.tsx
import { useState } from "react";
import CustomFile from "./File";
import FileSelect from './FileSelect';

function FileImportData() {
  const [selectedFile, setSelectedFile] = useState<CustomFile>();
  const [uploadStatus, setUploadStatus] = useState("idle"); // 'idle', 'uploading', 'success', 'error'

  const handleFileChange = (file: CustomFile | undefined) => {
    setSelectedFile(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      return;
    }

    setUploadStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload-data", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Use the processed data from the server here (e.g., update RealtimeData)
        setUploadStatus("success");
        setSelectedFile(undefined); // Clear file selection
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("error");
    } finally {
      setUploadStatus("idle");
    }
  };

  return (
    <div>
      <FileSelect onChange={handleFileChange} />
      <button onClick={handleFileUpload} disabled={uploadStatus !== "idle"}>
        {uploadStatus === "uploading" ? "Uploading..." : "Import Data"}
      </button>
      {uploadStatus === "success" && <p>Data imported successfully!</p>}
      {uploadStatus === "error" && <p>Error importing data!</p>}
    </div>
  );
}


export default FileImportData;