// Component.tsx
import { ComponentActions } from "@/core/actions/ComponentActions";
import ProjectService from "@/core/api/service/ProjectService";
import type { ComponentConfig } from '@/core/config/ComponentConfig';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useErrorHandling } from "@/core/hooks/useErrorHandling";
import type { NotificationData } from '@/core/hooks/useNotificationSystem';
import { StatusType } from "@/core/models/data/StatusType";
import type { Project } from '@/core/models/projects/Project';
import { NotificationChannelHelper } from '@/core/notifications/NotificationChannelHelper';
import type { NotificationChannels } from '@/core/notifications/NotificationChannels';
import UpdatedProjectDetails from "@/core/projects/UpdateProjectDetails";
import useNotificationManagerService from "@/core/services/NotificationService";
import type { EmailSettings, PushNotificationSettings } from '@/core/settings/Reminder';
import { useNotification } from '@/core/state/context/NotificationContext';
import { addNotification } from "@/core/state/redux/slices/CalendarSlice";
import { createSuccessLog } from '@/utils/logDataHelpers';
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import io, { Socket } from 'socket.io-client';

// ====================
// PURE HELPER FUNCTIONS (No hooks - Safe to export)
// ====================

export const createErrorNotification = (
  message: string,
  error?: Error | string,
  id?: string,
  additionalData?: Partial<NotificationData>
): NotificationData => ({
  id: id || `error-${Date.now()}`,
  message,
  createdAt: new Date(),
  type: NotificationTypeEnum.OPERATION_ERROR,
  updatedAt: new Date(),
  content: error ? (typeof error === 'string' ? error : error.message) : message,
  status: "error",
  timestampp: new Date(),
  completionMessageLog: createErrorLog(message, error),
  sendStatus: "Failed",
  ...additionalData,
});

export const createWarningNotification = (
  message: string,
  warning?: string,
  id?: string,
  additionalData?: Partial<NotificationData>
): NotificationData => ({
  id: id || `warning-${Date.now()}`,
  message,
  createdAt: new Date(),
  type: NotificationTypeEnum.WARNING,
  updatedAt: new Date(),
  content: warning || message,
  status: "warning",
  timestampp: new Date(),
  completionMessageLog: createWarningLog(message, warning),
  sendStatus: "Pending", // Fixed: SendStatus.Pending doesn't exist
  ...additionalData,
});

export const createInfoNotification = (
  message: string,
  info?: string,
  id?: string,
  additionalData?: Partial<NotificationData>
): NotificationData => ({
  id: id || `info-${Date.now()}`,
  message,
  createdAt: new Date(),
  type: NotificationTypeEnum.INFO,
  updatedAt: new Date(),
  content: info || message,
  status: "info",
  timestampp: new Date(),
  completionMessageLog: createSuccessLog(message),
  sendStatus: "Sent",
  ...additionalData,
});

export const createSuccessNotification = (
  message: string,
  id?: string,
  additionalData?: Partial<NotificationData>
): NotificationData => ({
  id: id || `success-${Date.now()}`,
  message,
  createdAt: new Date(),
  type: NotificationTypeEnum.CREATION_SUCCESS,
  updatedAt: new Date(),
  content: "",
  status: "success",
  timestampp: new Date(),
  completionMessageLog: createSuccessLog(message),
  sendStatus: "Sent",
  ...additionalData,
});

// ====================
// COMPONENT WITH HOOKS
// ====================

