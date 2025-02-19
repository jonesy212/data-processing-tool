import Version from '@/app/components/versions/Version';
// StructuredMetadata.ts

let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

import { BaseData, SharedBaseData } from '@/app/components/models/data/Data';
import * as path from 'path';
import { useState } from 'react';
import { LanguageEnum } from '../components/communications/LanguageEnum';
import { Comment } from '../components/models/data/Comments';
import { Data } from '../components/models/data/Data';
import { K, T } from '../components/models/data/dataStoreMethods';
import { Task } from '../components/models/tasks/Task';
import { TagsRecord } from '../components/snapshots';
import { CustomComment } from '../components/state/redux/slices/BlogSlice';
import { Video } from '../components/state/stores/VideoStore';
import { VersionData, VersionHistory } from '../components/versions/VersionData';
import { b } from './BaseConfig';
import { MyDataType } from './database/MetaDataOptions';
import { SharedMetadata } from './metadata/createMetadataState';

// Define interfaces for metadata structures
interface StructuredMetadata<
  T extends BaseData<any>,
  K extends T = T
> extends BaseConfig<T, K>, SharedMetadata<K>, SharedBaseData<K>{
  description?: string | undefined; // Must match BaseMetaDataOptions
  fileType?: string; // Add this property to the top level
  alternatePaths?: string[]; // Add this property to the top level
  originalPath?: string; // Add this property to the top level
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

  keywords: string;
  childIds?: K[];
  relatedData?: K[] | undefined;
  version: Version<T, K>;// Added
  lastUpdated?: Date | VersionHistory; // Added
  isActive: boolean; // Added
  config: Record<string, any>; // Added
  permissions: string[]; // Added
  customFields: Record<string, any>; // Added
  baseUrl?: string; // Added
  versionData: string | VersionData | null; // Include versionData explicitly
  latestVersion: VersionData; // Include latestVersion explicitly
}

interface VideoMetadata<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> extends BaseData<T, K>
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
  bitrate: number;
  frameRate: number
  views: number;
  likes: number;
  comments?: number | (Comment<T, K, Meta> | CustomComment)[] | undefined;
  resolution: string;
  aspectRatio: string;
  subtitles: boolean | string[];
  closedCaptions: string[];
  license: string;
  isLicensedContent: boolean;
  isFamilyFriendly: boolean;
  isEmbeddable: boolean;
  isDownloadable: boolean;
  codec: string;
  colorSpace: string;
  audioCodec: string;
  audioChannels: number;
  audioSampleRate: number;
  chapters: string[];
  thumbnailUrl: string;
  metadataSource: string;
  data: Data<T>; // Assuming Data is a custom data type
}

interface ProjectMetadata<
  T extends BaseData<any> = BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = never
> {
  projectName: string;
  startDate: Date | undefined;
  endDate?: Date | undefined;
  budget: number;
  status: string;
  description?: string | undefined;
  versionData: string | VersionData | null;
  teamMembers: string[];
  tasks: Task<T, K, Meta>[];
  milestones: string[];
  videos: Video[]; // Removed generic parameters
  projectId: number | string | undefined;
  contributors: string[]
  links: string[]
  tags?: TagsRecord<T, K> | string[] | undefined
}


function ensureMetadataEntries<T, K>(
  entries: Record<string, any>
): Record<string, K> {
  return Object.keys(entries).reduce((acc, key) => {
    const entry = entries[key];
    if (isValidMetadata(entry)) {
      acc[key] = entry as K;
    }
    return acc;
  }, {} as Record<string, K>);
}

function isValidMetadata<K>(entry: any): entry is K {
  // Add type-checking logic for `K`
  return entry && typeof entry === "object";
}


interface MetadataEntry {
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
  tags?: TagsRecord<T, K> | string[] | undefined;
}



