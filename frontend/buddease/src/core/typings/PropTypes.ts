PropTypes.ts
PropTypes.tsx
import {
    BaseDataEntity,
    BaseDataRoot,
    DefaultExcludedFields,
    DefaultMeta
} from '@/core/config/BaseConfig';
import TextType from "@/core/documents/TextType";
import type { Attachment, FileType } from '@/core/documents/attachment/Attachment';
import { AuthNotificationTypes } from '@/core/features/support/NotificationTypes';
import { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { MessageType } from "@/core/generators/MessaageType";
import { DataType } from "@/core/models/CommonData";
import { LogData } from "@/core/models/LogData";
import {
    CalendarStatus,
    ChatType,
    CustomNotificationType,
    MessageNotificationStatusType,
    PriorityTypeEnum,
    StatusType,
    TeamStatus
} from "@/core/models/data/StatusType";
import {
    ProgressBarAnimationType,
    ProgressBarProps,
    ProgressPhase,
} from "@/core/models/tracker/ProgressBar";
import { SendStatus } from "@/core/state/redux/slices/NofiticationsSlice";
import { AllStatus } from "@/core/state/stores/DetailsListStore";
import { DocumentTypeEnum } from "@/core/typings/documentTypes";
import React from "react";

type AnimationType = "fade" | "slide" | "bounce" | "custom" | "show";
type NotificationCategory = "general" | "urgent" | "important";
type ButtonType = "submit" | "reset" | "button" | undefined;
type VisibilityType = "public" | "private" | "restricted" | "shared" | boolean;

Union type of all types enums
type AllTypes =
  | DataType
  | MessageType
  | DocumentTypeEnum
  | PriorityTypeEnum
  | CustomNotificationType
  | ProgressBarAnimationType
  | MessageNotificationStatusType
  | TextType
  | ChatType
  | StatusType
  | TeamStatus
  | ButtonType
  | AnimationType // Add AnimationType to AllTypes
  | NotificationCategory // Add NotificationCategory to AllTypes
  | TextType
  | VisibilityType // Add TextType to AllTypes
  | TextType
  | CalendarStatus
  | FileType
  
interface BaseProps {
  id: string;
  title?: string;
  description?: string | undefined;
  startDate?: Date;
  endDate?: Date;
  // Add common properties here
}

interface NotificationProps<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > extends BaseProps {
  category?: NotificationCategory;
  message: string;
  content: any;
  date?: Date | undefined;
  status?: AllStatus;

  backgroundColor?: string;
  // color?: string;
  fontSize: string;
  fontColor: string;
  sendStatus: SendStatus;
  completionMessageLog: LogData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  type: NotificationType;
}

interface ProgressProps {
  progress: number | null;
  duration: number;
  barStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  animationClass?: string;
  animationType?: ProgressBarAnimationType;
}

interface ChatCardProps extends BaseProps {
  sender: string;
  message: string;
  timestamp: string;
  isSentByUser?: boolean;
  chatType?: ChatType;
}

Utilizing Specific Types in Use Cases:
const chatCardProps: ChatCardProps = {
  id: "123",
  sender: "User123",
  message: "Hello there!",
  timestamp: "2024-03-21",
  chatType: ChatType.Private,
};

const notificationProps: NotificationProps = {
  id: "456",
  message: "New notification received",
  category: "urgent",
  content: { data: "Notification content" },
  date: new Date(),
  status: StatusType.Pending, // Example of using StatusType
  backgroundColor: "blue",
  sendStatus: "Sent",
  completionMessageLog: undefined,
  fontSize: "",
  fontColor: "",
  type: AuthNotificationTypes.ACCOUNT_CREATED,
};

const progressBarProps: ProgressBarProps = {
  progress: {
    id: "unique-progress-id",
    name: "Progress Name",
    color: "#000000",
    description: "Progress Description",
    value: 75,
    label: "Progress Label",
    current: 0,
    max: 100,
    min: 0,
    percentage: 0,
    done: false,
  },

  duration: 1000,
  barStyle: { backgroundColor: "blue" },
  containerStyle: { width: "80%", border: "1px solid black" },
  animationType: "ease-in-out",
  phase: {
    type: "",
    duration: 0,
    value: 90,
  },
  phaseType: ProgressPhase.Ideation,
  animationID: "",
  uniqueID: "",
};

export { chatCardProps, notificationProps, progressBarProps };
export type {
    AllTypes,
    BaseProps,
    ChatCardProps,
    NotificationProps,
    ProgressProps,
    TextType
};

