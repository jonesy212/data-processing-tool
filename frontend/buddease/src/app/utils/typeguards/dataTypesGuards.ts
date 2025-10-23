import { RealtimeDataItem } from "@/app/typings/realtimeTypes";

// dataTypeGuards.ts
function isRealtimeDataItemArray(data: any[]): data is RealtimeDataItem[] {
    return data.every((item) => 
      item && 
      typeof item.date === 'string' && 
      typeof item.userId === 'string' &&
      typeof item.dispatch === 'function' &&
      typeof item.name === 'string'
    );
  }


  export  { isRealtimeDataItemArray }