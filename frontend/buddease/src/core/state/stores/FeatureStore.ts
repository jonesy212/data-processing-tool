// FeatureStore.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import type { Attachment } from "@/core/documents/attachment/Attachment";
import { makeAutoObservable } from "mobx";

export interface Feature
  extends BaseDataEntity {
  id: string;
  name: string;
  description: string;
}

export class FeatureStore<
  T extends BaseDataEntity = Feature,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  features: T[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addFeature(feature: T): void {
    this.features.push(feature);
  }

  removeFeature(featureId: string): void {
    this.features = this.features.filter((f) => f.id !== featureId);
  }

  setCurrentFeature(featureId: string): void {
    const selectedFeature = this.features.find((f) => f.id === featureId);
    if (selectedFeature) {
      console.log(`Current feature set to: ${selectedFeature.id}`);
    } else {
      console.error(`Feature with ID ${featureId} not found.`);
    }
  }
}

export const featureStore = new FeatureStore();
export default FeatureStore;
