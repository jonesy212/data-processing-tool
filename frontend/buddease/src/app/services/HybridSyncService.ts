// HybridSyncService.ts
class HybridSyncService {
  constructor(
    private sqlRepo: SqlRepository,
    private pouchRepo: PouchRepository
  ) {}

  async save(entity: DomainObject) {
    await this.pouchRepo.save(entity); // always write local

    if (navigator.onLine) {
      await this.sqlRepo.save(entity);
      await this.pouchRepo.markSynced(entity.id);
    } else {
      await this.pouchRepo.queueForSync(entity);
    }
  }
}


async syncPending() {
  const queued = await this.pouchRepo.getQueuedChanges();

  for (const change of queued) {
    await this.sqlRepo.save(change);
    await this.pouchRepo.markSynced(change.id);
  }
}
