// StructuredMetadata.ts
import { BaseDataEntity } from '@/app/configs/BaseConfig';
import { Snapshot } from '@/app/components/snapshots';
let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

import { SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { Taggable } from '@/app/components/models/CommonData';
import { BaseData, SharedRelationshipData } from '@/app/components/models/data/Data';
import { EventManager, InitializedState } from "@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { TagsRecord } from '@/app/components/snapshots/SnapshotWithCriteria';
import { Permission } from "@/app/components/users/Permission";
import { category } from "@/app/components/utils/snapshotUtils";
import { createLastUpdatedWithVersion, createLatestVersion } from "@/app/components/versions/createLatestVersion";
import Version from '@/app/components/versions/Version';
import { UnifiedMetadata } from "@/app/configs/database/MetaDataOptions";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { SchemaField } from '@/server/database/SchemaField';
import * as path from 'path';
import { useState } from 'react';
import { LanguageEnum } from '../components/communications/LanguageEnum';
import { Comment } from '../components/models/data/Comments';
import { Data } from '../components/models/data/Data';
import { K, T } from '../components/models/data/dataStoreMethods';
import { Task } from '../components/models/tasks/Task';
import { Contributor } from '../components/models/teams/TeamMembers';
import { CustomComment } from '../components/state/redux/slices/BlogSlice';
import { Video } from '../components/state/stores/VideoStore';
import { VersionData, VersionHistory } from '../components/versions/VersionData';
import { BaseConfig, DefaultExcludedFields, DefaultMeta } from './BaseConfig';
import { MyDataType } from './database/MetaDataOptions';
import { SharedMetadata } from './metadata/createMetadataState';
import { Attachment } from '../components/documents/Attachment/attachment';
import { ExcludedFields } from '../components/routing/Fields';

interface SpecificMetadata<
  T extends BaseData<any>,
  K extends T = T
> {
  tags?: TagsRecord<T, K> | string[] | undefined;
}

type TagsType<T extends BaseData<any>, K extends T = T> = TagsRecord<T, K> | string[] | undefined;

type MetaBase = {
  id?: string;                 // identifier
  description?: string;         // human-readable annotation
  fileType?: string;            // optional categorization
  keywords?: string[];          // search / tagging
  author?: string;              // attribution
  timestamp?: string | number | Date; // simple tracking
  version?: string | number | null;   // lightweight version ref
};
type MetadataEntriesType<
  T extends BaseData<any>,
  K extends T = T> = {
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
    contributors: Contributor[];
    publisher: string;
    copyright: string;
    license: string;
    links: string[];
    tags?: TagsType<T, K>;
  };
};

// Define interfaces for metadata structures
interface StructuredMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
  > extends
  SharedTimestamps,
  SharedStatusFlags,
  SharedIdentifiers<T, K, Meta, ExcludedFields>
{
  baseConfig: BaseConfig<T, K, StructuredMetadata<T, K>, ExcludedFields>;
  sharedMetadata: SharedMetadata<T, K>;
  sharedBaseData: SharedRelationshipData<K>;
  taggable: Taggable<T, K>;
  description?: string | undefined;
  fileType?: string;
  alternatePaths?: string[];
  originalPath?: string;
  metadataEntries: MetadataEntriesType<T, K>;
  keywords: string[];
  childIds?: K[];
  relatedData?: K[] | undefined;
  version?: string | number | Version<T, K> | VersionData<T, K> | null;
  lastUpdated?: Date | VersionHistory<T, K>; 
  permissions: Permission[];
  customFields?: Record<string, any>;
  config?: Record<string, any>;
  baseUrl?: string;
  versionData: string | VersionData<T, K> | null;
  latestVersion?: Pick<VersionData<T, K>, "id" | "versionNumber" | "timestamp" | "author" | "schema">;
  author?: string;
  timestamp: string | number | Date | undefined;

  schema?: Record<string, SchemaField>;
}


interface VideoMetadata<
  T extends BaseDataEntity, 
  K extends T = T,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
  > extends
  SharedTimestamps,
  SharedIdentifiers<T, K, StructuredMetadata<T, K>>
{
  baseData: Omit<BaseData<T, K>, ExcludedFields>; // Include BaseData with excluded fields
  meta: StructuredMetadata<T, K>; 
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
  metadata?: UnifiedMetadata<T, K>;
  childIds: K[]; // Add childIds
  relatedData: K[]; // Add relatedData
}

interface ProjectMetadata<
  T extends  BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
  > extends SharedTimestamps,
  SharedIdentifiers<T, K, DefaultMeta<T, K>, ExcludedFields> {
  projectName: string;
  startDate: Date | undefined;
  endDate?: Date | undefined;
  budget: number;
  status: string;
  description?: string | undefined;
  versionData?: string | VersionData<T, K> | null;
  teamMembers: string[];
  tasks: Task<T, K, Meta>[];
  milestones: string[];
  videos: Video[]; // Removed generic parameters
  projectId: number | string | undefined;
  contributors: Contributor[]
  links: string[]
  customFields?: Record<string, any>
  tags?: TagsRecord<T, K> | string[] | undefined
  isActive: boolean;
  permissions: Permission[];
  latestVersion?: Pick<VersionData<T, K>, "id" | "versionNumber" | "timestamp" | "author" | "schema">;
  lastUpdated: Date | VersionHistory<T, K>; // Add this line
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


interface MetadataEntry<T extends BaseData<any>, K extends T> {
  originalPath: string;
  alternatePaths: string[];
  author: string;
  timestamp: Date | undefined;
  fileType: string;
  title: string;
  description: string;
  keywords: string[];
  authors: string[];
  contributors: Contributor[];
  publisher: string;
  copyright: string;
  license: string;
  links: string[];
  tags?: TagsRecord<T, K> | string[] | undefined;
}

type StringKeys<T> = Extract<keyof T, string>;

function convertTags<T extends BaseData<any>, K extends T>(
  tags?: TagsRecord<T, K> | string[]
): TagsRecord<T, K> | string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;

  const newTags: TagsRecord<T, K> = {} as TagsRecord<T, K>;
  for (const key in tags) {
    const stringKey = key as StringKeys<T>;
    newTags[stringKey] = tags[stringKey]; // K-compatible
  }
  return newTags;
}



