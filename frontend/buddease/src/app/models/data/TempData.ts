import { BaseDataEntity, BaseDataRoot, DefaultMeta, DefaultExcludedFields } from '@/config/BaseConfig';

// Define types for `DebugInfo` and `TempData` to provide structure
type DebugInfo = {
  message: string; // Simple debug message
  timestamp: string; // When the debug info was created
  operation?: string; // Optional property indicating which operation triggered the debug info
  additionalData?: any; // Optional, allows for more specific debugging information
};


type TempData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<U>
  
> = {
  tempResults?: T[]; // Array of temporary results, type based on the snapshot data
  temporaryValues?: K; // Temporary values that could be used for intermediate calculations
  cacheTime?: Date; // Time at which this temporary data was stored
  valueA?: T;
  valueB?: K;
  metadata?: Meta; // Use the Meta type instead of string
  excludedFields?: ExcludedFields[]; // Array of excluded fields
  // Additional temporary data properties
  isValid?: boolean;
  expiration?: Date;
  tags?: string[];
  version?: string;
  source?: string;
};


export type { DebugInfo, TempData };
