import { FileMetadata } from "../models/file/FileManager";

// fileUtils.ts
interface MyFile extends File {
  metadata: FileMetadata;
}


// Assuming setFiles is intended to update the files in some state, we need to handle it accordingly
let filesMap: Map<string, MyFile> = new Map();

function setFiles(updater: (prevFiles: Map<string, MyFile>) => Map<string, MyFile>) {
  filesMap = updater(filesMap); // Update the filesMap with the new state
}

// Update metadata for a specific file
const updateFileMetadata = (fileId: string, newMetadata: Partial<FileMetadata>) => {
  setFiles(prevFiles => {
    const prevFile = prevFiles.get(fileId);
    if (!prevFile) return prevFiles;

    // Create a new file object with updated metadata
    const updatedFile: MyFile = {
      ...prevFile,
      metadata: { ...prevFile.metadata, ...newMetadata }
    };
    
    // Return the new map with the updated file
    return new Map(prevFiles).set(fileId, updatedFile);
  });
};



export {updateFileMetadata,}