// DrawingEntity.ts
import { BaseDataEntity, BaseDataRoot, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Content } from '@/app/models/content/AddContent';
import { Filter } from '@/app/pages/searches/SearchOptions';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotConfigParams } from '@/app/snapshots/SnapshotConfigBuilder';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotWithCriteria } from '@/app/snapshots/SnapshotWithCriteria';
import { BlendMode, DrawingElement, Shadow } from '@/app/state/redux/slices/DrawingSlice';
import { SubscriberCollection } from '@/app/subscribers/SubscriberCollection';
import { RealtimeDataItem } from '@/app/typings/realtimeTypes';

// Core Drawing Entity with all properties from Shape, LayerEffect, etc.
export interface DrawingEntity extends BaseDataEntity {
  // Core identifier and basic properties
  id: string;
  name: string;
  type: string;
  
  // Position and dimensions
  x: number;
  y: number;
  width?: number | string;
  height?: number | string;
  rotation?: number;
  
  // Appearance properties
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  opacity?: number;
  blendMode?: BlendMode;
  
  // Transform properties
  isFlippedX?: boolean;
  isFlippedY?: boolean;
  scaleX?: number;
  scaleY?: number;
  
  // State properties
  visible?: boolean;
  locked?: boolean;
  selected?: boolean;
  
  // Layer properties
  layerId?: string;
  groupId?: string;
  zIndex?: number;
  
  // Drawing-specific properties
  coordinates?: { x: number; y: number };
  pathData?: string; // For vector paths
  points?: number[]; // For polygonal shapes
  radius?: number; // For circles
  startAngle?: number; // For arcs
  endAngle?: number; // For arcs
  
  // Text properties
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Effect properties
  effects?: LayerEffect[];
  filters?: Filter[];
  shadows?: Shadow[];
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  version?: number;
  
  // Relationships
  parentId?: string;
  children?: DrawingEntity[];
  
  // Custom data
  metadata?: Record<string, any>;
  tags?: string[];
}

// Extended interfaces for specific entity types
export interface Shape extends DrawingEntity {
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'line' | 'path';
  cornerRadius?: number; // For rounded rectangles
  sides?: number; // For polygons
}

export interface LayerEffect extends DrawingEntity {
  effectType: 'blur' | 'shadow' | 'glow' | 'gradient' | 'texture';
  intensity?: number;
  radius?: number;
  color?: string;
  offsetX?: number;
  offsetY?: number;
  spread?: number;
  gradientType?: 'linear' | 'radial' | 'angular';
  gradientStops?: { position: number; color: string }[];
  textureUrl?: string;
  blendMode?: BlendMode;
}

export interface Guide extends DrawingEntity {
  guideType: 'horizontal' | 'vertical' | 'angular';
  position: number;
  color: string;
  label: string;
  visible: boolean;
  locked: boolean;
}





// Drawing-specific type parameters following your app's pattern
export type DrawingK = DrawingEntity;
export type DrawingMeta = DefaultMeta<DrawingEntity, DrawingK>;
export type DrawingAttachment = Attachment;
export type DrawingExcludedFields = DefaultExcludedFields<DrawingEntity>;
export type DrawingIncludedFields = keyof DrawingEntity;

// Main parameters container for Drawing
export type DrawingBaseParams = {
  T: DrawingEntity;
  K: DrawingK;
  Meta: DrawingMeta;
  AttachmentType: DrawingAttachment;
  ExcludedFields: DrawingExcludedFields;
  IncludedFields: DrawingIncludedFields;
};

// Snapshot and realtime types for Drawing
export type DrawingSnapshot = Snapshot<DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields>;
export type DrawingSnapshotData = SnapshotData<DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields>;
export type DrawingSnapshotStore = SnapshotStore<DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields>;
export type DrawingSnapshotWithCriteria = SnapshotWithCriteria<DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields>;
export type DrawingSubscriberCollection = SubscriberCollection<DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields>;
export type DrawingRealtimeDataItem = RealtimeDataItem<DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields>;

// Configuration types
export type DrawingSnapshotStoreConfig = SnapshotStoreConfig<DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields>;
export type DrawingSnapshotsArray = SnapshotsArray<DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields>;

// PARAMS
export type DrawingParams = SnapshotConfigParams<DrawingEntity, DrawingK, DrawingMeta, DrawingAttachment, DrawingExcludedFields, DrawingIncludedFields>;

// Utility to pick or omit fields dynamically
export type ApplyDrawingFieldFilters<
  T extends DrawingEntity,
  Excluded extends keyof T = never,
  Included extends Exclude<keyof T, Excluded> = Exclude<keyof T, Excluded>
> = Pick<Omit<T, Excluded>, Included>;

// Layer interface that uses DrawingEntity
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  groupId?: string;
  content: DrawingEntity[];
  effects: LayerEffect[];
  blendMode: BlendMode;
  opacity: number;
  compositeOperation?: GlobalCompositeOperation;
  filters: Filter[];
  mask?: DrawingEntity;
}

// Create a specific base for templates
interface BaseTemplateEntity<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Template-specific common properties
  categories: string[];
  tags: string[];
  imageUrl?: string;
  preview?: string;
}

// Then extend this for DrawingTemplate
export interface DrawingTemplate<
  T extends DrawingEntity = DrawingEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DrawingMeta,
  AttachmentType extends Attachment = DrawingAttachment,
  ExcludedFields extends keyof T = DrawingExcludedFields,
  IncludedFields extends keyof T = DrawingIncludedFields
> extends BaseTemplateEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {

    elements: DrawingElement[];
  content: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}


// Tracker integration
export interface TrackerDrawingElement {
  id: string;
  name: string;
  type: string;
  coordinates: { x: number; y: number };
  width: number | string;
  height: number | string;
  stroke?: string;
  strokeWidth?: number;
  fillColor?: string;
  isFlippedX?: boolean;
  isFlippedY?: boolean;
  x: number;
  y: number;
  
  // Tracker methods
  trackFileChanges?: (file: any) => Promise<void>;
  trackFolderChanges?: (folder: any) => Promise<void>;
}

export type {
  DrawingAttachment as AppAttachment, DrawingBaseParams as AppBaseParams, DrawingEntity as AppEntity, DrawingExcludedFields as AppExcludedFields,
  DrawingIncludedFields as AppIncludedFields,
  DrawingK as AppK,
  DrawingMeta as AppMeta, DrawingParams as AppParams,
  DrawingRealtimeDataItem as AppRealtimeDataItem,
  DrawingSnapshot as AppSnapshot, DrawingSnapshotData as AppSnapshotData,
  DrawingSnapshotsArray as AppSnapshotsArray,
  DrawingSnapshotStore as AppSnapshotStore,
  DrawingSnapshotStoreConfig as AppSnapshotStoreConfig,
  DrawingSnapshotWithCriteria as AppSnapshotWithCriteria,
  DrawingSubscriberCollection as AppSubscriberCollection
};

