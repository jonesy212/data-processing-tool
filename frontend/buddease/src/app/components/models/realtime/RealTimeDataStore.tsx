import { DefaultMeta, DefaultExcludedFields } from "@/app/configs/BaseConfig";
import { BaseDataEntity } from "../../snapshots/ValidationRule";
import { RealtimeData } from "./RealtimeData";
import { AppEntity, AppK, AppMeta, AppExcludedFields } from "./snapshotStoreConfigInstance";


// Use these defaults for the generic
type AppRealtimeData = RealtimeData<
  AppEntity,       // T
  AppK,            // K
  AppMeta,         // Meta
  AppExcludedFields // ExcludedFields
>;


// RealTimeDataStore.ts
interface RealTimeDataStore {
  realTimeDataList: AppRealtimeData[];
  currentRealTimeDataId: string;

  addRealTimeData(data: AppRealtimeData): void;
  removeRealTimeData(dataId: string): void;
  setCurrentRealTimeData(dataId: string): void;
}

class RealTimeDataStoreClass implements RealTimeDataStore {
  realTimeDataList: AppRealtimeData[] = [];
  currentRealTimeDataId: string = "";

  addRealTimeData(data: AppRealtimeData): void {
    this.realTimeDataList.push(data);
  }

  removeRealTimeData(dataId: string): void {
    this.realTimeDataList = this.realTimeDataList.filter(
      (data) => data.id !== dataId
    );
  }

  setCurrentRealTimeData(dataId: string): void {
    this.currentRealTimeDataId = dataId;
  }
}

const useRealTimeDataStore = (): RealTimeDataStore => {
  return new RealTimeDataStoreClass();
};

export {
  useRealTimeDataStore, RealTimeDataStoreClass,
};

export type { RealTimeDataStore }