const Component: React.FC = () => {
  // ====================
  // HOOKS (Must be inside component)
  // ====================
  const router = useRouter();
  const dispatch = useDispatch();
  const { notify } = useNotification();
  const { error, handleError, clearError } = useErrorHandling();
  
  // ====================
  // STATE
  // ====================
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // ====================
  // CUSTOM HOOK INSTANCES
  // ====================
  const notificationService = useNotificationManagerService();

  // ====================
  // HANDLER FUNCTIONS (Use hooks)
  // ====================

  const handleAddComponent = async () => {
    try {
      // Use notification service instance from hook
      await notificationService.handleButtonClick();
      notificationService.sendAnnouncement(
        "New announcement!",
        "Admin"
      );
      notificationService.sendPushNotification(
        "New push notification!",
        "System"
      );
      
      // Use notify from hook
      notify({
        id: `add_component_success_${Date.now()}`,
        message: NOTIFICATION_MESSAGES.Component.ADD_COMPONENT_SUCCESS || "Component added successfully",
        data: {
          entityType: 'component',
          action: 'add',
          extra: {
            operation: "Add component",
            source: "handleAddComponent",
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
    } catch (error) {
      console.error("Error adding component:", error);
      
      notify({
        id: `add_component_error_${Date.now()}`,
        message: NOTIFICATION_MESSAGES.Component.CREATE_COMPONENT_FAILURE || "Failed to add component",
        data: {
          originalError: error instanceof Error ? error.message : 'Unknown error',
          extra: {
            errorMessage: "Failed to add component",
            operation: "Add component",
            source: "handleAddComponent",
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
  };

  const handleRemoveComponent = () => {
    // Implement remove component logic
    console.log("Remove component");
    notify({
      id: `remove_component_${Date.now()}`,
      message: "Component removed",
      data: { entityType: 'component', action: 'remove' },
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      level: 'info' as const
    });
  };

  const handleUpdateComponent = (channels?: NotificationChannels) => {
    try {
      // Get component ID and updates from parameters or state
      const componentId = 1; // This should come from component state
      const componentUpdates: Partial<ComponentConfig> = {
        name: "Updated Component",
        type: "button"
      };
      
      // Dispatch action to update component
      dispatch(ComponentActions.updateComponent({
        id: componentId, 
        updates: componentUpdates
      }));
      
      // Create notification using pure function
      const notification = createSuccessNotification(
        "Component updated successfully", 
        "component-update-3"
      );
      
      // Check channel settings if provided
      if (channels) {
        const shouldSendEmail = NotificationChannelHelper.isAdvancedEnabled(channels, 'email');
        const shouldSendPush = NotificationChannelHelper.isAdvancedEnabled(channels, 'push');
        
        if (shouldSendEmail) {
          const emailSettings = NotificationChannelHelper.getAdvancedSettings<EmailSettings>(channels, 'email');
          if (emailSettings) {
            notification.emailTemplate = emailSettings.templates;
            notification.priority = emailSettings.priority;
            notification.recipients = emailSettings.recipients;
          }
        }
        
        if (shouldSendPush) {
          const pushSettings = NotificationChannelHelper.getAdvancedSettings<PushNotificationSettings>(channels, 'push');
          if (pushSettings) {
            notification.pushPriority = pushSettings.priority;
            notification.ttl = pushSettings.ttl;
            notification.deviceTokens = pushSettings.deviceTokens;
          }
        }
      }
      
      // Add to Redux store
      dispatch(addNotification(notification));
      
      // Also send real-time notification
      notify({
        id: `component_update_success_${componentId}_${Date.now()}`,
        message: "Component updated successfully",
        data: {
          entityType: 'component',
          entityId: componentId.toString(),
          action: 'update',
          extra: {
            componentId,
            updates: componentUpdates,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const
      });
      
    } catch (error: any) {
      const errorNotification = createErrorNotification(
        "Failed to update component", 
        error, 
        `component-update-error-${Date.now()}`
      );
      dispatch(addNotification(errorNotification));
      
      notify({
        id: `component_update_error_${Date.now()}`,
        message: "Failed to update component",
        data: {
          entityType: 'component',
          action: 'update',
          originalError: error.message,
          extra: {
            errorType: 'COMPONENT_UPDATE_ERROR',
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const
      });
    }
  };

  // ====================
  // WEB SOCKET
  // ====================
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || "http://your-backend-endpoint";
    const newSocket = io(socketUrl);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    newSocket.on("error", (err: Error) => {
      handleError("WebSocket error: " + err.message);
    });

    newSocket.on("reconnect_attempt", () => {
      console.log("Attempting to reconnect to WebSocket...");
    });

    newSocket.on("reconnect", () => {
      console.log("WebSocket reconnected successfully!");
    });

    newSocket.on("message", (message: string) => {
      console.log("Received message:", message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [handleError]);

  // ====================
  // FETCH PROJECT DATA
  // ====================
  useEffect(() => {
    const projectService = new ProjectService();

    const fetchCurrentProject = async () => {
      try {
        clearError();

        const { projectId } = router.query;
        if (typeof projectId === "string") {
          const parsedProjectId = parseInt(projectId, 10);
          if (!isNaN(parsedProjectId)) {
            const project = await projectService.fetchProject(parsedProjectId);
            setCurrentProject(project);

            // Join WebSocket room after project is loaded
            if (socket && project) {
              socket.emit("join", {
                projectId: project.id,
              });
            }
          } else {
            handleError("Invalid project ID: " + projectId);
          }
        } else {
          handleError("Project ID not found in URL");
        }
      } catch (error: any) {
        handleError(error.message || "Failed to fetch project");
      }
    };

    if (router.isReady) {
      fetchCurrentProject();
    }
  }, [router.query, router.isReady, socket, clearError, handleError]);

  // ====================
  // RENDER
  // ====================
  return (
    <div>
      <h1>Component Management</h1>
      {error && <div className="error">Error: {error}</div>}
      <button onClick={handleAddComponent}>Add Component</button>
      <button onClick={handleRemoveComponent}>Remove Component</button>
      <button onClick={() => handleUpdateComponent()}>Update Component</button>
      {currentProject && (
        <UpdatedProjectDetails
          projectId={currentProject.id}
          projectDetails={{
            ...currentProject,
            status: currentProject.status as StatusType | undefined,
          }}
        />
      )}
    </div>
  );
};

export default Component;

// ====================
// EXPORTS
// ====================
// Export handler functions that don't use hooks as callbacks
export const getComponentHandlers = () => ({
  // These would need to be called with context if they need hooks
  handleAddComponent: async (context: { 
    notify: any, 
    dispatch: any, 
    notificationService: any 
  }) => {
    // Implementation would need to be provided
  },
  handleRemoveComponent: () => {
    console.log("Remove component - export version");
  },
  handleUpdateComponent: (channels?: NotificationChannels) => {
    console.log("Update component - export version");
  }
});

// Export pure helper functions
export {
    createErrorNotification, createInfoNotification,
    createSuccessNotification, createWarningNotification
};
