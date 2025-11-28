// DataService.ts
import internalApiService from '@/app/api/ApiClient';
import { NotificationPosition } from '@/app/models/StatusType'
import { NotificationContextProps } from '@/state/context/NotificationContext';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes'
import { action, observable, runInAction } from 'mobx';
import { useAuth } from '@/app/state/context/AuthContext';
import DATA_NOTIFICATIONS from '@/app/features/support/DataNotifications';
import { YourResponseType } from '@/app/typings/responseTypes';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { DataState } from '@/app/state/DataState'

class DataService<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  @observable notification: NotificationContextProps | null = null;
  @observable dataAnalysis: YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null = null;
  @observable loading = false;
  @observable error: string | null = null;
  
  // Use generic parameters for all data states
  @observable userData: DataState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  @observable taskData: DataState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;
  @observable noteData: DataState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null = null;

  @action
  fetchData = async (): Promise<void> => {
    try {
      this.loading = true;

      const authStore = useAuth();
      const response = await internalApiService.get<YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>('/api/data', { 
        headers: { Authorization: `Bearer ${authStore.token}` } 
      },
        'FETCH_CLIENT_DETAILS_SUCCESS', // Success notification
        'FETCH_CLIENT_DETAILS_ERROR'    // Error notification
      );

      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const dataAnalysis = await response.data;

      runInAction(() => {
        if (this.notification) {
          this.notification.notify(
            "fetchDataSuccess",
            "Data fetched successfully",
            DATA_NOTIFICATIONS.DataOperationSuccess.FETCH_SUCCESS,
            new Date(),
            NotificationTypeEnum.OPERATION_SUCCESS,
            NotificationPosition.TopRight
          );
        }
        this.dataAnalysis = dataAnalysis;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        if (this.notification) {
          this.notification.notify(
            "fetchDataFailure",
            "Failed to fetch data",
            DATA_NOTIFICATIONS.DataError.FETCH_ERROR,
            new Date(),
            NotificationTypeEnum.ERROR,
            NotificationPosition.TopRight
          );
        }
        this.error = error.message || 'Error fetching data';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  // Entity-specific data loading methods using generic parameters
  @action
  loadUserData = async (userId: string): Promise<void> => {
    try {
      this.loading = true;
      const authStore = useAuth();
      
      const response = await internalApiService.get(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      },,
        'FETCH_CLIENT_DETAILS_SUCCESS',
        'FETCH_CLIENT_DETAILS_ERROR'
      );

      if (response.status !== 200) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      runInAction(() => {
        this.userData = response.data as DataState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        if (this.notification) {
          this.notification.notify(
            "loadUserSuccess",
            "User data loaded successfully",
            DATA_NOTIFICATIONS.DataOperationSuccess.FETCH_SUCCESS,
            new Date(),
            NotificationTypeEnum.OPERATION_SUCCESS,
            NotificationPosition.TopRight
          );
        }
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.userData = null;
        if (this.notification) {
          this.notification.notify(
            "loadUserFailure",
            "Failed to load user data",
            DATA_NOTIFICATIONS.DataError.FETCH_ERROR,
            new Date(),
            NotificationTypeEnum.ERROR,
            NotificationPosition.TopRight
          );
        }
        this.error = error.message || 'Error loading user data';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  @action
  loadTaskData = async (taskId: string): Promise<void> => {
    try {
      this.loading = true;
      const authStore = useAuth();
      
      const response = await internalApiService.get(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      },        
        'FETCH_CLIENT_DETAILS_SUCCESS', // Success notification
        'FETCH_CLIENT_DETAILS_ERROR'    // Error notification
      );

      if (response.status !== 200) {
        throw new Error(`Failed to fetch task data: ${response.status}`);
      }

      runInAction(() => {
        this.taskData = response.data as DataState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        if (this.notification) {
          this.notification.notify(
            "loadTaskSuccess",
            "Task data loaded successfully",
            DATA_NOTIFICATIONS.DataOperationSuccess.FETCH_SUCCESS,
            new Date(),
            NotificationTypeEnum.OPERATION_SUCCESS,
            NotificationPosition.TopRight
          );
        }
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.taskData = null;
        if (this.notification) {
          this.notification.notify(
            "loadTaskFailure",
            "Failed to load task data",
            DATA_NOTIFICATIONS.DataError.FETCH_ERROR,
            new Date(),
            NotificationTypeEnum.ERROR,
            NotificationPosition.TopRight
          );
        }
        this.error = error.message || 'Error loading task data';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  @action
  loadNoteData = async (noteId: string): Promise<void> => {
    try {
      this.loading = true;
      const authStore = useAuth();
      
      const response = await internalApiService.get(`/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      },
        'FETCH_CLIENT_DETAILS_SUCCESS',
        'FETCH_CLIENT_DETAILS_ERROR'
      );

      if (response.status !== 200) {
        throw new Error(`Failed to fetch note data: ${response.status}`);
      }

      runInAction(() => {
        this.noteData = response.data as DataState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
        if (this.notification) {
          this.notification.notify(
            "loadNoteSuccess",
            "Note data loaded successfully",
            DATA_NOTIFICATIONS.DataOperationSuccess.FETCH_SUCCESS,
            new Date(),
            NotificationTypeEnum.OPERATION_SUCCESS,
            NotificationPosition.TopRight
          );
        }
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.noteData = null;
        if (this.notification) {
          this.notification.notify(
            "loadNoteFailure",
            "Failed to load note data",
            DATA_NOTIFICATIONS.DataError.FETCH_ERROR,
            new Date(),
            NotificationTypeEnum.ERROR,
            NotificationPosition.TopRight
          );
        }
        this.error = error.message || 'Error loading note data';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };

  @action
  resetData = () => {
    this.dataAnalysis = null;
    this.userData = null;
    this.taskData = null;
    this.noteData = null;
    this.loading = false;
    this.error = null;
  };

  // Helper method to check data state
  getUserDataState(): string {
    if (this.userData === null) return 'uninitialized';
    if (this.userData instanceof Map) return 'snapshots';
    if (typeof this.userData === 'object') return 'entity';
    return 'unknown';
  }
}

// Create entity-specific instances using the generic parameters
import { 
  UserEntity, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields 
} from '@/app/typings/entities/UserEntity'
import { 
  TaskEntity, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields 
} from '@/app/typings/entities/TaskEntity'
import { 
  NoteEntity, NoteMeta, NoteAttachment, NoteExcludedFields, NoteIncludedFields 
} from '@/app/typings/entities/NoteEntity'

const userDataService = new DataService<
  UserEntity, 
  UserEntity,  // K extends T, so use UserEntity
  UserMeta, 
  UserAttachment, 
  UserExcludedFields, 
  UserIncludedFields
>();

const taskDataService = new DataService<
  TaskEntity, 
  TaskEntity, 
  TaskMeta, 
  TaskAttachment, 
  TaskExcludedFields, 
  TaskIncludedFields
>();

const noteDataService = new DataService<
  NoteEntity, 
  NoteEntity, 
  NoteMeta, 
  NoteAttachment, 
  NoteExcludedFields, 
  NoteIncludedFields
>();

// Default export for general use (uses default generic parameters)
const dataService = new DataService();

export { userDataService, taskDataService, noteDataService };
export default dataService;