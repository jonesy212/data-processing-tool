// FeatureStore.ts
import { makeAutoObservable } from "mobx";

// Define the interface for a feature
interface Feature {
  id: string;
  name: string;
  description: string;
}

class FeatureStore {
  features: Feature[] = []; // Array to store features

  constructor() {
    makeAutoObservable(this);
  }

  addFeature(name: string, description: string): void {
    const newFeature: Feature = {
      id: Date.now().toString(),
      name: name,
      description: description,
    };
    this.features.push(newFeature);
  }

  removeFeature(featureId: string): void {
    this.features = this.features.filter((feature) => feature.id !== featureId);
  }

  // Method to set the current feature (if needed)
  setCurrentFeature(featureId: string): void {
    // Implementation based on requirements
  }
}

const featureStore = new FeatureStore();
export default FeatureStore; featureStore;
