import * as fs from 'fs';
import * as path from 'path';
import { Data } from '../components/models/data/Data';
import { CacheStructure } from '../utils/CacheManager';
import determineFileType from './DetermineFileType';

interface StructureMetadata {
  [fileOrFolderId: string]: {
    originalPath: string;
    alternatePaths: string[];
    fileType: string;
  };
}

interface VideoMetadata  {
  duration: number; // Duration of the video in seconds
  resolution: string; // Resolution of the video (e.g., "1920x1080")
  sizeInBytes: number; // Size of the video file in bytes
  format: string; // Format of the video (e.g., "mp4", "avi", etc.)
  uploadDate: Date; // Date when the video was uploaded
  uploader: string; // Name or ID of the user who uploaded the video
  tags: string[]; // Array of tags associated with the video
  categories: string[]; // Array of categories the video belongs to
  language: string; // Language of the video content
  location: string; // Location where the video was recorded
  // Add more properties as needed
  data: Data
}




  
interface ProjectMetadata {
  startDate: Date; // Start date of the project
  endDate: Date; // End date of the project
  budget: number; // Budget allocated for the project
  status: string; // Status of the project (e.g., "In Progress", "Completed", etc.)
  description: string; // Description of the project
  teamMembers: string[]; // Array of team members involved in the project
  tasks: string[]; // Array of tasks associated with the project
  milestones: string[]; // Array of milestones for the project
  videos: VideoMetadata[]; // Array of video metadata associated with the project
  // Add more properties as needed
}








const structureMetadataPath = 'structure-metadata.json';

const readMetadata = (): StructureMetadata => {
  try {
    const data = fs.readFileSync(structureMetadataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const writeMetadata = (metadata: StructureMetadata) => {
  const data = JSON.stringify(metadata, null, 2);
  fs.writeFileSync(structureMetadataPath, data, 'utf-8');
};

const trackStructureChanges = (
  basePath: string,
  cacheStructure: CacheStructure
) => {
  const metadata = readMetadata();

  const traverseDirectory = (dir: string) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      const fileOrFolderId = Buffer.from(filePath).toString("base64"); // Unique identifier

      if (!metadata[fileOrFolderId]) {
        // New file or folder, update metadata
        metadata[fileOrFolderId] = {
          originalPath: filePath,
          alternatePaths: [],
          fileType: determineFileType(filePath),
        };
      }

      if (isDirectory) {
        traverseDirectory(filePath);
      }

      // Logic to check for changes and update alternate paths

      // Example:
      if (metadata[fileOrFolderId].originalPath !== filePath) {
        metadata[fileOrFolderId].alternatePaths.push(filePath);
      }
    }
  };

  traverseDirectory(basePath);
  writeMetadata(metadata);
};

// Example usage
const cacheStructure: CacheStructure = {}; // Initialize with your actual cache structure
// Example usage
const basePath = path.resolve(__dirname, 'src'); // Set your base path
trackStructureChanges(basePath, cacheStructure);


export type { StructureMetadata, VideoMetadata };

export default ProjectMetadata;
