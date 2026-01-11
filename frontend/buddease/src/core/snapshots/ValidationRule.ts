// ValidationRule.ts

// Base types for context
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { SnapshotStoreProps } from "@/core/snapshots/SnapshotStoreProps";
import { createSnapshot } from '@/core/snapshots/createSnapshot';
import { SnapshotStoreOptions } from '@/core/snapshots/useSnapshotStore';
import type { useDataStore } from '@/core/state/stores/DataStore';
import type { SnapshotAttachment, SnapshotEntity, SnapshotExcludedFields, SnapshotIncludedFields, SnapshotK, SnapshotMeta } from '@/core/typings/entities/SnapshotEntity';
import {
    StorePropAttachment,
    StorePropEntity, StorePropEntityTemplate, StorePropExcludedFields,
    StorePropIncludedFields,
    StorePropK,
    StorePropMeta
} from '@/core/typings/entities/StorePropEntity';
import { internalCache } from '@/utils/cache/InternalCache';


export interface BaseDataEntity {
  id?: string | number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  tempData?: {
    tempResults: any[];
    cacheTime: Date;
  };
  [key: string]: any;
}
export interface ValidationRule<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T
> {
  // Core Identification (required)
  id: string;
  name: string;

  // Rule Definition (rule is now optional since we have validate function)
  rule?: string; // Make optional - e.g., "required", "email", "minLength:5"
  validate: (value: any, entity: Partial<T>, meta?: ValidationMeta<T, K>) =>
    | boolean
    | string
    | ValidationResult;

  // Message Handling (make message optional if we have validate returning string)
  message?: string; // Simple static message
  errorMessage?: string; // Alternative name for message

  // Scope & Application (required)
  field: keyof T | '*';
  severity: 'error' | 'warning' | 'info';
  when: ('create' | 'update' | 'delete')[];

  // Optional properties
  description?: string;
  condition?: (entity: Partial<T>, meta?: ValidationMeta<T, K>) => boolean;
  priority?: number; // Make optional with default
  async?: boolean;

  // Optional metadata
  metadata?: {
    type: 'regex' | 'function' | 'custom' | 'built-in';
    category?: string;
    tags?: string[];
    version?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };

  // Optional related rules
  dependsOn?: string[];
  excludes?: string[];

  // Optional custom properties
  customProperties?: Record<string, any>;
}

// Factory function to create validation rules with defaults
function createValidationRule<T extends BaseDataEntity, K extends T = T>(
  rule: Omit<ValidationRule<T, K>, 'priority' | 'async' | 'severity' | 'when'> &
    Partial<Pick<ValidationRule<T, K>, 'priority' | 'async' | 'severity' | 'when'>>
): ValidationRule<T, K> {
  return {
    priority: 0,
    async: false,
    severity: 'error',
    when: ['create', 'update'],
    ...rule
  };
}

// Validation Result Types
interface ValidationMeta<T extends BaseDataEntity, K extends T = T> {
  timestamp: Date;
  operation: 'create' | 'update' | 'delete' | 'restore';
  previousState?: Partial<K>;
  currentState: Partial<K>;
  userId?: string;
  source?: string;
  // Fields from the second interface
  previousValue?: any;
  context?: Record<string, any>;
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  validationContext?: {
    skipRules?: string[];
    customValidators?: Array<(value: any) => ValidationResult>;
  };
}

// ValidationResult interface
interface ValidationResult {
  isValid: boolean;
  message: string;
  details?: Record<string, any>;

  // Combined error structure
  errors?: Array<{
    field: string;
    message: string;
    rule: string;
  }>;

  // Additional properties from first interface
  field?: string;
  value?: any;
  severity?: 'error' | 'warning' | 'info';
  code?: string; // Error code for programmatic handling
  metadata?: Record<string, any>;
}

