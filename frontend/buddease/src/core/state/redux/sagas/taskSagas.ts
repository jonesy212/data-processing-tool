taskSagas.ts
import { TaskActions } from "@/core/actions/TaskActions";
import EXTENDED_NOTIFICATION_MESSAGES from "@/core/features/support/ExtendedNotificationMessages";
import { Task } from "@/core/models/tasks/Task";
import { taskService } from "@/core/services/TaskService";
import axios, { AxiosResponse } from "axios";
import { Effect, call, put, takeLatest } from "redux-saga/effects";

// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchTasksAPI = () => axios.get('/api/tasks');

function* addTaskSaga(
  action: ReturnType<typeof TaskActions.add>
): Generator<Effect, void, any> {
  try {
    const { payload: newTask } = action;
    const response: AxiosResponse<Task> = yield call(
      taskService.addTask,
      newTask,
      "requestData"
    );
    yield put(TaskActions.addTaskSuccess({ task: response.data }));
  } catch (error) {
    yield put(
      TaskActions.addTaskFailure({
        error: EXTENDED_NOTIFICATION_MESSAGES.Tasks.TASK_ADD_ERROR,
      })
    );
  }
}

function* fetchTaskSaga(): Generator<Effect, void, any> {
  try {
    yield put(TaskActions.fetchTasksRequest());
    const response: AxiosResponse<Task[]> = yield call(fetchTasksAPI);
    yield put(TaskActions.fetchTasksSuccess({ tasks: response.data }));
  } catch (error) {
    yield put(
      TaskActions.fetchTasksFailure({
        error: EXTENDED_NOTIFICATION_MESSAGES.Tasks.TASK_FETCH_ERROR,
      })
    );
  }
}


function* removeTaskSaga(
  action: ReturnType<typeof TaskActions.remove>
): Generator<Effect, void, any> {
  try {
    const { payload: taskId } = action;
    yield call(taskService.removeTask, taskId, "requestData");
    yield put(TaskActions.removeTaskSuccess(taskId));
  } catch (error) {
    yield put(
      TaskActions.removeTaskFailure({
        error: EXTENDED_NOTIFICATION_MESSAGES.Tasks.TASK_REMOVE_ERROR,
      })
    );
  }
}

function* updateTaskSuccessSaga(
  action: ReturnType<typeof TaskActions.updateTaskSuccess>
): Generator<Effect, void, any> {
  try {
    const { task } = action.payload;
    yield put(TaskActions.updateTasksSuccess({ tasks: [task] }));
  } catch (error) {
    yield put(TaskActions.updateTaskFailure({ error: EXTENDED_NOTIFICATION_MESSAGES.Tasks.TASK_UPDATE_ERROR }));
  }
}

function* completeAllTasksSaga(): Generator<Effect, void, any> {
  try {
    yield call(taskService.completeAllTasks, "requestData");
    // Update the state or handle success if needed
    yield put(TaskActions.completeAllTasksSuccess());
  } catch (error) {
    yield put(TaskActions.completeAllTasksFailure({ error: EXTENDED_NOTIFICATION_MESSAGES.Tasks.COMPLETE_ALL_TASKS_ERROR }));
  }
}

function* fetchDataSaga(
  action: ReturnType<typeof TaskActions.fetchTasksRequest>
): Generator<Effect, void, any> {
  try {
    const response: AxiosResponse<Task[]> = yield call(
      taskService.fetchTasks,
      "requestData"
    );
    yield put(TaskActions.fetchTasksSuccess({ tasks: response.data }));
  } catch (error) {
    yield put(
      TaskActions.fetchTasksFailure({
        error: EXTENDED_NOTIFICATION_MESSAGES.Tasks.TASK_FETCH_ERROR,
      })
    );
  }
}

function* toggleTaskSaga(
  action: ReturnType<typeof TaskActions.toggle>
): Generator<Effect, void, any> {
  try {
    const { payload: taskId } = action;
    const updatedTask = (yield call(taskService.toggleTask, taskId)) as Task;

    yield put(TaskActions.updateTasksSuccess({ tasks: [updatedTask] }));
  } catch (error) {
    yield put(
      TaskActions.updateTaskFailure({
        error: EXTENDED_NOTIFICATION_MESSAGES.Tasks.TASK_TOGGLE_ERROR,
      })
    );
  }
}

