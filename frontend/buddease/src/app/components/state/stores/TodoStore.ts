// TodoManagerStore.ts
import { makeAutoObservable } from 'mobx';
import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import NOTIFICATION_MESSAGES from '../../support/NotificationMessages';
import { Todo } from '../../todos/Todo';
import SnapshotStore from './SnapshotStore';
export interface TodoManagerStore {
  todos: Record<string, Todo>;
  toggleTodo: (id: string) => void;
  addTodo: (todo: Todo) => void;
  addTodos: (newTodos: Todo[], data: {}) => void;
  removeTodo: (id: string) => void;
  updateTodoTitle: (payload: { id: string; newTitle: string }) => void;
  fetchTodosSuccess: (payload: { todos: Todo[] }) => void;
  fetchTodosFailure: (payload: { error: string }) => void; // Add this
  fetchTodosRequest: () => void; // Add this
  completeAllTodosSuccess: () => void; // Add this
  completeAllTodos: () => void; // Add this
  completeAllTodosFailure: (payload: { error: string }) => void; 
  NOTIFICATION_MESSAGE: string; 
  NOTIFICATION_MESSAGES: typeof NOTIFICATION_MESSAGES,
  setDynamicNotificationMessage: (message: string) => void; // Add this property
  
  snapshot: Record<string, Todo[]>;
  snapshotStore: SnapshotStore<Record<string, Todo[]>>;
  updateSnapshot: (snapshot: Record<string, Todo[]>) => void;
  initSnapshot: () => void;
  fetchSnapshot: SnapshotStore<Record<string, Todo[]>>;
  
}


