import { create } from "mobx-persist";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import BrowserCheck from "../../BrowserCheck";
import BrowserCheckStore from "./BrowserCheckStore";
import { IconStore } from "./IconStore";
import { RootStores } from "./RootStores";
import generateStoreKey from "./StoreKeyGenerator";
import useTodoManagerStore from "./TodoStore";
import TrackerStore from "./TrackerStore";
export const RootStoreComponent = observer(() => {
  const [rootStore, setRootStore] = useState<RootStores | null>(null);

  useEffect(() => {
    const newRootStore = new RootStores() as RootStores;

    // Use generateStoreKey to create a unique key for BrowserCheckStore
    const browserCheckStoreKey = generateStoreKey("browserCheckStore");

    // Initialize BrowserCheckStore with the generated key
    const browserCheckStoreInstance = new BrowserCheckStore(newRootStore);
    browserCheckStoreInstance.init(browserCheckStoreKey);

    // Assign the instance to newRootStore.browserCheckStore
    newRootStore.browserCheckStore = browserCheckStoreInstance;

    newRootStore.trackerStore = TrackerStore(newRootStore);

    newRootStore.iconStore = IconStore;

    newRootStore.todoStore = useTodoManagerStore();

    setRootStore(newRootStore);

    // Additional setup logic here

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