function* updateTaskSaga(action: ReturnType<typeof TaskActions.updateTask>): Generator<Effect, void, any> {
  try {
    const { payload: { taskId, newTitle } } = action;
    const response = yield call(taskService.updateTask, taskId, newTitle);
    yield put(TaskActions.updateTasksSuccess({ tasks: [response] as Task[] }));
  } catch (error) {
    yield put(
      TaskActions.updateTaskFailure({
        error: EXTENDED_NOTIFICATION_MESSAGES.Tasks.TASK_UPDATE_ERROR,
      })
    );
  }
}

function* fetchTasksSaga(): Generator<Effect, void, any> {
  try {
    yield put(TaskActions.fetchTasksRequest());
    const response = yield call(taskService.fetchTasks, "requestData");
    yield put(TaskActions.fetchTasksSuccess({ tasks: response as Task[] }));
  } catch (error) {
    yield put(
      TaskActions.fetchTasksFailure({
        error: EXTENDED_NOTIFICATION_MESSAGES.Tasks.TASK_FETCH_ERROR,
      })
    );
  }
}

// Implementation for fetchTasksRequestSaga
function* fetchTasksRequestSaga(): Generator<Effect, void, any> {
  try {
    yield put(TaskActions.fetchTasksRequest());

    // Use taskService to fetch tasks
    const tasks: Task[] = yield call(taskService.fetchTasks, "requestData");

    yield put(TaskActions.fetchTasksSuccess({ tasks }));
  } catch (error) {
    yield put(TaskActions.fetchTasksFailure({ error: String(error) }));
  }
}

// Implementation for completeAllTasksRequestSaga
function* completeAllTasksRequestSaga(): Generator<Effect, void, any> {
  try {
    // Use taskService to mark all tasks as complete
    yield call(taskService.completeAllTasks, "requestData");

    yield put(TaskActions.completeAllTasksSuccess());
  } catch (error) {
    yield put(TaskActions.completeAllTasksFailure({ error: String(error) }));
  }
}

// Implementation for fetchTasksSuccessSaga
function* fetchTasksSuccessSaga(
  action: ReturnType<typeof TaskActions.fetchTasksSuccess>
): Generator<Effect, void, any> {
  try {
    // Implement the logic to handle the fetchTasksSuccess action
    const { tasks } = action.payload;

    // For example, you might want to update the state with the fetched tasks
    yield put({
      type: "UPDATE_TASKS_ACTION_TYPE", // Replace with your actual action type for updating tasks
      payload: { tasks },
    });

    // For now, let's just log the success
    console.log("Fetch Tasks Success:", tasks);
  } catch (error) {
    // Handle errors if necessary
    console.error("Error in fetchTasksSuccessSaga:", error);
  }
}

function* completeAllTasksSuccessSaga(): Generator<Effect, void, any> {
  try {
    // Reset some state variables
    yield put(resetStateVariables());

    // Fetch updated data
    const taskId = 123; // Assuming taskId is known or retrieved from somewhere
    yield call(fetchUpdatedData, taskId);

    // Log the success
    console.log("All tasks completed successfully.");
  } catch (error) {
    // Handle errors if necessary
    console.error("Error in completeAllTasksSuccessSaga:", error);
  }
}

function* fetchTasksSuccessSaga(
  action: ReturnType<typeof TaskActions.fetchTasksSuccess>
): Generator<Effect, void, any> {
  try {
    const { tasks } = action.payload;
    
    // Use real actions
    yield put(TaskActions.updateTasksState({ tasks }));
    
    // Add actual business logic here
    if (tasks.length > 0) {
      yield call(cacheTasks, tasks);
      yield put(updateTaskMetrics(tasks));
    }
    
  } catch (error) {
    yield put(TaskActions.fetchTasksFailure({ error: String(error) }));
  }
}

function* completeAllTasksSuccessSaga(): Generator<Effect, void, any> {
  try {
    // Use real actions
    yield put(TaskActions.resetTaskState());
    yield put(TaskActions.fetchTasksRequest()); // Refresh the list
    
    // Show success feedback
    yield put(TaskActions.showNotification({
      message: "All tasks completed successfully!",
      type: "success"
    }));
    
  } catch (error) {
    yield put(TaskActions.completeAllTasksFailure({ error: String(error) }));
  }
}

function resetStateVariables() {
  return TaskActions.resetTaskState(); // Uses the actual action creator
}

// Define your fetchUpdatedData function
function* fetchUpdatedData(taskId: number): Generator<Effect, void, any> {
  try {
    yield put(TaskActions.fetchTasksRequest());
    const response = yield call(taskService.fetchTaskData, taskId); // Assuming taskId is defined elsewhere
    yield put(updateData(response));
    yield put(resetCompleteAllTasksState());
  } catch (error) {
    console.error("Error in fetchUpdatedData:", error);
  }
}

