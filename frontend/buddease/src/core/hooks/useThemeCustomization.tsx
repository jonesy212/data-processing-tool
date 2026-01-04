useThemeCustomization.tsx
import {
    NotificationState,
    initialNotificationState,
} from "@/core/state/redux/slices/NotificationSlice";
import {
    ThemeState,
    initialThemeState,
} from "@/core/state/redux/slices/ThemeSlice";
import { useState } from "react";

export const useThemeCustomization = () => {
  const infoColor = "#333";
  const [themeState, setThemeState] = useState<ThemeState>(initialThemeState);
  const [notificationState, setNotificationState] = useState<React.Dispatch<React.SetStateAction<NotificationState[]>>>(
    () => [initialNotificationState]
  );

  return {
    infoColor,
    themeState,
    setThemeState,
    notificationState,
    setNotificationState,
  };
};
