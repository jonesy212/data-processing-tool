// BaseTracker.ts
import type { HighlightColor } from "@/core/components/styling/Palette";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { NotificationData } from '@/core/hooks/useNotificationSystem';
import type { FileData } from "@/core/models/data/FileData";
import type { FolderData } from "@/core/models/data/FolderData";
import type { Phase } from '@/core/models/phases/Phase';
import type { Stroke } from "@/core/state/redux/slices/DrawingSlice";
import type { User } from "@/core/users/User";
import type { Payment } from "@/core/subscriptions/SubscriptionPlan";

export interface SharedFormattingOptions {
  borderColor?: string;
  textColor?: string;
  highlightColor?: string;
  backgroundColor?: string;
  fontSize?: string | number;
  fontFamily?: string;
}

export interface TrackerConfig<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  name: string;
  phases?: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  stroke: Stroke;
  strokeWidth: number;
  fillColor: string;
  isFlippedX: boolean;
  isFlippedY: boolean;
  x: number;
  y: number;
  formattingOptions?: SharedFormattingOptions;
  userData?: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export abstract class BaseTracker<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  id: string;
  name: string;
  phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  stroke: Stroke;
  strokeWidth: number;
  fillColor: string;
  isFlippedX: boolean;
  isFlippedY: boolean;
  x: number;
  y: number;
  payments?: Payment[];
  
  borderColor?: string;
  textColor?: string;
  highlightColor?: string;
  backgroundColor?: string;
  fontSize?: string | number;
  fontFamily?: string;
  
  protected userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  constructor(config: TrackerConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
    this.id = config.id;
    this.name = config.name;
    this.phases = config.phases || [];
    this.stroke = config.stroke;
    this.strokeWidth = config.strokeWidth;
    this.fillColor = config.fillColor;
    this.isFlippedX = config.isFlippedX;
    this.isFlippedY = config.isFlippedY;
    this.x = config.x;
    this.y = config.y;
    this.userData = config.userData || {} as User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
    if (config.formattingOptions) {
      Object.assign(this, config.formattingOptions);
    }
  }

  // Common methods with basic implementation
  abstract trackFileChanges(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): void;
  
  abstract trackFolderChanges(folder: FolderData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void>;
  
  abstract updateUserProfile(
    userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
    dispatch: any
  ): void;
  
  abstract sendNotification(
    notification: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    userData: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): void;

  // Common helper methods that can be shared
  protected detectContentChanges(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
    const previousContentLength = file.previousContent?.length;
    const currentContentLength = file.currentContent?.length;

    if (previousContentLength !== currentContentLength) {
      return "Detected content changes";
    }
    return "No content changes detected";
  }

  protected trackAccessHistory(file: FileData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): string {
    const currentTime = new Date().toISOString();
    const accessRecord = `Accessed at: ${currentTime}`;
    
    file.accessHistory = file.accessHistory ?? [];
    file.accessHistory.push(accessRecord);
    
    return `Access history recorded: ${accessRecord}`;
  }

  // Common appearance update method
  updateAppearance(
    newStroke: Stroke,
    newFillColor: string,
    updates: {
      stroke?: Stroke;
      fillColor?: string;
      borderColor?: string;
      textColor?: string;
      highlightColor?: any;
      backgroundColor?: string;
      fontSize?: string;
      fontFamily?: string;
    }
  ): void {
    this.stroke.width = updates.stroke?.width ?? newStroke.width;
    this.stroke.color = updates.stroke?.color ?? newStroke.color;
    this.fillColor = updates.fillColor ?? newFillColor;

    if (updates.borderColor !== undefined) this.borderColor = updates.borderColor;
    if (updates.textColor !== undefined) this.textColor = updates.textColor;
    if (updates.highlightColor !== undefined) this.highlightColor = updates.highlightColor;
    if (updates.backgroundColor !== undefined) this.backgroundColor = updates.backgroundColor;
    if (updates.fontSize !== undefined) this.fontSize = updates.fontSize;
    if (updates.fontFamily !== undefined) this.fontFamily = updates.fontFamily;

    console.log(`Appearance updated to stroke: ${this.stroke.width}px, color: ${this.stroke.color}, fill color: ${this.fillColor}`);
  }

  getName(trackerName: string): string {
    const trackerNamesMap: Record<string, string> = {
      tracker1: "Tracker One",
      tracker2: "Tracker Two",
      tracker3: "Tracker Three",
    };

    return trackerNamesMap[trackerName] || "Unknown Tracker";
  }
}

export default BaseTracker;