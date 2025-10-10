// CacheResponse.ts
type CacheReadOptions<T extends  BaseData<any>> = {
  filePath: string;
  apiKey: string;
  token: string;
  currentEvent: EventAttendance | null;
};

// Define the structure of the response data
interface CacheResponse<
  T extends  BaseData<any>,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, // Metadata type
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  id?: string | number | undefined;
  data: SupportedData<T, K, Meta>;
}


export type { CacheReadOptions, CacheResponse }