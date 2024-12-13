import { createSubscriptionPayload } from "../../actions/SubscriptionActions";
import { NotificationTypeEnum } from "../../support/NotificationContext";

const projectCategory = "Project Management"; // Example category

const projectSubscriptionPayload = createSubscriptionPayload({
    email: "user@example.com",
    category: "projectCategory",
    meta: {
      timestamp: new Date(),
      startDate: new Date(),
      endDate: new Date(),
      id: "task-update-id",
      isSticky: true,
      name: "Task Update Notification",
      type: NotificationTypeEnum.Info,
      status: 'ACTIVE',
        isDismissable, isClickable,
        isClosable, isAutoDismiss, isAutoDismissable, isAutoDismissOnNavigation, isAutoDismissOnAction, isAutoDismissOnTimeout,
        isAutoDismissOnTap, optionalData, data,
    },
    notify: (message) => console.log(`Notification: ${message}`),
  });
  
console.log(projectSubscriptionPayload);




// 1. Create a subscription payload for project updates
const subscription = createSubscriptionPayload({
    email: "user@example.com",
    category: "Project Updates",
    notify: (message) => console.log(message),
  });
  
  // 2. Simulate subscribing to project updates
  subscribe({
    channel: "project_channel",
    onLiveEvent: (event) => {
      if (event.payload.error) {
        subscription.notify(`Error: ${event.payload.error}`);
      } else {
        subscription.notify("New project update received!");
        const task = event.payload.data;
        dispatch(SnapshotActions().addSnapshot(task));
      }
    },
  });
  
  // 3. Add a new task and notify
  const newTask = { id: "task_01", title: "Design UI", status: "pending" };
  addNewTask(newTask);
  