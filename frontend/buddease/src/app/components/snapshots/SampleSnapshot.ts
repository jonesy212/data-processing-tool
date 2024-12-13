import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { BaseData } from '../data/Data';
import { CombinedEvents } from "../hooks/useSnapshotManager";
import { Snapshot } from "./LocalStorageSnapshotStore";

// Define SampleSnapshot implementing Snapshot<T, K>
class SampleSnapshot <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>
  implements Snapshot<T, K> {
  id: string;
  data: Map<string, Snapshot<T, K>>;
  meta: Map<string, Snapshot<T, K>>;
  events: CombinedEvents<T, K>;

  constructor(
    id: string,
    data: Map<string, Snapshot<T, K>>,
    meta: Map<string, Snapshot<T, K>>,
    events?: CombinedEvents<T, K>
  ) {
    this.id = id;
    this.data = data;
    this.meta = meta;
    this.events = {
      callbacks: events?.callbacks ?? ((snapshot: Snapshot<T, K>) => {
        console.log("callback called");
        return { snapshots: [snapshot] };
      }),
    };
  }

  // Example implementation of setData
  setData(newData: Map<string, Snapshot<T, K>>): void {
    this.data = newData;
  }
}
