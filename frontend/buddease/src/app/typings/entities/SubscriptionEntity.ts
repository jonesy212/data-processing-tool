// SubscriptionEntity.ts
import { SubscriptionPayload } from '@/app/actions/SubscriptionActions';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Data } from '@/app/models/data/Data';
import { createLatestVersion } from '@/app/versions/createLatestVersion';

// ------------------------------
// 1️⃣ Base SubscriptionEntity definition
// ------------------------------
interface SubscriptionEntity extends BaseDataEntity {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  createdAt?: string | Date | number;
  updatedAt?: string | Date | number;
  isArchived?: boolean;
  
  // Subscription-specific properties
  error?: string;
  state: string;
  email: string;
  value: number;
  subscriberId: string;
  message?: string;
  type?: "info" | "success" | "error" | "warning";
  
  // Subscription management
  subscription: {
    active: boolean;
    plan: string;
  };
  
  // Notification settings
  meta: {
    name: string;
    timestamp: Date;
    type: string; // NotificationType
    startDate: Date;
    endDate: Date;
    status: string;
    id: string;
    isSticky: boolean;
    isDismissable: boolean;
    isClickable: boolean;
    isClosable: boolean;
    isAutoDismiss: boolean;
    isAutoDismissable: boolean;
    isAutoDismissOnNavigation: boolean;
    isAutoDismissOnAction: boolean;
    isAutoDismissOnTimeout: boolean;
    isAutoDismissOnTap: boolean;
    optionalData: any;
    data: any;
  };
}

// --- 6-type alias pattern ---
type SubscriptionK = SubscriptionEntity;
type SubscriptionMeta = DefaultMeta<SubscriptionEntity, SubscriptionK>;
type SubscriptionAttachment = Attachment;
type SubscriptionExcludedFields = DefaultExcludedFields<SubscriptionEntity>;
type SubscriptionIncludedFields = keyof SubscriptionEntity;

// ------------------------------
// 2️⃣ Unified template for all generics
// ------------------------------
interface SubscriptionEntityTemplate {
  T: SubscriptionEntity;
  K: SubscriptionK;
  Meta: SubscriptionMeta;
  AttachmentType: SubscriptionAttachment;
  ExcludedFields: SubscriptionExcludedFields;
  IncludedFields: SubscriptionIncludedFields;
}

// ------------------------------
// 3️⃣ Structured Metadata
// ------------------------------
type SubscriptionStructuredMetadata = DefaultMeta<
  SubscriptionEntityTemplate['T'],
  SubscriptionEntityTemplate['K']
>;



// ------------------------------
// 5️⃣ Example Data object using the template
// ------------------------------
const subscriptionData: Data<
  SubscriptionEntityTemplate['T'],
  SubscriptionEntityTemplate['K'],
  SubscriptionStructuredMetadata,
  SubscriptionEntityTemplate['AttachmentType'],
  SubscriptionEntityTemplate['ExcludedFields'],
  SubscriptionEntityTemplate['IncludedFields']
> = {
  id: "subscription-001",
  name: "Premium Subscription",
  description: "Premium access with all features",
  category: "Premium",
  tags: ["premium", "full-access", "subscription"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isArchived: false,
  
  // Subscription-specific properties
  state: "active",
  email: "user@example.com",
  value: 99.99,
  subscriberId: "sub-12345",
  message: "Welcome to premium!",
  type: "success",
  latestVersion: createLatestVersion<SubscriptionEntity, SubscriptionK, SubscriptionMeta, SubscriptionAttachment, SubscriptionExcludedFields, SubscriptionIncludedFields>(),
  subscription: {
    active: true,
    plan: "premium"
  },
  
  meta: {
    name: "Premium Subscription Notification",
    timestamp: new Date(),
    type: "success",
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    status: "active",
    id: "notif-001",
    isSticky: false,
    isDismissable: true,
    isClickable: true,
    isClosable: true,
    isAutoDismiss: true,
    isAutoDismissable: true,
    isAutoDismissOnNavigation: true,
    isAutoDismissOnAction: true,
    isAutoDismissOnTimeout: true,
    isAutoDismissOnTap: true,
    optionalData: { tier: "premium" },
    data: { features: ["all"] }
  }
};


type AppSubscription = SubscriptionPayload<SubscriptionEntity,
  SubscriptionK,
  SubscriptionMeta,
  SubscriptionAttachment,
  SubscriptionExcludedFields,
  SubscriptionIncludedFields>


export type {
  AppSubscription, SubscriptionAttachment, SubscriptionEntity, SubscriptionEntityTemplate, SubscriptionExcludedFields,
  SubscriptionIncludedFields, SubscriptionK,
  SubscriptionMeta, SubscriptionStructuredMetadata
};

  export { subscriptionData };

