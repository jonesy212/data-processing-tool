// DocumentPath.ts
import { AppStructurePermissions } from "@/core/config/appStructure/AppStructure";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import { CommonData } from "@/core/models/CommonData";
import { Content } from "@/core/models/content/AddContent";
import { Permission } from '@/core/permissions/Permission';
import { DocumentBase } from "@/core/state/stores/DocumentStore";
import { DatasetModel } from "@/core/todos/tasks/DataSetModel";
import AccessHistory from "@/core/versions/AccessHistory";
import { Version } from "@/core/versions/Version";
import { VersionData } from "@/core/versions/VersionData";


interface DocumentPath<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends DocumentBase, 
  CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  DatasetModel<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
{
  id: string;
  _id: string;
  title: string;
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  documents: DocumentPath<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  permissions?: Permission[];
  appPermissions?: AppStructurePermissions[];
  folders: string[];
  folderPath: string;
  previousContent?: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  currentContent?: Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  previousMeta?: Meta;
  currentMeta?: Meta;
  accessHistory: AccessHistory[];
  documentPhase?: string;
  version?: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  versionData?: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  visibility: string;
  documentSize: { size: number };
  lastModifiedDate: Date;
  lastModifiedBy: string;
  createdByRenamed: string;
  createdDate: string;
  documentType: string;
  documentData?: DocumentData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  document?: any;
  hasPermission?(userId: string, permissionType: string): boolean;
  getUsersWithPermission?(permissionType: string): string[];

  // CouchDB/Elasticsearch fields
  _rev: string;
  _attachments: Record<string, any>;
  _links: Record<string, any>;
  _etag: string;
  _local: boolean;
  _revs: any[];
  _source: Record<string, any>;
  _shards: Record<string, any>;
  _size: number;
  _version: number;
  _version_conflicts: number;
  _seq_no: number;
  _primary_term: number;
  _routing: string;
  _parent: string;
  _parent_as_child: boolean;
  _slices: any[];
  _highlight: Record<string, any>;
  _highlight_inner_hits: Record<string, any>;
  _source_as_doc: boolean;
  _source_includes: string[];
  _routing_keys: string[];
  _routing_values: string[];
  _routing_values_as_array: string[];
  _routing_values_as_array_of_objects: any[];
  _routing_values_as_array_of_objects_with_key: any[];
  _routing_values_as_array_of_objects_with_key_and_value: any[];
  _routing_values_as_array_of_objects_with_key_and_value_and_value: any[];
}


export type { DocumentPath };