// Common validation rule examples
// Common validation rule examples using the factory
export const CommonValidationRules = {
  /** Requires field to not be null/undefined/empty */
  required: <T extends BaseDataEntity, K extends T = T>(field: keyof T, message?: string): ValidationRule<T, K> =>
    createValidationRule<T, K>({
      id: `required_${String(field)}`,
      name: `Required ${String(field)}`,
      rule: 'required',
      field,
      validate: (value) => {
        const isValid = value !== null && value !== undefined && value !== '';
        return isValid || (message ?? `${String(field)} is required`);
      },
      message: message ?? `${String(field)} is required`,
    }),

  /** String length validation */
  minLength: <T extends BaseDataEntity, K extends T = T>(
    field: keyof T,
    min: number,
    message?: string
  ): ValidationRule<T, K> =>
    createValidationRule<T, K>({
      id: `min_length_${String(field)}_${min}`,
      name: `Minimum length for ${String(field)}`,
      rule: `minLength:${min}`,
      field,
      validate: (value) => {
        if (value === null || value === undefined) return true;
        const isValid = typeof value === 'string' && value.length >= min;
        return isValid || (message ?? `${String(field)} must be at least ${min} characters`);
      },
      message: message ?? `${String(field)} must be at least ${min} characters`,
    }),

  /** Numeric range validation */
  numberRange: <T extends BaseDataEntity, K extends T = T>(
    field: keyof T,
    min: number,
    max: number,
    message?: string
  ): ValidationRule<T, K> =>
    createValidationRule<T, K>({
      id: `number_range_${String(field)}_${min}_${max}`,
      name: `Number range for ${String(field)}`,
      rule: `range:${min},${max}`,
      field,
      validate: (value) => {
        if (value === null || value === undefined) return true;
        const num = Number(value);
        const isValid = !isNaN(num) && num >= min && num <= max;
        return isValid || (message ?? `${String(field)} must be between ${min} and ${max}`);
      },
      message: message ?? `${String(field)} must be between ${min} and ${max}`,
    }),

  /** Email format validation */
  email: <T extends BaseDataEntity, K extends T = T>(field: keyof T, message?: string): ValidationRule<T, K> =>
    createValidationRule<T, K>({
      id: `email_${String(field)}`,
      name: `Email format for ${String(field)}`,
      rule: 'email',
      field,
      validate: (value) => {
        if (value === null || value === undefined) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = typeof value === 'string' && emailRegex.test(value);
        return isValid || (message ?? `${String(field)} must be a valid email address`);
      },
      message: message ?? `${String(field)} must be a valid email address`,
    }),

  /** Custom regex pattern validation */
  pattern: <T extends BaseDataEntity, K extends T = T>(
    field: keyof T,
    pattern: RegExp,
    message?: string
  ): ValidationRule<T, K> =>
    createValidationRule<T, K>({
      id: `pattern_${String(field)}_${pattern.toString()}`,
      name: `Pattern validation for ${String(field)}`,
      rule: `pattern:${pattern}`,
      field,
      validate: (value) => {
        if (value === null || value === undefined) return true;
        const isValid = typeof value === 'string' && pattern.test(value);
        return isValid || (message ?? `${String(field)} does not match the required pattern`);
      },
      message: message ?? `${String(field)} does not match the required pattern`,
      metadata: {
        type: 'regex',
      },
    }),

  /** Conditional validation example */
  conditional: <T extends BaseDataEntity, K extends T = T>(
    field: keyof T,
    condition: (entity: Partial<T>) => boolean,
    rule: ValidationRule<T, K>,
    message?: string
  ): ValidationRule<T, K> =>
    createValidationRule<T, K>({
      ...rule,
      id: `conditional_${rule.id}`,
      name: `Conditional: ${rule.name}`,
      condition: condition,
      message: message ?? rule.message,
    }),
};

// First, let's fix the ValidationResult interface to include all needed properties
interface ValidationResult {
  isValid: boolean;
  message: string; // Make this required, not optional
  details?: Record<string, any>;
  errors?: Array<{
    field: string;
    message: string;
    rule: string;
  }>;
  field?: string;
  value?: any;
  severity?: 'error' | 'warning' | 'info';
  code?: string;
  metadata?: Record<string, any>;
}

// Now fix the ValidationEngine class
export class ValidationEngine {
  static validateEntity<
    T extends BaseDataEntity,
    K extends T = T
  >(
    entity: Partial<T>,
    rules: ValidationRule<T, K>[],
    meta?: ValidationMeta<T, K>
  ): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Sort rules by priority (lower first)
    const sortedRules = [...rules].sort((a, b) => (a.priority || 100) - (b.priority || 100));

