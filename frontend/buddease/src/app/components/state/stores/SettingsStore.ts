// SettingsStore.ts
import {
    NotificationTypeEnum,
    useNotification,
} from "@/app/components/support/NotificationContext";
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import useErrorHandling from "../../hooks/useErrorHandling";
import axiosInstance from "../../security/csrfToken";
import { UserManagerState } from "../../users/UserSlice";
import { CodingLanguageEnum, LanguageEnum } from "../../communications/LanguageEnum";
import { NotificationData } from "../../support/NofiticationsSlice";
import { ThemeEnum } from "../../libraries/ui/theme/Theme";
import { BaseResponseType, YourResponseType, YourSettingsResponseType } from "../../typings/types";
import { ParsedData } from "../../crypto/parseData";

// Define the interface for different types of settings
export interface Settings extends YourResponseType {
    id?: string;
    filter: (key: keyof Settings | "communicationMode" | "defaultFileType" | "theme" | "notifications" | "language" | "collaborationMode" | "dataSync" | "defaultCurrency" | "apiAccessLevel" | "projectVisibility") => void;
    appName: string;
    communicationMode?: string;
    defaultFileType?: string;
    theme?: ThemeEnum
    isNotificationsEnabled?: boolean; // Notification setting
    notifications?: NotificationData[]; // Notification setting
    language?: LanguageEnum | CodingLanguageEnum; // Language preference
    collaborationMode?: "real-time" | "asynchronous"; // Collaboration mode setting
    dataSync?: "automatic" | "manual"; // Data sync settings
    defaultCurrency?: string; // Default currency for transactions
    apiAccessLevel?: "read-only" | "read-write"; // API access level
    projectVisibility?: "public" | "private"; // Project visibility setting
    // Add any additional properties or methods as needed
  
}

// Define the store interface
export interface SettingManagerStore {
    // Define methods for handling different types of settings
    fetchSettings: () => void;
    updateSettings: (settings: YourSettingsResponseType) => Promise<void>;
    deleteSettings: (settingsId: string) => void;
    reset: () => void;
    setUserData: (userData: UserManagerState) => void;
    // Add more methods for other setting types as needed
}


