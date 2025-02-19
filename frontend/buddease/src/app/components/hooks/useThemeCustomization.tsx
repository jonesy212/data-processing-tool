// useThemeCustomization.tsx
import { useState } from "react";
import {
    NotificationState,
    initialNotificationState,
} from "../state/redux/slices/NotificationSlice";
import {
    ThemeState,
    initialThemeState,
} from "../state/redux/slices/ThemeSlice";

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
