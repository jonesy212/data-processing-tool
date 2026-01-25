// StructuredMetadata.ts
import { LanguageEnum } from '@/core/communications/LanguageEnum';
import type { BaseConfig, BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { SchemaField } from '@/core/config/metadata/SchemaField';
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { SharedIdentifiers, SharedTimestamps } from '@/core/documents/RelatedProps';
import { SharedStatusFlags } from '@/core/documents/RelatedProps';
import UniqueIDGenerator from "@/core/generators/GenerateUniqueIds";
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { Comment } from '@/core/models/comments/Comments';
import type { BaseData, Data, SharedRelationshipData } from '@/core/models/data/Data';
import type { Task } from '@/core/models/tasks/Task';
import { Contributor } from '@/core/models/teams/Contributor';
import type { TagsRecord } from '@/core/models/tracker/Tag';
import { Taggable } from '@/core/models/tracker/Tag';
import { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import { Permission } from '@/core/permissions/Permission';
import type { SharedMetadata } from '@/core/shared/SharedMetadata';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import type { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { CustomComment } from '@/core/state/redux/slices/BlogSlice';
import type { EventManager, InitializedState } from "@/core/state/stores/DataStore";
import type { ProjectAttachment, ProjectEntity, ProjectExcludedFields, ProjectIncludedFields, ProjectK, ProjectMeta } from '@/core/typings/entities/ProjectEntity';
import type { UserEntity, UserK } from '@/core/typings/entities/UserEntity';
import type { VideoAttachment, VideoEntity, VideoExcludedFields, VideoIncludedFields, VideoK, VideoMeta } from '@/core/typings/entities/VideoEntity';
import { Video } from '@/core/typings/videoTypes/Video';
import { createLastUpdatedWithVersion, createLatestVersion } from "@/core/versions/createLatestVersion";
import { Version } from '@/core/versions/Version';
import { VersionData, VersionHistory } from '@/core/versions/VersionData';
import * as path from 'path';
import { useState } from 'react';


let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

// Full 4-argument version (recommended)
interface SpecificMetadata<
  T extends BaseDataEntity,
  K extends T = T
> {
  tags?: string[] | TagsRecord<T>;
  categories?: Category[];
  categoryProperties?: CategoryProperties<T, K>[];
  priority?: number;
  customFields?: Record<string, any>;
}

// Usage example
const metadata: SpecificMetadata<UserEntity, UserK> = {
  tags: {
    important: { 
      name: "important", 
      color: "red", 
      relatedTags: [], 
      description: '', 
      enabled: true, 
      nulltype: '',
      timestamp: new Date()

     },
    archived: { 
      name: "archived", 
      color: "gray",
     }
  },
  priority: 1
};

type TagsType<T extends BaseDataEntity> = TagsRecord<T> | string[] | undefined;

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
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T
> = {
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
    contributors: Contributor<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    publisher: string;
    copyright: string;
    license: string;
    links: string[];
    tags?: TagsType<T>;
  };
};

// Define interfaces for metadata structures
interface StructuredMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends
  SharedTimestamps,
  SharedStatusFlags,
  SharedIdentifiers<T, K> {
  baseConfig: BaseConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  sharedMetadata: SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  sharedBaseData: SharedRelationshipData<K>;
  taggable: Taggable<T>;
  description?: string;
  fileType?: string;
  alternatePaths?: string[];
  originalPath?: string;
  metadataEntries: MetadataEntriesType<T, K>;
  keywords: string[];
  childIds?: K[];
  relatedData?: K[] | undefined;
  version?: string | number | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  lastUpdated?: Date | VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  permissions?: Permission[] | string[];
  customFields?: Record<string, any>;
  config?: Record<string, any>;
  baseUrl?: string;
  versionData: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  latestVersion?: Pick<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id" | "versionNumber" | "author" | "schema">;
  author?: string;
  timestamp: string | number | Date | undefined;
  schema?: Record<string, SchemaField>;
}

interface VideoMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedTimestamps,
  SharedIdentifiers<T, K> {
  baseData: Omit<BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, ExcludedFields>; // Updated
  meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  title: string;
  url: string;
  duration: number;
  sizeInBytes: number;
  format: string;
  uploadDate: Date;
  uploader: string;
  tags?: TagsRecord<T> | string[] | undefined;
  categories: Category[];
  language: LanguageEnum;
  location: string;
  bitrate: number;
  frameRate: number
  views: number;
  likes: number;
  comments?: number | (Comment<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | CustomComment)[] | undefined;
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
  data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  childIds: K[]; 
  relatedData: K[]; 
}

interface ProjectMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedTimestamps,
  SharedIdentifiers<T, K> {
  projectName: string;
  startDate: Date | undefined;
  endDate?: Date | undefined;
  budget: number;
  status: string;
  description?: string;
  versionData?: string | VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  teamMembers: string[];
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  milestones: string[];
  videos: Video[]; // Removed generic parameters
  projectId: number | string | undefined;
  contributors: Contributor<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  links: string[]
  customFields?: Record<string, any>
  tags?: string[] | TagsRecord<T>
  isActive: boolean;
  permissions?: Permission[] | string[];
  latestVersion?: Pick<VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, "id" | "versionNumber" | "author" | "schema">;
  lastUpdated: Date | VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Add this line
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


interface MetadataEntry<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  originalPath: string;
  alternatePaths: string[];
  author: string;
  timestamp: Date | undefined;
  fileType: string;
  title: string;
  description: string;
  keywords: string[];
  authors: string[];
  contributors: Contributor<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  publisher: string;
  copyright: string;
  license: string;
  links: string[];
  tags?: string[] | TagsRecord<T>;
}

type StringKeys<T> = Extract<keyof T, string>;

function convertTags<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  tags?: string[] | TagsRecord<T>
): TagsRecord<T> | string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;

  const newTags: TagsRecord<T> = {} as TagsRecord<T>;
  for (const key in tags) {
    const stringKey = key as StringKeys<T>;
    newTags[stringKey] = tags[stringKey]; // K-compatible
  }
  return newTags;
}



