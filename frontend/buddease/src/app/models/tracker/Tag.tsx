// Tag.tsx
import { TagComponent } from '@/app/components/models/tracker/TagComponent';
import { BaseConfig } from '@/app/config/BaseConfig';
import { SpecificMetadata, StructuredMetadata } from '@/app/config/StructuredMetadata';
import { BaseEntityProperties, SharedStatusFlags, SharedTimestamps } from '@/app/documents/RelatedProps';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseDataEntity } from '@/app/snapshots/ValidationRule';
import { MetaAttachment, MetaEntity, MetaExcludedFields, MetaIncludedFields, MetaK, MetaMeta } from "@/app/typings/entities/MetaEntity";
import {
    TagAttachment,
    TagEntity,
    TagExcludedFields,
    TagIncludedFields,
    TagK,
    TagMeta
} from '@/app/typings/entities/TagEntity';
import { AllTypes } from '@/app/typings/PropTypes';
import { VersionData } from '@/app/versions/VersionData';
import React from 'react';
// Define the Tag interface and TagOptions interface
// Main Tag interface
interface Tag<T extends BaseDataEntity> extends TagOptions<T>, SharedTimestamps, SharedStatusFlags {
  relatedTags?: string[] | Tag<T>[];
  attribs?: Record<string, any>;
}

// Taggable interface for anything that can have tags/categories/keywords
interface Taggable<T extends BaseDataEntity> {
  tags?: string[] | TagsRecord<T>;
  categories?: Category[] | string[];
  keywords?: string[];
}



// Define BaseData interface
type TagsRecord<T extends BaseDataEntity> = SharedTimestamps & {
  [tagName: string]: Tag<T> | undefined;
};

interface TagOptions<T extends BaseDataEntity> extends BaseEntityProperties, SharedTimestamps {
  color: string;
  description: string;
  enabled: boolean;
  nulltype: AllTypes;
  tags?: string[] | TagsRecord<T>;
  timestamp: number;
}


const tag1: Tag<BaseDataEntity> = {
  id: "1",
  name: "Important",
  color: "red",
  description: "Important items that require attention",
  enabled: true,
  type: "priority",
  relatedTags: [],
  attribs: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "system",
  timestamp: Date.now(),
  nulltype: {} as AllTypes,
  tags: {
    createdAt: new Date(),
    createdBy: "system",
    updatedAt: new Date(),
    updatedBy: "system",
    "1": {
      id: "1",
      name: "Important",
      color: "red",
      description: "Important items that require attention",
      enabled: true,
      type: "priority",
      relatedTags: [],
      attribs: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      timestamp: Date.now(),
      nulltype: {} as AllTypes
    }
  } as TagsRecord<BaseDataEntity>
};


const tagOptions2: TagOptions<TagEntity> = {
  id: "2",
  name: "Less Important",
  color: "blue",
  description: '',
  enabled: false,
  type: '',
  tags: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  createdBy: '',
  timestamp: 0,
  nulltype: {} as AllTypes
};

const meta1: StructuredMetadata<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields> = {
  baseConfig: {} as BaseConfig<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>,
  sharedMetadata: {},
  sharedBaseData: {},
  taggable: {},
  metadataEntries: [], 
  keywords: [],
  versionData: {} as VersionData<MetaEntity, MetaK, MetaMeta, MetaAttachment, MetaExcludedFields, MetaIncludedFields>,
  timestamp: new Date(),
} 
const createTagElement = (
  tagOptions: TagOptions<TagEntity>
): React.ReactElement => {
  return React.createElement(
    TagComponent<TagEntity, TagK, TagMeta, TagAttachment, TagExcludedFields, TagIncludedFields>,
    { 
      tagOptions,
      excludedFields: [], // Provide default or actual excluded fields
      meta: undefined, // Provide meta if available, or undefined
      key: tagOptions.id 
    }
  );
};

const tag1 = createTagElement(tagOptions1);
const tag2 = createTagElement(tagOptions2)

// Sorting function for TagOptions
const localeCompare = <T extends BaseDataEntity>(
  a: TagOptions<T>,
  b: TagOptions<T>
): number => {
  const nameA = a.name ?? '';
  const nameB = b.name ?? '';
  return nameA.localeCompare(nameB);
};

const sortTags = <T extends BaseDataEntity>(tags: TagOptions<T>[]) => {
  tags.sort(localeCompare);
  return tags;
};

export const createTag = <T extends BaseDataEntity>(
  id: string, 
  name: string, 
  color: string,
  options: {
    description?: string;
    enabled?: boolean;
    type?: string;
    relatedTags?: string[] | Tag<T>[];
    attribs?: Record<string, any>;
    tags?: TagsRecord<T>;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    timestamp?: number;
    nulltype?: AllTypes;
  } = {}
): Tag<T> & { tags?: TagsRecord<T> } => {
  
  const {
    description = "description",
    enabled = true,
    type = "type",
    relatedTags = [],
    attribs = {},
    tags,
    createdAt,
    updatedAt,
    createdBy = "user",
    timestamp = Date.now(),
    nulltype = {} as AllTypes
  } = options;

  return {
    id,
    name,
    color,
    description,
    enabled,
    type,
    relatedTags,
    attribs,
    createdAt,
    updatedAt,
    createdBy,
    timestamp,
    nulltype,
    ...(tags && { tags }) // Only include tags if provided
  };
};

function processTags<T extends BaseDataEntity>(
  tags: TagsRecord<T>| string[]
): void {
  if (Array.isArray(tags)) {
    console.log("Simple tags:", tags);
  } else {
    console.log("Complex tags:", tags);
  }
}


function processVideoMetadata<
  T extends BaseDataEntity,
  K extends T = T
>(
  meta: SpecificMetadata<T, K>
): void {
  if (meta.tags) {
    if (Array.isArray(meta.tags)) {
      console.log("Simple tags:", meta.tags);
    } else {
      console.log("Complex tags:", meta.tags);
    }
  }
}


export type { Tag, Taggable, TagOptions, TagsRecord };

