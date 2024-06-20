// taskSagas.ts
import { taskService } from "@/app/components/tasks/TaskService";
import axios, { AxiosResponse } from "axios";
import { Effect, call, put, takeLatest } from "redux-saga/effects";
import { TaskActions } from "../../../actions/TaskActions";
import { Task } from "../../../models/tasks/Task";
import NOTIFICATION_MESSAGES from "../../../support/NotificationMessages";
import * as taskApi from '@/app/api/TasksApi'
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
        error: NOTIFICATION_MESSAGES.Tasks.TASK_ADD_ERROR,
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
        error: NOTIFICATION_MESSAGES.Tasks.TASK_FETCH_ERROR,
      })
    );
  }
}


function* removeTaskSaga(
  action: ReturnType<typeof TaskActions.remove>
): Generator {
  try {
    const { payload: taskId } = action;
    yield call(taskService.removeTask, taskId, "requestData");
    yield put(TaskActions.removeTaskSuccess(taskId));
  } catch (error) {
    yield put(
      TaskActions.removeTaskFailure({
        error: NOTIFICATION_MESSAGES.Tasks.TASK_REMOVE_ERROR,
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
    yield put(TaskActions.updateTaskFailure({ error: NOTIFICATION_MESSAGES.Tasks.TASK_UPDATE_ERROR }));
  }
}

function* completeAllTasksSaga(): Generator {
  try {
    yield call(taskService.completeAllTasks, "requestData");
    // Update the state or handle success if needed
    yield put(TaskActions.completeAllTasksSuccess());
  } catch (error) {
    yield put(TaskActions.completeAllTasksFailure({ error: NOTIFICATION_MESSAGES.Tasks.COMPLETE_ALL_TASKS_ERROR }));
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
        error: NOTIFICATION_MESSAGES.Tasks.TASK_FETCH_ERROR,
      })
    );
  }
}

function* toggleTaskSaga(
  action: ReturnType<typeof TaskActions.toggle>
): Generator {
  try {
    const { payload: taskId } = action;
    const updatedTask = (yield call(taskService.toggleTask, taskId)) as Task;

    yield put(TaskActions.updateTasksSuccess({ tasks: [updatedTask] }));
  } catch (error) {
    yield put(
      TaskActions.updateTaskFailure({
        error: NOTIFICATION_MESSAGES.Tasks.TASK_TOGGLE_ERROR,
      })
    );
  }
}

function* updateTaskSaga(action: ReturnType<typeof TaskActions.updateTask>): Generator {
  try {
    const { payload: { taskId, newTitle } } = action;
    const response = yield call(taskService.updateTask, taskId, newTitle);
    yield put(TaskActions.updateTasksSuccess({ tasks: [response] as Task[] }));
  } catch (error) {
    yield put(
      TaskActions.updateTaskFailure({
        error: NOTIFICATION_MESSAGES.Tasks.TASK_UPDATE_ERROR,
      })
    );
  }
}

function* fetchTasksSaga(): Generator {
  try {
    yield put(TaskActions.fetchTasksRequest());
    const response = yield call(taskService.fetchTasks, "requestData");
    yield put(TaskActions.fetchTasksSuccess({ tasks: response as Task[] }));
  } catch (error) {
    yield put(
      TaskActions.fetchTasksFailure({
        error: NOTIFICATION_MESSAGES.Tasks.TASK_FETCH_ERROR,
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

function* completeAllTasksSuccessSaga(): Generator {
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


// Define your resetStateVariables action creator
function resetStateVariables() {
  return { type: "RESET_STATE_VARIABLES_ACTION_TYPE" }; // Replace with your actual action type
}

// Define your fetchUpdatedData function
function* fetchUpdatedData(taskId: number): Generator {
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

  

export function* watchTaskSagas() {
  
  yield takeLatest(TaskActions.add.type, addTaskSaga),
  yield takeLatest(TaskActions.remove.type, removeTaskSaga),
    yield takeLatest(TaskActions.toggle.type, toggleTaskSaga),
    yield takeLatest(TaskActions.fetchTaskData.type, fetchDataSaga),
  yield takeLatest(TaskActions.updateTask.type, updateTaskSaga),
  yield takeLatest(TaskActions.updateTaskSuccess.type, updateTaskSuccessSaga),
  yield takeLatest(TaskActions.updateTasksSuccess.type, updateTasksSuccessSaga),
  yield takeLatest(TaskActions.fetchTasksRequest.type, fetchTaskSaga), 
  yield takeLatest(TaskActions.fetchTasksRequest.type, fetchTasksSaga),
  yield takeLatest(TaskActions.fetchTasksRequest.type, fetchTasksRequestSaga),
  yield takeLatest(TaskActions.fetchTasksSuccess.type, fetchTasksSuccessSaga),
  yield takeLatest(TaskActions.fetchTasksFailure.type, fetchTasksFailureSaga),
  yield takeLatest(TaskActions.completeAllTasksSuccess.type, completeAllTasksSuccessSaga),
  yield takeLatest(TaskActions.completeAllTasksRequest.type, completeAllTasksRequestSaga),
  yield takeLatest(TaskActions.completeAllTasksFailure.type, completeAllTasksFailureSaga)
};  


export function* taskSagas()
{
  yield watchTaskSagas()
}