function transformProjectToStructured<
  T extends  BaseDataEntity, 
  K extends T = T,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  projectMetadata: ProjectMetadata<T, K>
): StructuredMetadata<T, K, DefaultMeta<T, K>, ExcludedFields> {
  
  // Generate a project ID if it is undefined
  if (!projectMetadata.projectId) {
    projectMetadata.projectId = UniqueIDGenerator.generateProjectID("defaultProjectName");
  }

  // Create metadata entries based on project metadata
  const metadataEntries: Record<string, MetadataEntry<T, K>> = {};
  const entryId = projectMetadata.projectId.toString();

  metadataEntries[entryId] = {
    originalPath: `/projects/${projectMetadata.projectId}`,
    alternatePaths: [`/projects/alt/${projectMetadata.projectId}`],
    author: projectMetadata.teamMembers.length > 0 
      ? projectMetadata.teamMembers[0] 
      : "Unknown",
    timestamp: new Date(),
    fileType: "project",
    title: projectMetadata.description || "Untitled Project",
    description: projectMetadata.description || "",
    keywords: projectMetadata.tasks.map(task => task.taskName),
    authors: projectMetadata.teamMembers,
    contributors: projectMetadata.contributors || [],
    publisher: "Your Organization",
    copyright: "© Your Organization",
    license: "MIT",
    links: projectMetadata.links || [],
    tags: convertTags<T, K>(projectMetadata.tags),
  };

  // Ensure latestVersion
  const latestVersion = projectMetadata.latestVersion || createLatestVersion<T, K>();

  // Get author from first contributor or fallback
  const author = projectMetadata.contributors?.[0]?.memberName || "default-author";

  // Thread ExcludedFields fields here
  const mappedSnapshot: Map<
    string,
    Snapshot<T, K, DefaultMeta<T, K>, ExcludedFields>> = new Map()

  // Populate StructuredMetadata
  const structuredMetadata: StructuredMetadata<T, K, DefaultMeta<T, K>, ExcludedFields> = {
    description: projectMetadata.description || "A project to manage structured metadata.",
    metadataEntries,
    versionData: projectMetadata.versionData || null,
    author: projectMetadata.teamMembers.length > 0 
      ? projectMetadata.teamMembers[0] 
      : "Unknown",
    timestamp: new Date(),
    keywords: projectMetadata.tasks.map(task => task.taskName),
    isActive: projectMetadata.isActive,
    permissions: projectMetadata.permissions,
    customFields: projectMetadata.customFields,
    latestVersion,
    baseConfig: {
      id: projectMetadata.projectId?.toString() || "default-id",
      isActive: projectMetadata.isActive || false,
      author,
      apiEndpoint: "",
      apiKey: undefined,
      timeout: 0,
      retryAttempts: 0,
      name: projectMetadata.projectName,
      description: projectMetadata.description,
      category, 
      timestamp: new Date(),
      createdBy: projectMetadata.teamMembers[0] || "Unknown",
      metadata: {} as UnifiedMetadata<T, K, StructuredMetadata<T, K, DefaultMeta<T, K>, never>, ExcludedFields>,
      initialState: {} as InitializedState<T, K>,
      meta: {} as StructuredMetadata<T, K, StructuredMetadata<T, K, DefaultMeta<T, K>, never>, never>,
      mappedSnapshot,
      events: {} as EventManager<T, K>,
      schema: {},
      latestVersion
    },
    sharedMetadata: {
      version: latestVersion.versionNumber || "1.0",
      lastUpdated: projectMetadata.lastUpdated,
      latestVersion,
      isActive: projectMetadata.isActive,
      config: {},
      permissions: projectMetadata.permissions,
      customFields: projectMetadata.customFields,
      baseUrl: "",
      schema: {}
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


const projectMetadata: ProjectMetadata<
  BaseData<T, K, StructuredMetadata<T, K>, Attachment, ExcludedFields>,
  BaseData<T, K, StructuredMetadata<T, K>, Attachment, ExcludedFields>
> = {
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
  customFields: {},
  latestVersion: createLatestVersion<T, K>(),
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
    childIds: [] as K[],
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
  metadata: {} as UnifiedMetadata<MyDataType, MyDataType>,
  meta: {} as StructuredMetadata<MyDataType, MyDataType>,
  childIds: [],
  relatedData: [],
 
};


const validatedVideoMetadata = validateVideoMetadata(videoMetadata);


export { getStructureMetadataPath, projectMetadata, transformProjectToStructured, useUndoRedo, videoMetadata };
export type { MetadataEntriesType, MetadataEntry, ProjectMetadata, SpecificMetadata, StructuredMetadata, VideoMetadata };
 