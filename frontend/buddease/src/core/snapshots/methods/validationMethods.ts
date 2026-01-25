// validationMethods.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/core/config/BaseConfig";
import { Category } from "@/core/libraries/categories/generateCategoryProperties";
import { SearchCriteria } from "@/core/pages/searches/SearchCriteria";
import { CoreSnapshot } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { SnapshotWithCriteriaAsBase } from "@/core/snapshots/SnapshotStoreOptions";
import { SubscriberCollection } from '@/core/subscribers/SubscriberCollection';
import { RealtimeDataItem } from "@/core/typings/realtimeTypes";
;

export const ValidationMethods = {
  // EVENT & HIERARCHY VALIDATION METHODS
  
  emit: function<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    event: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotId: string,
    subscribers: SubscriberCollection<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataItems: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    criteria: SnapshotWithCriteriaAsBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    category: symbol | string | Category | undefined
  ): void {
    // Validate event parameters
    if (typeof event !== 'string' || event.trim().length === 0) {
      throw new Error('Event name must be a non-empty string');
    }

    if (!snapshot || typeof snapshot !== 'object') {
      throw new Error('Snapshot must be a valid object');
    }

    if (typeof snapshotId !== 'string' || snapshotId.trim().length === 0) {
      throw new Error('Snapshot ID must be a non-empty string');
    }

    if (!subscribers || typeof subscribers !== 'object') {
      throw new Error('Subscribers must be a valid object');
    }

    if (typeof type !== 'string' || type.trim().length === 0) {
      throw new Error('Type must be a non-empty string');
    }

    if (!snapshotStore || typeof snapshotStore !== 'object') {
      throw new Error('SnapshotStore must be a valid object');
    }

    if (!Array.isArray(dataItems)) {
      throw new Error('DataItems must be an array');
    }

    if (!criteria || typeof criteria !== 'object') {
      throw new Error('Criteria must be a valid object');
    }

    // Category can be undefined, but if provided, validate type
    if (category !== undefined && typeof category !== 'string' && typeof category !== 'symbol' && !isCategory(category)) {
      throw new Error('Category must be a string, symbol, Category instance, or undefined');
    }

    // Additional validation for specific event types
    if (event === 'snapshotUpdate' && !snapshot.id) {
      throw new Error('Snapshot must have an ID for update events');
    }
    },
    

