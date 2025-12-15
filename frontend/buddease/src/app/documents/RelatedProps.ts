// RelatedProps.ts
import { Label } from '@/app/branding/BrandingSettings';
import { ExternalReference } from '@/app/calendar/ExternalReference';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta, RootCategories } from '@/app/config/BaseConfig';
import { Attachment, FileType } from '@/app/documents/attachment/Attachment';
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import { AccessControlEntry } from '@/app/permissions/AccessControlEntry';
import { PermissionLevel, VisibilityLevel, } from '@/app/permissions/PermissionEnums';
import { ValidationStatus } from '@/app/permissions/ValidationStatus';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { AllTypes } from '@/app/typings/PropTypes';
import { Version } from "@/app/versions/Version";

interface BaseEntityProperties { 
  _id?: string;
  id?: string | number;
  type?: string | AllTypes | Promise<FileType> | null;
  title?: string;
  label?: Label | string | Record<string, string> | null;
  key?: string;
  value?: string | number | any | null;
  name?: string;
  category?: Category;
  criteria?: CriteriaType;
  storeId?: string | number
 }

interface SharedIdentifiers<  
  T extends BaseDataEntity,
  K extends T = T
> extends RootCategories<T, K>,
  BaseEntityProperties {
  snapshotId?: string | number | null;
}

interface SharedSnapshotProperties<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntityProperties {
  version?:  Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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

export type { BaseEntityProperties, SharedIdentifiers, SharedSnapshotProperties, SharedStatusFlags, SharedTimestamps };