function transformProjectToStructured<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  projectMetadata: ProjectMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

  // Generate a project ID if it is undefined
  if (!projectMetadata.projectId) {
    projectMetadata.projectId = UniqueIDGenerator.generateProjectID("defaultProjectName");
  }

  // Create metadata entries based on project metadata
  const metadataEntries: Record<string, MetadataEntry<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {};
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
  const latestVersion = projectMetadata.latestVersion || createLatestVersion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();

  // Get author from first contributor or fallback
  const author = projectMetadata.contributors?.[0]?.memberName || "default-author";

  // Thread ExcludedFields fields here
  const mappedSnapshot: Map<
    string,
    Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = new Map()

  // Populate StructuredMetadata
  const structuredMetadata: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
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
    latestVersion: projectMetadata.latestVersion,
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
      category: projectMetadata.category,
      timestamp: new Date(),
      createdBy: projectMetadata.teamMembers[0] || "Unknown",
      metadata: {} as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      initialState: {} as InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      mappedSnapshot,
      events: {} as EventManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      schema: {},
      latestVersion: projectMetadata.latestVersion
    },
    sharedMetadata: {
      version: latestVersion.versionNumber || "1.0",
      lastUpdated: projectMetadata.lastUpdated,
      latestVersion: projectMetadata.latestVersion,
      isActive: projectMetadata.isActive,
      config: {} as Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
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

const projectMetadata: ProjectMetadata<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields> = {
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
  latestVersion: createLatestVersion<ProjectEntity, ProjectK, ProjectMeta, ProjectAttachment, ProjectExcludedFields, ProjectIncludedFields>(),
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


function validateVideoMetadata<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(metadata: VideoMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): VideoMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
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




const videoMetadata: VideoMetadata<VideoEntity, VideoK, VideoMeta, VideoAttachment, VideoExcludedFields, VideoIncludedFields> = {
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
    childIds: [] as VideoK[],
    relatedData: [],
    transactionHistory: [],
    latestVersion: latestVersion
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
  metadata: {} as UnifiedMetadata<VideoEntity, VideoK, VideoMeta, VideoAttachment, VideoExcludedFields, VideoIncludedFields>,
  meta: {} as StructuredMetadata<VideoEntity, VideoK, VideoMeta, VideoAttachment, VideoExcludedFields, VideoIncludedFields>,
  childIds: [],
  relatedData: [],

};


const validatedVideoMetadata = validateVideoMetadata(videoMetadata);


export { getStructureMetadataPath, projectMetadata, transformProjectToStructured, useUndoRedo, videoMetadata };
export type { MetadataEntriesType, MetadataEntry, ProjectMetadata, SpecificMetadata, StructuredMetadata, VideoMetadata };

