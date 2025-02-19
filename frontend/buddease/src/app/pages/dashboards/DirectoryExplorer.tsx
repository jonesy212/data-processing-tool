// DirectoryExplorer.ts
import { generateAppResponse, getAppContext } from "@/app/components/prompts/AppContextHelper";

class DirectoryExplorer {
    directoryData: string; // Assuming directoryData is of type string
  
    constructor(directoryData: string) {
      this.directoryData = directoryData;
    }
  
    // Method to explore the directory and generate response based on user query
    exploreDirectory(userQuery: string): string {
      // Use getAppContext to determine the user context
      const context = getAppContext(userQuery);
  
      // Use the context to generate an appropriate response
      if (context) {
        const response = generateAppResponse(context);
        return response;
      } else {
        // If no context is found, return a default response
        return "No relevant context found for the provided query.";
      }
    }
  
    // Method to list files and directories in the current directory
    listDirectoryContents(): string[] {
      // Parse the directoryData and return a list of files and directories
      const directoryContents = this.directoryData.split("\n");
      return directoryContents;
    }
  
    // Method to add a new file or directory to the current directory
    addFileOrDirectory(name: string, isDirectory: boolean): void {
      // Modify the directoryData to include the new file/directory
      this.directoryData += `\n${name}${isDirectory ? "/" : ""}`;
    }
  
    // Method to remove a file or directory from the current directory
    removeFileOrDirectory(name: string): void {
      // Modify the directoryData to remove the specified file/directory
      const regex = new RegExp(`\\b${name}(?:/)?\\b`, "g");
      this.directoryData = this.directoryData.replace(regex, "");
    }
  }

// Export the DirectoryExplorer class
export default DirectoryExplorer;
