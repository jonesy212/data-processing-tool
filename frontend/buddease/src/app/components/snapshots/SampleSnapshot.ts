import { CombinedEvents } from "../hooks/useSnapshotManager";
import { Snapshot } from "./LocalStorageSnapshotStore";

// Define SampleSnapshot implementing Snapshot<T, Meta, K>
class SampleSnapshot <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>
  implements Snapshot<T, Meta, K> {
  id: string;
  data: Map<string, Snapshot<T, Meta, K>>;
  meta: Map<string, Snapshot<T, Meta, K>>;
  events: CombinedEvents<T, Meta, K>;

  constructor(
    id: string,
    data: Map<string, Snapshot<T, Meta, K>>,
    meta: Map<string, Snapshot<T, Meta, K>>,
    events?: CombinedEvents<T, Meta, K>
  ) {
    this.id = id;
    this.data = data;
    this.meta = meta;
    this.events = {
      callbacks: events?.callbacks ?? ((snapshot: Snapshot<T, Meta, K>) => {
        console.log("callback called");
        return { snapshots: [snapshot] };
      }),
    };
  }

  // Example implementation of setData
  setData(newData: Map<string, Snapshot<T, Meta, K>>): void {
    this.data = newData;
  }
}