function transformProjectToStructured<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T
>(projectMetadata: ProjectMetadata<T, K>): StructuredMetadata<T, K> {
  
  // Create metadata entries based on project metadata
  const metadataEntries: Record<string, MetadataEntry> = {};

  // Example logic to create metadata entries from project metadata
  const entryId = projectMetadata.projectId.toString(); // or any unique identifier

  metadataEntries[entryId] = {
    originalPath: `/projects/${projectMetadata.projectId}`, // Derive paths
    alternatePaths: [`/projects/alt/${projectMetadata.projectId}`],
    author: projectMetadata.teamMembers.length > 0 ? projectMetadata.teamMembers[0] : "Unknown", // Set author
    timestamp: new Date(), // Or use an appropriate date from projectMetadata
    fileType: "project", // Example file type, adjust as necessary
    title: projectMetadata.description || "Untitled Project", // Set title
    description: projectMetadata.description || "",
    keywords: projectMetadata.tasks.map(task => task.taskName), // Extract keywords from tasks
    authors: projectMetadata.teamMembers, // Set authors
    contributors: projectMetadata.contributors || [], // Optional contributors
    publisher: "Your Organization", // Example publisher
    copyright: "© Your Organization", // Example copyright
    license: "MIT", // Example license, adjust as necessary
    links: projectMetadata.links || [], // Optional links
    tags: projectMetadata.tags || [], // Optional tags
  };

  // Populate the StructuredMetadata object with necessary details
  const structuredMetadata: StructuredMetadata<T, K> = {
    description: projectMetadata.description || "A project to manage structured metadata.",
    metadataEntries,
    versionData: projectMetadata.versionData || [],
    author: projectMetadata.teamMembers.length > 0 ? projectMetadata.teamMembers[0] : "Unknown",
    timestamp: new Date(), // Or the appropriate timestamp from projectMetadata
    keywords: projectMetadata.tasks.map(task => task.taskName), // Use task names as keywords
  };

  return structuredMetadata;
}

const projectMetadata: ProjectMetadata<BaseData, BaseData> = {
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
  projectId: 0,
  versionData: [],
  contributors: [],
  links: []
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


function validateVideoMetadata<T extends BaseData<any>>(metadata: VideoMetadata<T>): VideoMetadata<T> {
  return {
    ...metadata,
    // Validate strings: Replace empty strings with "N/A" or another default value
    codec: metadata.codec || "N/A",
    colorSpace: metadata.colorSpace || "N/A",
    audioCodec: metadata.audioCodec || "N/A",
    thumbnailUrl: metadata.thumbnailUrl || "https://example.com/default-thumbnail.jpg",
    metadataSource: metadata.metadataSource || "Unknown",

    // Validate numbers: Replace zeros or negatives with default values
    audioChannels: metadata.audioChannels > 0 ? metadata.audioChannels : 2, // Default: Stereo (2 channels)
    audioSampleRate: metadata.audioSampleRate > 0 ? metadata.audioSampleRate : 44100, // Default: 44.1 kHz
    duration: metadata.duration > 0 ? metadata.duration : 1, // Default: 1 second
    sizeInBytes: metadata.sizeInBytes > 0 ? metadata.sizeInBytes : 1048576, // Default: 1 MB
  };
}

const videoMetadata: VideoMetadata<
  MyDataType, K<MyDataType>,
  StructuredMetadata<MyDataType, MyDataType>,
  keyof MyDataType
> = {
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
    childIds: [] as  K<T>[],
    relatedData: []
  },
  frameRate: 30,
  bitrate: 0,
  codec: '',
  colorSpace: '',
  audioCodec: '',
  audioChannels: 0,
  audioSampleRate: 0,
  chapters: [],
  thumbnailUrl: '',
  metadataSource: '',
  childIds: [],
  relatedData: []
};


const validatedVideoMetadata = validateVideoMetadata(videoMetadata);


export { getStructureMetadataPath, projectMetadata, transformProjectToStructured, useUndoRedo, videoMetadata };
export type { MetadataEntry, ProjectMetadata, StructuredMetadata, VideoMetadata };
 