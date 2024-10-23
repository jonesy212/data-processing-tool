// Example MobX Store for a Feature
import { makeAutoObservable } from "mobx";

class FeatureStore {
  // Define observable properties
  featureData: any = null; // Assuming featureData can be of any type

  constructor() {
    makeAutoObservable(this);
  }


  addFeature(featureName: string, featureDescription: string) {
    this.featureData = {
      name: featureName,
      description: featureDescription
    }
  }

  removeFeature(featureId: string) { 
    this.featureData = null;
  }

  setCurrentFeature(featureId: string) {
    this.featureData = this.featureData.find(
      (feature: any) => feature.id === featureId
    );
  }

  // Define actions to modify state
  updateFeatureData(newData: any) {
    this.featureData = newData;
  }

  // Method to clear feature data
  clearFeatureData() {
    this.featureData = null;
  }

  // Method to check if feature data is available
  hasFeatureData() {
    return this.featureData !== null;
  }

  // Method to get feature data
  getFeatureData() {
    return this.featureData;
  }

  // Method to perform some operation with feature data
  performFeatureOperation(operation: (data: any) => any) {
    // Example: Perform some operation with feature data
    const result = operation(this.featureData);
    // Example: Update feature data based on operation result
    this.updateFeatureData(result);
  }
}

// Export instance of FeatureStore
const featureStore = new FeatureStore();
export default featureStore;
