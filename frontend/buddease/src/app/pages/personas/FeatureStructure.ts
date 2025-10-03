import FeatureStore from "@/app/state/stores/FeatureStore";
import { CategoryProperties } from "./ScenarioBuilder";


// FeatureStructure.ts
interface FeatureStructure {
  componentName: string;
  category: keyof CategoryProperties;
  properties: string[];
  validationRules?: string[];
  featureStore: FeatureStore; // Include FeatureStore instance
}


export default FeatureStructure