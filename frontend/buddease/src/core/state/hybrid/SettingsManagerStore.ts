// SettingsManagerStore.ts
// SettingsStore.ts
import axiosInstance from '@/core/api/csrfToken';
import { CodingLanguageEnum, LanguageEnum } from '@/core/communications/LanguageEnum';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import { useErrorHandling } from '@/core/hooks/useErrorHandling';
import type { NotificationData } from '@/core/hooks/useNotificationSystem';
import { ThemeEnum } from '@/core/libraries/ui/theme/Theme';
import { useNotification } from '@/core/state/context/NotificationContext';
import type { UserManagerState } from '@/core/state/redux/slices/UserSlice';
import type { YourSettingsResponseType } from '@/core/typings/responseTypes';
import { makeAutoObservable } from "mobx";
import { useState } from 'react';

// Define the interface for different types of settings
export interface Settings  {
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
export interface SettingManagerStore<
    T  extends BaseDataEntity = AppEntity,        // concrete defaults
    K  extends T = T,
    Meta extends DefaultMeta<T,K> = DefaultMeta<T,K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
    > {
    // State
    settings: YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
    isLoading: boolean;
    error: string | null;

    // Define methods for handling different types of settings
    fetchSettings: () => void;
    updateSettings: (settings: YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
    deleteSettings: (settingsId: string) => void;
    reset: () => void;
    setUserData: (userData: UserManagerState) => void;
    // Add more methods for other setting types as needed
}

// Define the setting manager store
const useSettingManagerStore = <
  T  extends BaseDataEntity = AppEntity,
  K  extends T = T,
  Meta extends DefaultMeta<T,K> = DefaultMeta<T,K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): SettingManagerStore => {
    const { error: errorHandlingError, handleError, clearError, parseDataWithErrorHandling } =
        useErrorHandling();

    const [settings, setSettings] = useState<YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { notify } = useNotification();

    // Function to reset the settings state
    const reset = () => {
        setSettings(null);
        setIsLoading(false);
        clearError();
        setError(null);
    };

    const fetchSettings = async () => {
        setIsLoading(true);
        clearError();
        setError(null);
        try {
            const response = await axiosInstance.get("/settings");
            const data = response.data;

            const parsedData = parseDataWithErrorHandling(data, 0);

            if (parsedData && parsedData.length > 0) {
                setSettings(parsedData[0]);
            } else {
                setSettings(null);
                const errorMsg = "Invalid settings response";
                setError(errorMsg);
                handleError(errorMsg);
            }
        } catch (error: any) {
            const errorMsg = "Error fetching settings";
            setError(errorMsg);
            handleError(errorMsg, error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const updateSettings = async (updatedSettings: YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
        setIsLoading(true);
        setError(null);
        try {
            await axiosInstance.put("/settings", updatedSettings);
            setSettings(updatedSettings);
            notify({
                id: 'updateSettingsSuccess',
                message: 'Settings updated successfully',
                data: { originalError: undefined },   // or any NotificationDataPayload you need
                timestamp: new Date(),
                type: NotificationTypeEnum.OPERATION_SUCCESS
            });
        } catch (error: any) {
            const errorMsg = "Error updating settings";
            setError(errorMsg);
            handleError(errorMsg, error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteSettings = async (settingsId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await axiosInstance.delete(`/settings/${settingsId}`);
            if (settings && settings.id === settingsId) {
                setSettings(null);
            }
        } catch (error: any) {
            const errorMsg = "Error deleting settings";
            setError(errorMsg);
            handleError(errorMsg, error);
        } finally {
            setIsLoading(false);
        }
    };

    const setUserData = (userData: UserManagerState): void => {
        setSettings((prevSettings) => {
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
                        id: '',
                        projectName: '',
                        description: '',
                        teamMembers: '',
                    
                        exchange: '',
                        communication: '',
                        collaborationOptions: '',
                        metadata: '',
                    
                        exchangeData: '',
                        averagePrice: '',
                    
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
                        browserKey: '', 
                        dispatch: '', 
                        init: '', 
                        testDispatch: ''
                    },
                    trackerStore: {
                        trackers: '',
                        addTracker: '',
                        getTracker: '',
                        getTrackers: '',
                       
                        removeTracker: '',
                        dispatch: '',
                       
                    },
                    todoStore: {
                        dispatch: '',
                        todos: '',
                        todoList: '',
                        toggleTodo: '',
                    
                        addTodo: '',
                        loading: '',
                        error: '',
                        addTodos: '',
                    
                        removeTodo: '',
                        assignTodoToUser: '',
                        updateTodoTitle: '',
                        fetchTodosSuccess: '',
                        
                        fetchTodosFailure: '',
                        openTodoSettingsPage: '',
                        getTodoId: '',
                        getTeamId: '',
                    
                        fetchTodosRequest: '',
                        completeAllTodosSuccess: '',
                        completeAllTodos: '',
                        completeAllTodosFailure: '',
                    
                        NOTIFICATION_MESSAGE: '',
                        setDynamicNotificationMessage: '',
                        subscribeToSnapshot: '',
                        batchFetchTodoSnapshotsRequest: ''
                    },
                    taskManagerStore: {
                        
                        tasks: '', 
                        taskTitle: '', 
                        taskDescription: '', 
                        taskStatus: '',
                        
                        assignedTaskStore: '', 
                        updateTaskTitle: '', 
                        updateTaskDescription: '', 
                        updateTaskStatus: '',
                        
                        updateTaskDueDate: '', 
                        updateTaskPriority: '', 
                        filterTasksByStatus: '', 
                        getTaskCountByStatus: '',
                        
                        clearAllTasks: '', 
                        archiveCompletedTasks: '', 
                        updateTaskAssignee: '', 
                        getTasksByAssignee: '',
                        
                        getTaskById: '', 
                        sortByDueDate: '', 
                        exportTasksToCSV: '', 
                        dispatch: '', 
                        addTaskSuccess: '', 
                        addTask: '',
                        
                        addTasks: '', 
                        assignTaskToUser: '', 
                        removeTask: '', 
                        removeTasks: '', 
                        fetchTasksByTaskId: '', 
                        fetchTasksSuccess: '',
                        
                        fetchTasksFailure: '', 
                        fetchTasksRequest: '', 
                        completeAllTasksSuccess: '', 
                        completeAllTasks: '',
                        
                        completeAllTasksFailure: '', 
                        NOTIFICATION_MESSAGE: '', 
                        setDynamicNotificationMessage: '',
                        
                        takeTaskSnapshot: '', 
                        markTaskAsComplete: '', 
                        updateTaskPositionSuccess: '', 
                        batchFetchTaskSnapshotsRequest: '', 
                        
                        batchFetchTaskSnapshotsSuccess: '', 
                        batchFetchUserSnapshotsRequest: '',
                    },
                    iconStore: {
                        
                        dispatch: '',
                    },
                    calendarStore: {
                        
                        openScheduleEventModal: '', 
                        openCalendarSettingsPage: '', 
                        getData: '', 
                        updateDocumentReleaseStatus: '',
                        
                        getState: '', 
                        action: '', 
                        events: '', 
                        eventTitle: '', 
                        
                        eventDescription: '', 
                        eventStatus: '', 
                        assignedEventStore: '', 
                        snapshotStore: '',
                        
                        NOTIFICATION_MESSAGE: '', 
                        NOTIFICATION_MESSAGES: '', 
                        updateEventTitle: '', 
                        updateEventDescription: '',
                        
                        updateEventStatus: '', 
                        updateEventDate: '', 
                        addEvent: '', 
                        addEvents: '',
                        
                        removeEvent: '', 
                        removeEvents: '', 
                        reassignEvent: '', 
                        addEventSuccess: '', 
                        
                        fetchEventsSuccess: '', 
                        fetchEventsFailure: '', 
                        fetchEventsRequest: '', 
                        completeAllEventsSuccess: '',
                        
                        completeAllEvents: '', 
                        completeAllEventsFailure: '', 
                        setDynamicNotificationMessage: '', 
                        handleRealtimeUpdate: '', 
                        getSnapshotDataKey: '',
                    },
                    endpoints: {},
                    highlights: [],
                    results: [],
                    totalCount: 0,
                    searchData: {
                        results: '',
                        totalCount: '',
                    
                    },
                    calendarEventTypes: '',
                    todoTypes: '',
                    taskTypes: '',
                    snapshotStoreTypes: '',
                
                } as YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
            }
    
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
            } as YourSettingsResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        });
            
        notify({
            id: "setUserData",
            message: "User data updated successfully.",
            data: { 
                entityType: "User",
                userId: "current-user-id", // if available
                // other relevant metadata
            },
            timestamp: new Date(),
            type: NotificationTypeEnum.OPERATION_SUCCESS
        });
    };

    // Create MobX store with reactive state
    const store = makeAutoObservable({
        // Reactive state
        settings,
        isLoading,
        error,
        
        // Methods
        reset,
        setUserData,
        fetchSettings,
        updateSettings,
        deleteSettings,
    });

    return store;
};

export default useSettingManagerStore;