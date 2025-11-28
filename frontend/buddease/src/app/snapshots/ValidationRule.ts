// ValidationRule.ts

// Base types for context
import { SnapshotStoreConfig } from '@/app/snapshots';
import { createSnapshot } from '@/app/snapshots/createSnapshot';
import { SnapshotStoreProps } from "@/app/snapshots/SnapshotStoreProps";
import {
  StorePropAttachment,
  StorePropEntity,
  StorePropExcludedFields,
  StorePropIncludedFields,
  StorePropK,
  StorePropMeta
} from '@/app/typings/entities/StorePropEntity';
import { useDataStore } from '@/app/state/stores/DataStore';
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

export interface ValidationMeta<T extends BaseDataEntity, K extends T = T> {
  timestamp: Date;
  operation: 'create' | 'update' | 'delete' | 'restore';
  previousState?: Partial<K>;
  currentState: Partial<K>;
  userId?: string;
  source?: string;
}

// Validation Rule Types
export type ValidationRule<T extends BaseDataEntity = BaseDataEntity, K extends T = T> = {
  /** Unique identifier for the validation rule */
  id: string;
  
  /** Human-readable name for the rule */
  name: string;
  
  /** Description of what this rule validates */
  description?: string;
  
  /** The field(s) this rule applies to (use '*' for all fields) */
  field: keyof T | '*';
  
  /** Validation function that returns true if valid, false or error message if invalid */
  validate: (value: any, entity: Partial<T>, meta?: ValidationMeta<T, K>) => 
    | boolean 
    | string 
    | ValidationResult;
  
  /** Error message template (can use {field}, {value} placeholders) */
  errorMessage?: string;
  
  /** Severity level of the validation */
  severity?: 'error' | 'warning' | 'info';
  
  /** Whether this rule should run on create, update, or both */
  when?: ('create' | 'update' | 'delete')[];
  
  /** Optional condition to determine if this rule should run */
  condition?: (entity: Partial<T>, meta?: ValidationMeta<T, K>) => boolean;
  
  /** Priority order (lower numbers run first) */
  priority?: number;
};

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    rule: string;
  }>;  message?: string;
  details?: Record<string, any>;
}

// Common validation rule examples
export const CommonValidationRules = {
  /** Requires field to not be null/undefined/empty */
  required: <T extends BaseDataEntity, K extends T = T>(field: keyof T, message?: string): ValidationRule<T, K> => ({
    id: `required_${String(field)}`,
    name: `Required ${String(field)}`,
    field,
    validate: (value) => {
      const isValid = value !== null && value !== undefined && value !== '';
      return isValid || (message ?? `${String(field)} is required`);
    },
    severity: 'error',
    when: ['create', 'update']
  }),

  /** String length validation */
  minLength: <T extends BaseDataEntity, K extends T = T>(
    field: keyof T, 
    min: number, 
    message?: string
  ): ValidationRule<T, K> => ({
    id: `min_length_${String(field)}_${min}`,
    name: `Minimum length for ${String(field)}`,
    field,
    validate: (value) => {
      if (value === null || value === undefined) return true; // Let required rule handle this
      const isValid = typeof value === 'string' && value.length >= min;
      return isValid || (message ?? `${String(field)} must be at least ${min} characters`);
    },
    severity: 'error',
    when: ['create', 'update']
  }),

  /** Numeric range validation */
  numberRange: <T extends BaseDataEntity, K extends T = T>(
    field: keyof T,
    min: number,
    max: number,
    message?: string
  ): ValidationRule<T, K> => ({
    id: `number_range_${String(field)}_${min}_${max}`,
    name: `Number range for ${String(field)}`,
    field,
    validate: (value) => {
      if (value === null || value === undefined) return true;
      const num = Number(value);
      const isValid = !isNaN(num) && num >= min && num <= max;
      return isValid || (message ?? `${String(field)} must be between ${min} and ${max}`);
    },
    severity: 'error',
    when: ['create', 'update']
  }),

  /** Email format validation */
  email: <T extends BaseDataEntity, K extends T = T>(field: keyof T, message?: string): ValidationRule<T, K> => ({
    id: `email_${String(field)}`,
    name: `Email format for ${String(field)}`,
    field,
    validate: (value) => {
      if (value === null || value === undefined) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = typeof value === 'string' && emailRegex.test(value);
      return isValid || (message ?? `${String(field)} must be a valid email address`);
    },
    severity: 'error',
    when: ['create', 'update']
  }),

  /** Custom regex pattern validation */
  pattern: <T extends BaseDataEntity, K extends T = T>(
    field: keyof T,
    pattern: RegExp,
    message?: string
  ): ValidationRule<T, K> => ({
    id: `pattern_${String(field)}_${pattern.toString()}`,
    name: `Pattern validation for ${String(field)}`,
    field,
    validate: (value) => {
      if (value === null || value === undefined) return true;
      const isValid = typeof value === 'string' && pattern.test(value);
      return isValid || (message ?? `${String(field)} does not match the required pattern`);
    },
    severity: 'error',
    when: ['create', 'update']
  })
};


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
      
      if (typeof validationResult === 'boolean') {
        results.push({
          isValid: validationResult,
          message: validationResult ? undefined : rule.errorMessage,
          details: { ruleId: rule.id, field: rule.field },
          errors: []
        });
      } else if (typeof validationResult === 'string') {
        results.push({
          isValid: false,
          message: validationResult,
          details: { ruleId: rule.id, field: rule.field },
          errors: []
        });
      } else {
        results.push({
          ...validationResult,
          details: { ...validationResult.details, ruleId: rule.id, field: rule.field }
        });
      }
    }
    
    return results;
  }
  
  static hasErrors(results: ValidationResult[]): boolean {
    return results.some(result => !result.isValid && result.message);
  }
  
  static getErrorMessages(results: ValidationResult[]): string[] {
    return results
      .filter(result => !result.isValid && result.message)
      .map(result => result.message!);
  }
}


const snapshotStoreConfig = useDataStore().snapshotStoreConfig


// Usage example with SnapshotStoreConfig
const exampleConfig: SnapshotStoreConfig<  
  StorePropEntity,
  StorePropK,
  StorePropMeta,
  StorePropAttachment,
  StorePropExcludedFields,
  StorePropIncludedFields> = {
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

  getOrCreateSnapshot: async(
    id: string,
    baseData: StorePropEntity,
    storeProps: SnapshotStoreProps<StorePropEntity, StorePropK, StorePropMeta, StorePropAttachment, StorePropExcludedFields, StorePropIncludedFields>
  ) => {
    const existing = internalCache.get(id);
    if (existing) {
      return existing; // return cached snapshot
    }

    // if not found, create a new one
    return await createSnapshot(baseData, new Map(), id, null, null, null, null, false, storeProps);
  }
  // ... other SnapshotStoreConfig properties
};