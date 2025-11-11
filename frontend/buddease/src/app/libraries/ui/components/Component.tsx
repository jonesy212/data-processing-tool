
import { ComponentActions } from "@/app/actions/ComponentActions";
import ProjectService from "@/app/api/ProjectService";
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import { NotificationData } from '@/app/hooks/useNotificationSystem';
import { StatusType } from "@/app/models/data/StatusType";
import { Project } from '@/app/models/projects/Project';
import { NotificationChannelHelper } from '@/app/notifications/NotificationChannels';
import UpdatedProjectDetails from "@/app/projects/UpdateProjectDetails";
import useNotificationManagerService from "@/app/services/NotificationService";
import {
  NotificationTypeEnum,
  useNotification,
} from '@/app/state/context/NotificationContext';
import { addNotification } from "@/app/state/redux/slices/CalendarSlice";
import { createSuccessLog } from '@/utils/logDataHelpers';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import io from "socket.io-client";

const dispatch = useDispatch();
const { notify } = useNotification();

export const handleAddComponent = async () => {
  try {
    // Call the appropriate functions from the notification service
    await useNotificationManagerService().handleButtonClick();
    useNotificationManagerService().sendAnnouncement(
      "New announcement!",
      "Admin"
    );
    useNotificationManagerService().sendPushNotification(
      "New push notification!",
      "System"
    );
    // Notify user using the notification context
    await notify(
      "handleAddSuccess",
      "Component added successfully",
      NOTIFICATION_MESSAGES.Component.ADD_COMPONENT_SUCCESS,
      new Date(),
      NotificationTypeEnum.OPERATION_SUCCESS
    );
  } catch (error) {
    console.error("Error adding component:", error);
    // Notify user of the error using the notification context
    await notify(
      "handleAddFailure",
      "Failed to add component",
      NOTIFICATION_MESSAGES.Component.CREATE_COMPONENT_FAILURE,
      new Date(),
      NotificationTypeEnum.OPERATION_ERROR
    );
  }
};


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
  status: "tentative",
  completionMessageLog: createSuccessLog(message),
  sendStatus: "Sent",
  ...additionalData,
});



export const handleUpdateComponent = (channels: NotificationChannels) => {
  try {
    // Dispatch action to update component
    dispatch(ComponentActions.updateComponent({/*...*/}));
    
    // Create notification content (using notificationHelpers)
    const notification = createSuccessNotification("Component updated successfully", "3");
    
    // Check channel settings (using your NotificationChannelHelper)
    const shouldSendEmail = NotificationChannelHelper.isAdvancedEnabled(channels, 'email');
    const shouldSendPush = NotificationChannelHelper.isAdvancedEnabled(channels, 'push');
    
    // Get advanced settings if needed
    const emailSettings = NotificationChannelHelper.getAdvancedSettings<EmailSettings>(channels, 'email');
    const pushSettings = NotificationChannelHelper.getAdvancedSettings<PushSettings>(channels, 'push');
    
    // Add channel-specific data to notification if channels are enabled
    if (shouldSendEmail && emailSettings) {
      notification.emailTemplate = emailSettings.templates;
      notification.priority = emailSettings.priority;
    }
    
    if (shouldSendPush && pushSettings) {
      notification.pushPriority = pushSettings.priority;
      notification.ttl = pushSettings.ttl;
    }
    
    addNotification(notification);
    
  } catch (error: any) {
    const errorNotification = createErrorNotification("Failed to update component", error, "error");
    addNotification(errorNotification);
  }
};


const Component: React.FC = () => {
  const router = useRouter();
  const { error, handleError, clearError } = useErrorHandling();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize WebSocket connection
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

  // Fetch project data and join WebSocket room
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

  // Component handlers
  const handleAddComponent = () => {
    // Implement add component logic
    console.log("Add component");
  };

  const handleRemoveComponent = () => {
    // Implement remove component logic
    console.log("Remove component");
  };

  const handleUpdateComponent = () => {
    // Implement update component logic
    console.log("Update component");
  };

  return (
    <div>
      <h1>Component Management</h1>
      {error && <div className="error">Error: {error}</div>}
      <button onClick={handleAddComponent}>Add Component</button>
      <button onClick={handleRemoveComponent}>Remove Component</button>
      <button onClick={handleUpdateComponent}>Update Component</button>
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