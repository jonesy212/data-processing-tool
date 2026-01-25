// SettingsEntity.ts
// SettingsEntity
import '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { User } from '@/core/users/User';
import type { Task } from '@/core/models/tasks/Task';
import type { TrackerProps } from '@/core/models/tracker/Tracker';
import type { Todo } from '@/core/todos/Todo';
import type { TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields } from '@/core/typings/entities/TaskEntity';
import type { UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields } from '@/core/typings/entities/UserEntity';

// Settings entity interface
interface SettingsEntity extends BaseDataEntity {
  userId: number;
  notificationsEnabled: boolean;
  communicationMode: string;
  enableRealTimeUpdates: boolean;
  // ... all other settings properties
}

// Extended settings type (K)
interface SettingsEntityExtended extends SettingsEntity {
  // Add any extended properties here
}

// Type parameters for Settings
type SettingsK = SettingsEntityExtended;
type SettingsMeta = DefaultMeta<SettingsEntity, SettingsK>;
type SettingsAttachment = Attachment;
type SettingsExcludedFields = DefaultExcludedFields<SettingsEntity>;
type SettingsIncludedFields = keyof SettingsEntity;

// Settings base params container
type SettingsBaseParams = {
  T: SettingsEntity;
  K: SettingsK;
  Meta: SettingsMeta;
  AttachmentType: SettingsAttachment;
  ExcludedFields: SettingsExcludedFields;
  IncludedFields: SettingsIncludedFields;
};

// Export types
export type {
  SettingsEntity,
  SettingsK,
  SettingsMeta,
  SettingsAttachment,
  SettingsExcludedFields,
  SettingsIncludedFields,
  SettingsBaseParams
};