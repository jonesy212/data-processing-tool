<!-- NotificationManagerComponent.md -->

# NotificationManager Component

## Overview

`NotificationManager` is a **class-based React component** designed to manage notifications within the application. It handles CRUD operations for notifications, API error handling, and context-aware notification dispatching.  

This component is **generic**, supporting extended data types and attachments using TypeScript generics, making it highly reusable across different entities in the system.

---

## Responsibilities

- Manages notifications using an internal array or via `setNotifications` prop.
- Provides methods to add, update, mark as read, remove, and clear notifications.
- Integrates with the application's notification system using the `useNotification` hook.
- Handles context-aware API errors and generates notifications accordingly.
- Supports generic metadata and attachments for flexibility in different domains.
- Supports confirmation and cancellation callbacks for user interactions.

---

## Props

```ts
interface NotificationManagerProps<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  notifications: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  notify: (
    id: string,
    messageKey: keyof NotificationMessages,
    data?: any,
    date?: Date,
    type?: NotificationType
  ) => void;

  setNotifications?: (
    updater: (
      prev: NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
    ) => NotificationData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => void;

  onConfirm: (message: string, randomBytes: any) => void;
  onCancel: (message: string, randomBytes: any) => void;
}
