import { Snapshot } from "@/app/snapshots";
import { DataStoreWithSnapshotMethods } from "@/app/projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";
import { subscribeToSnapshot, subscribeToSnapshots } from "./snapshotHandlers";
import { SnapshotStoreOptions } from "./SnapshotStoreOptions";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/data_analysis/frontend/buddease/src/app/configs/BaseConfig";

class SnapshotManagerOptions<T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  private options: SnapshotStoreOptions<T, K, Meta, ExcludedFields> | undefined;

  constructor(initialOptions: Partial<SnapshotStoreOptions<T, K, Meta, ExcludedFields>> = {}) {
      this.options = {
          data: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
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
          dataStoreMethods: {} as DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields>,
          getDelegate: [],
          getDataStoreMethods: function (): DataStoreWithSnapshotMethods<T, K, Meta, ExcludedFields> {
              throw new Error("Function not implemented.");
          },
          snapshotMethods: [],
          eventRecords: null,
          ...initialOptions, // Overwrite defaults with provided options
      } as SnapshotStoreOptions<T, K, Meta, ExcludedFields>;
  }

  get(): SnapshotStoreOptions<T, K, Meta, ExcludedFields> {
      if (this.options === undefined) {
          throw new Error("Options have not been initialized");
      }
      return this.options;
  }

  set(options: Partial<SnapshotStoreOptions<T, K, Meta, ExcludedFields>>) {
      if (this.options) {
          this.options = { ...this.options, ...options } as SnapshotStoreOptions<T, K, Meta, ExcludedFields>;
      } else {
          throw new Error("Options have not been initialized");
      }
  }
}


export default SnapshotManagerOptions;