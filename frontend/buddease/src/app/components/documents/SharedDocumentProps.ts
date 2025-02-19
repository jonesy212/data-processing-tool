// SharedDocumentProps.ts

import { ContentState } from 'draft-js';
import { DocumentFormattingOptions } from '@/app/components/documents/ DocumentFormattingOptionsComponent';
import { DocumentBuilderConfig } from "@/app/configs/DocumentBuilderConfig";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { EditorState } from "draft-js";
import { Dispatch, SetStateAction } from "react";
import { ProjectPhaseTypeEnum } from "../models/data/StatusType";
import { Phase } from "../phases/Phase";
import { TagsRecord } from '../snapshots';
import { WritableDraft } from '../state/redux/ReducerGenerator';
import { DocumentObject } from '../state/redux/slices/DocumentSlice';
import AccessHistory from '../versions/AccessHistory';
import AppVersionImpl from "../versions/AppVersion";
import { VersionData } from '../versions/VersionData';
import { ModifiedDate } from "./DocType";
import { DocumentData } from "./DocumentBuilder";
import { DocumentTypeEnum } from './DocumentGenerator';
import { DocumentOptions } from "./DocumentOptions";
import { DocumentPhaseTypeEnum } from "./DocumentPhaseType";
import { BaseData } from '@/app/components/models/data/Data';
import { ExcludedFields } from '@/app/components/routing/Fields';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';

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
  ExcludedFields extends keyof T = never
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
  previousMetadata?: UnifiedMetaDataOptions<T, K> | undefined;
  currentMetadata: UnifiedMetaDataOptions<T, K>
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
         tags?: TagsRecord<T, K> | string[] | undefined; 
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