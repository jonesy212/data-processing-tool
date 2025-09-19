import { fetchData } from "@/app/api/ApiData";
import { endpoints } from "@/app/api/ApiEndpoints";
import { isUserLoggedIn } from "@/app/pages/forms/utils/CommonLoginLogic";
import * as userApi from "../../../api/UsersApi";
import { UIActions } from "../../actions/UIActions";
import { LogData } from "../../models/LogData";
import { NotificationData } from "../../support/NofiticationsSlice";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import NotificationMessagesFactory from "../../support/NotificationMessagesFactory";
import { NOTIFICATION_TYPES } from "../../support/NotificationTypes";
import { NotificationTypeEnum } from "@/context/NotificationContext";
import useNotificationBar from "../commHooks/useNotificationBar";
import { createPhaseHook } from "../phaseHooks/PhaseHooks";
import useDarkModeToggle from "./useDarkModeToggle";
import UserService from "@/api/ApiUser";
import {
  Snapshot,
  BaseDataEntity,
  DefaultMeta,
  DefaultExcludedFields,
} from "../../models"; // adjust paths

const usePhaseUI = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>() => {
  const dispatch = useNotificationBar();
  const { isDarkMode, toggleDarkMode } = useDarkModeToggle();
  const userId = UserService.getCurrentUserId();

  /** ---------------- Dark Mode Phase Hook ---------------- */
  const createDarkModeTogglePhaseHook = () => {
    const condition = () => true;
    const duration = "10000";

    const asyncEffect = async () => {
      console.log("Dark Mode Toggle Phase Hook triggered");

      const settings = await fetchData("dark-mode-settings", userId);
      if (settings !== null && !isDarkMode) {
        toggleDarkMode();
      }

      await fetchUserDataAndDisplayNotification(
        dispatch.addNotification,
        null,
        null
      );

      return () => console.log("Cleanup for Dark Mode Toggle Phase");
    };

    const name = "Dark Mode Toggle Phase";
    const isActive = false;

    return { condition, duration, asyncEffect, name, isActive };
  };

  /** ---------------- Notification Bar Phase Hook ---------------- */
  const createNotificationBarPhaseHook = () => {
    return createPhaseHook<T>(10000, {
      condition: (idleTimeoutDuration: number) =>
        isUserLoggedIn().then((userStatus: any) => !!userStatus),

      asyncEffect: async ({ idleTimeoutId, startIdleTimeout }) => {
        const { addNotification, clearNotifications } = useNotificationBar();
        console.log("Notification Bar Phase Hook triggered");

        await UIActions.fetchAndDisplayNotifications({
          addNotification,
          clearNotifications,
        });

        return clearNotifications;
      },

      name: "Notification Bar Phase",
      isActive: false,

      initialStartIdleTimeout(timeoutDuration: number, onTimeout: () => void) {
        this.idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
      },

      resetIdleTimeout: async () => {},
      duration: undefined,
      idleTimeoutId: null,
      clearIdleTimeout() {},
      onPhaseStart() {},
      onPhaseEnd() {},
      startIdleTimeout(timeoutDuration: number, onTimeout: () => void) {
        this.idleTimeoutId = setTimeout(onTimeout, timeoutDuration);
      },
      cleanup: undefined,
      startAnimation() {},
      stopAnimation() {},
      animateIn() {},
      toggleActivation(accessToken?: string | null) {},
    });
  };

  /** ---------------- Notification Helpers ---------------- */
  const logData: LogData<BaseDataEntity> = {
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
    },
  };

  const displayNotification = <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
  >(
    notification: NotificationData<T, K, Meta>,
    addNotification: Function
  ) => {
    const message = notification.message;
    const type = message ? "info" : "error";
    const defaultMessage =
      message || NOTIFICATION_MESSAGES.NO_NOTIFICATIONS.DEFAULT;
    addNotification(defaultMessage, type);
  };

  const fetchAndDisplayNotifications = async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
  >(
    addNotification: Function,
    clearNotifications: Function
  ) => {
    try {
      const notifications = await fetchData("notifications");
      if (notifications !== null) {
        if (Array.isArray(notifications)) {
          (notifications as NotificationData<T, K, Meta>[]).forEach(
            (notification: NotificationData<T, K, Meta>) => {
              displayNotification<T, K, Meta>(notification, addNotification);
            }
          );
        } else {
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
              getaData: undefined,
            },
            addNotification
          );
        }
      } else {
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
      const userData = await userApi.fetchUserData(req, res);
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

  return {
    createDarkModeTogglePhaseHook,
    createNotificationBarPhaseHook,
    fetchAndDisplayNotifications,
    fetchUserDataAndDisplayNotification,
  };
};

const darkModeTogglePhaseHook = usePhaseUI().createDarkModeTogglePhaseHook();
const notificationBarPhaseHook = usePhaseUI().createNotificationBarPhaseHook();

export { usePhaseUI, darkModeTogglePhaseHook, notificationBarPhaseHook };
