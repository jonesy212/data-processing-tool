// DocumentPath.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { CommonData } from "@/app/models/CommonData";
import { Content } from "@/app/models/content/AddContent";
import { DocumentBase } from "@/app/state/stores/DocumentStore";
import { DatasetModel } from "@/app/todos/tasks/DataSetModel";
import AccessHistory from "@/app/versions/AccessHistory";
import { Version } from "@/app/versions/Version";
import { VersionData } from "@/app/versions/VersionData";
import { AppStructurePermissions } from "@/app/config/appStructure/AppStructure";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';


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
  documents: DocumentPath<T, K, Meta>[];
  permissions?: AppStructurePermissions;
  folders: string[];
  folderPath: string;
  previousContent?: Content<T, K, Meta>;
  currentContent?: Content<T, K, Meta>;
  previousMeta?: Meta;
  currentMeta?: Meta;
  accessHistory: AccessHistory[];
  documentPhase?: string;
  version?: Version<T, K, Meta>;
  versionData?: VersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  visibility: string;
  documentSize: { size: number };
  lastModifiedDate: Date;
  lastModifiedBy: string;
  createdByRenamed: string;
  createdDate: string;
  documentType: string;
  documentData?: any;
  document?: any;
  
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
