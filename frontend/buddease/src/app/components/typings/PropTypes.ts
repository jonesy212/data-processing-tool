// PropTypes.tsx
import { MessageType } from "@/app/generators/MessaageType";
import React from "react";
import { DocumentTypeEnum } from "../documents/DocumentGenerator";
import { DataType } from "../models/CommonData";
import {
  ChatType,
  CustomNotificationType,
  MessageNotificationStatusType,
  PriorityTypeEnum,
  StatusType,
  TeamStatus,
} from "../models/data/StatusType";
import {
  ProgressBarAnimationType,
  ProgressBarProps,
  ProgressPhase,
} from "../models/tracker/ProgressBar";
import TextType from "../documents/TextType";

type AnimationType = "fade" | "slide" | "bounce" | "custom" | "show";;
type NotificationCategory = "general" | "urgent" | "important";
type ButtonType = "submit" | "reset" | "button" | undefined;
// Union type of all types enums
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
  | TextType; // Add TextType to AllTypes

interface BaseProps {
  id: string;
  title?: string;
  description?: string | null | undefined;
  startDate?: Date;
  endDate?: Date;
  // Add common properties here
}

interface NotificationProps extends BaseProps {
  category?: NotificationCategory;
  message: string;
  content?: any;
  date?: Date;
  type?: AllTypes; // Update type property to use AllTypes
  // backgroundColor?: string;
  // color?: string;
  // fontSize?: string;
  // textColor?: string
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

// Utilizing Specific Types in Use Cases:
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
  type: StatusType.Pending, // Example of using StatusType
};

const progressBarProps: ProgressBarProps = {
  progress: {
    id: "unique-progress-id",
    value: 75,
    label: "Progress Label"
  }, // Corrected to match the Progress interface
  duration: 1000,
  barStyle: { backgroundColor: "blue" },
  containerStyle: { width: "80%", border: "1px solid black" },
  animationType: "ease-in-out",
  phase: ProgressPhase.Ideation,
  animationID: "",
  uniqueID: "",
};

export { chatCardProps, notificationProps, progressBarProps };
export type { AllTypes,TextType, BaseProps, ChatCardProps, NotificationProps, ProgressProps };

