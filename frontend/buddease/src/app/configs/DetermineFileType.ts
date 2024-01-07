const determineFileType = (filePath: string): string => {
  // Implement logic to determine the type based on file path or content
  if (filePath.includes("DataVersionsConfig")) {
    return "DataVersionsConfig";
  } else if (filePath.includes("FrontendStructure")) {
    return "FrontendStructure";
  } else {
    // Add more conditions for other types as needed
    return "UnknownType";
  }
};
export default determineFileType;
