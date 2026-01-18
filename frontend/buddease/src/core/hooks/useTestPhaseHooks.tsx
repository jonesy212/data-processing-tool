// useTestPhaseHooks.tsx
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { CustomPhaseHooks, Phase } from '@/core/models/phases/Phase';

// Test Phase Hook Configuration - Updated to match your structure
export interface TestPhaseHookConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  condition: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  asyncEffect?: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
  canTransitionTo?: (currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
                     nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => boolean;
  handleTransitionTo?: (currentPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
                        nextPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
  duration?: number;
  retryCount?: number;
  timeout?: number;
  validate?: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => string[];
  cleanup?: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
  onError?: (error: Error, phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onSuccess?: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  mockData?: Partial<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  testScenarios?: TestScenario<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  onStart?: () => void;
  onEnd?: () => void;
  startIdleTimeout?: (timeoutDuration: number, onTimeout: () => void) => void;
  clearIdleTimeout?: () => void;
}

// Test Scenario Definition
export interface TestScenario<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  name: string;
  description: string;
  setup: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
  execute: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<TestResult>;
  teardown?: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>;
  expectedResult: any;
}

// Test Result
export interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  duration?: number;
  timestamp: Date;
}

// Test Phase Hooks Interface - Updated to match your return structure
export interface TestPhaseHooks<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  createTestPhaseHook: (
    config: TestPhaseHookConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  runTestScenarios?: (
    phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    scenarios: TestScenario<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ) => Promise<TestResult[]>;
  
  validatePhaseForTesting?: (
    phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => ValidationResult;
  
  mockPhase?: (
    mockData: Partial<Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  ) => Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  createTransitionTest?: (
    fromPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    toPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => Promise<TransitionTestResult>;
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Transition Test Result
export interface TransitionTestResult {
  success: boolean;
  canTransition: boolean;
  transitionErrors: string[];
  transitionWarnings: string[];
  duration: number;
}


// Factory for creating test scenarios
export const createTestScenario = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  name: string,
  description: string,
  execute: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<any>,
  expectedResult: any,
  setup?: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>,
  teardown?: (phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => Promise<void>
): TestScenario<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return {
    name,
    description,
    setup: setup || (async () => {}),
    execute: async (phase) => ({
      success: true,
      message: "Executed successfully",
      data: await execute(phase),
      timestamp: new Date()
    }),
    teardown,
    expectedResult
  };
};

// Common test hooks for different phase types
export const commonTestHooks = {
  // Hook for testing phase transitions
  createTransitionTestHook: <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    fromPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    toPhase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): TestPhaseHookConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
    return {
      condition: (phase) => phase.id === fromPhase.id,
      canTransitionTo: (currentPhase, nextPhase) => nextPhase.id === toPhase.id,
      handleTransitionTo: async (currentPhase, nextPhase) => {
        if (nextPhase.id === toPhase.id) {
          console.log(`Testing transition from ${fromPhase.name} to ${toPhase.name}`);
        }
      },
      onStart: () => console.log(`Starting transition test from ${fromPhase.name}`),
      onEnd: () => console.log(`Completed transition test to ${toPhase.name}`)
    };
  },
  
  // Hook for validation testing
  createValidationTestHook: <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    validationRules: string[]
  ): TestPhaseHookConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
    return {
      condition: (phase) => true,
      asyncEffect: async (phase) => {
        console.log(`Validating phase ${phase.name} against rules:`, validationRules);
        // Add validation logic here
      },
      onStart: () => console.log("Starting validation test"),
      onEnd: () => console.log("Completed validation test"),
      validate: (phase) => {
        const errors: string[] = [];
        // Implement validation logic based on rules
        validationRules.forEach(rule => {
          // Example validation logic
          if (rule === 'has-id' && !phase.id) {
            errors.push("Phase must have an ID");
          }
          if (rule === 'has-name' && !phase.name) {
            errors.push("Phase must have a name");
          }
        });
        return errors;
      }
    };
  }
};

export default useTestPhaseHooks;