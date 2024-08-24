import { fetchData } from "@/app/api/ApiData";
import { endpoints } from "@/app/api/ApiEndpoints";
import { isUserLoggedIn } from "@/app/pages/forms/utils/CommonLoginLogic";
import * as userApi from "../../../api/UsersApi";
import { UIActions } from "../../actions/UIActions";
import { LogData } from "../../models/LogData";
import { NotificationData } from "../../support/NofiticationsSlice";
import { NotificationTypeEnum } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import NotificationMessagesFactory from "../../support/NotificationMessagesFactory";
import { NOTIFICATION_TYPES } from "../../support/NotificationTypes";
import useNotificationBar from "../commHooks/useNotificationBar";
import { createPhaseHook } from "../phaseHooks/PhaseHooks";
import useDarkModeToggle from "./useDarkModeToggle";


const usePhaseUI = () => {
  const dispatch = useNotificationBar();
  const { isDarkMode } = useDarkModeToggle();
  
  const createDarkModeTogglePhaseHook = () => {
    // Define the condition for when the phase hook should be active
    const condition = () => true;

    // Define the duration for the phase hook
    const duration = "10000";

    // Define the asynchronous effect that the phase hook will perform
    const asyncEffect = async () => {
      // Perform any asynchronous operations here
      // For example, fetch data or toggle dark mode
      console.log("Dark Mode Toggle Phase Hook triggered");

      // Example: Toggle dark mode
      const { toggleDarkMode, isDarkMode } = useDarkModeToggle();
      await fetchData("dark-mode-settings"); // Added two null arguments
      if (!isDarkMode) {
        toggleDarkMode();
      }

      // Example: Fetch user data and display notification
      await fetchUserDataAndDisplayNotification(
        useNotificationBar().addNotification, null, null
      );

      // Return a cleanup function if necessary
      return () => console.log("Cleanup for Dark Mode Toggle Phase");
    };

    // Define other properties of the phase hook object
    const name = "";
    const isActive = false;

    // Return the phase hook object
    return {
      condition,
      duration,
      asyncEffect,
      name,
      isActive,
    };
  };

  const notify = async (
    type: NotificationTypeEnum,
    message: string,
    isDarkMode: boolean
  ) => {
    const dispatch = useNotificationBar();
    try {
      await dispatch.addNotification({
        message: message,
        type: "success",
        onCancel: () => {
          console.log("Notification dispatched successfully");
        },
      });
    } catch (error) {
      await dispatch.addNotification({
        message: message,
        type: "error",
        onCancel: undefined,
      });
      console.error("Failed to dispatch notification:", error);
    }
  };


  const logData: LogData = {
    date: new Date(),
    endpoint: endpoints.notifications,
    method: "GET",
    status: "200",
    response: {},
    timestamp: new Date(),
    level: "info",
    message: `GET request to ${endpoints.notifications} successful`,
    sent: new Date(),
    isSent: true,
    isDelivered: true,
    delivered: new Date(),
    opened: new Date(),
    clicked: new Date(),
    responded: false,
    responseTime: new Date(),
    eventData: {
      id: "",
      title: "",
      content: "",
      topics: [],
      highlights: [],
      files: [],
      date: new Date(),
      participants: [],
      rsvpStatus: "yes",
      teamMemberId: "",
      taskIdToAssign: undefined,
      meta: undefined,
    }
  };

  const displayNotification = (
    notification: NotificationData,
    addNotification: Function
  ) => {
    const message = notification.message; // Access message directly from notification
    const type = message ? "info" : "error";
    const defaultMessage =
      message || NOTIFICATION_MESSAGES.NO_NOTIFICATIONS.DEFAULT;
    addNotification(defaultMessage, type);
  };

  const fetchAndDisplayNotifications = async (
    addNotification: Function,
    clearNotifications: Function
  ) => {
    try {
      const notifications = await fetchData("notifications");
      if (notifications !== null) {
        if (Array.isArray(notifications)) {
          // Check if notifications is an array before using forEach
          (notifications as NotificationData[]).forEach(
            (notification: NotificationData) => {
              displayNotification(notification, addNotification);
            }
          );
        } else {
          // Handle the case when notifications is empty
          displayNotification(
            {
              data: undefined,
              id: "",
              message: "",
              content: "",
              type: NotificationTypeEnum.AccountCreated,
              sendStatus: "Error",
              completionMessageLog: logData,
              date: new Date(),
              notificationType: "",
              topics: [],
              highlights: [],
              files: [],
              rsvpStatus: "yes",
              participants: [],
              teamMemberId: "",
              taskIdToAssign: undefined,
              meta: undefined,
              getSnapshotStoreData: undefined,
              getaData: undefined
            },
            addNotification
          );
        }
      } else {
        // Handle the case when notifications is null
        console.error("Notifications is null.");
      }
    } catch (error: any) {
      console.error("Error fetching notifications:", error.message);
      addNotification(
        NotificationMessagesFactory.createErrorMessage(
          "Failed to fetch notifications"
        ),
        "error" as NOTIFICATION_TYPES
      );
    }
  };
  
  const fetchUserDataAndDisplayNotification = async (
    addNotification: Function,
    req: any,
    res: any
  ) => {
    try {
      const userData = await userApi.fetchUserData(req, res); // Call the API function with req and res
      addNotification(
        NotificationMessagesFactory.createCustomMessage("User data fetched"),
        "success"
      );
      return userData;
    } catch (error: any) {
      console.error("Error fetching user data:", error.message);
      throw error;
    }
  };

  
 const createNotificationBarPhaseHook = async () => {
    return createPhaseHook(10000, {
      condition: (idleTimeoutDuration: number) =>
        isUserLoggedIn().then((userStatus: any) => !!userStatus),
      asyncEffect: async ({ idleTimeoutId, startIdleTimeout }) => {
        const { addNotification, clearNotifications } = useNotificationBar();
        console.log("Notification Bar Phase Hook triggered");
        await fetchAndDisplayNotifications(addNotification, clearNotifications);
        return clearNotifications;
      },
      name: "Notification Bar Phase",
      isActive: false,
      initialStartIdleTimeout: function (
        timeoutDuration: number,
        onTimeout: () => void
      ): void {
        this.idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
      },
      resetIdleTimeout: async function (): Promise<void> {
        // Implementation for resetting idle timeout
      },
      duration: undefined,
      idleTimeoutId: null,
      clearIdleTimeout: function (): void {
        // Implementation for clearing idle timeout
      },
      onPhaseStart: function (): void {
        // Implementation for phase start
      },
      onPhaseEnd: function (): void {
        // Implementation for phase end
      },
      startIdleTimeout: function (
        timeoutDuration: number,
        onTimeout: () => void
      ): void {
        const idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
      },
      cleanup: undefined,
      startAnimation: function (): void {
        // Implementation for starting animation
      },
      stopAnimation: function (): void {
        // Implementation for stopping animation
      },
      animateIn: function (): void {
        // Implementation for animating in
      },
      toggleActivation: function (
        accessToken?: string | null | undefined
      ): void {
        // Implementation for toggling activation
      },
    });
  };
}