// Define your updateData action creator
function updateData<T>(data: T) {
  return { type: "UPDATE_DATA_ACTION_TYPE", payload: data };
}

// Define your resetCompleteAllTasksState action creator
function resetCompleteAllTasksState() {
  return { type: "RESET_COMPLETE_ALL_TASKS_STATE_ACTION_TYPE" }; // Replace with your actual action type
}


// Implementation for updateTasksSuccessSaga
function* updateTasksSuccessSaga(
  action: ReturnType<typeof TaskActions.updateTasksSuccess>
): Generator<Effect, void, any> {
  try {
    // Implement the logic to handle the updateTasksSuccess action
    const { tasks } = action.payload;
    // Additional logic can be added here if needed
  } catch (error) {
    // Handle errors if necessary
  }
}


// Implementation for fetchTasksFailureSaga
function* fetchTasksFailureSaga(
  action: ReturnType<typeof TaskActions.fetchTasksFailure>
): Generator<Effect, void, any> {
  try {
    // Handle the fetchTasksFailure action
    const { error } = action.payload;
    // Additional error handling logic can be added here if needed
  } catch (error) {
    // Handle errors if necessary
  }
}


// Implementation for completeAllTasksFailureSaga
function* completeAllTasksFailureSaga(action: ReturnType<typeof TaskActions.completeAllTasksFailure>): Generator<Effect, void, any> {
  try {
    // You can handle the failure action as needed
    const { error } = action.payload;

    // For example, you might want to show a notification to the user
    yield put({
      type: "SHOW_NOTIFICATION_ACTION_TYPE", // Replace with your actual action type for showing notifications
      payload: {
        message: `Failed to complete all tasks: ${error}`,
        type: "error",
      },
    });

    // For now, let's just log the error
    console.error("Complete All Tasks Failure:", error);
  } catch (error) {
    // Handle errors if necessary
    console.error("Error in completeAllTasksFailureSaga:", error);
  }
}


function* assignTaskSaga(
  action: ReturnType<typeof TaskActions.assignTask>
): Generator<Effect, void, any> {
  try {
    const { projectId, taskId, assigneeId } = action.payload;
    const response = yield call(taskService.assignTask, projectId, taskId, assigneeId);
    yield put(TaskActions.updateTaskSuccess({ task: response }));
  } catch (error) {
    yield put(TaskActions.updateTaskFailure({ error: String(error) }));
  }
}

function* unassignTaskSaga(
  action: ReturnType<typeof TaskActions.unassignTask>
): Generator<Effect, void, any> {
  try {
    const { taskId } = action.payload;
    const response = yield call(taskService.unassignTask, taskId);
    yield put(TaskActions.updateTaskSuccess({ task: response }));
  } catch (error) {
    yield put(TaskActions.updateTaskFailure({ error: String(error) }));
  }
}

function* updateTaskPrioritySaga(
  action: ReturnType<typeof TaskActions.updateTaskPriority>
): Generator<Effect, void, any> {
  try {
    const { taskId, newPriority } = action.payload;
    const response = yield call(taskService.updateTaskPriority, taskId, newPriority);
    yield put(TaskActions.updateTaskPrioritySuccess({ 
      taskId: String(taskId), 
      priority: newPriority,
      task: response 
    }));
  } catch (error) {
    yield put(TaskActions.updateTaskPriorityFailure({ 
      taskId: String(taskId), 
      error: String(error) 
    }));
  }
}

function* markTaskAsCompleteSaga(
  action: ReturnType<typeof TaskActions.markTaskAsComplete>
): Generator<Effect, void, any> {
  try {
    const taskId = action.payload;
    yield put(TaskActions.markTaskAsCompleteRequest(taskId));
    const response = yield call(taskService.markTaskComplete, taskId);
    yield put(TaskActions.markTaskAsCompleteSuccess(taskId));
    yield put(TaskActions.updateTaskSuccess({ task: response }));
  } catch (error) {
    yield put(TaskActions.markTaskAsCompleteFailure({ 
      taskId, 
      error: String(error) 
    }));
  }
}


function* batchUpdateTasksSaga(
  action: ReturnType<typeof TaskActions.batchUpdateTasksRequest>
): Generator<Effect, void, any> {
  try {
    const { ids, newTitles } = action.payload;
    const response = yield call(taskService.batchUpdateTasks, ids, newTitles);
    yield put(TaskActions.batchUpdateTasksSuccess({ tasks: response }));
  } catch (error) {
    yield put(TaskActions.batchUpdateTasksFailure({ error: String(error) }));
  }
}

