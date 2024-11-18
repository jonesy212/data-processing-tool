
// Define types for `DebugInfo` and `TempData` to provide structure
type DebugInfo = {
  message: string; // Simple debug message
  timestamp: string; // When the debug info was created
  operation?: string; // Optional property indicating which operation triggered the debug info
  additionalData?: any; // Optional, allows for more specific debugging information
};

type TempData<T, K> = {
  tempResults?: T[]; // Array of temporary results, type based on the snapshot data
  temporaryValues?: K; // Temporary values that could be used for intermediate calculations
  cacheTime?: Date; // Time at which this temporary data was stored
  valueA?: T;
  valueB?: K;
  metadata?: string;

};


export type { DebugInfo, TempData };
