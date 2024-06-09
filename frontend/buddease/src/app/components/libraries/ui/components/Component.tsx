import React from "react";

import ProjectService from "@/app/api/ProjectService";
import { addNotification } from "@/app/components/calendar/CalendarSlice";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import { ComponentStatus, StatusType } from "@/app/components/models/data/StatusType";
import useNotificationManagerService from "@/app/components/notifications/NotificationService";
import { Project } from "@/app/components/projects/Project";
import UpdatedProjectDetails from "@/app/components/projects/UpdateProjectDetails";
import { WritableDraft } from "@/app/components/state/redux/ReducerGenerator";
import { NotificationData } from "@/app/components/support/NofiticationsSlice";
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import io from "socket.io-client";
import { ComponentActions } from "./ComponentActions";

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
      NotificationTypeEnum.OperationSuccess
    );
  } catch (error) {
    console.error("Error adding component:", error);
    // Notify user of the error using the notification context
    await notify(
      "handleAddFailure",
      "Failed to add component",
      NOTIFICATION_MESSAGES.Component.CREATE_COMPONENT_FAILURE,
      new Date(),
      NotificationTypeEnum.OperationError
    );
  }
};

export const handleRemoveComponent = () => {
  try {
    // Dispatch an action to remove a component
    dispatch(ComponentActions.removeComponent(1)); // Provide the ID of the component to remove
    // Provide feedback to users
    const notification: WritableDraft<NotificationData> = {
      id: "2", // Provide a unique ID for the notification
      message: "Component removed successfully",
      createdAt: new Date(),
      type: NotificationTypeEnum.CreationSuccess,
      updatedAt: new Date(),
      content: "",
      status: ComponentStatus.Tentative,
      completionMessageLog: {
        timestamp: new Date(),
        level: "info",
        message: "Component removed successfully",
      },
      sendStatus: "Sent",
      options: {
        additionalOptions: undefined,
      },
    };
    addNotification(notification); // Updated argument to pass notification object
  } catch (error: any) {
    const errorNotification: WritableDraft<NotificationData> = {
      id: "error", // Provide a unique ID for the error notification
      message: "Failed to remove component: " + error.message,
      createdAt: new Date(),
      type: NotificationTypeEnum.Error,
      content: "",
      status: ComponentStatus.Tentative,
      updatedAt: new Date(),
      completionMessageLog: {
        timestamp: new Date(),
        level: "error",
        message: "Failed to remove component: " + error.message,
      },
      sendStatus: "Sent",
    };
    console.error("Error removing component:", error);
    // Handle error and provide feedback to users
    addNotification(errorNotification);
  }
};

export const handleUpdateComponent = () => {
  try {
    // Dispatch an action to update a component
    dispatch(
      ComponentActions.updateComponent({
        id: 1,
        updatedComponent: { name: "Updated Component" },
      })
    );
    // Provide feedback to users
    const notification: WritableDraft<NotificationData> = {
      id: "3",
      message: "Component updated successfully",
      createdAt: new Date(),
      type: NotificationTypeEnum.CreationSuccess,
      updatedAt: new Date(),
      content: "",
      status: "tentative",
      completionMessageLog: {
        timestamp: new Date(),
        level: "info",
        message: "Component updated successfully",
      },
      sendStatus: "Sent",
    };
    addNotification(notification);
  } catch (error: any) {
    console.error("Error updating component:", error);
    // Handle error and provide feedback to users
    const errorNotification: WritableDraft<NotificationData> = {
      id: "error",
      message: "Failed to update component: " + error.message,
      createdAt: new Date(),
      type: NotificationTypeEnum.Error,
      content: "",
      status: "tentative",
      completionMessageLog: {
        timestamp: new Date(),
        level: "error",
        message: "Failed to update component: " + error.message,
      },
      sendStatus: "Sent",
    };
    addNotification(errorNotification);
  }
};
const Component = () => {
  const router = useRouter();
  const { error, handleError, clearError } = useErrorHandling();

  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const socketUrl = "http://your-backend-endpoint";
  const socket = io(socketUrl);

  socket.on("connect", () => {
    console.log("Connected to WebSocket");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket");
  });

  socket.on("error", (err: Error) => {
    handleError("WebSocket error: " + err.message);
  });

  socket.on("reconnect_attempt", () => {
    console.log("Attempting to reconnect to WebSocket...");
  });

  socket.on("reconnect", () => {
    console.log("WebSocket reconnected successfully!");
  });

  socket.on("close", (event: CloseEvent) => {
    handleError("WebSocket connection closed: " + event.reason);
  });

  socket.on("message", (message: string) => {
    console.log("Received message:", message);
  });

  useEffect(() => {
    const projectService = new ProjectService();

    const fetchCurrentProject = async () => {
      try {
        clearError();

        const { projectId } = router.query;
        if (typeof projectId === "string") {
          const parsedProjectId = parseInt(projectId, 10);
          const project = await projectService.fetchProject(parsedProjectId);
          setCurrentProject(project);
        } else {
          handleError("Project ID is not a string: " + projectId);
        }
      } catch (error: any) {
        handleError(error.message);
      }
    };

    fetchCurrentProject();

    if (socket) {
      socket.emit("join", {
        projectId: currentProject?.id,
      });
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Component Management</h1>
      {error && <div>Error: {error}</div>}
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
