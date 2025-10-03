// containerMethods.ts

import { SnapshotData, SnapshotContainer } from "..";
import { Category } from "@/app/data_analysis/frontend/buddease/src/app/components/libraries/categories/generateCategoryProperties";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from "@/app/data_analysis/frontend/buddease/src/app/configs/BaseConfig";
import { CategoryProperties } from "@/app/data_analysis/frontend/buddease/src/app/pages/personas/ScenarioBuilder";
import { CriteriaType } from "@/app/data_analysis/frontend/buddease/src/app/pages/searchs/CriteriaType";
import SnapshotStore from "@/app/snapshotstore";

// src/methods/containerMethods.ts
export const ContainerMethodsImplementation = {
  getSnapshotContainer: function<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    criteria?: CriteriaType,
    category?: Category,
    categoryProperties?: CategoryProperties,
    delegate?: any,
    snapshotData?: SnapshotData<T, K, Meta, ExcludedFields>
  ): SnapshotContainer<T, K, Meta, ExcludedFields> | undefined {
    return this.snapshotContainers?.get(snapshotId);
  },
  
  setSnapshotContainer: function<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>
  >(
    this: SnapshotStore<T, K, Meta, ExcludedFields>,
    container: SnapshotContainer<T, K, Meta, ExcludedFields>,
    snapshotId?: string
  ): void {
    const containerId = snapshotId || container.id;
    if (!this.snapshotContainers) {
      this.snapshotContainers = new Map();
    }
    this.snapshotContainers.set(containerId, container);
  },
  
  // ... other container methods ...
};

// Then merge in your main implementation file
export const SnapshotMethodsImplementation = {
  ...ExistingSnapshotMethods,
  ...ContainerMethodsImplementation
};