function* batchRemoveTasksSaga(
  action: ReturnType<typeof TaskActions.batchRemoveTasksRequest>
): Generator<Effect, void, any> {
  try {
    const taskIds = action.payload;
    yield call(taskService.batchRemoveTasks, taskIds);
    yield put(TaskActions.batchRemoveTasksSuccess(taskIds));
  } catch (error) {
    yield put(TaskActions.batchRemoveTasksFailure({ error: String(error) }));
  }
}

function* filterTasksByStatusSaga(
  action: ReturnType<typeof TaskActions.filterTasksByStatus>
): Generator<Effect, void, any> {
  try {
    const { status } = action.payload;
    const filteredTasks = yield call(taskService.filterTasksByStatus, status);
    yield put(TaskActions.fetchTasksSuccess({ tasks: filteredTasks }));
  } catch (error) {
    yield put(TaskActions.fetchTasksFailure({ error: String(error) }));
  }
}

function* sortByDueDateSaga(): Generator<Effect, void, any> {
  try {
    const sortedTasks = yield call(taskService.sortTasksByDueDate);
    yield put(TaskActions.fetchTasksSuccess({ tasks: sortedTasks }));
  } catch (error) {
    yield put(TaskActions.fetchTasksFailure({ error: String(error) }));
  }
}


function* updateTaskIdeasSaga(
  action: ReturnType<typeof TaskActions.updateTaskIdeas>
): Generator<Effect, void, any> {
  try {
    const { taskId, ideas } = action.payload;
    const response = yield call(taskService.updateTaskIdeas, taskId, ideas);
    yield put(TaskActions.updateTaskSuccess({ task: response }));
  } catch (error) {
    yield put(TaskActions.updateTaskFailure({ error: String(error) }));
  }
}

function* exportTasksToCSVSaga(): Generator<Effect, void, any> {
  try {
    const csvData = yield call(taskService.exportTasksToCSV);
    yield call(downloadCSV, csvData, 'tasks.csv');
    yield put(TaskActions.showNotification({
      message: 'Tasks exported successfully!',
      type: 'success'
    }));
  } catch (error) {
    yield put(TaskActions.showNotification({
      message: 'Export failed: ' + String(error),
      type: 'error'
    }));
  }
}

function* getTaskCountByStatusSaga(): Generator<Effect, void, any> {
  try {
    const counts = yield call(taskService.getTaskCountByStatus);
    // Dispatch to some analytics/store action
    yield put(updateTaskCounts(counts));
  } catch (error) {
    console.error('Failed to get task counts:', error);
  }
}
  

export function* watchTaskSagas() {
  // Core CRUD
  yield takeLatest(TaskActions.add.type, addTaskSaga);
  yield takeLatest(TaskActions.remove.type, removeTaskSaga);
  yield takeLatest(TaskActions.updateTask.type, updateTaskSaga);
  yield takeLatest(TaskActions.toggle.type, toggleTaskSaga);
  
  // Fetch operations
  yield takeLatest(TaskActions.fetchTasksRequest.type, fetchTasksSaga);
  yield takeLatest(TaskActions.fetchTaskData.type, fetchTaskDataSaga);
  
  // Assignment operations
  yield takeLatest(TaskActions.assignTask.type, assignTaskSaga);
  yield takeLatest(TaskActions.unassignTask.type, unassignTaskSaga);
  
  // Status operations
  yield takeLatest(TaskActions.markTaskAsComplete.type, markTaskAsCompleteSaga);
  yield takeLatest(TaskActions.completeAllTasksRequest.type, completeAllTasksSaga);
  
  // Priority operations
  yield takeLatest(TaskActions.updateTaskPriority.type, updateTaskPrioritySaga);
  
  // Batch operations
  yield takeLatest(TaskActions.batchUpdateTasksRequest.type, batchUpdateTasksSaga);
  yield takeLatest(TaskActions.batchRemoveTasksRequest.type, batchRemoveTasksSaga);
  
  // Filter/Sort operations
  yield takeLatest(TaskActions.filterTasksByStatus.type, filterTasksByStatusSaga);
  yield takeLatest(TaskActions.sortByDueDate.type, sortByDueDateSaga);
  
  // Export operations
  yield takeLatest(TaskActions.exportTasksToCSV.type, exportTasksToCSVSaga);
  
  // Analytics operations
  yield takeLatest(TaskActions.getTaskCountByStatus.type, getTaskCountByStatusSaga);
  
  // Ideas operations
  yield takeLatest(TaskActions.updateTaskIdeas.type, updateTaskIdeasSaga);
}

export function* taskSagas()
{
  yield watchTaskSagas()
}


