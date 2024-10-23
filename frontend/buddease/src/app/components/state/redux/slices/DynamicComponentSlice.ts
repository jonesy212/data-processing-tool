// dynamicComponentSlice.ts
import { createEntitySlice } from "../SliceGenerator";

interface DynamicComponent {
  id: string;
  name: string;
  // Add other properties as needed
}

const dynamicComponentsSlice = createEntitySlice<DynamicComponent>('dynamicComponents');

export const { addEntity: addDynamicComponent, updateEntity: updateDynamicComponent, removeEntity: removeDynamicComponent } = dynamicComponentsSlice.actions;

export default dynamicComponentsSlice.reducer;
