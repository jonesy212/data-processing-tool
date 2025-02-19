// todoSagas.ts
import axios, { AxiosResponse } from "axios";
import { Effect, call, put, select, takeLatest } from "redux-saga/effects";

import NOTIFICATION_MESSAGES from "../../../support/NotificationMessages";
import { Todo } from "../../../todos/Todo";
import { TodoActions } from "../../../todos/TodoActions";

// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchTodosAPI = () => axios.get("/api/todos");

function* addTodoSaga(
  action: ReturnType<typeof TodoActions.addTodo>
): Generator<Effect, void, any> {
  try {
    const { payload: newTodo } = action;

    const response: AxiosResponse<Todo> = yield call(() =>
      axios.post("/api/todos", newTodo, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    yield put(TodoActions.updateTodosSuccess({ todos: [response.data] }));
  } catch (error) {
    yield put(
      TodoActions.updateTodoFailure({
        error: NOTIFICATION_MESSAGES.Todos.TODO_ADD_ERROR,
      })
    );
  }
}

function* fetchTodoSaga(): Generator<Effect, void, any> {
  try {
    yield put(TodoActions.fetchTodosRequest());
    const response: AxiosResponse<Todo[]> = yield call(fetchTodosAPI);
    yield put(TodoActions.fetchTodosSuccess({ todos: response.data }));
  } catch (error) {
    yield put(
      TodoActions.fetchTodosFailure({
        error: NOTIFICATION_MESSAGES.Todos.TODO_FETCH_ERROR,
      })
    );
  }
}

function* removeTodoSaga(
  action: ReturnType<typeof TodoActions.remove>
): Generator<Effect, void, any> {
  try {
    const { id } = action.payload as unknown as { id: number };

    yield call(() => axios.delete(`/api/todos/${id}`));

    yield put(
      TodoActions.updateTodosSuccess({
        todos: yield select((state) =>
          state.todos.filter(
            (todo: Todo) => todo.id.toString() !== id.toString()
          )
        ),
      })
    );
  } catch (error) {
    yield put(
      TodoActions.updateTodoFailure({
        error: NOTIFICATION_MESSAGES.Todos.TODO_REMOVE_ERROR,
      })
    );
  }
}

function* updateTodoSuccessSaga(
  action: ReturnType<typeof TodoActions.updateTodoSuccess>
): Generator<Effect, void, any> {
  try {
    const { todo } = action.payload;
    yield put(TodoActions.updateTodosSuccess({ todos: [todo] }));
  } catch (error) {
    yield put(
      TodoActions.updateTodoFailure({
        error: NOTIFICATION_MESSAGES.Todos.TODO_UPDATE_ERROR,
      })
    );
  }
}

function* completeAllTodosSaga(): Generator<Effect, void, any> {
  try {
    // Assuming there is an endpoint to mark all todos as complete
    yield call(() => axios.post("/api/todos/complete-all"));

    yield put(TodoActions.completeAllTodosSuccess());
  } catch (error) {
    yield put(
      TodoActions.completeAllTodosFailure({
        error: NOTIFICATION_MESSAGES.Todos.COMPLETE_ALL_TODOS_ERROR,
      })
    );
  }
}

function* toggleTodoSaga(
  action: ReturnType<typeof TodoActions.toggle>
): Generator<Effect, void, any> {
  try {
    const { payload: todoId } = action;

    const todos = yield select((state) => state.todos);
    const todo = todos.find((t: any) => t.id === todoId);

    if (todo) {
      todo.completed = !todo.completed;

      yield call(() => axios.put(`/api/todos/${todoId}`, todo));

      yield put(TodoActions.updateTodosSuccess({ todos }));
    }
  } catch (error) {
    yield put(
      TodoActions.updateTodoFailure({
        error: NOTIFICATION_MESSAGES.Todos.TODO_TOGGLE_ERROR,
      })
    );
  }
}

function* updateTodoSaga(
  action: ReturnType<typeof TodoActions.updateTodo>
): Generator<Effect, void, any> {
  try {
    const { id, newTitle } = action.payload;

    const response: AxiosResponse<Todo> = yield call(() =>
      axios.put(
        `/api/todos/${id}`,
        { title: newTitle },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    yield put(TodoActions.updateTodosSuccess({ todos: [response.data] }));
  } catch (error) {
    yield put(
      TodoActions.updateTodoFailure({
        error: NOTIFICATION_MESSAGES.Todos.TODO_UPDATE_ERROR,
      })
    );
  }
}

function* batchAssignTodosSaga(
  action: ReturnType<typeof TodoActions.batchAssignTodos>
): Generator<Effect, void, any> {
  try {
    // Implementation for batchAssignTodos
    const { payload } = action;

    yield call(() => axios.post("/api/todos/batch-assign", payload));

    yield put(TodoActions.batchAssignSuccess(payload));
  } catch (error) {
    yield put(
      TodoActions.batchAssignFailure({
        error: NOTIFICATION_MESSAGES.Todos.BATCH_ASSIGN_ERROR,
      })
    );
  }
}
// Implementation for fetchTodosRequestSaga
function* fetchTodosRequestSaga(): Generator<Effect, void, any> {
  try {
    yield put(TodoActions.fetchTodosRequest());

    const response: AxiosResponse<Todo[]> = yield call(fetchTodosAPI);

    yield put(TodoActions.fetchTodosSuccess({ todos: response.data }));
  } catch (error) {
    yield put(TodoActions.fetchTodosFailure({ error: String(error) }));
  }
}

// Implementation for completeAllTodosRequestSaga
function* completeAllTodosRequestSaga(): Generator<Effect, void, any> {
  try {
    // Assuming there is an endpoint to mark all todos as complete
    yield call(() => axios.post("/api/todos/complete-all"));

    yield put(TodoActions.completeAllTodosSuccess());
  } catch (error) {
    yield put(TodoActions.completeAllTodosFailure({ error: String(error) }));
  }
}

// Implementation for fetchTodosSuccessSaga
function* fetchTodosSuccessSaga(
  action: ReturnType<typeof TodoActions.fetchTodosSuccess>
): Generator<Effect, void, any> {
  try {
    // Implement the logic to handle the fetchTodosSuccess action
    const { todos } = action.payload;

    // For example, you might want to update the state with the fetched todos
    yield put({
      type: "UPDATE_TASKS_ACTION_TYPE", // Replace with your actual action type for updating todos
      payload: { todos },
    });

    // For now, let's just log the success
    console.log("Fetch Todos Success:", todos);
  } catch (error) {
    // Handle errors if necessary
    console.error("Error in fetchTodosSuccessSaga:", error);
  }
}

function* completeAllTodosSuccessSaga(): Generator<Effect, void, any> {
  try {
    // Implement the logic to handle the completeAllTodosSuccess action

    // For example, you might want to perform some post-success actions
    // or update the state based on the success of completing all todos
    yield put({
      type: "COMPLETE_ALL_TASKS_SUCCESS_ACTION_TYPE", // Replace with your actual action type
    });

    // For now, let's just log the success
    console.log("Complete All Todos Success");
  } catch (error) {
    // Handle errors if necessary
    console.error("Error in completeAllTodosSuccessSaga:", error);
  }
}

// Implementation for updateTodosSuccessSaga
function* updateTodosSuccessSaga(
  action: ReturnType<typeof TodoActions.updateTodosSuccess>
): Generator<Effect, void, any> {
  try {
    // Implement the logic to handle the updateTodosSuccess action
    const { todos } = action.payload;
    // For example, you might want to update the state with the updated todos
    yield put({
      type: "UPDATE_TASKS_ACTION_TYPE",
      payload: { todos },
    });
    // Additional logic can be added here if needed
  } catch (error) {
    // Handle errors if necessary
  }
}

// Implementation for fetchTodosFailureSaga
function* fetchTodosFailureSaga(
  action: ReturnType<typeof TodoActions.fetchTodosFailure>
): Generator<Effect, void, any> {
  try {
    // Handle the fetchTodosFailure action
    const { error } = action.payload;
    // Additional error handling logic can be added here if needed
  } catch (error) {
    // Handle errors if necessary
  }
}

// Implementation for completeAllTodosFailureSaga
function* completeAllTodosFailureSaga(
  action: ReturnType<typeof TodoActions.completeAllTodosFailure>
): Generator<Effect, void, any> {
  try {
    // You can handle the failure action as needed
    const { error } = action.payload;

    // For example, you might want to show a notification to the user
    yield put({
      type: "SHOW_NOTIFICATION_ACTION_TYPE", // Replace with your actual action type for showing notifications
      payload: {
        message: `Failed to complete all todos: ${error}`,
        type: "error",
      },
    });

    // For now, let's just log the error
    console.error("Complete All Todos Failure:", error);
  } catch (error) {
    // Handle errors if necessary
    console.error("Error in completeAllTodosFailureSaga:", error);
  }
}


export function* watchTodoSagas() {
  yield takeLatest(TodoActions.addTodo.type, addTodoSaga),
  yield takeLatest(TodoActions.remove.type, removeTodoSaga),
  yield takeLatest(TodoActions.toggle.type, toggleTodoSaga),
  yield takeLatest(TodoActions.updateTodo.type, updateTodoSaga),
  
  yield takeLatest(TodoActions.updateTodoSuccess.type, updateTodoSuccessSaga),
  yield takeLatest(TodoActions.updateTodosSuccess.type, updateTodosSuccessSaga),
  yield takeLatest(TodoActions.fetchTodosRequest.type, fetchTodoSaga),
  yield takeLatest(TodoActions.fetchTodosRequest.type, fetchTodosRequestSaga),
  yield takeLatest(TodoActions.fetchTodosSuccess.type, fetchTodosSuccessSaga),
  yield takeLatest(TodoActions.fetchTodosFailure.type, fetchTodosFailureSaga),
  yield takeLatest(
    TodoActions.completeAllTodosSuccess.type,
    completeAllTodosSuccessSaga
  ),
  yield takeLatest(
    TodoActions.completeAllTodosRequest.type,
    completeAllTodosRequestSaga
  ),
  yield takeLatest(
    TodoActions.completeAllTodosFailure.type,
    completeAllTodosFailureSaga
  ),
  yield takeLatest(TodoActions.completeAllTodosSuccess.type, completeAllTodosSaga),
  yield takeLatest(TodoActions.batchAssignTodos.type, batchAssignTodosSaga)

}

export function* todoSagas(){
  yield watchTodoSagas()
}