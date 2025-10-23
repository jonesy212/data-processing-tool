import { BaseEntityProperties, SharedIdentifiers, SharedStatusFlags, SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { TagsRecord } from "@/app/snapshots/SnapshotWithCriteria";
import { BaseDataEntity,DefaultMeta, DefaultExcludedFields, DefaultIncludedFields} from '@/config/BaseConfig';
import { AllTypes } from '@/app/typings/PropTypes';
import { SpecificMetadata } from '@/config/StructuredMetadata';
import React from 'react';


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

const tagOptions2: TagOptions<BaseDataEntity> = {
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
  a: TagOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  b: TagOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): number => {
  const nameA = a.name ?? '';
  const nameB = b.name ?? '';
  return nameA.localeCompare(nameB);
};

const sortTags = <T extends BaseDataEntity, K extends T = T>(tags: TagOptions<T, K>[]) => {
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
    tags: (string[] | Tag<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) & TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    description: string; 
    enabled: boolean;
  }
): TagOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => ({
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
  tags: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>| string[]
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


export type { Tag, TagOptions };
