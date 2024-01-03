// taskSagas.ts
import axios, { AxiosResponse } from "axios";
import { Effect, call, put, select, takeLatest } from "redux-saga/effects";
import { Task } from "../../models/tasks/Task";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
import { TaskActions } from "../../tasks/TaskActions";

// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchTasksAPI = () => axios.get('/api/tasks');


function* addTaskSaga(
  action: ReturnType<typeof TaskActions.add>
): Generator<Effect, void, any> {
  try {
    const { payload: newTask } = action;

    const response: AxiosResponse<Task> = yield call(() =>
      axios.post("/api/tasks", newTask, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    yield put(TaskActions.updateTasksSuccess({ tasks: [response.data] }));
  } catch (error) {
    yield put(
      TaskActions.updateTaskFailure({
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
): Generator<Effect, void, any> {
  try {
    const { id } = action.payload as unknown as { id: number };

    yield call(() => axios.delete(`/api/tasks/${id}`));

    yield put(
      TaskActions.updateTasksSuccess({
        tasks: yield select((state) =>
          state.tasks.filter(
            (task: Task) => task.id.toString() !== id.toString()
          )
        ),
      })
    );
  } catch (error) {
    yield put(
      TaskActions.updateTaskFailure({
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


function* completeAllTasksSaga(): Generator<Effect, void, any> {
  try {
    // Assuming there is an endpoint to mark all tasks as complete
    yield call(() => axios.post('/api/tasks/complete-all'));

    yield put(TaskActions.completeAllTasksSuccess());
  } catch (error) {
    yield put(TaskActions.completeAllTasksFailure({ error: NOTIFICATION_MESSAGES.Tasks.COMPLETE_ALL_TASKS_ERROR }));
  }
}


function* toggleTaskSaga(
  action: ReturnType<typeof TaskActions.toggle>
): Generator<Effect, void, any> {
  try {
    const { payload: taskId } = action;

    const tasks = yield select((state) => state.tasks);
    const task = tasks.find((t:any) => t.id === taskId);

    if (task) {
      task.completed = !task.completed;

      yield call(() => axios.put(`/api/tasks/${taskId}`, task));

      yield put(TaskActions.updateTasksSuccess({ tasks }));
    }
  } catch (error) {
    yield put(
      TaskActions.updateTaskFailure({
        error: NOTIFICATION_MESSAGES.Tasks.TASK_TOGGLE_ERROR
      })
    );
  }
}

function* updateTaskSaga(
  action: ReturnType<typeof TaskActions.updateTask>
): Generator<Effect, void, any> {
  try {
    const { id, newTitle } = action.payload;

    const response: AxiosResponse<Task> = yield call(() =>
      axios.put(`/api/tasks/${id}`, { title: newTitle }, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    yield put(TaskActions.updateTasksSuccess({ tasks: [response.data] }));
  } catch (error) {
    yield put(
      TaskActions.updateTaskFailure({
        error: NOTIFICATION_MESSAGES.Tasks.TASK_UPDATE_ERROR,
      })
    );
  }
}



// Implementation for fetchTasksRequestSaga
function* fetchTasksRequestSaga(): Generator<Effect, void, any> {
  try {
    yield put(TaskActions.fetchTasksRequest());

    const response: AxiosResponse<Task[]> = yield call(fetchTasksAPI);

    yield put(TaskActions.fetchTasksSuccess({ tasks: response.data }));
  } catch (error) {
    yield put(TaskActions.fetchTasksFailure({ error: String(error) }));
  }
}

// Implementation for completeAllTasksRequestSaga
function* completeAllTasksRequestSaga(): Generator<Effect, void, any> {
  try {
    // Assuming there is an endpoint to mark all tasks as complete
    yield call(() => axios.post('/api/tasks/complete-all'));

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
    // Implement the logic to handle the completeAllTasksSuccess action

    // For example, you might want to perform some post-success actions
    // or update the state based on the success of completing all tasks
    yield put({
      type: "COMPLETE_ALL_TASKS_SUCCESS_ACTION_TYPE", // Replace with your actual action type
    });

    // For now, let's just log the success
    console.log("Complete All Tasks Success");
  } catch (error) {
    // Handle errors if necessary
    console.error("Error in completeAllTasksSuccessSaga:", error);
  }
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

    






export const taskSagas = [
  takeLatest(TaskActions.add.type, addTaskSaga),
  takeLatest(TaskActions.remove.type, removeTaskSaga),
  takeLatest(TaskActions.toggle.type, toggleTaskSaga),
  takeLatest(TaskActions.updateTask.type, updateTaskSaga),
  takeLatest(TaskActions.updateTaskSuccess.type, updateTaskSuccessSaga),
  takeLatest(TaskActions.updateTasksSuccess.type, updateTasksSuccessSaga),
  takeLatest(TaskActions.fetchTasksRequest.type, fetchTaskSaga), 
  takeLatest(TaskActions.fetchTasksRequest.type, fetchTasksRequestSaga),
  takeLatest(TaskActions.fetchTasksSuccess.type, fetchTasksSuccessSaga),
  takeLatest(TaskActions.fetchTasksFailure.type, fetchTasksFailureSaga),
  takeLatest(TaskActions.completeAllTasksSuccess.type, completeAllTasksSuccessSaga),
  takeLatest(TaskActions.completeAllTasksRequest.type, completeAllTasksRequestSaga),
  takeLatest(TaskActions.completeAllTasksFailure.type, completeAllTasksFailureSaga),
];  



