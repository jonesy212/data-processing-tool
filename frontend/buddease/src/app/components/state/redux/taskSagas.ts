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
    yield put(TaskActions.fetchTasksFailure(error as any));
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

    

export const taskSagas = [
  takeLatest(TaskActions.add.type, addTaskSaga),
  takeLatest(TaskActions.remove.type, removeTaskSaga),
  takeLatest(TaskActions.updateTaskSuccess.type, updateTaskSuccessSaga),
  takeLatest(TaskActions.completeAllTasksRequest.type, completeAllTasksSaga),
  takeLatest(TaskActions.fetchTasksRequest.type, fetchTaskSaga),
];  



