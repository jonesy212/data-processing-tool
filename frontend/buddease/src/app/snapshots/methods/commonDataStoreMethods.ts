// commonDataStoreMethods
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";import { Category } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import { Subscriber } from '@/app/subscribers/Subscriber';
import { FilterCriteria } from '@/app/pages/searches/CriteriaType';
import { MixedCriteria } from '@/app/pages/searches/CriteriaOptions';
import { SearchCriteria } from '@/app/pages/searches/SearchCriteria';



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

// Main export
export const CommonDataStoreMethods = {
  // Implement getSnapshotByKey
  getSnapshotByKey<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, key: string): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    // Implementation: Search through snapshots or data stores for the key
    if (this.snapshots && this.snapshots.length > 0) {
      return this.snapshots.find(snapshot => 
        snapshot.id === key || 
        (snapshot as any).key === key ||
        (snapshot.data as any)?.id === key
      );
    }
    
    // Check data stores if available
    if (this.dataStores && this.dataStores.length > 0) {
      for (const dataStore of this.dataStores) {
        const snapshot = dataStore.getSnapshotByKey?.(key);
        if (snapshot) return snapshot;
      }
    }
    
    return undefined;
  },

  // Implement mapSnapshotStore
  async mapSnapshotStore<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    storeId: number,
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    category?: Category
  ): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
    try {
      // Create or find snapshot container
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
        };
        
        this.snapshotContainers.set(snapshotId, container);
      } else {
        // Update existing container
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

  // Implement getSubscribers
  async getSubscribers<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    categoryProperties: CategoryProperties | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    timestamp: string | number | Date | undefined,
    type: string,
    event: Event,
    id: number,
    snapshotStore: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    data: T,
    category?: Category
  ): Promise<Subscriber<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    // Get subscribers for this specific snapshot
    const snapshotSubscribers = this.subscribers?.get(snapshotId) || [];
    
    // Get global subscribers
    const globalSubscribers = this.subscribers?.get('*') || [];
    
    // Combine and return all relevant subscribers
    return [...snapshotSubscribers, ...globalSubscribers].filter(subscriber => 
      subscriber.isActive && subscriber.filter?.(snapshot, category, event) !== false
    );
  },

  // Implement getDataWithSearchCriteria with overloads
  getDataWithSearchCriteria<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    criteria: FilterCriteria | SearchCriteria | MixedCriteria
  ): T[] {
    let results: T[] = [];
    
    // Search through snapshots
    if (this.snapshots && this.snapshots.length > 0) {
      results = this.snapshots
        .map(snapshot => snapshot.data)
        .filter(data => matchesCriteria(data, criteria));
    }
    
    // Search through data stores if available
    if (this.dataStores && this.dataStores.length > 0) {
      for (const dataStore of this.dataStores) {
        const storeResults = dataStore.getDataWithSearchCriteria?.(criteria) || [];
        results = [...results, ...storeResults];
      }
    }
    
    return removeDuplicates(results);
  },

  // Implement addData
  addData<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    this: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    id: string,
    data: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ): void {
    // Create new snapshot from partial data
    const newSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id,
      timestamp: new Date(),
      data: data.data || {} as T,
      metadata: data.metadata || {} as Meta,
      attachments: data.attachments || [] as AttachmentType[],
      ...data
    } as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
    // Add to snapshots array
    if (!this.snapshots) {
      this.snapshots = [];
    }
    
    // Remove existing snapshot with same ID if it exists
    this.snapshots = this.snapshots.filter(s => s.id !== id);
    this.snapshots.push(newSnapshot);
    
    // Notify subscribers
    this.notifySubscribers('dataAdded', newSnapshot);
  }
};