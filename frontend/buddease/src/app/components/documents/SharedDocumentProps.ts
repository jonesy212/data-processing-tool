// SharedDocumentProps.ts

import { DocumentFormattingOptions } from '@/app/components/documents/ DocumentFormattingOptionsComponent';
import { BaseData } from '@/app/components/models/data/Data';
import { ProjectPhaseTypeEnum } from "@/app/models/data/StatusType";
import { Phase } from "@/app/phases/Phase";
import { TagsRecord } from '@/app/snapshots';
import AppVersionImpl from "@/app/versions/AppVersion";
import { DocumentBuilderConfig } from "@/config/DocumentBuilderConfig";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { ContentState, EditorState } from 'draft-js';
import { Dispatch, SetStateAction } from "react";
import { DocumentTypeEnum } from '@/server/ServerDocumentGenerator';
import AccessHistory from '@/app/components/versions/AccessHistory';
import { VersionData } from '@/app/versions/VersionData';
import { WritableDraft } from '../state/redux/ReducerGenerator';
import { DocumentObject } from '../state/redux/slices/DocumentSlice';
import { ModifiedDate } from "./DocType";
import { DocumentData } from "@/app/documents/editing/DocumentBuilder";
import { DocumentOptions } from "./DocumentOptions";
import { DocumentPhaseTypeEnum } from "./DocumentPhaseType";

export interface CommonAnimationOptions {
  type: "slide" | "fade" | "show" | "custom" | "none"; // Add more animation types as needed
  duration: number;
  speed?: number;
  transition?: "ease-in-out" | "ease-in" | "ease-out" | "linear" | "none";
  // Add more animation-related properties
}

export interface DocumentBuilderProps<
  T extends BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>
  extends DocumentData<T, K, Meta, ExcludedFields>  {
  isDynamic: boolean;
  setDocumentPhase?: (
    docPhase: string | Phase | undefined,
    phaseType: DocumentPhaseTypeEnum
  ) => {
    phase: string | Phase | undefined,
    phaseType: DocumentPhaseTypeEnum
    } | undefined;
  currentContent?: ContentState
  previousContent?: string | ContentState;
  previousMetadata?: UnifiedMetadata<T, K> | undefined;
  currentMetadata: UnifiedMetadata<T, K>
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
         tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string[] | undefined; 
        phaseType: ProjectPhaseTypeEnum;
        customProp1: string;
        customProp2: number;
        onChange: (phase: ProjectPhaseTypeEnum) => void;
      } | undefined;
  version: AppVersionImpl | undefined;
  onOptionsChange: (newOptions: DocumentOptions) => void;
  onConfigChange: (newConfig: DocumentBuilderConfig) => void;
  setOptions: Dispatch<SetStateAction<DocumentOptions>>; 
  documents: WritableDraft<DocumentObject<T, K, Meta>>[]
  options: DocumentOptions;
  editorState: EditorState
  projectPath: string;
  buildDocument: (options: DocumentFormattingOptions, documentData: DocumentData<T, K, Meta, ExcludedFields>, document: DocumentObject<T, K, Meta>, documentType: DocumentTypeEnum) => void;
  buildDocuments?: DocumentData<T, K, Meta, ExcludedFields>[];
}

export interface DocumentAnimationOptions extends CommonAnimationOptions {
  // You can add any document-specific animation properties here if needed
}