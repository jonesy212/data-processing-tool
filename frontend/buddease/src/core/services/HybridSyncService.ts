// HybridSyncService.ts
app/services/HybridSyncService.ts
import { IndexedDBRepository } from '@/core/repositories/IndexedDBRepository';
import { SqlRepository } from '@/core/repositories/SqlRepository';
import { call, put, select } from '@/core/state/redux/sagas/UndoRedoSaga';
import { DomainObject } from '@/core/typings/DomainObject';

export class HybridSyncService {
  private sqlRepo: SqlRepository;
  private indexedDBRepo: IndexedDBRepository;
  private reduxDispatch: Function;
  private syncInProgress = false;

  constructor(reduxDispatch: Function) {
    this.sqlRepo = new SqlRepository();
    this.indexedDBRepo = new IndexedDBRepository();
    this.reduxDispatch = reduxDispatch;
    
    // Setup online/offline listeners
    this.setupNetworkListeners();
  }

  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  async save(entity: DomainObject): Promise<DomainObject> {
    const enrichedEntity: DomainObject = {
      ...entity,
      version: entity.version || 1,
      createdAt: entity.createdAt || new Date(),
      updatedAt: new Date(),
      metadata: {
        ...entity.metadata,
        lastUpdated: new Date().toISOString(),
        synced: false
      }
    };

    // Save to IndexedDB (offline-first)
    await this.indexedDBRepo.save(enrichedEntity);

    // Queue for sync via Redux
    this.reduxDispatch({
      type: 'SYNC/ENTITY_QUEUED',
      payload: { 
        entity: enrichedEntity,
        timestamp: new Date().toISOString()
      }
    });

    return enrichedEntity;
  }

  // Redux Saga for sync
  static *syncEntitySaga(action: any) {
    try {
      const { entity } = action.payload;
      const service = new HybridSyncService(yield select());
      
      // Try to sync with PostgreSQL
      yield call([service.sqlRepo, 'save'], entity);
      
      // Mark as synced in IndexedDB
      yield call([service.indexedDBRepo, 'markSynced'], entity.id);
      
      // Dispatch success notification
      yield put({
        type: 'NOTIFICATIONS/SHOW',
        payload: { 
          id: Date.now().toString(),
          type: 'success',
          message: 'Changes synced successfully',
          autoHide: true
        }
      });
      
      // Update sync status in Redux store
      yield put({
        type: 'SYNC/UPDATE_STATUS',
        payload: { 
          entityId: entity.id,
          status: 'synced',
          syncedAt: new Date().toISOString()
        }
      });
      
    } catch (error: any) {
      // Handle sync failure
      yield put({
        type: 'SYNC/ENTITY_FAILED',
        payload: { 
          entity: action.payload.entity,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
      
      // Show error notification
      yield put({
        type: 'NOTIFICATIONS/SHOW',
        payload: { 
          id: Date.now().toString(),
          type: 'error',
          message: `Sync failed: ${error.message}`,
          autoHide: true
        }
      });
    }
  }
  // Saga for bulk sync (when coming online)
  static *bulkSyncSaga(): Generator<any, void, any> {
    try {
      const service = new HybridSyncService(yield select());
      const queuedChanges: DomainObject[] = yield call([service.indexedDBRepo, 'getQueuedChanges']);
      
      yield put({
        type: 'SYNC/BULK_SYNC_STARTED',
        payload: { count: queuedChanges.length }
      });
      
      for (const entity of queuedChanges) {
        yield put({
          type: 'SYNC/ENTITY_QUEUED',
          payload: { entity }
        });
      }
      
      yield put({
        type: 'SYNC/BULK_SYNC_COMPLETED',
        payload: { count: queuedChanges.length }
      });
      
    } catch (error: any) {
      yield put({
        type: 'SYNC/BULK_SYNC_FAILED',
        payload: { error: error.message }
      });
    }
  }
    
  async syncPending(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let success = 0;
    let failed = 0;

    try {
      const queued = await this.indexedDBRepo.getQueuedChanges();
      
      for (const entity of queued) {
        try {
          await this.sqlRepo.save(entity);
          await this.indexedDBRepo.markSynced(entity.id);
          success++;
        } catch (error) {
          failed++;
          
          // Update error metadata
          const updatedEntity = {
            ...entity,
            metadata: {
              ...entity.metadata,
              syncError: error instanceof Error ? error.message : 'Unknown error',
              lastSyncAttempt: new Date()
            }
          };
          await this.indexedDBRepo.save(updatedEntity);
        }
      }
      
      return { success, failed };
    } finally {
      this.syncInProgress = false;
    }
  }

  private handleOnline(): void {
    this.reduxDispatch({ type: 'SYNC/NETWORK_ONLINE' });
    this.syncPending().catch(console.error);
  }

  private handleOffline(): void {
    this.reduxDispatch({ type: 'SYNC/NETWORK_OFFLINE' });
  }

  async getLocalData(filter?: { type?: string }): Promise<DomainObject[]> {
    return this.indexedDBRepo.getAll(filter);
  }

  async getEntity(id: string): Promise<DomainObject | null> {
    // Try local first
    const local = await this.indexedDBRepo.get(id);
    if (local) return local;
    
    // Fall back to remote
    return this.sqlRepo.get(id);
  }

  async close(): Promise<void> {
    await this.indexedDBRepo.close();
    await this.sqlRepo.close();
  }
}