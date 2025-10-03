// RelatedProps.ts
import { SnapshotContainer } from '@/app/snapshots';
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { Label } from '@/app/components/projects/branding/BrandingSettings';
import { AllTypes } from '@/app/components/typings/PropTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { Attachment, FileType } from './Attachment/attachment';
import { ExternalReference } from '../calendar/ExternalReference';
import { Data } from "@/app/models/data/Data";


interface BaseEntityProperties { 
  _id?: string;
   id?: string | number;
   type?: string | AllTypes | Promise<FileType> | null;
   title?: string;
   label?: Label | string | Record<string, string> | null;
   key?: string;
   value?: string | number | any | null;
   name?: string;
   category?: symbol | string | Category;
   criteria?: CriteriaType;

 }

interface SharedIdentifiers<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntityProperties {
  snapshotId?: string | number | null;
  categoryProperties?: CategoryProperties;
  data?: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

interface SharedSnapshotProperties<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>
  extends BaseEntityProperties {
  version?: number;
  previousVersionId?: string | null;
  nextVersionId?: string | null;
  permissions?: PermissionLevel[];
  visibility?: VisibilityLevel;
  accessControlList?: AccessControlEntry[];
  relatedSnapshotIds?: string[];
  dependencyIds?: string[];
  referenceIds?: string[];
  viewCount?: number;
  downloadCount?: number;
  shareCount?: number;
  confidenceScore?: number;
  accuracyScore?: number;
  completenessScore?: number;
  sourceSystem?: string;
  importId?: string;
  externalReferences?: ExternalReference[];
  sizeInBytes?: number;
  estimatedSize?: number;
  checksum?: string;
  validationStatus?: ValidationStatus;
  lastValidatedAt?: Date | string;
  delegate?: any;
  snapshotContainer?: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
}

interface SharedTimestamps {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
  lastLogin?: Date;
  lastLogout?: Date;
  lastPasswordChange?: Date;
  lastEmailChange?: Date;
  lastProfileChange?: Date;
  lastAvatarChange?: Date;
  lastBannerChange?: Date;
  lastStatusChange?: Date;
  lastRoleChange?: Date;
  lastTierChange?: Date;
  lastPaymentChange?: Date;
  lastSubscriptionChange?: Date;
  lastEmailVerification?: Date;
  lastPasswordReset?: Date;
  lastLoginAttempt?: Date;
  loginAttempts?: number;
  lockoutEnd?: Date | null;
}

interface SharedStatusFlags {
  isActive?: boolean;
  isArchived?: boolean;
  isCompleted?: boolean;
  isBeingEdited?: boolean;
  isBeingDeleted?: boolean;
  isBeingCompleted?: boolean;
  isBeingReassigned?: boolean;
  isDeleted?: boolean;
  isBanned?: boolean;
  isDisabled?: boolean;
  isSuspended?: boolean;
  isPending?: boolean;
  isRequested?: boolean;
  isRecommended?: boolean;
  isPopular?: boolean;
  isTrending?: boolean;
  isViral?: boolean;
  isControversial?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  isPromoted?: boolean;
  isBoosted?: boolean;
  isBookmarked?: boolean;
  isSaved?: boolean;
  isLiked?: boolean;
  isDisliked?: boolean;
  isShared?: boolean;
  isViewed?: boolean;
  isRead?: boolean;
  isUnread?: boolean;
  isNotified?: boolean;
  isNoteworthy?: boolean;
  isResponsible?: boolean;
  isAccountable?: boolean;
  isConsulted?: boolean;
  isInformed?: boolean;
  isEngaged?: boolean;
  isAvailable?: boolean;
  isOnline?: boolean;
  isOffline?: boolean;
  isAway?: boolean;
  isBusy?: boolean;
  isDoNotDisturb?: boolean;
  isUnderMaintenance?: boolean;
}

export type { SharedIdentifiers, SharedStatusFlags, SharedTimestamps, SharedSnapshotProperties, BaseEntityProperties };
