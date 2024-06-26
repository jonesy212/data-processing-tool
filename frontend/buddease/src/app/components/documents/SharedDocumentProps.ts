// SharedDocumentProps.ts
import { DocumentBuilderConfig } from "@/app/configs/DocumentBuilderConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { ContentState, EditorState } from "draft-js";
import { Dispatch, SetStateAction } from "react";
import { ProjectPhaseTypeEnum } from "../models/data/StatusType";
import { Phase } from "../phases/Phase";
import AppVersionImpl from "../versions/AppVersion";
import { ModifiedDate } from "./DocType";
import { DocumentData } from "./DocumentBuilder";
import { AccessRecord, DocumentOptions } from "./DocumentOptions";
import { DocumentPhaseTypeEnum } from "./DocumentPhaseType";

export interface CommonAnimationOptions {
  type: "slide" | "fade" | "show" | "custom" | "none"; // Add more animation types as needed
  duration: number;
  speed?: number;
  transition?: "ease-in-out" | "ease-in" | "ease-out" | "linear" | "none";
  // Add more animation-related properties
}

export interface DocumentBuilderProps extends DocumentData  {
  isDynamic: boolean;
  setDocumentPhase: (
    docPhase: string | Phase | undefined,
    phaseType: DocumentPhaseTypeEnum
  ) => {
    phase: string | Phase | undefined,
    phaseType: DocumentPhaseTypeEnum
    };
  currentContent: ContentState
  previousContent: string;
  currentMetadata: StructuredMetadata;
  
  previousMetadata: StructuredMetadata;
  accessHistory: AccessRecord[];
  lastModifiedDate: ModifiedDate | undefined;
  versionData: Version | undefined;
  documentPhase:
    | string
    | {
        name: string;
        originalPath: string;
        alternatePaths: string[];
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
        phaseType: ProjectPhaseTypeEnum;
        customProp1: string;
        customProp2: number;
        onChange: (phase: ProjectPhaseTypeEnum) => void;
      } | undefined;
  version: AppVersionImpl | undefined;
  onOptionsChange: (newOptions: DocumentOptions) => void;
  onConfigChange: (newConfig: DocumentBuilderConfig) => void;
  setOptions: Dispatch<SetStateAction<DocumentOptions>>; // Use Dispatch and SetStateAction
  documents: DocumentData[]; // Add documents prop to receive document data
  options: DocumentOptions;
  editorState: EditorState
  
  
  buildDocument: (documentData: DocumentData) => void;
  buildDocuments?: DocumentData[];
}

export interface DocumentAnimationOptions extends CommonAnimationOptions {
  // You can add any document-specific animation properties here if needed
}