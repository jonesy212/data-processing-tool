import { CryptoActions } from '@/app/actions/CryptoActions';
import { ProjectManagementActions } from '@/app/actions/ProjectManagementActions';
import { TaskActions } from '@/app/actions/TaskActions';
import { BaseDataEntity, DefaultMeta } from '@/app/components/configs/BaseConfig';
import { Attachment } from '@/app/documents/Attachment/attachment';
import { addNotification } from '@/features/support/NotificationsSlice';
import { Snapshot, Snapshots } from '@/LocalStorageSnapshotStore';
import { NotificationData } from '@/models/display/ShowToast';
import { SnapshotActions } from '@/app/snapshots/SnapshpshotActions';
import { Subscriber } from '@/users/Subscriber';
import { useDispatch } from 'react-redux';

// Types for Redux integration
export interface ReduxDispatchConfig {
  enableBatchOperations?: boolean;
  batchSize?: number;
  errorHandling?: 'throw' | 'log' | 'silent';
}

export interface BatchOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  type: 'ADD' | 'UPDATE' | 'REMOVE' | 'NOTIFY';
  payload: any;
  snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

export const useReduxIntegration = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(config?: ReduxDispatchConfig) => {
  const dispatch = useDispatch();

  // === PROJECT MANAGEMENT ACTIONS ===
  const projectOperations = {
    startNewProject: () => {
      return dispatch(ProjectManagementActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().startNewProject());
    },

    addTeamMember: (payload: { projectId: string; memberId: string }) => {
      return dispatch(
        ProjectManagementActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().addTeamMember(payload)
      );
    },

    updateProjectStatus: (payload: { projectId: string; status: string }) => {
      return dispatch(
        ProjectManagementActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().updateProjectStatus(payload)
      );
    }
  };

  // === TASK MANAGEMENT ACTIONS ===
  const taskOperations = {
    createTask: (taskPayload: any) => {
      return dispatch(TaskActions.createTask(taskPayload));
    },

    assignTask: (payload: { projectId: string; taskId: string; assigneeId: string }) => {
      return dispatch(TaskActions.assignTask(payload));
    },

    updateTaskStatus: (payload: { taskId: string; status: string }) => {
      return dispatch(TaskActions.updateTaskStatus(payload));
    }
  };

  // === CRYPTO ACTIONS ===
  const cryptoOperations = {
    buyCrypto: (payload: { currency: string; amount: number }) => {
      return dispatch(CryptoActions.buyCrypto(payload));
    },

    sellCrypto: (payload: { currency: string; amount: number }) => {
      return dispatch(CryptoActions.sellCrypto(payload));
    },

    monitorMarketTrends: () => {
      return dispatch(CryptoActions.monitorMarketTrends());
    },

    joinCryptoCommunity: (payload: { communityId: string }) => {
      return dispatch(CryptoActions.joinCryptoCommunity(payload));
    }
  };

  // === SNAPSHOT ACTIONS ===
  const snapshotOperations = {
    addSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      return dispatch(SnapshotActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().add(snapshot));
    },

    updateSnapshots: (snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
      return dispatch(SnapshotActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().updateSnapshots(snapshots));
    },

    removeSnapshot: (snapshotId: string) => {
      return dispatch(SnapshotActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().remove(snapshotId));
    },

    batchTakeSnapshots: (payload: { snapshots: { snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> } }) => {
      return dispatch(SnapshotActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().batchTakeSnapshots(payload));
    },

    fetchSnapshotData: (url: string) => {
      return dispatch(SnapshotActions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>().fetchSnapshotData(url));
    }
  };

  // === NOTIFICATION ACTIONS ===
  const notificationOperations = {
    addNotification: (notification: NotificationData) => {
      return dispatch(addNotification(notification));
    },

    notifySubscribers: (
      subscribers: Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
      notification: NotificationData
    ) => {
      // Batch notification dispatch for multiple subscribers
      subscribers.forEach(subscriber => {
        const personalizedNotification = {
          ...notification,
          message: `${notification.message} - Sent to: ${subscriber.getData()?.name ?? ''}`
        };
        dispatch(addNotification(personalizedNotification));
      });
    }
  };

  // === BATCH OPERATIONS ===
  const batchOperations = {
    executeBatch: async (operations: BatchOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => {
      const batchSize = config?.batchSize || 50;
      const results = [];

      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        
        try {
          const batchResults = await Promise.all(
            batch.map(async (op) => {
              switch (op.type) {
                case 'ADD':
                  return snapshotOperations.addSnapshot(op.snapshot!);
                case 'UPDATE':
                  return snapshotOperations.updateSnapshots(op.payload);
                case 'REMOVE':
                  return snapshotOperations.removeSnapshot(op.payload);
                case 'NOTIFY':
                  return notificationOperations.addNotification(op.payload);
                default:
                  throw new Error(`Unknown operation type: ${op.type}`);
              }
            })
          );
          results.push(...batchResults);
        } catch (error) {
          if (config?.errorHandling === 'throw') {
            throw error;
          } else if (config?.errorHandling === 'log') {
            console.error('Batch operation failed:', error);
          }
          // For 'silent', just continue
        }
      }

      return results;
    },

    batchSnapshotUpdates: (updates: {
      additions?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      updates?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
      removals?: string[];
    }) => {
      const operations: BatchOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

      // Add snapshot additions
      updates.additions?.forEach(snapshot => {
        operations.push({
          type: 'ADD',
          payload: null,
          snapshot
        });
      });

      // Add snapshot updates
      if (updates.updates?.length) {
        operations.push({
          type: 'UPDATE',
          payload: updates.updates
        });
      }

      // Add snapshot removals
      updates.removals?.forEach(snapshotId => {
        operations.push({
          type: 'REMOVE',
          payload: snapshotId
        });
      });

      return batchOperations.executeBatch(operations);
    }
  };

  // === COMPREHENSIVE ACTION HANDLER ===
  const handleActions = async () => {
    try {
      // Project management actions
      await projectOperations.startNewProject();
      await projectOperations.addTeamMember({
        projectId: "project123",
        memberId: "user456",
      });
      await projectOperations.updateProjectStatus({
        projectId: "project123",
        status: "In Progress",
      });

      // Task management actions
      await taskOperations.createTask({
        projectId: "project123",
        phaseId: "phase456",
        task: {
          name: "Task 1",
          description: "Description of Task 1",
          id: "",
          title: "",
          assignedTo: null,
          assigneeId: undefined,
          dueDate: undefined,
          payload: undefined,
          priority: "Low" as any,
          previouslyAssignedTo: [],
          done: false,
          data: undefined,
          source: "user",
          startDate: undefined,
          endDate: undefined,
          isActive: false,
          tags: [],
          timestamp: undefined,
          category: "",
        },
      });

      await taskOperations.assignTask({
        projectId: "project123",
        taskId: "task789",
        assigneeId: "user456",
      });

      // Crypto actions
      await cryptoOperations.buyCrypto({ currency: "BTC", amount: 1 });
      await cryptoOperations.sellCrypto({ currency: "ETH", amount: 2 });
      await cryptoOperations.monitorMarketTrends();
      await cryptoOperations.joinCryptoCommunity({ communityId: "crypto123" });

      console.log("All actions handled successfully.");
    } catch (error) {
      console.error("Error handling actions:", error);
      throw error;
    }
  };

  return {
    // Individual operation groups
    projectOperations,
    taskOperations,
    cryptoOperations,
    snapshotOperations,
    notificationOperations,
    batchOperations,
    
    // Comprehensive handlers
    handleActions,
    
    // Direct dispatch for custom operations
    dispatch: (action: any) => dispatch(action),
    
    // Utility methods
    getDispatch: () => dispatch
  };
};

export type ReduxIntegrationHook = ReturnType<typeof useReduxIntegration>;