addChild: function<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
  parentId: string,
  childId: string,
  childSnapshot: CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): void {
  // Validate parentId
  if (typeof parentId !== 'string' || parentId.trim().length === 0) {
    throw new Error('Parent ID must be a non-empty string');
  }

  // Validate childId
  if (typeof childId !== 'string' || childId.trim().length === 0) {
    throw new Error('Child ID must be a non-empty string');
  }

  // Validate childSnapshot
  if (!childSnapshot || typeof childSnapshot !== 'object') {
    throw new Error('Child snapshot must be a valid object');
  }

  // Validate that childId matches the snapshot's ID (if snapshot has an ID)
  if (childSnapshot.id && childSnapshot.id !== childId) {
    throw new Error(`Child ID mismatch: parameter ${childId} doesn't match snapshot ID ${childSnapshot.id}`);
  }

  // Prevent circular references - child cannot be its own parent
  if (parentId === childId) {
    throw new Error('Cannot add child with the same ID as parent (circular reference)');
  }

  // Validate that child doesn't already have a different parent
  if (childSnapshot.parentId && childSnapshot.parentId !== parentId) {
    throw new Error(`Child already has a different parent: ${childSnapshot.parentId}`);
  }

  // Validate that parent doesn't already have this child
  // This would require access to the parent snapshot, but since we're validating inputs,
  // we can't always access the parent here. This might be handled in the actual implementation.

  // Validate child snapshot structure has required properties for being a child
  if (!childSnapshot.timestamp) {
    throw new Error('Child snapshot must have a timestamp');
  }

  // Validate version compatibility if versions exist
  if (childSnapshot.version !== undefined && typeof childSnapshot.version !== 'number' && typeof childSnapshot.version !== 'string') {
    throw new Error('Child version must be a number or string if provided');
  }

  // Additional validation based on your specific business rules
  if (childSnapshot.category !== undefined) {
    // Validate category format if needed
    if (typeof childSnapshot.category !== 'string' && typeof childSnapshot.category !== 'symbol' && !isCategory(childSnapshot.category)) {
      throw new Error('Child category must be a string, symbol, Category instance, or undefined');
    }
  }

  // Validate that child snapshot has the correct type for your hierarchy
  if (childSnapshot.type && typeof childSnapshot.type !== 'string') {
    throw new Error('Child type must be a string if provided');
  }

  // Optional: Validate that the parent can accept this type of child
  // This would require knowledge of your hierarchy rules
},

    removeChild: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      childId: string,
      parentId: string,
      parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): void {
      if (typeof childId !== 'string' || childId.trim().length === 0) {
        throw new Error('Child ID must be a non-empty string');
      }

      if (typeof parentId !== 'string' || parentId.trim().length === 0) {
        throw new Error('Parent ID must be a non-empty string');
      }

      if (!parentSnapshot || typeof parentSnapshot !== 'object') {
        throw new Error('Parent snapshot must be a valid object');
      }

      if (!childSnapshot || typeof childSnapshot !== 'object') {
        throw new Error('Child snapshot must be a valid object');
      }

      // Validate that parent actually has this child
      if (!parentSnapshot.children || !parentSnapshot.children.includes(childId)) {
        throw new Error(`Parent does not have child with ID: ${childId}`);
      }

      // Validate that child exists and has correct parent reference
      if (childSnapshot.parentId !== parentId) {
        throw new Error(`Child parent ID mismatch: expected ${parentId}, got ${childSnapshot.parentId}`);
      }
    },

    getChildren: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      id: string,
      childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] {
      if (typeof id !== 'string' || id.trim().length === 0) {
        throw new Error('ID must be a non-empty string');
      }

      if (!childSnapshot || typeof childSnapshot !== 'object') {
        throw new Error('Child snapshot must be a valid object');
      }

      // Validate that child snapshot has the correct parent reference
      if (childSnapshot.parentId !== id) {
        throw new Error(`Child parent ID mismatch: expected ${id}, got ${childSnapshot.parentId}`);
      }

      return [childSnapshot]; // Return validated child
    },

    hasChildren: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      id: string
    ): boolean {
      if (typeof id !== 'string' || id.trim().length === 0) {
        throw new Error('ID must be a non-empty string');
      }

      // Additional validation could check if ID exists in the store
      // For now, just validate the input format
      return false; // Default implementation
    },

    isDescendantOf: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      childId: string,
      parentId: string,
      parentSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      childSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    ): boolean {
      if (typeof childId !== 'string' || childId.trim().length === 0) {
        throw new Error('Child ID must be a non-empty string');
      }

      if (typeof parentId !== 'string' || parentId.trim().length === 0) {
        throw new Error('Parent ID must be a non-empty string');
      }

      if (!parentSnapshot || typeof parentSnapshot !== 'object') {
        throw new Error('Parent snapshot must be a valid object');
      }

      if (!childSnapshot || typeof childSnapshot !== 'object') {
        throw new Error('Child snapshot must be a valid object');
      }

      if (childId === parentId) {
        throw new Error('Child and parent cannot have the same ID');
      }

      // Check if child actually points to this parent
      if (childSnapshot.parentId !== parentId) {
        return false;
      }

      return true;
    },

    getInitialState: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
      // Validate that we can create a valid initial state
      // This might involve checking default values, required fields, etc.
      
      const initialState: Partial<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {
        id: 'initial',
        timestamp: new Date(),
        data: {} as T,
        version: '1'
      };

      // Validate required fields
      if (!initialState.id) {
        throw new Error('Initial state must have an ID');
      }

      if (!initialState.timestamp) {
        throw new Error('Initial state must have a timestamp');
      }

      return initialState as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    },

    getConfigOption: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      optionKey: string
    ): Record<string, any> {
      if (typeof optionKey !== 'string' || optionKey.trim().length === 0) {
        throw new Error('Option key must be a non-empty string');
      }

      // Validate option key format (e.g., no special characters, etc.)
      if (!/^[a-zA-Z0-9_.-]+$/.test(optionKey)) {
        throw new Error('Option key contains invalid characters');
      }

      return {}; // Return empty config by default
    },

    getTimestamp: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(): Date {
      // Always return current timestamp for validation purposes
      return new Date();
    },

    // STORE MANAGEMENT VALIDATION METHODS
    
    findSnapshots: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
      criteria: SearchCriteria
    ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
      if (!criteria || typeof criteria !== 'object') {
        throw new Error('Search criteria must be a valid object');
      }

      // Validate criteria structure
      if (criteria.filters && !Array.isArray(criteria.filters)) {
        throw new Error('Criteria filters must be an array');
      }

      if (criteria.sortBy && typeof criteria.sortBy !== 'string') {
        throw new Error('Sort by must be a string');
      }

      if (criteria.limit !== undefined && (typeof criteria.limit !== 'number' || criteria.limit < 0)) {
        throw new Error('Limit must be a non-negative number');
      }

      if (criteria.offset !== undefined && (typeof criteria.offset !== 'number' || criteria.offset < 0)) {
        throw new Error('Offset must be a non-negative number');
      }

      return Promise.resolve([]); // Return empty array for validation
    },


    // Add these to ValidationMethods or as helper functions
  validateHierarchy: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
    parentId: string,
    childId: string,
    parentSnapshot: CoreSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
    maxDepth: number = 10
  ): void {
    if (maxDepth <= 0) {
      throw new Error('Maximum hierarchy depth exceeded - possible circular reference');
    }

    // Additional hierarchy validation logic can go here
  },

  validateChildType: function<
      T extends BaseDataEntity,
      K extends T = T,
      Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
      AttachmentType extends Attachment = Attachment,
      ExcludedFields extends keyof T = DefaultExcludedFields<T>,
      IncludedFields extends keyof T = keyof T
    >(
    parentType: string,
    childType: string
  ): void {
    // Implement your specific type compatibility rules
    const allowedChildTypes: Record<string, string[]> = {
      'folder': ['document', 'image', 'folder'],
      'document': [],
      'image': [],
      // Add your specific type hierarchy rules
    };

    if (allowedChildTypes[parentType] && !allowedChildTypes[parentType].includes(childType)) {
      throw new Error(`Cannot add child of type '${childType}' to parent of type '${parentType}'`);
    }
  }
};

// Helper function to check if object is a Category
function isCategory(obj: any): boolean {
  return obj && typeof obj === 'object' && 'name' in obj && 'type' in obj;
}