// FeatureStructure.ts
import { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import FeatureStore from "@/core/state/stores/FeatureStore";


interface FeatureStructure {
  componentName: string;
  category: keyof CategoryProperties;
  properties: string[];
  validationRules?: string[];
  featureStore: FeatureStore; // Include FeatureStore instance
}


export default FeatureStructure