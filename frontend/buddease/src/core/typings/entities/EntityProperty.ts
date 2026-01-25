// EntityProperty.ts

import type { ValidationRule } from '@/core/snapshots/ValidationRule';
import type { Constraint } from '@/core/components/database/SchemaEvolutionManager';
import type { IndexDefinition } from '@/core/components/database/SchemaEvolutionManager';
import type { BaseDataEntity } from '@/core/config/BaseConfig';

/**
 * Primitive and structural types supported by the schema layer
 */
export type EntityPropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'json'
  | 'uuid'
  | 'enum'
  | 'array'
  | 'object'
  | 'reference'
  | 'computed';

/**
 * Defines a single property on an entity
 */
export interface EntityProperty<
    T extends BaseDataEntity = BaseDataEntity,
  K extends T = T> {
  /** Logical name used in code */
  name: string;

  /** Optional physical/database column name */
  columnName?: string;

  /** Property data type */
  type: EntityPropertyType;

  /** Human-readable description */
  description?: string;

  /** Required at persistence or validation time */
  required?: boolean;

  /** Nullable at the database level */
  nullable?: boolean;

  /** Default value or factory */
  defaultValue?: unknown | (() => unknown);

  /** Immutable after creation */
  readonly?: boolean;

  /** Unique constraint */
  unique?: boolean;

  /** Indexed independently of entity-level indexes */
  indexed?: boolean | IndexDefinition<T>;

  /** Enum configuration (when type === 'enum') */
  enumValues?: readonly string[];

  /** Array configuration (when type === 'array') */
  arrayOf?: EntityPropertyType | EntityProperty;

  /** Object configuration (when type === 'object') */
  properties?: EntityProperty[];

  /** Reference configuration (when type === 'reference') */
  reference?: {
    entity: string;
    property?: string;
    onDelete?: 'cascade' | 'restrict' | 'set-null';
    onUpdate?: 'cascade' | 'restrict';
  };

  /** Computed / derived field configuration */
  computed?: {
    dependsOn: string[];
    resolver: string; // expression, function name, or DSL reference
    persisted?: boolean;
  };

  /** Validation rules applied to this property */
  validationRules?: ValidationRule[];

  /** Database-level constraints */
  constraints?: Constraint<T, K>[];

  /** Access control at the property level */
  accessControl?: {
    read?: string[];
    write?: string[];
  };

  /** UI hints (purely declarative) */
  ui?: {
    label?: string;
    component?: string;
    order?: number;
    hidden?: boolean;
    placeholder?: string;
    helpText?: string;
  };

  /** Migration and evolution metadata */
  evolution?: {
    introducedInVersion?: string;
    deprecatedInVersion?: string;
    replacedBy?: string;
  };

  /** Arbitrary extension point */
  extensions?: Record<string, unknown>;
}



export const isReferenceProperty = (p: EntityProperty): boolean =>
  p.type === 'reference' && !!p.reference;

export const isComputedProperty = (p: EntityProperty): boolean =>
  p.type === 'computed' && !!p.computed;

export const isObjectProperty = (p: EntityProperty): boolean =>
  p.type === 'object' && Array.isArray(p.properties);

export const isArrayProperty = (p: EntityProperty): boolean =>
  p.type === 'array' && !!p.arrayOf;
