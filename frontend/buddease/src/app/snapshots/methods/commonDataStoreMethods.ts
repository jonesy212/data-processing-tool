// commonDataStoreMethods.ts

import { BaseDataEntity } from '@/app/config/BaseConfig';
import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { MixedCriteria } from '@/app/pages/searches/CriteriaOptions';
import { FilterCriteria } from '@/app/pages/searches/FilterCriteria';
import { SearchCriteria } from '@/app/pages/searches/SearchCriteria';
import { AppSubscriber } from '@/app/subscribers/Subscriber';
import { AppAttachment, AppEntity, AppMeta, AppSnapshot, AppSnapshotContainer, AppSnapshotStore } from '@/app/typings/entities/SnapshotEntity';

// Helper functions (can be in same file or imported)
const matchesCriteria = <T extends BaseDataEntity>(
  data: T,
  criteria: FilterCriteria | SearchCriteria | MixedCriteria
): boolean => {
  if ('filters' in criteria) {
    // Handle FilterCriteria
    return criteria.filters.every(filter => {
      const value = (data as any)[filter.field];
      return evaluateFilter(value, filter.operator, filter.value);
    });
  } else if ('query' in criteria) {
    // Handle SearchCriteria
    const query = criteria.query.toLowerCase();
    return Object.values(data).some(value => 
      String(value).toLowerCase().includes(query)
    );
  } else {
    // Handle MixedCriteria or default case
    return true;
  }
};

const evaluateFilter = (value: any, operator: string, filterValue: any): boolean => {
  switch (operator) {
    case 'equals':
      return value === filterValue;
    case 'contains':
      return String(value).includes(String(filterValue));
    case 'greaterThan':
      return value > filterValue;
    case 'lessThan':
      return value < filterValue;
    default:
      return true;
  }
};

const removeDuplicates = <T extends BaseDataEntity>(items: T[]): T[] => {
  const seen = new Set();
  return items.filter(item => {
    const identifier = item.id || JSON.stringify(item);
    if (seen.has(identifier)) {
      return false;
    }
    seen.add(identifier);
    return true;
  });
};

// Now refactor your CommonDataStoreMethods using these aliases
export const CommonDataStoreMethods = {
  // Much cleaner - no complex generics
  getSnapshotByKey(
    this: AppSnapshotStore, 
    key: string
  ): AppSnapshot | undefined {
    if (this.snapshots && this.snapshots.length > 0) {
      return this.snapshots.find(snapshot => 
        snapshot.id === key || 
        (snapshot as any).key === key ||
        (snapshot.data as any)?.id === key
      );
    }
    
    // Check if you have a dataStores property (not setDataStores method)
    if (this.dataStores && this.dataStores.length > 0) {
      for (const dataStore of this.dataStores) {
        const snapshot = dataStore.getSnapshotByKey?.(key);
        if (snapshot) return snapshot as AppSnapshot;
      }
    }
    
    return undefined;
  },

  // Much simpler signature
  async mapSnapshotStore(
    this: AppSnapshotStore,
    storeId: number,
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: AppSnapshot,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: AppSnapshotStore,
    data: Data<>,
    category?: Category
  ): Promise<AppSnapshotContainer | undefined> {
    try {
      let container = this.snapshotContainers.get(snapshotId);
      
      if (!container) {
        container = {
          snapshotId,
          snapshotData: snapshot,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          category,
          categoryProperties,
          dataStoreMethods: this,
          id: storeId.toString(),
          snapshot,
          snapshotStore: this,
          data
        } as AppSnapshotContainer;
        
        this.snapshotContainers.set(snapshotId, container);
      } else {
        container.snapshotData = snapshot;
        container.timestamp = timestamp ? new Date(timestamp) : new Date();
        container.categoryProperties = categoryProperties;
      }
      
      return container;
    } catch (error) {
      console.error('Error mapping snapshot store:', error);
      return undefined;
    }
  },

  // Clean and readable
  async getSubscribers(
    this: AppSnapshotStore,
    snapshotId: string,
    snapshot: AppSnapshot,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: AppSnapshotContainer,
    data: AppEntity,
    category?: Category,
    categoryProperties?: CategoryProperties | undefined,
  ): Promise<AppSubscriber[]> {
    const snapshotSubscribers = this.subscribers?.get(snapshotId) || [];
    const globalSubscribers = this.subscribers?.get('*') || [];
    
    return [...snapshotSubscribers, ...globalSubscribers].filter(subscriber => 
      subscriber.isActive && subscriber.filter?.(snapshot, category, event) !== false
    ) as AppSubscriber[];
  },


  getDataWithSearchCriteria(
    this: AppSnapshotStore,
    criteria: FilterCriteria | SearchCriteria | MixedCriteria
  ): AppEntity[] {
    let results: AppEntity[] = [];
    
    if (this.snapshots && this.snapshots.length > 0) {
      results = this.snapshots
        .map(snapshot => snapshot.data)
        .filter(data => matchesCriteria(data, criteria)) as AppEntity[];
    }
    
    // Change to dataStores (property) instead of setDataStores (method)
    if (this.dataStores && this.dataStores.length > 0) {
      for (const dataStore of this.dataStores) {
        const storeResults = dataStore.getDataWithSearchCriteria?.(criteria) || [];
        results = [...results, ...storeResults] as AppEntity[];
      }
    }
    
    return removeDuplicates(results);
  },

  // Very clean implementation
  addData(
    this: AppSnapshotStore,
    id: string,
    data: Partial<AppSnapshot>
  ): void {
    const newSnapshot: AppSnapshot = {
      id,
      timestamp: new Date(),
      data: data.data || {} as AppEntity,
      metadata: data.metadata || {} as AppMeta,
      attachments: data.attachments || [] as AppAttachment[],
      ...data
    } as AppSnapshot;
    
    if (!this.snapshots) {
      this.snapshots = [];
    }
    
    this.snapshots = this.snapshots.filter(s => s.id !== id);
    this.snapshots.push(newSnapshot);
    
    this.notifySubscribers('dataAdded', newSnapshot);
  }
};