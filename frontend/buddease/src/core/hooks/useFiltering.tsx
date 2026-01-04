useFiltering.tsx
import { TaskActions } from "@/core/actions/TaskActions";
import endpointConfigurations from "@/core/api/endpointConfigurations";
import { Task } from "@/core/components/models/tasks/Task";
import {
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta,
} from "@/core/config/BaseConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { NotificationTypeEnum } from "@/core/features/support/UnifiedNotificationTypes";
import { PriorityTypeEnum } from "@/core/models/data/StatusType";
import { SearchOptions } from "@/core/pages/searches/SearchOptions";
import { useNotification } from "@/core/state/context/NotificationContext";
import { RootState } from "@/core/state/redux/slices/RootSlice";
import { Action, ThunkAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Dispatch, useCallback, useState } from "react";

const { notify } = useNotification();

Reusable filtering logic
function useFiltering(options: SearchOptions) {
  const [filters, setFilters] = useState<
    SearchOptions["additionalOptions"]["filters"]
  >([]);
  const [transform, setTransform] = useState("none");

  const addFilter = (
    column: string,
    operation: "equal" | "notEqual" | "contains" | "notContains",
    value: string | number | boolean
  ) => {
    // Logic to add filter
    setFilters((prevFilters) => [
      ...(prevFilters || []),
      { name: column, operation, value },
    ]);
  };

  const filterTasksEndpoint = endpointConfigurations.filtering.filterTasks;
  const searchMessagesEndpoint =
    endpointConfigurations.searching.searchMessages;

  const handleFilterTasks = (
    filters: SearchOptions["additionalOptions"]["filters"],
    transform: string
  ) => {
    // Call API to filter tasks
    return axios.post(filterTasksEndpoint.path, { filters, transform });
  };

  const handleSearchMessages = (
    filters: SearchOptions["additionalOptions"]["filters"],
    transform: string
  ) => {
    // Call API to search messages
    return axios.post(searchMessagesEndpoint.path, { filters, transform });
  };

  const handleSubmit = useCallback(
    async (type: "tasks" | "messages" = "tasks") => {
      try {
        const response =
          type === "tasks"
            ? await handleFilterTasks(filters, transform)
            : await handleSearchMessages(filters, transform);

        const successMessage =
          type === "tasks"
            ? "Tasks filtered successfully"
            : "Messages searched successfully";

        notify({
          id: `${type}FilterSuccess${Date.now()}`,
          message: successMessage,
          data: {
            extra: {
              operation: type === "tasks" ? "filter_tasks" : "search_messages",
              filterCount: filters?.length || 0,
              transform,
            },
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_SUCCESS,
          level: "success",
        });

        console.log(`${successMessage}:`, response.data);
        return response.data;
      } catch (error: any) {
        console.error(
          `Error ${
            type === "tasks" ? "filtering tasks" : "searching messages"
          }:`,
          error
        );

        const errorMessage =
          type === "tasks"
            ? NOTIFICATION_MESSAGES.Tasks.TASK_FETCH_ERROR
            : NOTIFICATION_MESSAGES.Search.SEARCH_ERROR;

        notify({
          id: `${type}FilterError${Date.now()}`,
          message: errorMessage,
          data: {
            originalError: error.message,
            extra: {
              operation: type === "tasks" ? "filter_tasks" : "search_messages",
              filterCount: filters?.length || 0,
              transform,
              errorDetails: error,
            },
          },
          timestamp: new Date(),
          type: NotificationTypeEnum.OPERATION_ERROR,
          level: "error",
        });

        throw error;
      }
    },
    [filters, transform, handleFilterTasks, handleSearchMessages, notify]
  );

  const handleSearchSubmit = () => {
    // Logic to handle form submission for searching messages
    handleSearchMessages(filters, transform)
      .then((response) => {
        console.log("Messages searched successfully:", response.data);
        // TODO: Update state with searched data, or notify the user
      })
      .catch((error) => {
        console.error("Error searching messages:", error);
        // TODO: Add better error handling and user notification
      });
  };

  // Example usage within the hook
  const exampleUsage = () => {
    const column = "status";
    const operation = "equal";
    const value = "completed";

    addFilter(column, operation, value);

    handleSubmit(); // For filtering tasks
    // handleSearchSubmit(); // Uncomment this line to search messages instead
  };

  // Call example usage (this is just to demonstrate, you might not call it like this in actual code)
  exampleUsage(); // TODO: Remove this in production

  return {
    addFilter,
    handleSubmit,
    handleSearchSubmit,
    filters,
    transform,
    setTransform,
  };
}

const updateTaskPriority =
  <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    taskId: Task<
      T,
      K,
      Meta,
      AttachmentType,
      ExcludedFields,
      IncludedFields
    >["id"],
    priority: PriorityTypeEnum
  ): ThunkAction<void, RootState, unknown, Action<string>> =>
  async (dispatch: Dispatch<Action<string>>, getState: () => RootState) => {
    try {
      // Get the full task object from the state
      const state = getState();
      const task:
        | Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        | undefined = state.taskManager.tasks.find(
        (
          task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
        ) => task.id === taskId
      );

      if (!task) {
        throw new Error(`Task with id ${taskId} not found`);
      }

      // Assuming setTasks is a React setState function or similar
      // Corrected the Record type (only 2 type parameters)
      setTasks(
        (
          prevTasks: Record<
            PriorityTypeEnum,
            Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
          >
        ): Record<
          PriorityTypeEnum,
          Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
        > => {
          const updatedTasks = { ...prevTasks };

          // Find which priority group the task is currently in
          const currentPriorityGroup = Object.entries(updatedTasks).find(
            ([_, tasks]) => tasks.some((t) => t.id === taskId)
          )?.[0] as PriorityTypeEnum | undefined;

          // Remove task from current priority group if found
          if (currentPriorityGroup) {
            updatedTasks[currentPriorityGroup] = updatedTasks[
              currentPriorityGroup
            ].filter((t) => t.id !== taskId);
          }

          // Add task to new priority group
          if (!updatedTasks[priority]) {
            updatedTasks[priority] = [];
          }

          const updatedTask = { ...task, priority };
          updatedTasks[priority] = [...updatedTasks[priority], updatedTask];

          return updatedTasks;
        }
      );

      // Dispatch the action with the full task object
      dispatch(
        TaskActions.updateTaskPrioritySuccess({
          taskId,
          priority,
          task: task, // Include the full task if needed
        })
      );
    } catch (error: any) {
      console.error("Error updating task priority:", error);
      // Dispatch any necessary error actions here
      dispatch(
        TaskActions.updateTaskPriorityFailure({
          taskId,
          error: error.message,
        })
      );
    }
  };

export default useFiltering;


function setTasks<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  setterFunction: (
    prevTasks: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
  ) => Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>
): void {
  // Implementation would update state/store
  console.log('setTasks called');
}
