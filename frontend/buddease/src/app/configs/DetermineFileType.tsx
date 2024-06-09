import React from "react";
import { FileTypeEnum } from "../components/documents/FileType";



// Function to determine the file type based on the file path
const determineFileType = (filePath: string): FileTypeEnum => {
  if (filePath.includes("DataVersionsConfig")) {
    return FileTypeEnum.DataVersionsConfig;
  } else if (filePath.includes("FrontendStructure")) {
    return FileTypeEnum.FrontendStructure;
  } else {
    return FileTypeEnum.UnknownType;
  }
}



const DetermineFileType: React.FC = () => {
  // Example file path for demonstration
  const filePath = "/path/to/file/DataVersionsConfig";

  // Determine the file type
  const fileType = determineFileType(filePath);

  return (
    <div>
      <h2>File Type: {fileType}</h2>
    </div>
  );
};

export default DetermineFileType; determineFileType;
