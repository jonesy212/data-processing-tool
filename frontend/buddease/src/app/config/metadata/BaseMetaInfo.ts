// BaseMetaInfo.ts

export interface BaseMetaInfo {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  authorId?: string;
  version?: number | string;
  // any extra generic payload you want stored without forcing TS expansion
  [key: string]: any;
}