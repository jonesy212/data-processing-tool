// SharedDocumentProps.ts

import type { DocumentFormattingOptions } from '@/core/components/documents/DocumentFormattingOptionsComponent';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { DocumentBuilderConfig } from "@/core/config/DocumentBuilderConfig";
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { ModifiedDate } from "@/core/documents/DocType";
import type { DocumentOptions } from "@/core/documents/DocumentOptions";
import type { DocumentData } from "@/core/documents/editing/DocumentBuilder";
import { DocumentPhaseTypeEnum } from "@/core/documents/editing/DocumentPhaseType";
import { DocumentPhase } from '@/core/models/phases/DocumentPhase';
import { Phase } from '@/core/models/phases/Phase';
import { WritableDraft } from '@/core/state/redux/ReducerGenerator';
import { DocumentObject } from '@/core/state/redux/slices/DocumentSlice';
import { DocumentTypeEnum } from '@/core/typings/documentTypes';
import AccessHistory from '@/core/versions/AccessHistory';
import AppVersionImpl from "@/core/versions/AppVersion";
import { VersionData } from '@/core/versions/VersionData';
import { ContentState, EditorState } from 'draft-js';
import { Dispatch, SetStateAction } from "react";


export interface CommonAnimationOptions {
  type: "slide" | "fade" | "show" | "custom" | "none"; // Add more animation types as needed
  duration: number;
  speed?: number;
  transition?: "ease-in-out" | "ease-in" | "ease-out" | "linear" | "none";
  // Add more animation-related properties
}

export interface DocumentBuilderProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>  extends DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  {
  isDynamic: boolean;
  setDocumentPhase?: (
    docPhase: string | Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
    phaseType: DocumentPhaseTypeEnum
  ) => {
    phase: string | Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined,
    phaseType: DocumentPhaseTypeEnum
    }
  currentContent?: ContentState
  previousContent?: string | ContentState;
  previousMetadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  accessHistory: AccessHistory[];
  lastModifiedDate: ModifiedDate; 
  versionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  documentPhase: 
    | string
    | DocumentPhase<T, K>;

  appVersion?: AppVersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  onOptionsChange: (newOptions: DocumentOptions) => void;
  onConfigChange: (newConfig: DocumentBuilderConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  setOptions: Dispatch<SetStateAction<DocumentOptions>>; 
  documents: WritableDraft<DocumentObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>[];
  options: DocumentOptions;
  editorState: EditorState
  projectPath: string;
  getDefaultMetadata: () => UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  buildDocument: (options: DocumentFormattingOptions,
  documentData: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, document: DocumentObject<T, K, Meta>, documentType: DocumentTypeEnum) => void;
  buildDocuments?: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

export interface DocumentAnimationOptions extends CommonAnimationOptions {
  // You can add any document-specific animation properties here if needed
}