    for (const rule of sortedRules) {
      // Check if rule should run based on operation type
      if (meta && rule.when && !rule.when.includes(meta.operation as any)) {
        continue;
      }

      // Check conditional execution
      if (rule.condition && !rule.condition(entity, meta)) {
        continue;
      }

      let value: any;

      if (rule.field === '*') {
        // Apply to entire entity
        value = entity;
      } else {
        // Apply to specific field
        value = entity[rule.field as keyof T];
      }

      const validationResult = rule.validate(value, entity, meta);

      // Create base result object
      const baseResult: Partial<ValidationResult> = {
        field: typeof rule.field === 'string' ? rule.field : '*',
        details: { ruleId: rule.id, field: rule.field },
        severity: rule.severity || 'error'
      };

      if (typeof validationResult === 'boolean') {
        const message = validationResult
          ? `Validation passed for rule: ${rule.name || rule.id}`
          : rule.errorMessage || rule.message || `Validation failed for rule: ${rule.name || rule.id}`;

        results.push({
          isValid: validationResult,
          message,
          ...baseResult,
          errors: validationResult ? undefined : [{
            field: String(rule.field),
            message: rule.errorMessage || rule.message || 'Validation failed',
            rule: rule.rule || rule.id
          }]
        });
      } else if (typeof validationResult === 'string') {
        results.push({
          isValid: false,
          message: validationResult,
          ...baseResult,
          errors: [{
            field: String(rule.field),
            message: validationResult,
            rule: rule.rule || rule.id
          }]
        });
      } else {
        // validationResult is a ValidationResult object
        const result = validationResult as ValidationResult;
        results.push({
          ...result,
          ...baseResult,
          details: { ...result.details, ...baseResult.details },
          errors: result.errors || (result.isValid ? undefined : [{
            field: String(rule.field),
            message: result.message || 'Validation failed',
            rule: rule.rule || rule.id
          }])
        });
      }
    }

    return results;
  }

  static hasErrors(results: ValidationResult[]): boolean {
    return results.some(result => !result.isValid);
  }

  static getErrorMessages(results: ValidationResult[]): string[] {
    return results
      .filter(result => !result.isValid)
      .map(result => result.message);
  }
}



const snapshotStoreConfig = useDataStore().snapshotStoreConfig


// Usage example with SnapshotStoreConfig
const exampleConfig: SnapshotStoreConfig<
  SnapshotEntity,
  SnapshotK,
  SnapshotMeta,
  SnapshotAttachment,
  SnapshotExcludedFields,
  SnapshotIncludedFields
> = {
  ...snapshotStoreConfig,

  validationRules: [
    CommonValidationRules.required('id', 'ID is required'),
    CommonValidationRules.minLength('name', 3, 'Name must be at least 3 characters'),
    CommonValidationRules.email('email'),
    {
      id: 'custom_business_rule',
      name: 'Custom Business Validation',
      field: '*',
      validate: (entity) => {
        // Complex business logic validation
        return entity.status !== 'archived' || entity.archivedAt !== undefined;
      },
      errorMessage: 'Archived entities must have an archive date',
      severity: 'error',
      when: ['update']
    }
  ],
 
  getOrCreateSnapshot: async (
    id: string,
    baseData: StorePropEntity,
    storeProps: SnapshotStoreProps<
      StorePropEntity, 
      StorePropK, 
      StorePropMeta, 
      StorePropAttachment, 
      StorePropExcludedFields, 
      StorePropIncludedFields
    >
  ) => {
    const existing = internalCache.get(id);
    if (existing) {
      return existing;
    }
    return await createSnapshot(
      baseData, 
      new Map(), 
      id, 
      null, 
      null, 
      null, 
      undefined, 
      false, 
      storeProps
    );
  }
};

// Then use it in storeProps
const storeProps: SnapshotStoreProps<
  StorePropEntityTemplate['T'],
  StorePropEntityTemplate['K'],
  StorePropEntityTemplate['Meta'],
  StorePropEntityTemplate['AttachmentType'],
  StorePropEntityTemplate['ExcludedFields'],
  StorePropEntityTemplate['IncludedFields']
> = {
  storeId: "store-prop-store-001",
  name: "StoreProp Snapshot Store",
  endpointCategory: "store-props",
  expirationDate: new Date(Date.now() + 86400000),
  category: "store-props",
  timestamp: new Date(),
  criteria: {},
  snapshotStoreConfig: snapshotStoreConfig, // Use the typed config
  schema: {},
  options: {} as SnapshotStoreOptions<StorePropEntity, StorePropK, StorePropMeta, StorePropAttachment, StorePropExcludedFields, StorePropIncludedFields>,
  callback: (snapshotStore: SnapshotStore<StorePropEntity, StorePropK, StorePropMeta, StorePropAttachment, StorePropExcludedFields, StorePropIncludedFields>) => {
    console.log("Initialized StorePropSnapshotStore:", snapshotStore);
  },
};
