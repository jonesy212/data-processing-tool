// FeatureStore.ts
import { makeAutoObservable } from "mobx";
import { Data } from "../../models/data/Data";

// Define the interface for a feature
interface Feature extends Data{
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
    const selectedFeature = this.features.find(feature => feature.id === featureId);
    if (selectedFeature) {
      // Perform any actions related to setting the current feature
      // For example, you might update some state or trigger some events
      console.log(`Current feature set to: ${selectedFeature.name}`);
    } else {
      console.error(`Feature with ID ${featureId} not found.`);
    }
  }
}

const featureStore = new FeatureStore();
export default FeatureStore; featureStore;
export type { Feature };
