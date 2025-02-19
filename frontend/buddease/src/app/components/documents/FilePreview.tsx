// FilePreview.tsx
import  { useState } from "react";
import CustomFile from "./File";
import React from "react";

const FilePreview: React.FC = () => {
  const [file, setFile] = useState<CustomFile | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const customFile: CustomFile = {
        ...selectedFile,
        uploader: "User123",
        uploadDate: new Date(),
        downloadCount: 0,
        visibility: "public",
      };
      setFile(customFile);
    }
  };

  const renderFilePreview = () => {
    if (!file) return null;

    if (file.type.startsWith("image/")) {
      return (
        <img src={URL.createObjectURL(file)} alt={file.name} width="200" />
      );
    } else if (file.type === "application/pdf") {
      return (
        <iframe
          src={URL.createObjectURL(file)}
          width="600"
          height="400"
        ></iframe>
      );
    } else if (file.type.startsWith("text/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          document.getElementById("textPreview")!.innerText = text;
        }
      };
      reader.readAsText(file);
      return <pre id="textPreview"></pre>;
    } else {
      return <p>File preview not available</p>;
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {file && (
        <div>
          <h2>File Details</h2>
          <p>Name: {file.name}</p>
          <p>Size: {file.size} bytes</p>
          <p>Type: {file.type}</p>
          <p>Last Modified: {new Date(file.lastModified).toLocaleString()}</p>
          <p>Uploader: {file.uploader}</p>
          <p>Upload Date: {file.uploadDate.toLocaleString()}</p>
          <p>Download Count: {file.downloadCount}</p>
          <p>Visibility: {file.visibility}</p>
          {renderFilePreview()}
        </div>
      )}
    </div>
  );
};

export default FilePreview;
