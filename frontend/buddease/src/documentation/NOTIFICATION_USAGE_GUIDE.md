<!-- NOTIFICATION_USAGE_GUIDE.md -->
# 🧩 Notification Usage & Integration Guide

Comprehensive documentation on how to use, trigger, and manage notifications in your application — especially within the ApiCommunicationService class and snapshot workflow.

## 📘 Overview

Notifications provide real-time feedback on events such as:

Successful snapshot saves

Failed API operations

Global errors or warnings

They help maintain consistent communication between your backend processes and user-facing UI layers.

⚙️ Core Components & Their Roles
## ApiCommunicationService

Handles all API communications, including saving snapshots.
Integrates notifications directly into its workflow for success and error events.

Defines saveSnapshotToDatabase()

Triggers notifications after each operation

Uses injected notify method from NotificationContainer

## NotificationContainer

Provides the notification dispatching function (notify) across the app.
Ensures consistent handling of:

IDs

Messages

Data payloads

Timestamps

Notification type (SUCCESS, ERROR, WARNING, INFO)

```typescript
interface NotificationContainer {
  notify: (
    id: string,
    message: string,
    data: any,
    timestamp: Date,
    type: NotificationTypeEnum
  ) => void;
}
```

# NotificationManagerService

Used to inject a notification handler into the application scope.
This makes the notification system available globally.
``` ts
NotificationManagerService.notify = notifyFn;
```


## ✅ Use Case: During application bootstrap or service initialization.

# NotificationService

Fallback service for triggering notifications when a context-level notify function is unavailable.

```typescript 
NotificationService.notify({
  id: "SaveSnapshotError",
  message: "Failed to save snapshot to database",
  timestamp: new Date(),
  type: NotificationTypeEnum.ERROR,
  data: { error: String(error) },
});
```

## ✅ Use Case: Global exception handling or background operations.

💾 Snapshot Notification Flow
1️⃣ Successful Save

Triggered when a snapshot is successfully persisted to the backend.
```ts
this.notify?.(
  "SaveSnapshotSuccessId",
  "Snapshot saved successfully",
  snapshotData,
  new Date(),
  NotificationTypeEnum.SUCCESS
);
```

## 📍When to Use:

After a successful axios.post() to /save.

To confirm data persistence visually or via logs.

2️⃣ Save Failure

Triggered when the save process encounters an error.
```ts
this.notify?.(
  "SaveSnapshotErrorId",
  "Failed to save snapshot to database",
  error,
  new Date(),
  NotificationTypeEnum.ERROR
);
```

📍When to Use:

Inside the catch block of snapshot-related API calls.

To inform the user or developer of a failed operation.
| **Component**                    | **Purpose**         | **Integration Role**                                |
| -------------------------------- | ------------------- | --------------------------------------------------- |
| **`NotificationContainer`**      | Base provider       | Exposes `notify` method to app-wide contexts        |
| **`NotificationManagerService`** | Dependency injector | Registers global notification handler               |
| **`NotificationService`**        | Fallback API        | Triggers notifications outside context scope        |
| **`NotificationTypeEnum`**       | Enum type           | Defines `SUCCESS`, `ERROR`, `INFO`, `WARNING` types |
| **`handleSnapshotApiError`**     | Error handler       | Normalizes and logs API-related errors              |


| Step | File                            | Action                            | Notes                                       |
| ---- | ------------------------------- | --------------------------------- | ------------------------------------------- |
| 1️⃣  | `NotificationManagerService.ts` | Assign `notifyFn`                 | Required to enable global notifications     |
| 2️⃣  | `ApiCommunicationService.ts`    | Inject `notify` from container    | Used in all API methods                     |
| 3️⃣  | `NotificationService.ts`        | Implement fallback handling       | Ensures errors always trigger notifications |
| 4️⃣  | `SnapshotStore.ts`              | Ensure snapshot calls are wrapped | Enables per-snapshot feedback               |
| 5️⃣  | `handleSnapshotApiError.ts`     | Map and format errors             | Keep logs clean and structured              |



# 🧩 Example Integration Flow
try {
  await apiService.saveSnapshotToDatabase(snapshotData);
  this.notify?.(
    "SnapshotSaved",
    "Your snapshot was saved successfully.",
    snapshotData,
    new Date(),
    NotificationTypeEnum.SUCCESS
  );
} catch (error) {
  this.notify?.(
    "SnapshotSaveError",
    "An unexpected error occurred while saving.",
    error,
    new Date(),
    NotificationTypeEnum.ERROR
  );
}

# 🧠 Best Practices

✅ Always include timestamps
→ Helps identify when an event occurred in logs or UI.

✅ Use unique and descriptive IDs
→ e.g., "SaveSnapshotSuccessId", not "Success1".

✅ Differentiate user vs. developer messages
→ Keep user messages simple; log details in console.error().

✅ Notify but don’t throw after notify
→ Notifications inform but shouldn’t interrupt execution.

📂 File Reference Summary
File	Description
ApiCommunicationService.ts	Main snapshot communication handler
NotificationManagerService.ts	Global notifier injector
NotificationService.ts	Standalone notification fallback
NotificationContainer.ts	Provides notify function
NOTIFICATION_USAGE_GUIDE.md	📄 This documentation file
🔁 Notification Type Quick Reference
Type	Usage	Example Message
🟢 SUCCESS	Positive confirmations	“Snapshot saved successfully.”
🔴 ERROR	Failures or exceptions	“Failed to connect to database.”
🟡 WARNING	Risk or incomplete action	“Network unstable — retrying…”
🔵 INFO	General system updates	“Fetching latest data…”
🧩 Example Notification Definition
enum NotificationTypeEnum {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO"
}

🏁 Summary

The notification system integrates deeply into your app’s API communication layer.
By consistently using notify, NotificationManagerService, and NotificationService, you ensure every action has clear, predictable feedback for both users and developers.