// Define the setting manager store
const useSettingManagerStore = (): SettingManagerStore => {
    const { error, handleError, clearError, parseDataWithErrorHandling } =
        useErrorHandling();

    const [settings, setSettings] = useState<YourSettingsResponseType | null>(null); // Store settings state
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { notify } = useNotification();

    // Function to reset the settings state
    const reset = () => {
        setSettings(null); // Reset settings state to null
        setIsLoading(false); // Reset loading state if necessary
        clearError(); // Clear any errors if you're using error handling
    };

    const fetchSettings = async () => {
        setIsLoading(true);
        clearError(); // Clear any existing errors
        try {
            // Fetch settings from the server using Axios
            const response = await axiosInstance.get("/settings");
            const data = response.data;

            // Use parseDataWithErrorHandling to parse the fetched data
            const parsedData = parseDataWithErrorHandling(data, /* threshold value */ 0); // Adjust the threshold as needed

            // Set the parsed settings to the state
            // Ensure parsedData is of the expected type
            if (parsedData && parsedData.length > 0) {
                setSettings(parsedData[0]); // Assuming you want to set the first item
            } else {
                setSettings(null); // Handle the case when there is no valid parsed data

                handleError("Invalid settings response");
            }
        } catch (error: any) {
            handleError("fetching settings", error);
        } finally {
            setIsLoading(false);
        }

    };
    
    const updateSettings = async (updatedSettings: YourSettingsResponseType) => {
        try {
            // Update settings on the server using Axios
            await axiosInstance.put("/settings", updatedSettings);

            // Update the settings state with the updated settings
            setSettings(updatedSettings);
            notify(
                "updateSettingsSuccess",
                "Settings updated successfully",
                "Settings updated",
                new Date(),
                NotificationTypeEnum.OperationSuccess
            );
        } catch (error: any) {
            handleError("updating settings", error);
        }
    };
    const deleteSettings = async (settingsId: string) => {
        try {
            // Delete settings on the server using Axios
            await axiosInstance.delete(`/settings/${settingsId}`);
            // Check if the deleted setting matches the current settings state
            if (settings && settings.id === settingsId) {
                // If the deleted setting matches, set the settings state to null
                setSettings(null);
            }
        } catch (error: any) {
            handleError("deleting settings", error);
        }
    }
    const setUserData = (userData: UserManagerState): void => {
        setSettings((prevSettings) => {
            // Handle case where prevSettings is null
            if (!prevSettings) {
                return {
                    ...userData,
                    id: "default-id",
                    pageNumber: 0,
                    filter: (key: keyof Settings | "communicationMode" | "defaultFileType") => {
                        // Implement the filter logic here
                    },
                    appName: "Buddease",
                    data: {
                        id, projectName, description, teamMembers,
                        exchange, communication, collaborationOptions, metadata,
                        exchangeData, averagePrice,
                        calendarEvents: [],
                        todos: [],
                        tasks: [],
                        snapshotStores: [],
                        currentPhase: "",
                        comment: "",
                    },
                    calendarEvents: [],
                    todos: [],
                    tasks: [],
                    snapshotStores: [],
                    currentPhase: "",
                    comment: "",
                    browserCheckStore: {
                        browserKey, dispatch, init, testDispatch
                    },
                    trackerStore: {
                        trackers, addTracker, getTracker, getTrackers,
                        removeTracker, dispatch
                    },
                    todoStore: {
                        dispatch, todos, todoList, toggleTodo,
                        addTodo, loading, error, addTodos,
                        removeTodo, assignTodoToUser, updateTodoTitle, fetchTodosSuccess, 
                        fetchTodosFailure, openTodoSettingsPage, getTodoId, getTeamId,
                        fetchTodosRequest, completeAllTodosSuccess, completeAllTodos, completeAllTodosFailure,
                        NOTIFICATION_MESSAGE, NOTIFICATION_MESSAGES, setDynamicNotificationMessage, subscribeToSnapshot, batchFetchTodoSnapshotsRequest
                    },
                    taskManagerStore: {
                        tasks, taskTitle, taskDescription, taskStatus,
                        assignedTaskStore, updateTaskTitle, updateTaskDescription, updateTaskStatus,
                        updateTaskDueDate, updateTaskPriority, filterTasksByStatus, getTaskCountByStatus,
                        clearAllTasks, archiveCompletedTasks, updateTaskAssignee, getTasksByAssignee,
                        getTaskById, sortByDueDate, exportTasksToCSV, dispatch, addTaskSuccess, addTask,
                        addTasks, assignTaskToUser, removeTask, removeTasks, fetchTasksByTaskId, fetchTasksSuccess,
                        fetchTasksFailure, fetchTasksRequest, completeAllTasksSuccess, completeAllTasks,
                        completeAllTasksFailure, NOTIFICATION_MESSAGE, NOTIFICATION_MESSAGES, setDynamicNotificationMessage,
                        takeTaskSnapshot, markTaskAsComplete, updateTaskPositionSuccess, batchFetchTaskSnapshotsRequest, 
                        batchFetchTaskSnapshotsSuccess, batchFetchUserSnapshotsRequest
                    },
                    iconStore: {
                        dispatch
                    },
                    calendarStore: {
                        openScheduleEventModal, openCalendarSettingsPage, getData, updateDocumentReleaseStatus,
                        getState, action, events, eventTitle, 
                        eventDescription, eventStatus, assignedEventStore, snapshotStore,
                        NOTIFICATION_MESSAGE, NOTIFICATION_MESSAGES, updateEventTitle, updateEventDescription,
                        updateEventStatus, updateEventDate, addEvent, addEvents,
                        removeEvent, removeEvents, reassignEvent, addEventSuccess, 
                        fetchEventsSuccess, fetchEventsFailure, fetchEventsRequest, completeAllEventsSuccess,
                        completeAllEvents, completeAllEventsFailure, setDynamicNotificationMessage, handleRealtimeUpdate, getSnapshotDataKey
                    },
                    endpoints: {},
                    highlights: [],
                    results: [],
                    totalCount: 0,
                    searchData: {
                        results, totalCount
                    },
                    // Add other missing properties here with appropriate default values
                };
            }
    
            // Update logic based on key
            const updatedSettings = { ...prevSettings };
            const filter = (key: keyof Settings | "communicationMode" | "defaultFileType" | "theme" | "notifications" | "language" | "collaborationMode" | "dataSync" | "defaultCurrency" | "apiAccessLevel" | "projectVisibility") => {
                if (key === "communicationMode" && prevSettings.communicationMode) {
                    updatedSettings.audioUrl.communicationMode = "newMode";
                }
    
                if (key === "defaultFileType" && prevSettings.defaultFileType) {
                    updatedSettings.defaultFileType = "newFileType";
                }
    
                if (key === "theme" && prevSettings.theme) {
                    updatedSettings.theme = prevSettings.theme === ThemeEnum.LIGHT ? ThemeEnum.DARK : ThemeEnum.LIGHT;
                }
    
                if (key === "notifications" && prevSettings.notifications !== undefined) {
                    updatedSettings.notifications = prevSettings.notifications.map(notification => ({
                        ...notification,
                        enabled: !notification.enabled
                    }));
                }
    
                if (key === "language" && prevSettings.language) {
                    updatedSettings.language = prevSettings.language === LanguageEnum.English ? LanguageEnum.Spanish : LanguageEnum.English;
                }
    
                if (key === "collaborationMode" && prevSettings.collaborationMode) {
                    updatedSettings.collaborationMode = prevSettings.collaborationMode === "real-time" ? "asynchronous" : "real-time";
                }
    
                if (key === "dataSync" && prevSettings.dataSync) {
                    updatedSettings.dataSync = prevSettings.dataSync === "automatic" ? "manual" : "automatic";
                }
    
                if (key === "defaultCurrency" && prevSettings.defaultCurrency) {
                    updatedSettings.defaultCurrency = "USD";
                }
    
                if (key === "apiAccessLevel" && prevSettings.apiAccessLevel) {
                    updatedSettings.apiAccessLevel = prevSettings.apiAccessLevel === "read-only" ? "read-write" : "read-only";
                }
    
                if (key === "projectVisibility" && prevSettings.projectVisibility) {
                    updatedSettings.projectVisibility = prevSettings.projectVisibility === "public" ? "private" : "public";
                }
            };
    
            return {
                ...updatedSettings,
                userData,
                filter,
                // calendarEvents: prevSettings.appName.calendarEvents || [],
                // todos: prevSettings.todos || [],
                // tasks: prevSettings.tasks || [],
                // snapshotStores: prevSettings.snapshotStores || [],
                // Add other missing properties here, using prevSettings values or default values
            } as YourSettingsResponseType;
        });
    
    

        notify(
            "setUserData",
            "User data updated successfully.",
            {},
            new Date(),
            NotificationTypeEnum.OperationSuccess
        );
    };


    const store: SettingManagerStore = makeAutoObservable({
        settings,
        reset,
        setUserData,
        isLoading,
        fetchSettings,
        updateSettings,
        deleteSettings,
    });

    return store;
};

export default useSettingManagerStore;
