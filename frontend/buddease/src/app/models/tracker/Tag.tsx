import { TagComponent } from '@/app/components/models/tracker/TagComponent';
import { DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { SpecificMetadata } from '@/app/config/StructuredMetadata';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseEntityProperties, SharedStatusFlags, SharedTimestamps } from '@/app/documents/RelatedProps';
import { TagsRecord } from '@/app/models/tracker/Tag';
import { BaseDataEntity } from '@/app/snapshots/ValidationRule';
import { TagAttachment, TagEntity, TagExcludedFields, TagIncludedFields, TagK, TagMeta } from '@/app/typings/entities/TaskEntity';
import { AllTypes } from '@/app/typings/PropTypes';
import React from 'react';

// Define the Tag interface and TagOptions interface
// Main Tag interface
interface Tag<T extends BaseDataEntity> extends TagOptions<T>, SharedTimestamps, SharedStatusFlags {
  relatedTags: string[];
  attribs?: Record<string, any>;
}

// Taggable interface for anything that can have tags/categories/keywords
interface Taggable<T extends BaseDataEntity> {
  tags?: string[] | TagsRecord<T>;
  categories?: string[];
  keywords?: string[];
}



// Define BaseData interface
interface TagsRecord<T extends BaseDataEntity> {
  [tagName: string]: Tag<T>;
}



interface TagOptions<T extends BaseDataEntity> extends BaseEntityProperties, BaseMetadataProperties {
  color: string;
  description: string;
  enabled: boolean;
  nulltype: AllTypes;
  tags?: string[] | TagsRecord<T>;
  timestamp: number;
}




// Example usage of TagComponent
const tagOptions1: TagOptions<BaseDataEntity> = {
  id: "1",
  name: "Important",
  color: "red",
  description: '',
  enabled: false,
  type: '',
  tags: {
    "1": {
      id: "1",
      name: "Important",
      color: "red",
      description: '',
      enabled: false,
      type: '',
      relatedTags: [],
      attribs: {},
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: '',
      timestamp: 0,
      nulltype: {} as AllTypes
    }
  } as TagsRecord<BaseDataEntity>, // explicit type
  createdAt: undefined,
  updatedAt: undefined,
  createdBy: '',
  timestamp: 0,
  nulltype: {} as AllTypes
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

const tag1: React.ReactElement = <TagComponent<TagEntity, TagK, TagMeta, TagAttachment, TagIncludedFields, TagExcludedFields> tagOptions={tagOptions1} />;
const tag2: React.ReactElement = <TagComponent<TagEntity, TagK, TagMeta, TagAttachment, TagIncludedFields, TagExcludedFields> tagOptions={tagOptions2} />;

// Example usage of functions
tag1.props.children;
tag2.props.children;

// Sorting function for TagOptions
const localeCompare = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  a: TagOptions<T>,
  b: TagOptions<T>
): number => {
  const nameA = a.name ?? '';
  const nameB = b.name ?? '';
  return nameA.localeCompare(nameB);
};

const sortTags = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(tags: TagOptions<T>[]) => {
  tags.sort(localeCompare);
  return tags;
};

export const createTag = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  id: string, 
  name: string, 
  color: string,
  p0: {
    tags: (string[] | Tag<T>[]) & TagsRecord<T>;
    description: string; 
    enabled: boolean;
  }
): TagOptions<T> => ({
  id,
  name,
  color,
  description: p0.description,
  enabled: p0.enabled,
  type: '',
  tags: p0.tags,
  createdAt: undefined,
  updatedAt: undefined,
  createdBy: '',
  timestamp: 0,
  nulltype: {} as AllTypes
});


function processTags<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
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
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  meta: SpecificMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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

