import { create } from "mobx-persist";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import BrowserCheck from "../../BrowserCheck";
import BrowserCheckStore from "./BrowserCheckStore";
import { RootStores } from "./RootStores";
import generateStoreKey from "./StoreKeyGenerator";
import useTodoManagerStore from "./TodoStore";
import TrackerStore from "./TrackerStore";
import useIconStore from "./IconStore";
export const RootStoreComponent = observer(() => {
  const [rootStore, setRootStore] = useState<RootStores | null>(null);

  useEffect(() => {
    const newRootStore = new RootStores() as RootStores;
    
    const dispatch = (action: any, state: any) => {
      newRootStore.browsers.setState(state);
    };

    // Use generateStoreKey to create a unique key for BrowserCheckStore
    const browserCheckStoreKey = generateStoreKey("browserCheckStore");

    // Initialize BrowserCheckStore with the generated key
    const browserCheckStoreInstance = new BrowserCheckStore(
      newRootStore,
      dispatch
    );
    browserCheckStoreInstance.init(browserCheckStoreKey);

    // Assign the instance to newRootStore.browserCheckStore
    newRootStore.browserCheckStore = browserCheckStoreInstance;

    newRootStore.trackerStore = TrackerStore(newRootStore);

    newRootStore.iconStore = useIconStore(newRootStore);

    newRootStore.todoStore = useTodoManagerStore();

    // newRootStore.undoRedoStore = useUnd
    setRootStore(newRootStore);

    // Additional setup logic here
    // Test dispatching an action
    const testAction = { type: "TEST_ACTION", payload: "Test payload" };
    browserCheckStoreInstance.testDispatch(testAction);

    // Hydrate the store
    const hydrate = create();
    hydrate("rootStore", newRootStore)
      .then(() => {
        // After hydration is complete, you can perform any additional setup here
      })
      .catch((error: any) => {
        console.error("Error hydrating store:", error);
      });
  }, []);

  if (!rootStore) {
    return null;
  }

  return (
    <div>
      {/* Render your component using rootStore */}
      <BrowserCheck browsers={["Chrome", "Firefox", "Safari"]} />
    </div>
  );
});
