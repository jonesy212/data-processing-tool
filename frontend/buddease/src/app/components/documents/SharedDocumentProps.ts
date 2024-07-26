import { ContentState } from 'draft-js';
// SharedDocumentProps.ts
import { DocumentBuilderConfig } from "@/app/configs/DocumentBuilderConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { EditorState } from "draft-js";
import { Dispatch, SetStateAction } from "react";
import { ProjectPhaseTypeEnum } from "../models/data/StatusType";
import { Phase } from "../phases/Phase";
import AccessHistory from '../versions/AccessHistory';
import AppVersionImpl from "../versions/AppVersion";
import { VersionData } from '../versions/VersionData';
import { ModifiedDate } from "./DocType";
import { DocumentData } from "./DocumentBuilder";
import { DocumentOptions } from "./DocumentOptions";
import { DocumentPhaseTypeEnum } from "./DocumentPhaseType";
import { DocumentObject } from '../state/redux/slices/DocumentSlice';
import { DocumentTypeEnum } from './DocumentGenerator';
import { WritableDraft } from '../state/redux/ReducerGenerator';

export interface CommonAnimationOptions {
  type: "slide" | "fade" | "show" | "custom" | "none"; // Add more animation types as needed
  duration: number;
  speed?: number;
  transition?: "ease-in-out" | "ease-in" | "ease-out" | "linear" | "none";
  // Add more animation-related properties
}

export interface DocumentBuilderProps extends DocumentData  {
  isDynamic: boolean;
  setDocumentPhase?: (
    docPhase: string | Phase | undefined,
    phaseType: DocumentPhaseTypeEnum
  ) => {
    phase: string | Phase | undefined,
    phaseType: DocumentPhaseTypeEnum
    } | undefined;
  currentContent: ContentState
  previousContent?: string | ContentState;
  currentMetadata: StructuredMetadata | undefined;
  previousMetadata: StructuredMetadata | undefined;
  accessHistory: AccessHistory[];
  lastModifiedDate: ModifiedDate | undefined;
  versionData: VersionData | undefined;
  documentPhase:
    | string
    | {
        name?: string;
        originalPath?: string;
        alternatePaths?: string[];
        fileType?: string;
        title?: string;
        description?: string;
        keywords?: string[];
        authors?: string[];
        contributors?: string[];
        publisher?: string;
        copyright?: string;
        license?: string;
        links?: string[];
        tags?: string[];
        phaseType: ProjectPhaseTypeEnum;
        customProp1: string;
        customProp2: number;
        onChange: (phase: ProjectPhaseTypeEnum) => void;
      } | undefined;
  version: AppVersionImpl | undefined;
  onOptionsChange: (newOptions: DocumentOptions) => void;
  onConfigChange: (newConfig: DocumentBuilderConfig) => void;
  setOptions: Dispatch<SetStateAction<DocumentOptions>>; 
  documents: WritableDraft<DocumentObject>[]
  options: DocumentOptions;
  editorState: EditorState
  projectPath: string;
  buildDocument: (documentData: DocumentData, document: DocumentObject, documentType: DocumentTypeEnum) => void;
  buildDocuments?: DocumentData[];
}

export interface DocumentAnimationOptions extends CommonAnimationOptions {
  // You can add any document-specific animation properties here if needed
}