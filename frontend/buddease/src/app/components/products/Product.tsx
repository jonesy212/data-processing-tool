// Product.tsx
import { CommonData, UserData, VisualizationData } from "../models/User";

interface Product extends UserData {
  // Add specific properties for the product
  brainstormingDetails: CommonData<VisualizationData[]>;
  launchDetails: CommonData<VisualizationData[]>;
}

export type { Product };
