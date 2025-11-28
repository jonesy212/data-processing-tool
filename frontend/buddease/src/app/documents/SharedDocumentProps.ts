// SharedDocumentProps.ts

import { DocumentFormattingOptions } from '@/app/components/documents/DocumentFormattingOptionsComponent';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { ModifiedDate } from "@/app/documents/DocType";
import { DocumentOptions } from "@/app/documents/DocumentOptions";
import { DocumentData } from "@/app/documents/editing/DocumentBuilder";
import { DocumentPhaseTypeEnum } from "@/app/documents/editing/DocumentPhaseType";
import { ProjectPhaseTypeEnum } from "@/app/models/data/StatusType";
import { Phase } from '@/app/models/phases/Phase';
import { TagsRecord } from '@/app/models/tracker/Tag'
import { WritableDraft } from '@/app/state/redux/ReducerGenerator';
import { DocumentObject } from '@/app/state/redux/slices/DocumentSlice';
import { DocumentTypeEnum } from '@/app/typings/documentTypes';
import AccessHistory from '@/app/versions/AccessHistory';
import AppVersionImpl from "@/app/versions/AppVersion";
import { VersionData } from '@/app/versions/VersionData';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { DocumentBuilderConfig } from "@/app/config/DocumentBuilderConfig";
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";
import { ContentState, EditorState } from 'draft-js';
import { Dispatch, SetStateAction } from "react";
import { DocumentPhase } from '@/app/models/phases/DocumentPhase'


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
  lastModifiedDate?: ModifiedDate | undefined; 
  versionData: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  documentPhase: 
    | string
    | DocumentPhase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  appVersion?: AppVersionImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  onOptionsChange: (newOptions: DocumentOptions) => void;
  onConfigChange: (newConfig: DocumentBuilderConfig) => void;
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