const createNotificationBarPhaseHook = async () => {
  return createPhaseHook(10000, {
    condition: (idleTimeoutDuration: number) =>
      isUserLoggedIn().then((userStatus: any) => !!userStatus),
    asyncEffect: async ({ idleTimeoutId, startIdleTimeout }) => {
      const { addNotification, clearNotifications } = useNotificationBar();
      console.log("Notification Bar Phase Hook triggered");
     UIActions.fetchAndDisplayNotifications({ addNotification, clearNotifications });
      return clearNotifications;
    },
    name: "Notification Bar Phase",
    isActive: false,
    initialStartIdleTimeout: function (
      timeoutDuration: number,
      onTimeout: () => void
    ): void {
      this.idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
    },
    resetIdleTimeout: async function (): Promise<void> {
      // Implementation for resetting idle timeout
    },
    duration: undefined,
    idleTimeoutId: null,
    clearIdleTimeout: function (): void {
      // Implementation for clearing idle timeout
    },
    onPhaseStart: function (): void {
      // Implementation for phase start
    },
    onPhaseEnd: function (): void {
      // Implementation for phase end
    },
    startIdleTimeout: function (
      timeoutDuration: number,
      onTimeout: () => void
    ): void {
      const idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
    },
    cleanup: undefined,
    startAnimation: function (): void {
      // Implementation for starting animation
    },
    stopAnimation: function (): void {
      // Implementation for stopping animation
    },
    animateIn: function (): void {
      // Implementation for animating in
    },
    toggleActivation: function (
      accessToken?: string | null | undefined
    ): void {
      // Implementation for toggling activation
    },
  });
};

const createDarkModeTogglePhaseHook = () => {
  const idleTimeoutDuration = 10000; // Define the idle timeout duration
  return createPhaseHook(idleTimeoutDuration, {
    name: "Dark Mode Toggle Phase",
    condition: async () => true,
    asyncEffect: async ({ idleTimeoutId, startIdleTimeout }) => {
      const { toggleDarkMode, isDarkMode } = useDarkModeToggle();
      console.log("Dark Mode Toggle Phase Hook triggered");

      // Ensure fetchData returns a promise
      const settings = await fetchData("dark-mode-settings");
      if (settings !== null) {
        // Proceed only if settings is not null
        if (!isDarkMode) {
          toggleDarkMode();
        }

        // Use the correct structure for addNotification
        const notificationBar: any = useNotificationBar(); // Specify type as 'any'
        try {
          UIActions.fetchUserDataAndDisplayNotification(
            notificationBar.addNotification
          );
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error("Failed to fetch dark mode settings: settings is null");
      }

      return () => console.log("Cleanup for Dark Mode Toggle Phase");
    },

    duration: idleTimeoutDuration.toString(), // Include duration property
    startIdleTimeout: (timeoutDuration: number, onTimeout: () => void | undefined) => {
      if (onTimeout) {
        setTimeout(onTimeout, timeoutDuration);
      }
    },
  });
};

export { usePhaseUI, createDarkModeTogglePhaseHook};
export const darkModeTogglePhaseHook = createDarkModeTogglePhaseHook();
export const notificationBarPhaseHook = createNotificationBarPhaseHook();

