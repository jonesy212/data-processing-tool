import { RealtimeData } from "./RealtimeData";

// RealTimeDataStore.ts
interface RealTimeDataStore {
  realTimeDataList: RealtimeData[];
  currentRealTimeDataId: string;

  addRealTimeData(data: RealtimeData): void;
  removeRealTimeData(dataId: string): void;
  setCurrentRealTimeData(dataId: string): void;
}

class RealTimeDataStoreClass implements RealTimeDataStore {
  realTimeDataList: RealtimeData[] = [];
  currentRealTimeDataId: string = "";

  addRealTimeData(data: RealtimeData): void {
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

export { useRealTimeDataStore, RealTimeDataStoreClass, RealTimeDataStore}