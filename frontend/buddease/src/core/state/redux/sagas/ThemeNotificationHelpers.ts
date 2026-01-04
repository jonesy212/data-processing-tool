ThemeNotificationHelpers.ts
import { handleApiErrorAndNotify } from "@/core/api/ApiData";
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";

export const handleThemeApiErrorAndNotify = (
  error: any,
  defaultMessage: string,
  errorId: keyof typeof NOTIFICATION_MESSAGES.Theme
) => {
  return handleApiErrorAndNotify(
    error,
    defaultMessage,
    errorId,
    NOTIFICATION_MESSAGES.Theme
  );
};

Success notification helper
export const showThemeSuccessNotification = (message: string) => {
  const { notify } = handleThemeApiErrorAndNotify(
    null,
    message,
    'SUCCESS' as keyof typeof NOTIFICATION_MESSAGES.Theme
  );
  
  return notify({
    type: "success",
    message,
  });
};

Error notification helper  
export const showThemeErrorNotification = (error: any, defaultMessage: string) => {
  const { notify } = handleThemeApiErrorAndNotify(
    error,
    defaultMessage,
    'ERROR' as keyof typeof NOTIFICATION_MESSAGES.Theme
  );
  
  return notify({
    type: "error",
    message: error?.message || defaultMessage,
  });
};