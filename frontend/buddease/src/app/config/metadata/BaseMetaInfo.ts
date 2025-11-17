// BaseMetaInfo.ts
import { AppVersion } from '@/app/versions/AppVersion';

export interface BaseMetaInfo {
  createdAt?: string | Date;
  updatedAt?: string | Date;
  authorId?: string;
  version?: number | string | AppVersion | null;

  // any extra generic payload you want stored without forcing TS expansion
  [key: string]: any;
}