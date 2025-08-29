// RelatedProps.ts
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { Label } from '@/app/components/projects/branding/BrandingSettings';
import { Snapshot } from "@/app/components/snapshots";
import { AllTypes } from '@/app/components/typings/PropTypes';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/configs/BaseConfig';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';

interface SharedTimestamps {
	createdAt?: string | Date | undefined;
	updatedAt?: string | Date | undefined;
	createdBy?: string | undefined;
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

interface SharedIdentifiers<
	T extends BaseDataEntity,
	K extends T = T,
	Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
	ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
	_id?: string;
	id?: string | number | undefined;
	type?: string | AllTypes | null;
	title?: string;
	label?: Label | string | Record<string, string> | null;
	key?: string;
	value?: string | number | Snapshot<T, K, Meta, ExcludedFields> | null;
	name?: string;
	category?: symbol | string | Category | undefined;
	criteria?: CriteriaType
}


export type { SharedIdentifiers, SharedStatusFlags, SharedTimestamps };