const useTodoManagerStore = (): TodoManagerStore => {
  const [todos, setTodos] = useState<Record<string, Todo>>({});
  const [NOTIFICATION_MESSAGE, setNotificationMessage] = useState<string>(''); // Initialize it with an empty string
  // Initialize SnapshotStore
  
  interface SnapshotStoreConfig<T> {
    key: string;
    initialState: T;
    onSnapshot?: (snapshot: T) => void;
    snapshot?: () => void;
    initSnapShot: () => void;
    updateSnapshot: (snapshot: T) => void;
    snapshots: () => Record<string, T>;
    getSnapshots: () => Record<string, Record<string, Todo[]>>;
  }

  class SnapshotStore<T> {
    key: string;
    state: T;
    onSnapshot?: (snapshot: T) => void;
    snapshot?: () => void;
    // initSnapShot?: () => void;
    // updateSnapshot?: (snapshot: Record<string, Todo[]>) => void;
    
    constructor(config: SnapshotStoreConfig<T>) {
      this.key = config.key;
      this.state = config.initialState;
      this.onSnapshot = config.onSnapshot;
      this.snapshot = config.snapshot
      // this.initSnapShot = config.initSnapShot
      // this.updateSnapshot = config.updateSnapshot
    }

    takeSnapshot() {
      if (this.onSnapshot) {
        this.onSnapshot(this.state);
      }
    }
    updateSnapshot() {
      if (this.onSnapshot) {
        // get current snapshot from database
        const currentSnapshot = snapshotStore(this.key);
        // update snapshot state
        this.state = currentSnapshot;
        // call init snapshot to trigger snapshot
        snapshotStore.initSnapShot(this.state);
        // update snapshot store state
        this.onSnapshot(this.state);
      }
    }
    initSnapShot(snapshot: Record<string, Todo[]>) { 
      snapshotStore.state = snapshot;
    }
  }

  const {state: authState }= useAuth();
const snapshotStore = new SnapshotStore<Record<string, Todo[]>>({
  key: "todos",
  initialState: {},
  onSnapshot: (snapshot) => {
    console.log("Snapshot taken!", snapshot);
  },
  snapshot: () => {
    console.log("Snapshot taken!");
    const snapshotValues = Object.values(todos);
    const snapshotRecord: Record<string, Todo[]> = {};
    snapshotValues.forEach((value) => {
      snapshotRecord[value.id] = [value];
    });
    snapshotStore.state = snapshotRecord;
  },
  initSnapShot: () => {
    snapshotStore.takeSnapshot();
  },
  updateSnapshot: (snapshot: Record<string, Todo[]>) => {
    snapshotStore.state = snapshot;
    if (snapshotStore.onSnapshot) {
      snapshotStore.takeSnapshot();
    }
  },
  snapshots: () => {
    return snapshotStore.getSnapshots(); 
  },
  getSnapshot: (id: string) => {
    return snapshotStore.state[id];
  },
  getSnapshots: (snapshots: Record<string, Todo[]>) => {

    },


  clearSnapshots: () => {
    snapshotStore.state = {};
  }
});






  const toggleTodo = (id: string) => {
    setTodos((prevTodos) => {
      const todo = prevTodos[id];
      if (todo) {
        todo.done = !todo.done;
      }
      return { ...prevTodos, [id]: todo };
    });
  };

  const addTodo = (todo: Todo) => {
    setTodos((prevTodos) => ({ ...prevTodos, [todo.id]: todo }));
  };



  const addTodos = (newTodos: Todo[]) => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      newTodos.forEach((todo) => {
        updatedTodos[todo.id] = todo;
      });
  
      // Take the snapshot before updating the state
      if (snapshotStore.onSnapshot) {
        snapshotStore.takeSnapshot();
      }
  
      // Update the state with the new todos
      return updatedTodos;
    });
  };
  

  



  const removeTodo = (id: string) => {
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      delete updatedTodos[id];
      return updatedTodos;
    });
  };

  const updateTodoTitle = (payload: { id: string; newTitle: string }) => {
    setTodos((prevTodos) => {
      const todo = prevTodos[payload.id];
      if (todo) {
        todo.title = payload.newTitle;
      }
      return { ...prevTodos, [payload.id]: todo };
    });
  };

  const fetchTodosSuccess = (payload: { todos: Todo[] }) => {
    const { todos: newTodos } = payload;
    setTodos((prevTodos) => {
      const updatedTodos = { ...prevTodos };
      newTodos.forEach((todo) => {
        updatedTodos[todo.id] = todo;
      });
      return updatedTodos;
    });
  };

  const completeAllTodosSuccess = () => {
    console.log("All Todos completed successfully!");
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.OperationSuccess.DEFAULT);
  };

  const completeAllTodos = () => {
    console.log("Completing all Todos...");
    // You can add loading indicators or other UI updates here

    // Simulate asynchronous completion
    setTimeout(() => {
      // Update todos to mark all as done
      setTodos((prevTodos) => {
        const updatedTodos: Record<string, Todo> = {};
        Object.keys(prevTodos).forEach((id) => {
          updatedTodos[id] = { ...prevTodos[id], done: true };
        });
        return updatedTodos;
      });

      // Trigger success
      completeAllTodosSuccess();
    }, 1000);
  };


  const fetchTodosFailure = (payload: { error: string }) => {
    console.error("Fetch Todos Failure:", payload.error);
    // You can add additional logic or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.ERROR_FETCHING_DATA);
  };

  const fetchTodosRequest = () => {
    console.log("Fetching Todos...");
    // You can add loading indicators or other UI updates here
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.DataLoading.PAGE_LOADING);
  };

  const completeAllTodosFailure = (payload: { error: string }) => {
    console.error("Complete All Todos Failure:", payload.error);
    // You can add additional error handling or trigger notifications as needed
    setDynamicNotificationMessage(NOTIFICATION_MESSAGES.Error.PROCESSING_BATCH);
  };

  // Function to set a dynamic notification message
  const setDynamicNotificationMessage = (message: string) => {
    setNotificationMessage(message);
  };

  const initSnapShot = () => {
    snapshotStore.takeSnapshot();
  }

  const updateSnapshot = (snapshot: Record<string, Todo[]>) => { 
    snapshotStore.state = snapshot;
    snapshotStore.takeSnapshot();
  }




  makeAutoObservable({
    todos,
    toggleTodo,
    addTodo,
    addTodos,
    removeTodo,
    updateTodoTitle,
    fetchTodosSuccess,
    fetchTodosFailure,
    fetchTodosRequest,
    completeAllTodosSuccess,
    completeAllTodos,
    completeAllTodosFailure,
    NOTIFICATION_MESSAGE,
    NOTIFICATION_MESSAGES,
    setDynamicNotificationMessage,
    snapshotStore,
    updateSnapshot,
    initSnapShot,
    
  }, {
    setDynamicNotificationMessage: false, // Ensure this function is not considered as an action

  });

return {
  todos,
  toggleTodo,
  addTodo,
  addTodos,
  removeTodo,
  updateTodoTitle,
  fetchTodosSuccess,
  fetchTodosFailure,
  fetchTodosRequest,
  completeAllTodosSuccess,
  completeAllTodos,
  completeAllTodosFailure,
  NOTIFICATION_MESSAGE,
  NOTIFICATION_MESSAGES,
  setDynamicNotificationMessage,
  fetchSnapshot: snapshotStore.fetchSnapshot,
  initSnapshot: snapshotStore.initSnapshot,
  snapshot: snapshotStore.snapshots,
  snapshotStore: snapshotStore, 
  updateSnapshot: snapshotStore.updateSnapshot,
};

};

export default useTodoManagerStore;