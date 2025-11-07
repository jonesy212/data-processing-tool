interface CacheDataRepository extends Repository<CacheData> {
  updatePhaseHook(phase: keyof CacheData, value: any): Promise<void>;
  syncRealtimeData(data: RealtimeData): Promise<void>;
}