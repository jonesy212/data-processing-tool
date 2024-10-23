import React, { useState } from 'react';
import CustomFile from './File';
import { FileActions } from '../actions/FileActions';
import { useDispatch } from 'react-redux';

interface FileSelectProps { 
  onChange: (files: FileList | null) => void;
}

function FileSelect({ onChange }: FileSelectProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileInputKey, setFileInputKey] = useState<number>(0); // Add key to reset file input
  const dispatch = useDispatch();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files; // Get the FileList
    if (fileList) {
      setSelectedFiles(fileList); // Set selectedFiles to the new FileList
      onChange(fileList); // Call onChange with the FileList

      // Convert FileList to array of CustomFile objects
      const customFilesArray: CustomFile[] = Array.from(fileList).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        webkitRelativePath: file.webkitRelativePath,
        path: file.webkitRelativePath,
        arrayBuffer: () =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
          }),
        slice: file.slice.bind(file),
        stream: file.stream.bind(file),
        text: () =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
          }),
        uploader: "", // Add missing properties
        uploadDate: new Date(),
        downloadCount: 0,
        visibility: "private",
      }));

      // Dispatch setSelectedFile action with array of CustomFile objects
      dispatch(FileActions.setSelectedFile(customFilesArray));
    }

    // Reset the file input by changing its key
    setFileInputKey((prevKey) => prevKey + 1);
  };

  return (
    <div>
      {/* Use key to reset file input */}
      <input
        key={fileInputKey}
        type="file"
        onChange={handleFileChange}
        multiple
      />{" "}
      {/* Allow multiple file selection */}
      {selectedFiles && selectedFiles.length > 0 && (
        <div>
          <p>Selected files:</p>
          <ul>
            {Array.from(selectedFiles).map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FileSelect;
