// StructuredMetadata.ts
import Version from '@/app/components/versions/Version';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";import { TransactionData } from '@/app/components/payment/Transaction';

let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

import { BaseData, SharedBaseData } from '@/app/components/models/data/Data';
import * as path from 'path';
import {
  category,
  isSnapshot,
  isSnapshotDataType,
} from "../utils/snapshotUtils";
import { Permission } from "@/app/components/users/Permission";
import { useState } from 'react';
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { LanguageEnum } from '../components/communications/LanguageEnum';
import { Comment } from '../components/models/data/Comments';
import { Data } from '../components/models/data/Data';
import { K, T } from '../components/models/data/dataStoreMethods';
import { Task } from '../components/models/tasks/Task';
import { TagsRecord } from '@/app/components/snapshots/SnapshotWithCriteria';
import { CustomComment } from '../components/state/redux/slices/BlogSlice';
import { Video } from '../components/state/stores/VideoStore';
import { VersionData, VersionHistory } from '../components/versions/VersionData';
import { BaseConfig } from './BaseConfig';
import { MyDataType } from './database/MetaDataOptions';
import { Taggable } from '@/app/components/models/CommonData';
import { createLatestVersion, createLastUpdatedWithVersion } from "@/app/components/versions/createLatestVersion";
import { InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import { EventManager } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { SharedVersionData } from "@/app/components/versions/VersionData";
import { SharedMetadata } from './metadata/createMetadataState';
import { SharedTimestamps, SharedStatusFlags, SharedIdentifiers } from '@/app/components/documents/RelatedProps'
import VersionImpl from "../components/versions/Version";

interface SpecificMetadata<T extends BaseData<any>, K extends T = T> {
  tags?: TagsRecord<T, K> | string[] | undefined;
}


type TagsType<T extends BaseData<any>, K extends T = T> = TagsRecord<T, K> | string[] | undefined;

type MetadataEntriesType<T extends BaseData<any>, K extends T = T> = {
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
    tags?: TagsType<T, K>;
  };
};


// Define interfaces for metadata structures

interface StructuredMetadata<
  T extends BaseData<any>,
  K extends T = T
> extends SharedTimestamps, SharedStatusFlags, SharedIdentifiers {
  baseConfig: BaseConfig<T, K, StructuredMetadata<T, K>>;
  sharedMetadata: SharedMetadata<K>;
  sharedBaseData: SharedBaseData<K>;
  taggable: Taggable<T, K>;
  description?: string | undefined;
  fileType?: string;
  alternatePaths?: string[];
  originalPath?: string;
  metadataEntries: MetadataEntriesType<T, K>;
  keywords: string[];
  childIds?: K[];
  relatedData?: K[] | undefined;
  version?: string | number | VersionImpl<T, K>;
  lastUpdated?: VersionHistory;
  permissions: Permission[];
  customFields: Record<string, any>;
  config?: Record<string, any>;
  baseUrl?: string;
  versionData: string | VersionData<T, K> | null;
  latestVersion: VersionData<T, K>;
  author: string;
  timestamp: string | number | Date | undefined;
}


interface VideoMetadata<
  T extends BaseData<any>,
  K extends T = T,
  ExcludedFields extends keyof T = never
> extends SharedTimestamps, SharedIdentifiers {
  baseData: Omit<BaseData<T, K>, ExcludedFields>; // Include BaseData with excluded fields
  metadata: StructuredMetadata<T, K>; // Explicitly include metadata
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
  comments?: number | (Comment<T, K, StructuredMetadata<T, K>> | CustomComment)[] | undefined;
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

  childIds: K[]; // Add childIds
  relatedData: K[]; // Add relatedData
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
  versionData: string | VersionData<T, K> | null;
  teamMembers: string[];
  tasks: Task<T, K, Meta>[];
  milestones: string[];
  videos: Video[]; // Removed generic parameters
  projectId: number | string | undefined;
  contributors: string[]
  links: string[]
  tags?: TagsRecord<T, K> | string[] | undefined

  isActive: boolean;
  permissions: Permission[];
  customFields: Record<string, any>;
  latestVersion: VersionData<T, K>;
  lastUpdated: Date; // Add this line

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
  tags?: TagsRecord<T, K<T>> | string[] | undefined;
}



function transformProjectToStructured<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T
>(projectMetadata: ProjectMetadata<T, K>): StructuredMetadata<T, K> {
  
    // Generate a project ID if it is undefined
    if (!projectMetadata.projectId) {
      projectMetadata.projectId = UniqueIDGenerator.generateProjectID("defaultProjectName");
    }

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

  // Provide a default value for latestVersion if it is undefined or incompatible
  const latestVersion = projectMetadata.latestVersion || createLatestVersion<T, K>();

  // Populate the StructuredMetadata object with necessary details
  const structuredMetadata: StructuredMetadata<T, K> = {
    description: projectMetadata.description || "A project to manage structured metadata.",
    metadataEntries: metadataEntries || [],
    versionData: projectMetadata.versionData || null,
    author: projectMetadata.teamMembers.length > 0 ? projectMetadata.teamMembers[0] : "Unknown",
    timestamp: new Date(), // Or the appropriate timestamp from projectMetadata
    keywords: projectMetadata.tasks.map(task => task.taskName), // Use task names as keywords
    isActive: projectMetadata.isActive,
    permissions: projectMetadata.permissions,
    customFields: projectMetadata.customFields,
    latestVersion: projectMetadata.latestVersion || null, 
    baseConfig: {
      // Provide necessary BaseConfig properties
      id: projectMetadata.projectId?.toString() || "default-id",
      apiEndpoint: "",
      apiKey: undefined,
      timeout: 0,
      retryAttempts: 0,
      name: projectMetadata.projectName,
      description: projectMetadata.description,
      latestVersion,
      category: category,
      timestamp: new Date(),
      createdBy: projectMetadata.teamMembers[0] || "Unknown",
      metadata: {} as UnifiedMetadata<T, K>,
      initialState: {} as InitializedState<T, K>,
      meta: {} as StructuredMetadata<T, K>,
      mappedSnapshot: new Map<string, Snapshot<T, K>>(),
      events: {} as EventManager<T, K>,
    },
    sharedMetadata: {
      version: projectMetadata.latestVersion?.version || "1.0",
      lastUpdated: projectMetadata.lastUpdated,
      latestVersion: projectMetadata.latestVersion,
      isActive: projectMetadata.isActive,
      config: {},
      permissions: projectMetadata.permissions,
      customFields: projectMetadata.customFields,
      baseUrl: "",
    },
    sharedBaseData: {
      childIds: [],
      relatedData: [],
    },
    taggable: {
      tags: projectMetadata.tags,
      categories: [],
      keywords: projectMetadata.tasks.map(task => task.taskName),
    },
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
  versionData: null,
  contributors: [],
  links: [],
  isActive: true,
  permissions: [],
  customFields: [],
  latestVersion: createLatestVersion(),
  lastUpdated: createLastUpdatedWithVersion(),

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
  MyDataType,
  MyDataType,
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

  baseData: [],
  metadata: {} as StructuredMetadata<MyDataType, MyDataType>,
  childIds: [],
  relatedData: [],
 
};


const validatedVideoMetadata = validateVideoMetadata(videoMetadata);


export { getStructureMetadataPath, projectMetadata, transformProjectToStructured, useUndoRedo, videoMetadata };
export type { MetadataEntry, MetadataEntriesType, ProjectMetadata, StructuredMetadata, VideoMetadata };
 