// useThemeCustomization.tsx
import type { NotificationState } from '@/core/state/redux/slices/NotificationSlice';
import type { initialNotificationState } from '@/core/state/redux/slices/NotificationSlice';
    NotificationState,
    initialNotificationState,
} from "@/core/state/redux/slices/NotificationSlice";
import type { ThemeState } from '@/core/state/redux/slices/ThemeSlice';
import type { initialThemeState } from '@/core/state/redux/slices/ThemeSlice';
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
