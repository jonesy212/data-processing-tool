// BaseMetaInfo.ts

export interface BaseMetaInfo {
  createdAt?: string;
  updatedAt?: string;
  authorId?: string;
  version?: number | string;
  // any extra generic payload you want stored without forcing TS expansion
  [key: string]: any;
}