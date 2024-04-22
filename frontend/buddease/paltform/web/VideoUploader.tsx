// VideoUploader.tsx
import { useState } from 'react';

const VideoUploader = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Perform upload logic here, e.g., using fetch or axios
      // Assume `onUpload` is a function passed from the parent component to handle the uploaded file
      onUpload(selectedFile);
      // Optionally, you can clear the selected file after uploading
      setSelectedFile(null);
    }
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default VideoUploader;
