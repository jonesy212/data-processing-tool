// storageTypes.ts
// storageTypes.ts
// Centralized storage/search metadata (all fields you listed)
export interface StorageMetadata {
  // DB layer
  _attachments?: Record<string, any>;
  _links?: Record<string, any>;
  _etag?: string;
  _local?: boolean;
  _revs?: string[];
  _source?: Record<string, any>;
  _shards?: Record<string, any>;
  _size?: number;
  _version?: number;
  _version_conflicts?: number;
  _seq_no?: number;
  _primary_term?: number;
  _routing?: string;
  _parent?: string;
  _parent_as_child?: boolean;

  // Search / Elasticsearch layer
  _slices?: any[];
  _highlight?: Record<string, any>;
  _highlight_inner_hits?: Record<string, any>;
  _source_as_doc?: boolean;
  _source_includes?: string[];
  _routing_keys?: string[];
  _routing_values?: string[];
  _routing_values_as_array?: string[];
  _routing_values_as_array_of_objects?: Record<string, any>[];
  _routing_values_as_array_of_objects_with_key?: Record<string, any>[];
  _routing_values_as_array_of_objects_with_key_and_value?: Record<string, any>[];
  _routing_values_as_array_of_objects_with_key_and_value_and_value?: Record<string, any>[];

  // Generic storage bag (extra engine-specific fields)
  _storageExtras?: Record<string, any>;
}

// PersistedDocument: generic composition of domain + storage metadata
export type PersistedDocument<TDomain> = TDomain & StorageMetadata & {
  // explicit DB id field (optional if domain has its own id)
  _id?: string | number;
  // partition/collection indicator if needed
  _collection?: string;
};

// transformers.ts
/**
 * Map domain object -> persisted object
 * - Will copy domain fields (shallow) and attach storage metadata (if provided)
 * - Does NOT mutate original domain object
 */
export function mapDomainToPersisted<TDomain extends Record<string, any>>(
  domain: TDomain,
  storageMeta?: Partial<StorageMetadata> & { _id?: string | number; _collection?: string }
): PersistedDocument<TDomain> {
  return {
    ...domain,
    ...(storageMeta || {}),
  } as PersistedDocument<TDomain>;
}

/**
 * Map persisted object -> domain object
 * - Strips storage metadata fields and returns a pure domain object
 * - Optionally returns storage metadata separately if you need it
 */
export function mapPersistedToDomain<TDomain extends Record<string, any>>(
  persisted: PersistedDocument<TDomain>
): { domain: TDomain; storageMetadata: StorageMetadata } {
  // copy to avoid mutating caller
  const copy = { ...persisted } as any;

  // Extract storage fields into a metadata object
  const storageMetadata: StorageMetadata = {
    _attachments: copy._attachments,
    _links: copy._links,
    _etag: copy._etag,
    _local: copy._local,
    _revs: copy._revs,
    _source: copy._source,
    _shards: copy._shards,
    _size: copy._size,
    _version: copy._version,
    _version_conflicts: copy._version_conflicts,
    _seq_no: copy._seq_no,
    _primary_term: copy._primary_term,
    _routing: copy._routing,
    _parent: copy._parent,
    _parent_as_child: copy._parent_as_child,
    _slices: copy._slices,
    _highlight: copy._highlight,
    _highlight_inner_hits: copy._highlight_inner_hits,
    _source_as_doc: copy._source_as_doc,
    _source_includes: copy._source_includes,
    _routing_keys: copy._routing_keys,
    _routing_values: copy._routing_values,
    _routing_values_as_array: copy._routing_values_as_array,
    _routing_values_as_array_of_objects: copy._routing_values_as_array_of_objects,
    _routing_values_as_array_of_objects_with_key: copy._routing_values_as_array_of_objects_with_key,
    _routing_values_as_array_of_objects_with_key_and_value: copy._routing_values_as_array_of_objects_with_key_and_value,
    _routing_values_as_array_of_objects_with_key_and_value_and_value: copy._routing_values_as_array_of_objects_with_key_and_value_and_value,
    _storageExtras: copy._storageExtras,
  };

  // Remove storage keys from copy to produce domain object
  delete copy._attachments;
  delete copy._links;
  delete copy._etag;
  delete copy._local;
  delete copy._revs;
  delete copy._source;
  delete copy._shards;
  delete copy._size;
  delete copy._version;
  delete copy._version_conflicts;
  delete copy._seq_no;
  delete copy._primary_term;
  delete copy._routing;
  delete copy._parent;
  delete copy._parent_as_child;
  delete copy._slices;
  delete copy._highlight;
  delete copy._highlight_inner_hits;
  delete copy._source_as_doc;
  delete copy._source_includes;
  delete copy._routing_keys;
  delete copy._routing_values;
  delete copy._routing_values_as_array;
  delete copy._routing_values_as_array_of_objects;
  delete copy._routing_values_as_array_of_objects_with_key;
  delete copy._routing_values_as_array_of_objects_with_key_and_value;
  delete copy._routing_values_as_array_of_objects_with_key_and_value_and_value;
  delete copy._storageExtras;
  delete copy._id;
  delete copy._collection;

  return { domain: copy as TDomain, storageMetadata };
}
