import { determineFileTypeAPI } from "../api/ApiFiles";
import loadFile from "../components/documents/FileLoadOptions";

export const determineType = async (filePath: string) => {
  try {
    // Assuming filePath is used to load the file from a specific source
    const file = await loadFile(filePath);  // Load the file (write the loadFile function based on your needs)

    // Use the determineFileTypeAPI to get the type
    const type = await determineFileTypeAPI(file);

    return type;  // Return the type determined from the API
  } catch (error) {
    throw new Error(`Failed to determine type for file at ${filePath}`);
  }
};