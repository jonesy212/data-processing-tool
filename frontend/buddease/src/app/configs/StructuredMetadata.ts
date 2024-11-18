// StructuredMetadata.ts

let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

import * as path from 'path';
import { useState } from 'react';
import { BaseData } from '@/app/components/models/data/Data';
import { LanguageEnum } from '../components/communications/LanguageEnum';
import { Data } from '../components/models/data/Data';
import baseConfig, { TagsRecord } from '../components/snapshots';
import { BaseConfig } from './BaseConfig';
import { MyDataType, UnifiedMetaDataOptions } from './database/MetaDataOptions';
 import { Video } from '../components/state/stores/VideoStore';
import { VideoData } from '../components/video/Video';
import { Task } from '../components/models/tasks/Task';
import { Meta } from '../components/models/data/dataStoreMethods';

// Define interfaces for metadata structures
interface StructuredMetadata<T extends  BaseData<T>,
  K extends T = T> extends BaseConfig<T, K> {
  description?: string | undefined; // Must match BaseMetaDataOptions
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

interface VideoMetadata<
  T extends BaseData<T>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never>
 {
  title: string;
  url: string;
  duration: number;
  sizeInBytes: number;
  format: string;
  uploadDate: Date;
  uploader: string;
  tags?: TagsRecord<T> | string[] | undefined;
  categories: string[];
  language: LanguageEnum;
  location: string;
  frameRate: number
  views: number;
  likes: number;
  comments: number;
  resolution: string;
  aspectRatio: string;
  subtitles: boolean | string[];
  closedCaptions: string[];
  license: string;
  isLicensedContent: boolean;
  isFamilyFriendly: boolean;
  isEmbeddable: boolean;
  isDownloadable: boolean;
  data: Data<T>; // Assuming Data is a custom data type
}


interface ProjectMetadata<T, K> {
  projectName: string;
  startDate: Date | undefined;
  endDate?: Date | undefined;
  budget: number;
  status: string;
  description?: string | undefined;
  teamMembers: string[];
  tasks: Task<T, K, Meta>[];
  milestones: string[];
  videos: Video[]; // Removed generic parameters
  projectId: number
}
function transformProjectToStructured<
  T extends  BaseData<T>,
  K extends T = T
>(projectMetadata: ProjectMetadata<T, K>): UnifiedMetaDataOptions<T, K> {
  
   // Create metadata entries based on project metadata
  const metadataEntries: Record<string, {
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
  }> = {};

  // Assuming `projectMetadata` has the necessary properties to fill in the metadata entries
  // Example: Adding a single entry for demonstration purposes
  const entryId = projectMetadata.projectId.toString(); // or any unique identifier
  metadataEntries[entryId] = {
    originalPath: `/projects/${projectMetadata.projectId}`, // Replace with actual logic to derive paths
    alternatePaths: [`/projects/alt/${projectMetadata.projectId}`],
    author: projectMetadata.teamMembers.length > 0 ? projectMetadata.teamMembers[0] : "Unknown", // Assuming teamMembers are authors
    timestamp: new Date(), // Or use an appropriate date from projectMetadata
    fileType: "project", // Example file type, adjust as necessary
    title: projectMetadata.description || "Untitled Project", // Replace with the appropriate title
    description: projectMetadata.description || "",
    keywords: projectMetadata.tasks.map(task => task.taskName), // Assuming tasks contain titles as keywords
    authors: projectMetadata.teamMembers, // Assuming teamMembers are the authors
    contributors: [], // Populate this based on your logic or additional data
    publisher: "Your Organization", // Adjust as necessary
    copyright: "© Your Organization", // Adjust as necessary
    license: "MIT", // Example license, adjust based on your needs
    links: [], // Populate with relevant links if available
    tags: [], // Populate tags as needed
  };

  const structuredMetadata: StructuredMetadata<T, K> = {
    ...baseConfig,
    description: projectMetadata.description,
    metadataEntries: metadataEntries,
  };



  // Return as UnifiedMetaDataOptions
  return {
    projectMetadata: projectMetadata,
    // Set other metadata types to undefined or some default values as necessary
    videoMetadata: undefined,
    mediaMetadata: undefined,
    taskMetadata: undefined,
    meetingMetadata: undefined,
    tags: []
  };
}


const projectMetadata: ProjectMetadata<string, number> = {
  projectName: "",
  startDate: new Date(),
  endDate: new Date(),
  budget: 0,
  status: "",
  description: "",
  teamMembers: [],
  tasks: [],
  milestones: [],
  videos: [],
  projectId: 0
};
// Define function to get structure metadata path
const getStructureMetadataPath = (filename: string): string => {
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



const videoMetadata: VideoMetadata<MyDataType> = {
  title: "Example Video",
  url: "https://example.com/video",
  duration: 300, // 5 minutes
  sizeInBytes: 104857600,
  format: "MP4",
  uploadDate: new Date(),
  uploader: "Uploader Name",
  tags: ["example", "video"],
  categories: ["Education", "Tutorial"],
  language: LanguageEnum.English,
  location: "San Francisco, USA",
  views: 1500,
  likes: 300,
  comments: 20,
  resolution: "1920x1080",
  aspectRatio: "16:9",
  subtitles: true,
  closedCaptions: ["English"],
  license: "Creative Commons",
  isLicensedContent: true,
  isFamilyFriendly: true,
  isEmbeddable: true,
  isDownloadable: true,
  data: {
    id: "123",
    name: "Sample Data",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  frameRate: 30, // 30 frames per second
};


export { getStructureMetadataPath, projectMetadata, transformProjectToStructured, useUndoRedo, videoMetadata };
export type { ProjectMetadata, StructuredMetadata, VideoMetadata };
 
