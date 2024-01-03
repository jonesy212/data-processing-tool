// NotificationEditingPhaseHook.ts
import useNotificationBar from '../hooks/commHooks/useNotificationBar';
import { createPhaseHook } from '../hooks/phaseHooks/PhaseHooks';

export const notificationEditingPhaseHook = createPhaseHook({
  condition: () => {
    // Add your condition logic for when the notification editing should be active
    return true;
  },
  asyncEffect: async () => {
    const { addNotification, clearNotifications } = useNotificationBar();

    // Add any async logic for the notification editing phase
    console.log("Notification Editing Phase Hook triggered");

    // Simulate a delay before sending the notification
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5000 milliseconds (5 seconds)


    // Add the notification with a cancel option
    const notificationMessage = "Your notification message here";

    addNotification(notificationMessage, "info");

    const cancelOption = () => {
      // Cleanup logic for the notification editing phase
      console.log("Notification Editing Phase Canceled");
      clearNotifications();
    };

    return cancelOption; // Cleanup function
  },
  name: ''
});
