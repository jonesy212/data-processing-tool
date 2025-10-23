// NotificationContext.ts

import { Message } from '@/app/generators/GenerateChatInterfaces';
import { NotificationPosition, PriorityTypeEnum } from '@/app/models/data/StatusType';
import { NotificationData } from '@/app/state/redux/slices/NofiticationsSlice';
import NotificationStore from '@/app/state/stores/NotificationStore';
import { DocumentTypeEnum } from '@/app/typings/documentTypes';
import { createContext, useContext } from 'react';
import { 
  NOTIFICATION_TYPES, 
  NotificationType as MainNotificationType 
} from '@/app/features/support/NotificationTypes';


interface NotificationOptions {
  dataId?: string;
  error?: string;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextProps {
  notify: (
    id: string,
    message: string,
    notificationOptions: NotificationOptions,
    date: Date,
    type: NotificationType,
    position: NotificationPosition
  ) => void;
  setDuration: (duration: number) => void;
  setNotifications: (notifications: Notification[]) => void;
  
  showNotification: (title: string, message: string | Message, content?: any) => void;
  showSuccessNotification: (title: string, message: string | Message, content?: any) => void;
  showErrorNotification: (title: string, message: string | Message, content?: any) => void;
  showInfoNotification: (title: string, message: string | Message, content?: any) => void;
  addNotification: (notification: NotificationData<any>) => void;
  sendNotification: (
    notification: NotificationData<any> | string,
    options?: {
      type?: NotificationType;
      duration?: number;
      position?: NotificationPosition;
      action?: () => void;
      dismissible?: boolean;
      priority?: 'low' | 'normal' | 'high';
      category?: string;
      metadata?: Record<string, any>;
    }
  ) => string; 
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  dismissNotification: (notificationId: string) => void;
}
 
type CustomNotificationType = "RandomDismiss";

const NotificationTypeEnum = NOTIFICATION_TYPES;

type NotificationType = MainNotificationType 
  | DocumentTypeEnum 
  | PriorityTypeEnum 
  | CustomNotificationType;

type NotificationContextType = Pick<NotificationContextProps, "notify">;

const NotificationContext = createContext<NotificationStore | null>(null);

const useNotification = () => {
  const store = useNotificationStore();
  return {
    notify: store.notify,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    showNotification: store.showNotification,
    showSuccessNotification: store.showSuccessNotification,
    showErrorNotification: store.showErrorNotification,
    showInfoNotification: store.showInfoNotification,
    sendNotification: store.sendNotification    
  };
};


export const useNotificationStore = (): NotificationStore => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error('useNotificationStore must be used within a NotificationProvider');
  }
  return context;
};
 
export { NotificationTypeEnum, useNotification };
export type { NotificationContextProps, NotificationContextType, NotificationOptions, NotificationType };
