import React from "react";
import { FileTypeEnum } from "../components/documents/FileType";

interface DetermineFileTypeProps {
  filePath: string;
}

const determineFileType = (filePath: string): FileTypeEnum => {
  // Example logic to determine the file type based on the file path
  const extension = filePath.split('.').pop() || "";
  switch (extension) {
    case "tsx":
    case "ts":
      return FileTypeEnum.UI;
    case "md":
      return FileTypeEnum.MD;
    case "pdf":
      return FileTypeEnum.PDF;
    // Add more cases as needed
    default:
      return FileTypeEnum.UnknownType;
  }
};

const DetermineFileType: React.FC<DetermineFileTypeProps> = ({ filePath }) => {
  // Determine the file type
  const fileType = determineFileType(filePath);

  return (
    <div>
      <h2>File Type: {fileType}</h2>
    </div>
  );
};

export default DetermineFileType;
export { determineFileType };