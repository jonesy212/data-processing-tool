// StructuredMetadata.ts

let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}
import * as path from 'path';
import { useState } from 'react';
import { LanguageEnum } from '../components/communications/LanguageEnum';
import useErrorHandling from '../components/hooks/useErrorHandling';
import { Data } from '../components/models/data/Data';
import determineFileType from './DetermineFileType';
import { BaseConfig } from './BaseConfig';

// Define interfaces for metadata structures
interface StructuredMetadata extends BaseConfig {
  metadataEntries: {
    [fileOrFolderId: string]: {
      originalPath: string;
      alternatePaths: string[];
      author: string;
      timestamp: Date | undefined;
      fileType: string;
      title: string;
      description: string;
      keywords: string[];
      authors: string[];
      contributors: string[];
      publisher: string;
      copyright: string;
      license: string;
      links: string[];
      tags: string[];
    };
  };
}


interface VideoMetadata {
  duration: number;
  resolution: string;
  sizeInBytes: number;
  format: string;
  uploadDate: Date;
  uploader: string;
  tags: string[];
  categories: string[];
  language: LanguageEnum;
  location: string;
  data: Data; // Assuming Data is a custom data type
}

interface ProjectMetadata {
  startDate: Date;
  endDate: Date;
  budget: number;
  status: string;
  description: string;
  teamMembers: string[];
  tasks: string[];
  milestones: string[];
  videos: VideoMetadata[];
}



function transformProjectToStructured(projectMetadata: ProjectMetadata): StructuredMetadata {
  // Perform transformation here
  return {} as StructuredMetadata;
}


const projectMetadata: ProjectMetadata = {
  startDate: new Date(),
  endDate: new Date(),
  budget: 0,
  status: "",
  description: "",
  teamMembers: [],
  tasks: [],
  milestones: [],
  videos: []
};



// Define function to get structure metadata path
const getStructureMetadataPath = (filename: string): string => {
  // Assuming __dirname is defined in your environment
  return path.join(__dirname, filename);
};


// Define the initial state for undo and redo operations
const initialUndoRedoState = {
  past: [] as any[],
  present: null as any,
  future: [] as any[],
};

// Define the function to handle undo and redo actions
const useUndoRedo = <T>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState(initialUndoRedoState);

  const undo = () => {
    // Move the present state to the future
    const { past, present, future } = history;
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setHistory({
      past: newPast,
      present: previous,
      future: [present, ...future],
    });

    setState(previous);
  };

  const redo = () => {
    // Move the present state to the past
    const { past, present, future } = history;
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setHistory({
      past: [...past, present],
      present: next,
      future: newFuture,
    });

    setState(next);
  };

  return { state, setState, undo, redo };
};


// Example usage
const initialState: StructuredMetadata = {
  metadataEntries: {},
  apiEndpoint: '',
  apiKey: '',
  timeout: 0,
  retryAttempts: 0
};

// Initial state for metadata structure
const { state, setState, undo, redo } = useUndoRedo(initialState);

// Define your metadata structure using 'state' and update it using 'setState'

// Add undo and redo handlers to the metadata structure
(state as any).undo = undo;




// Define function to read metadata from file
const readMetadata = (filename: string): StructuredMetadata => {
  try {
    const structureMetadataPath = getStructureMetadataPath(filename);
    const data = fs.readFileSync(structureMetadataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    const { handleError } = useErrorHandling(); // Use useErrorHandling hook
    handleError(`Error reading metadata file: ${error.message}`); // Handle error
    return {
      metadataEntries: {},
      apiEndpoint: '',
      apiKey: '',
      timeout: 0,
      retryAttempts: 0
    };
  }
};
// Define function to write metadata to file
const writeMetadata = (filename: string, metadata: StructuredMetadata): void => {
  try {
    const structureMetadataPath = getStructureMetadataPath(filename);
    const data = JSON.stringify(metadata, null, 2);
    fs.writeFileSync(structureMetadataPath, data, 'utf-8');
  } catch (error: any) {
    const { handleError } = useErrorHandling(); // Use useErrorHandling hook
    handleError(`Error writing metadata file: ${error.message}`); // Handle error
  }
};

// Define function to track structure changes
const trackStructureChanges = (
  basePath: string,
  filename: string,
  cacheStructure: any // Define type for cacheStructure if possible
): void => {
  let metadata = readMetadata(filename);


  const traverseDirectory = (dir: string) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();
      const fileOrFolderId = Buffer.from(filePath).toString("base64");

      if (!metadata.metadataEntries[fileOrFolderId]) {
        const filePath = path.join(dir, file);
        const isDirectory = fs.statSync(filePath).isDirectory();
        const fileOrFolderId = Buffer.from(filePath).toString("base64");
        const fileType = determineFileType({ filePath });

        metadata.metadataEntries[fileOrFolderId] = {
          author: "",
          timestamp: new Date(),
          originalPath: filePath,
          alternatePaths: [],
          fileType: (fileType as string) || "Unknown",
          title: "",
          description: "",
          keywords: [],
          authors: [],
          contributors: [],
          publisher: "",
          copyright: "",
          license: "",
          links: [],
          tags: [],
        };
      }

      if (isDirectory) {
        traverseDirectory(filePath);
      }

      if (metadata.metadataEntries[fileOrFolderId].originalPath !== filePath) {
        metadata.metadataEntries[fileOrFolderId].alternatePaths.push(filePath);
      }
    }
  };
  traverseDirectory(basePath);
  writeMetadata(filename, metadata);
};


// Example usage
const metadataFilePath = 'structure-metadata.json';
const basePath = path.resolve(__dirname, 'src'); // Set your base path
trackStructureChanges(basePath, metadataFilePath, {}); // Pass an empty object as cacheStructure

export type { ProjectMetadata, StructuredMetadata, VideoMetadata };

export default ProjectMetadata;
export { projectMetadata, state, transformProjectToStructured };

