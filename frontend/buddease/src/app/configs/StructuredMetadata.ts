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
import { TagsRecord } from '../components/snapshots';

// Define interfaces for metadata structures
interface StructuredMetadata extends BaseConfig {
  description: string | undefined; // Must match BaseMetaDataOptions
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
  title: string;
  url: string;
  duration: number;
  resolution: string;
  sizeInBytes: number;
  format: string;
  uploadDate: Date;
  uploader: string;
  tags?: TagsRecord | string[] | undefined;
  categories: string[];
  language: LanguageEnum;
  location: string;
  views: number;
  likes: number;
  comments: number;
  
  data: Data; // Assuming Data is a custom data type
}

interface ProjectMetadata {
  startDate: Date;
  endDate: Date;
  budget: number;
  status: string;
  description: string | undefined;
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

// Export types and constants
export type { ProjectMetadata, StructuredMetadata, VideoMetadata };
export { projectMetadata, getStructureMetadataPath, transformProjectToStructured, useUndoRedo };
