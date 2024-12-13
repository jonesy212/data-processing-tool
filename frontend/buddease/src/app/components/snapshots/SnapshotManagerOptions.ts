import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { DataStoreWithSnapshotMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { Snapshot } from "./LocalStorageSnapshotStore";
import { subscribeToSnapshot, subscribeToSnapshots } from "./snapshotHandlers";
import { SnapshotStoreOptions } from "./SnapshotStoreOptions";

class SnapshotManagerOptions<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  private options: SnapshotStoreOptions<T, K> | undefined;

  constructor(initialOptions: Partial<SnapshotStoreOptions<T, K>> = {}) {
      this.options = {
          data: new Map<string, Snapshot<T, K>>(),
          initialState: null,
          snapshotId: "",
          category: {
              name: "initial-category",
              description: "",
              icon: "",
              color: "",
              iconColor: "",
              isActive: false,
              isPublic: false,
              isSystem: false,
              isDefault: false,
              isHidden: false,
              isHiddenInList: false,
              UserInterface: [],
              DataVisualization: [],
              Forms: undefined,
              Analysis: [],
              Communication: [],
              TaskManagement: [],
              Crypto: [],
              brandName: "",
              brandLogo: "",
              brandColor: "",
              brandMessage: "",
          },
          date: new Date(),
          type: "initial-type",
          snapshotConfig: [],
          subscribeToSnapshots: subscribeToSnapshots,
          subscribeToSnapshot: subscribeToSnapshot,
          delegate: [],
          dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K>,
          getDelegate: [],
          getDataStoreMethods: function (): DataStoreWithSnapshotMethods<T, K> {
              throw new Error("Function not implemented.");
          },
          snapshotMethods: [],
          eventRecords: null,
          ...initialOptions, // Overwrite defaults with provided options
      } as SnapshotStoreOptions<T, K>;
  }

  get(): SnapshotStoreOptions<T, K> {
      if (this.options === undefined) {
          throw new Error("Options have not been initialized");
      }
      return this.options;
  }

  set(options: Partial<SnapshotStoreOptions<T, K>>) {
      if (this.options) {
          this.options = { ...this.options, ...options } as SnapshotStoreOptions<T, K>;
      } else {
          throw new Error("Options have not been initialized");
      }
  }
}


export default SnapshotManagerOptions;