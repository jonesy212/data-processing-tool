import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { TagsRecord } from '@/app/models/tracker/Tag';
import { TagEntity } from '@/app/typings/entities/TagEntity';

import { SpecificMetadata } from '@/app/config/StructuredMetadata';
import { Tag, TagOptions } from '@/app/models/tracker/Tag';
import { AllTypes } from '@/app/typings/PropTypes';
import React from 'react';


interface TagProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> { 
  tagOptions: TagOptions<T>,
  excludedFields?: ExcludedFields,
  meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
}

// Functional Component TagComponent
const TagComponent = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  tagOptions,
  excludedFields,
  meta
}: TagProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  // Function to display tag options
  const display = () => {
    console.log(`Tag Name: ${tagOptions.name}`);
    console.log(`Tag Color: ${tagOptions.color}`);
  };

  // Function to return tag options
  const getOptions = () => tagOptions;

  // Function to get tag id
  const getId = () => tagOptions.id;

  return (
    <div>
      <p>Tag Name: {tagOptions.name}</p>
      <p>Tag Color: {tagOptions.color}</p>
      {meta && <span>Created By: {meta.createdBy}</span>}
    </div>
  );
};

export default TagComponent;

// Example usage of TagComponent
const tagOptions1: TagOptions<TagEntity> = {
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
  } as TagsRecord<TagEntity>, // explicit type
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
const tag1: React.ReactElement = <TagComponent<BaseDataEntity> tagOptions={tagOptions1} />;
const tag2: React.ReactElement = <TagComponent<BaseDataEntity> tagOptions={tagOptions2} />;

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


export { TagComponent };
