snapshotValidators.ts
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { ImportFix } from '@/core/generators/corrections/ImportFixServicies';
import { SnapshotAnalyzer } from '@/core/generators/corrections/SnapshotAnalyzer';
import { StructureValidator } from '@/core/generators/corrections/StructureValidator';
import { ConfigurationValidator } from '@/core/generators/corrections/validators/ConfigurationValidator';
import { FileStructureValidator } from '@/core/generators/corrections/validators/FileStructureValidator';
import { MultiPlatformDirectoryValidator } from '@/core/generators/corrections/validators/MultiPlatformDirectoryValidator';
import { PackageJsonValidator } from '@/core/generators/corrections/validators/PackageJsonValidator';
import { CorrectionCategory, CorrectionSeverity, CorrectionType } from '@/core/typings/correctionTypes';

export type ValidationSuggestion = StringSuggestion | ImportFixSuggestion | CodeSuggestion;

export interface StringSuggestion {
    type: 'string';
    value: string;
}

export interface ImportFixSuggestion {
    type: 'import-fix';
    value: ImportFix;
}

export interface CodeSuggestion {
    type: 'code';
    value: {
        code: string;
        language?: string;
        title?: string;
    };
}

Type guards
export const isStringSuggestion = (suggestion: ValidationSuggestion): suggestion is StringSuggestion =>
    suggestion.type === 'string';

export const isImportFixSuggestion = (suggestion: ValidationSuggestion): suggestion is ImportFixSuggestion =>
    suggestion.type === 'import-fix';

export const isCodeSuggestion = (suggestion: ValidationSuggestion): suggestion is CodeSuggestion =>
    suggestion.type === 'code';



export interface SnapshotValidationConfig {
    projectRoot?: string;
    snapshotPath?: string;
    strictMode?: boolean;
    validateStructure?: boolean;
    validateTypes?: boolean;
    validateDependencies?: boolean;
    validateSecurity?: boolean;
    validatePerformance?: boolean;
    customRules?: SnapshotValidationRule[];
}

export interface SnapshotValidationRule {
    name: string;
    description?: string;
    condition: (snapshot: any, context?: any) => boolean | Promise<boolean>;
    message: string;
    severity: ValidationSeverity;
    category: ValidationCategory;
    fix?: string | ((snapshot: any) => string);
}

export type ValidationCategory = CorrectionCategory;
export type ValidationSeverity = CorrectionSeverity;


export interface SnapshotValidationResult {
    isValid: boolean;
    issues: SnapshotValidationIssue[];
    warnings: SnapshotValidationIssue[];
    errors: SnapshotValidationIssue[];
    score?: number;
    timestamp: Date;
    validator: string;
}

export interface SnapshotValidationIssue {
    id: string;
    type: ValidationCategory;
    severity: ValidationSeverity;
    message: string;
    location?: string;
    codeSnippet?: string;
    suggestion?: ValidationSuggestion;
    fix?: string;
    rule?: string;
    metadata?: Record<string, any>;
}

export class SnapshotValidators {
    private projectRoot: string;
    private snapshotPath: string;
    private config: SnapshotValidationConfig;

    private snapshotAnalyzer: SnapshotAnalyzer;
    private directoryValidator: MultiPlatformDirectoryValidator;
    private fileValidator: FileStructureValidator;
    private packageValidator: PackageJsonValidator;
    private configValidator: ConfigurationValidator;
    private structureValidator: StructureValidator;

    // Cache for validation results
    private validationCache: Map<string, SnapshotValidationResult> = new Map();

    constructor(config: SnapshotValidationConfig = {}) {
        this.config = {
            projectRoot: '.',
            snapshotPath: '/src/app/snapshots',
            strictMode: false,
            validateStructure: true,
            validateTypes: true,
            validateDependencies: true,
            validateSecurity: true,
            validatePerformance: true,
            ...config
        };

        this.projectRoot = this.config.projectRoot!;
        this.snapshotPath = this.config.snapshotPath!;

        // Initialize all validators
        this.snapshotAnalyzer = new SnapshotAnalyzer(this.snapshotPath);
        this.directoryValidator = new MultiPlatformDirectoryValidator(this.projectRoot);
        this.fileValidator = new FileStructureValidator(this.projectRoot);
        this.packageValidator = new PackageJsonValidator(this.projectRoot);
        this.configValidator = new ConfigurationValidator(this.projectRoot);
        this.structureValidator = new StructureValidator(this.projectRoot);
    }



    private createStringSuggestion(value: string): ValidationSuggestion {
  return {
    type: 'string',
    value
  };
}

    private createSuggestionFromStringOrObject(suggestion: string | object | undefined): ValidationSuggestion | undefined {
    if (!suggestion) return undefined;
    
    if (typeof suggestion === 'string') {
        return this.createStringSuggestion(suggestion);
    } else if (this.isImportFix(suggestion)) {
        return {
        type: 'import-fix',
        value: suggestion as ImportFix
        };
    } else if (typeof suggestion === 'object' && 'code' in suggestion) {
        return {
        type: 'code',
        value: {
            code: (suggestion as any).code,
            language: (suggestion as any).language,
            title: (suggestion as any).title
        }
        };
    } else {
        return this.createStringSuggestion(JSON.stringify(suggestion));
    }
    }
    // Main validation methods
    async validateSnapshotStructure(snapshot: any): Promise<SnapshotValidationResult> {
        const cacheKey = `structure-${JSON.stringify(snapshot)}`;
        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey)!;
        }

        const issues: SnapshotValidationIssue[] = [];

        // Basic structure validation
        issues.push(...this.validateBasicStructure(snapshot));

        // Data model validation
        if (this.config.validateStructure) {
            issues.push(...await this.validateDataModel(snapshot));
        }

        // Type validation
        if (this.config.validateTypes) {
            issues.push(...this.validateSnapshotTypes(snapshot));
        }

        const result = this.createValidationResult(issues);
        this.validationCache.set(cacheKey, result);

        return result;
    }

    async validateAgainstSchema(snapshot: any, schema: any): Promise<SnapshotValidationResult> {
        const issues: SnapshotValidationIssue[] = [];

        if (!schema) {
            return {
                isValid: true,
                issues: [],
                warnings: [],
                errors: [],
                timestamp: new Date(),
                validator: 'schema'
            };
        }

        // Validate required fields
        if (schema.required) {
            for (const field of schema.required) {
                if (!(field in snapshot)) {
                    issues.push({
                        id: `missing-required-field-${field}`,
                        type: 'structure',
                        severity: 'high',
                        message: `Missing required field: ${field}`,
                        location: `snapshot.${field}`,
                        suggestion: this.createStringSuggestion(`Add ${field} property to snapshot`),
                        rule: 'required-field'
                    });
                }
            }
        }

        // Validate field types
        if (schema.properties) {
            for (const [field, fieldSchema] of Object.entries(schema.properties as any)) {
                const value = snapshot[field];
                if (value !== undefined) {
                    const typeIssues = this.validateFieldType(field, value, fieldSchema as any);
                    issues.push(...typeIssues);
                }
            }
        }

        return this.createValidationResult(issues);
    }

    async validateGeneric(payload: any): Promise<SnapshotValidationResult> {
        const issues: SnapshotValidationIssue[] = [];

        // Check if payload is valid object
        if (!payload || typeof payload !== 'object') {
            issues.push({
                id: 'invalid-payload-type',
                type: 'structure',
                severity: 'high',
                message: 'Payload must be an object',
                suggestion: this.createStringSuggestion('Provide a valid object payload'),
                rule: 'payload-type'
            });

            return this.createValidationResult(issues);
        }

        // Validate payload structure
        if (this.config.validateStructure) {
            issues.push(...this.validatePayloadStructure(payload));
        }

        // Security validation
        if (this.config.validateSecurity) {
            issues.push(...this.validateSecurity(payload));
        }

        // Performance validation
        if (this.config.validatePerformance) {
            issues.push(...await this.validatePerformance(payload));
        }

        return this.createValidationResult(issues);
    }

    // Comprehensive project validation
    async validateProject(): Promise<SnapshotValidationResult> {
        const cacheKey = 'project-validation';
        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey)!;
        }

        const issues: SnapshotValidationIssue[] = [];
        const corrections: Correction[] = [];

        try {
            // Run all validators in parallel
            const [
                snapshotIssues,
                directoryCorrections,
                fileCorrections,
                packageCorrections,
                configCorrections,
                structureCorrections
            ] = await Promise.all([
                this.snapshotAnalyzer.analyzeSnapshotIssues(),
                this.directoryValidator.analyze(),
                this.fileValidator.analyze(),
                this.packageValidator.analyze(),
                this.configValidator.analyze(),
                this.structureValidator.analyze()
            ]);

            // Convert corrections to validation issues
            const allCorrections = [
                ...directoryCorrections,
                ...fileCorrections,
                ...packageCorrections,
                ...configCorrections,
                ...structureCorrections
            ];

            // Convert snapshot analyzer issues
            const snapshotValidationIssues = this.convertCorrectionsToIssues(snapshotIssues);

            // Convert structure validator corrections
            const structureValidationIssues = this.convertCorrectionsToIssues(allCorrections);

            // Combine all issues
            issues.push(...snapshotValidationIssues, ...structureValidationIssues);

            // Run custom rules
            if (this.config.customRules) {
                const customIssues = await this.runCustomRules(null);
                issues.push(...customIssues);
            }

        } catch (error) {
            issues.push({
                id: 'validation-error',
                type: 'structure',
                severity: 'high',
                message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
                location: 'project-root',
                suggestion: this.createStringSuggestion('Check validation configuration and project structure'),
                rule: 'validation-execution'
            });
        }

        const result = this.createValidationResult(issues);
        this.validationCache.set(cacheKey, result);

        return result;
    }

    // Specific validation methods for middleware
    async validateAddSnapshot(payload: any, store?: any): Promise<SnapshotValidationResult> {
        const issues: SnapshotValidationIssue[] = [];

        // Basic validation
        if (!payload) {
            issues.push({
                id: 'empty-payload',
                type: 'structure',
                severity: 'high',
                message: 'Payload cannot be empty',
                suggestion: this.createStringSuggestion('Provide a valid snapshot payload'),
                rule: 'non-empty-payload'
            });

            return this.createValidationResult(issues);
        }

        // Validate ID
        if (!payload.id) {
            issues.push({
                id: 'missing-id',
                type: 'structure',
                severity: 'high',
                message: 'Snapshot must have an ID',
                location: 'payload.id',
                suggestion: this.createStringSuggestion('Add a unique identifier to the snapshot'),
                rule: 'required-id'
            });
        } else if (typeof payload.id !== 'string' && typeof payload.id !== 'number') {
            issues.push({
                id: 'invalid-id-type',
                type: 'types',
                severity: 'medium',
                message: 'Snapshot ID must be string or number',
                location: 'payload.id',
                suggestion: this.createStringSuggestion('Use string or number for ID'),
                rule: 'valid-id-type'
            });
        }

        // Validate timestamp
        if (!payload.timestamp) {
            // Auto-add timestamp if missing
            payload.timestamp = new Date();
        } else {
            try {
                const timestamp = new Date(payload.timestamp);
                if (isNaN(timestamp.getTime())) {
                    issues.push({
                        id: 'invalid-timestamp',
                        type: 'types',
                        severity: 'medium',
                        message: 'Invalid timestamp format',
                        location: 'payload.timestamp',
                        suggestion: this.createStringSuggestion('Use ISO 8601 format or Date object'),
                        fix: 'payload.timestamp = new Date().toISOString()',
                        rule: 'valid-timestamp'
                    });
                }
            } catch (error) {
                issues.push({
                    id: 'timestamp-parsing-error',
                    type: 'types',
                    severity: 'medium',
                    message: 'Failed to parse timestamp',
                    location: 'payload.timestamp',
                    suggestion: this.createStringSuggestion('Use valid date format'),
                    rule: 'parsable-timestamp'
                });
            }
        }

        // Check for duplicate ID in store
        if (store && payload.id) {
            try {
                const existing = await store.findSnapshot(payload.id);
                if (existing) {
                    issues.push({
                        id: 'duplicate-id',
                        type: 'data',
                        severity: 'high',
                        message: `Snapshot with ID ${payload.id} already exists`,
                        location: 'payload.id',
                        suggestion: this.createStringSuggestion('Use a unique identifier'),
                        rule: 'unique-id'
                    });
                }
            } catch (error) {
                // Store query failed, but that's okay for validation
            }
        }

        // Validate data structure
        const structureResult = await this.validateSnapshotStructure(payload);
        issues.push(...structureResult.issues);

        return this.createValidationResult(issues);
    }

    async validateUpdateSnapshot(payload: any, store?: any): Promise<SnapshotValidationResult> {
        const issues: SnapshotValidationIssue[] = [];

        // Validate required fields for update
        if (!payload?.id) {
            issues.push({
                id: 'missing-update-id',
                type: 'structure',
                severity: 'high',
                message: 'Snapshot ID required for update',
                location: 'payload.id',
                suggestion: this.createStringSuggestion('Provide the ID of the snapshot to update'),
                rule: 'required-update-id'
            });

            return this.createValidationResult(issues);
        }

        if (!payload.updates || typeof payload.updates !== 'object') {
            issues.push({
                id: 'missing-updates',
                type: 'structure',
                severity: 'high',
                message: 'Updates object required',
                location: 'payload.updates',
                suggestion: this.createStringSuggestion('Provide an object with fields to update'),
                rule: 'required-updates'
            });

            return this.createValidationResult(issues);
        }

        // Check if snapshot exists in store
        if (store) {
            try {
                const existing = await store.findSnapshot(payload.id);
                if (!existing) {
                    issues.push({
                        id: 'snapshot-not-found',
                        type: 'data',
                        severity: 'high',
                        message: `Snapshot with ID ${payload.id} not found`,
                        location: 'payload.id',
                        suggestion: this.createStringSuggestion('Check the snapshot ID or create it first'),
                        rule: 'existing-snapshot'
                    });
                } else {
                    // Validate update fields exist in original
                    for (const field of Object.keys(payload.updates)) {
                        if (!(field in existing) && !field.startsWith('_')) {
                            issues.push({
                                id: `unknown-field-${field}`,
                                type: 'structure',
                                severity: 'medium',
                                message: `Field '${field}' does not exist in original snapshot`,
                                location: `payload.updates.${field}`,
                                suggestion: this.createStringSuggestion('Only update existing fields or add new ones explicitly'),
                                rule: 'valid-update-fields'
                            });
                        }
                    }
                }
            } catch (error) {
                // Store query failed, but that's okay for validation
            }
        }

        // Validate update data structure
        if (Object.keys(payload.updates).length > 0) {
            const updateValidation = await this.validateSnapshotStructure(payload.updates);
            issues.push(...updateValidation.issues.map(issue => ({
                ...issue,
                location: issue.location ? `payload.updates.${issue.location}` : 'payload.updates'
            })));
        }

        return this.createValidationResult(issues);
    }

    async validateRemoveSnapshot(payload: any, store?: any): Promise<SnapshotValidationResult> {
        const issues: SnapshotValidationIssue[] = [];

        if (!payload) {
            issues.push({
                id: 'empty-remove-payload',
                type: 'structure',
                severity: 'high',
                message: 'Snapshot ID or object required for removal',
                suggestion: this.createStringSuggestion('Provide a snapshot ID or object'),
                rule: 'non-empty-remove-payload'
            });

            return this.createValidationResult(issues);
        }

        const snapshotId = typeof payload === 'string' ? payload : payload.id;
        if (!snapshotId) {
            issues.push({
                id: 'missing-remove-identifier',
                type: 'structure',
                severity: 'high',
                message: 'Valid snapshot identifier required',
                location: 'payload',
                suggestion: this.createStringSuggestion('Provide string ID or object with id property'),
                rule: 'valid-remove-identifier'
            });
        }

        // Check if snapshot exists in store
        if (store && snapshotId) {
            try {
                const existing = await store.findSnapshot(snapshotId);
                if (!existing) {
                    issues.push({
                        id: 'remove-non-existent',
                        type: 'warning',
                        severity: 'low',
                        message: `Snapshot with ID ${snapshotId} not found (removal may be redundant)`,
                        location: 'payload',
                        suggestion: this.createStringSuggestion('Verify the snapshot exists before removal'),
                        rule: 'existing-removal-target'
                    });
                }
            } catch (error) {
                // Store query failed, but that's okay for validation
            }
        }

        return this.createValidationResult(issues);
    }

    // Helper methods
    private validateBasicStructure(snapshot: any): SnapshotValidationIssue[] {
        const issues: SnapshotValidationIssue[] = [];

        // Check if snapshot is an object
        if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
            issues.push({
                id: 'invalid-snapshot-type',
                type: 'structure',
                severity: 'high',
                message: 'Snapshot must be an object',
                suggestion: this.createStringSuggestion('Provide a valid object as snapshot'),
                rule: 'object-type'
            });
            return issues;
        }

        // Check for circular references
        try {
            JSON.stringify(snapshot);
        } catch (error) {
            issues.push({
                id: 'circular-reference',
                type: 'structure',
                severity: 'high',
                message: 'Snapshot contains circular references',
                suggestion: this.createStringSuggestion('Remove circular references or use custom serialization'),
                rule: 'no-circular-references'
            });
        }

        // Check size limits (optional)
        const snapshotSize = JSON.stringify(snapshot).length;
        if (snapshotSize > 1024 * 1024) { // 1MB limit
            issues.push({
                id: 'snapshot-too-large',
                type: 'performance',
                severity: 'medium',
                message: `Snapshot is large (${Math.round(snapshotSize / 1024)}KB)`,
                suggestion: this.createStringSuggestion('Consider splitting large snapshots or compressing data'),
                rule: 'size-limit'
            });
        }

        return issues;
    }

    private async validateDataModel(snapshot: any): Promise<SnapshotValidationIssue[]> {
        const issues: SnapshotValidationIssue[] = [];

        // Check for required data model fields
        const modelFields = ['data', 'metadata', 'version'];

        for (const field of modelFields) {
            if (!(field in snapshot)) {
                issues.push({
                    id: `missing-model-field-${field}`,
                    type: 'structure',
                    severity: field === 'data' ? 'high' : 'medium',
                    message: `Missing recommended field: ${field}`,
                    location: `snapshot.${field}`,
                    suggestion: this.createStringSuggestion(`Add ${field} property to snapshot`),
                    fix: field === 'version' ? 'snapshot.version = "1.0.0"' : undefined,
                    rule: 'data-model-completeness'
                });
            }
        }

        // Validate data field
        if (snapshot.data) {
            if (typeof snapshot.data !== 'object' || snapshot.data === null) {
                issues.push({
                    id: 'invalid-data-field',
                    type: 'types',
                    severity: 'high',
                    message: 'Data field must be an object',
                    location: 'snapshot.data',
                    suggestion: this.createStringSuggestion('Provide object for data field'),
                    rule: 'object-data'
                });
            }
        }

        // Validate metadata field
        if (snapshot.metadata && typeof snapshot.metadata !== 'object') {
            issues.push({
                id: 'invalid-metadata-field',
                type: 'types',
                severity: 'medium',
                message: 'Metadata must be an object',
                location: 'snapshot.metadata',
                suggestion: this.createStringSuggestion('Provide object for metadata or remove it'),
                rule: 'object-metadata'
            });
        }

        return issues;
    }

    private validateSnapshotTypes(snapshot: any): SnapshotValidationIssue[] {
        const issues: SnapshotValidationIssue[] = [];

        // Type validation rules
        const typeRules = [
            {
                field: 'id',
                expectedType: ['string', 'number'],
                required: true,
                severity: 'high' as ValidationSeverity
            },
            {
                field: 'timestamp',
                expectedType: ['string', 'object'], // Date object or ISO string
                required: false,
                severity: 'medium'
            },
            {
                field: 'version',
                expectedType: ['string'],
                required: false,
                severity: 'low'
            },
            {
                field: 'data',
                expectedType: ['object'],
                required: true,
                severity: 'high'
            }
        ];

        for (const rule of typeRules) {
            const value = snapshot[rule.field];

            if (rule.required && value === undefined) {
                continue; // Already handled by required field validation
            }

            if (value !== undefined) {
                const actualType = Array.isArray(value) ? 'array' : typeof value;
                const isValidType = rule.expectedType.includes(actualType) ||
                    (rule.expectedType.includes('object') && actualType === 'object' && value !== null);

                if (!isValidType) {
                    issues.push({
                        id: `invalid-type-${rule.field}`,
                        type: 'types',
                        severity: rule.severity,
                        message: `Field '${rule.field}' has invalid type. Expected: ${rule.expectedType.join(' or ')}, Got: ${actualType}`,
                        location: `snapshot.${rule.field}`,
                        suggestion: this.createStringSuggestion(`Change ${rule.field} to correct type`),
                        rule: 'type-consistency'
                    });
                }
            }
        }

        return issues;
    }

    private validatePayloadStructure(payload: any): SnapshotValidationIssue[] {
        const issues: SnapshotValidationIssue[] = [];

        // Check for common payload issues
        if (payload._id && !payload.id) {
            issues.push({
                id: 'underscore-id',
                type: 'structure',
                severity: 'low',
                message: 'Using _id instead of id',
                location: 'payload._id',
                suggestion: this.createStringSuggestion('Consider standardizing on id field'),
                fix: 'payload.id = payload._id; delete payload._id;',
                rule: 'standard-id-field'
            });
        }

        // Check for MongoDB-style ObjectId
        if (payload._id && typeof payload._id === 'object' && payload._id.$oid) {
            issues.push({
                id: 'mongodb-objectid',
                type: 'compatibility',
                severity: 'medium',
                message: 'Using MongoDB ObjectId format',
                location: 'payload._id',
                suggestion: this.createStringSuggestion('Convert to string ID for compatibility'),
                fix: 'payload.id = payload._id.$oid;',
                rule: 'standard-id-format'
            });
        }

        return issues;
    }

    private validateSecurity(payload: any): SnapshotValidationIssue[] {
        const issues: SnapshotValidationIssue[] = [];

        // Check for potential security issues
        const sensitivePatterns = [
            { pattern: /password/i, field: 'password' },
            { pattern: /token/i, field: 'token' },
            { pattern: /secret/i, field: 'secret' },
            { pattern: /key/i, field: 'key' },
            { pattern: /auth/i, field: 'auth' }
        ];

        // Recursive function to check nested objects
        const checkForSensitiveData = (obj: any, path: string = '') => {
            if (!obj || typeof obj !== 'object') return;

            for (const [key, value] of Object.entries(obj)) {
                const fullPath = path ? `${path}.${key}` : key;

                // Check key names
                for (const { pattern, field } of sensitivePatterns) {
                    if (pattern.test(key) && typeof value === 'string' && value.length > 0) {
                        issues.push({
                            id: `sensitive-data-${field}-${key}`,
                            type: 'security',
                            severity: 'high',
                            message: `Potential sensitive data in field: ${fullPath}`,
                            location: fullPath,
                            suggestion: this.createStringSuggestion('Avoid storing sensitive data in snapshots'),
                            rule: 'no-sensitive-data'
                        });
                    }
                }

                // Recursively check nested objects
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    checkForSensitiveData(value, fullPath);
                }
            }
        };

        checkForSensitiveData(payload);

        return issues;
    }

    private async validatePerformance(payload: any): Promise<SnapshotValidationIssue[]> {
        const issues: SnapshotValidationIssue[] = [];

        // Performance validation
        const payloadStr = JSON.stringify(payload);
        const sizeKB = payloadStr.length / 1024;

        if (sizeKB > 100) { // 100KB threshold
            issues.push({
                id: 'large-payload',
                type: 'performance',
                severity: 'medium',
                message: `Large payload size: ${Math.round(sizeKB)}KB`,
                suggestion: this.createStringSuggestion('Consider compressing or paginating large payloads'),
                rule: 'payload-size-limit'
            });
        }

        // Check for nested depth
        const maxDepth = this.calculateObjectDepth(payload);
        if (maxDepth > 10) {
            issues.push({
                id: 'deeply-nested',
                type: 'performance',
                severity: 'low',
                message: `Deeply nested object (depth: ${maxDepth})`,
                suggestion: this.createStringSuggestion('Flatten nested structures for better performance'),
                rule: 'nesting-depth-limit'
            });
        }

        return issues;
    }


    private createValidationIssue(
        id: string,
        type: ValidationCategory,
        severity: ValidationSeverity,
        message: string,
        options?: {
            location?: string;
            suggestion?: string | ValidationSuggestion;
            fix?: string;
            rule?: string;
            metadata?: Record<string, any>;
        }
        ): SnapshotValidationIssue {
        const suggestion = options?.suggestion 
            ? (typeof options.suggestion === 'string' 
                ? this.createStringSuggestion(options.suggestion)
                : options.suggestion)
            : undefined;

        return {
            id,
            type,
            severity,
            message,
            location: options?.location,
            suggestion,
            fix: options?.fix,
            rule: options?.rule,
            metadata: options?.metadata
        };
    }
    
    private validateFieldType(field: string, value: any, fieldSchema: any): SnapshotValidationIssue[] {
        const issues: SnapshotValidationIssue[] = [];

        // Check type
        if (fieldSchema.type) {
            const expectedType = fieldSchema.type;
            const actualType = Array.isArray(value) ? 'array' : typeof value;

            if (expectedType === 'array' && !Array.isArray(value)) {
                issues.push({
                    id: `type-mismatch-${field}`,
                    type: 'types',
                    severity: 'medium',
                    message: `Field '${field}' must be array, got ${actualType}`,
                    location: `snapshot.${field}`,
                    suggestion: this.createStringSuggestion(`Change ${field} to array type`),
                    rule: 'schema-type-match'
                });
            } else if (expectedType !== 'array' && actualType !== expectedType) {
                issues.push({
                    id: `type-mismatch-${field}`,
                    type: 'types',
                    severity: 'medium',
                    message: `Field '${field}' must be ${expectedType}, got ${actualType}`,
                    location: `snapshot.${field}`,
                    suggestion: this.createStringSuggestion(`Change ${field} to ${expectedType} type`),
                    rule: 'schema-type-match'
                });
            }
        }

        // Check enum values
        if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
            issues.push({
                id: `invalid-enum-${field}`,
                type: 'types',
                severity: 'medium',
                message: `Field '${field}' must be one of: ${fieldSchema.enum.join(', ')}`,
                location: `snapshot.${field}`,
                suggestion: this.createStringSuggestion(`Use one of the allowed values`),
                rule: 'enum-validation'
            });
        }

        // Check min/max for numbers
        if (typeof value === 'number') {
            if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
                issues.push({
                    id: `below-minimum-${field}`,
                    type: 'types',
                    severity: 'medium',
                    message: `Field '${field}' must be >= ${fieldSchema.minimum}`,
                    location: `snapshot.${field}`,
                    suggestion: this.createStringSuggestion(`Increase value to at least ${fieldSchema.minimum}`),
                    rule: 'minimum-value'
                });
            }

            if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
                issues.push({
                    id: `above-maximum-${field}`,
                    type: 'types',
                    severity: 'medium',
                    message: `Field '${field}' must be <= ${fieldSchema.maximum}`,
                    location: `snapshot.${field}`,
                    suggestion: this.createStringSuggestion(`Decrease value to at most ${fieldSchema.maximum}`),
                    rule: 'maximum-value'
                });
            }
        }

        // Check min/max length for strings
        if (typeof value === 'string') {
            if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
                issues.push({
                    id: `too-short-${field}`,
                    type: 'types',
                    severity: 'medium',
                    message: `Field '${field}' must be at least ${fieldSchema.minLength} characters`,
                    location: `snapshot.${field}`,
                    suggestion: this.createStringSuggestion(`Increase length to at least ${fieldSchema.minLength}`),
                    rule: 'minimum-length'
                });
            }

            if (fieldSchema.maxLength !== undefined && value.length > fieldSchema.maxLength) {
                issues.push({
                    id: `too-long-${field}`,
                    type: 'types',
                    severity: 'medium',
                    message: `Field '${field}' must be at most ${fieldSchema.maxLength} characters`,
                    location: `snapshot.${field}`,
                    suggestion: this.createStringSuggestion(`Decrease length to at most ${fieldSchema.maxLength}`),
                    rule: 'maximum-length'
                });
            }
        }

        return issues;
    }
    private async runCustomRules(snapshot: any): Promise<SnapshotValidationIssue[]> {
        const issues: SnapshotValidationIssue[] = [];

        if (!this.config.customRules) {
            return issues;
        }

        for (const rule of this.config.customRules) {
            try {
                const isValid = await rule.condition(snapshot, { projectRoot: this.projectRoot });

                if (!isValid) {
                    const fix = typeof rule.fix === 'function' ? rule.fix(snapshot) : rule.fix;

                    issues.push(this.createValidationIssue(
                        `custom-rule-${rule.name}`,
                        rule.category,
                        rule.severity,
                        rule.message,
                        {
                            suggestion: fix || 'Review and fix according to custom rule',
                            fix: typeof fix === 'string' ? fix : undefined,
                            rule: rule.name,
                            metadata: { description: rule.description }
                        }
                    ));
                }
            } catch (error) {
                issues.push(this.createValidationIssue(
                    `custom-rule-error-${rule.name}`,
                    'configuration',
                    'medium',
                    `Custom rule '${rule.name}' failed to execute`,
                    {
                        suggestion: 'Check rule implementation',
                        rule: 'custom-rule-execution',
                        metadata: { error: error instanceof Error ? error.message : String(error) }
                    }
                ));
            }
        }

        return issues;
    }
    private convertCorrectionsToIssues(corrections: Correction[]): SnapshotValidationIssue[] {
        return corrections.map(correction => {
            // Helper function to map CorrectionType to ValidationCategory
            const mapType = (correctionType: CorrectionType): ValidationCategory => {
                const typeMap: Partial<Record<CorrectionType, ValidationCategory>> = {
                    'error': 'types',
                    'types': 'types',
                    'warning': 'structure',
                    'suggestion': 'structure',
                    'info': 'structure',
                    'critical': 'security'
                };
                return typeMap[correctionType] || 'structure';
            };

            // Helper function to map CorrectionSeverity to ValidationSeverity
            const mapSeverity = (severity: CorrectionSeverity): ValidationSeverity => {
                const severityMap: Record<CorrectionSeverity, ValidationSeverity> = {
                    'critical': 'critical',
                    'high': 'high',
                    'medium': 'medium',
                    'low': 'low'
                };
                return severityMap[severity] || 'medium';
            };

            // Helper function to map CorrectionCategory to ValidationCategory
            const mapCategory = (category: CorrectionCategory): ValidationCategory => {
                const categoryMap: Record<CorrectionCategory, ValidationCategory> = {
                    'compilation': 'types',
                    'runtime': 'performance',
                    'security': 'security',
                    'performance': 'performance',
                    'structure': 'structure',
                    'maintainability': 'structure',
                    'compatibility': 'compatibility',
                    'readability': 'structure',
                    'dependencies': 'dependency',
                    'native-modules': 'dependency',
                    'ios': 'platform',
                    'configuration': 'configuration',
                    'quality': 'structure',
                    'ui': 'structure',
                    'development': 'configuration',
                    'deployment': 'configuration',
                    'linting': 'configuration',
                    'import': 'types',
                    'nextjs': 'platform',
                    'bundler': 'configuration',
                    'formatting': 'configuration',
                    'styling': 'configuration',
                    'testing': 'configuration',
                    'authentication': 'security',
                    'database': 'structure',
                    'api': 'structure',
                    'mobile': 'platform',
                    'web3': 'platform',
                    'filesystem': 'structure',
                    'general': 'structure',
                    'network': 'structure',
                    'platform': 'platform',
                    'types': 'types',
                    'react': 'platform',
                    'imports': 'types',
                    'react-native': 'platform',
                    'function': 'structure',
                    'class': 'structure',
                    'education': 'general',
                    'type_error': 'types',
                    'scripts': 'configuration',
                    'data': 'data', 
                    'dependency': 'dependency'
                    } as const; // Use const assertion for better type inference


                return categoryMap[category] || 'structure';
            };

            // Determine the type (prioritize category, fall back to type)
            const type: ValidationCategory = correction.category
                ? mapCategory(correction.category)
                : mapType(correction.type);

            // Determine severity
            const severity: ValidationSeverity = mapSeverity(correction.severity);

            // Convert fix to proper suggestion type
            let suggestion: ValidationSuggestion | undefined;
            let fix: string | undefined;

            if (correction.fix) {
                if (typeof correction.fix === 'string') {
                    // String fix
                    suggestion = {
                        type: 'string',
                        value: correction.fix
                    };
                    fix = correction.fix;
                } else if (this.isImportFix(correction.fix)) {
                    // ImportFix object
                    suggestion = {
                        type: 'import-fix',
                        value: correction.fix
                    };
                    fix = JSON.stringify(correction.fix);
                } else if (typeof correction.fix === 'object' && 'code' in correction.fix) {
                    // Code suggestion
                    suggestion = {
                        type: 'code',
                        value: {
                            code: correction.fix.code,
                            language: correction.fix.language,
                            title: correction.fix.title
                        }
                    };
                    fix = correction.fix.code;
                } else {
                    // Generic object, stringify it
                    const stringValue = JSON.stringify(correction.fix);
                    suggestion = {
                        type: 'string',
                        value: stringValue
                    };
                    fix = stringValue;
                }
            }

            // Create the validation issue
            const issue: SnapshotValidationIssue = {
                id: correction.id,
                type,
                severity,
                message: correction.message,
                location: correction.file,
                codeSnippet: correction.code,
                suggestion,
                fix,
                rule: 'analyzer-generated',
                metadata: {
                    originalType: correction.type,
                    originalCategory: correction.category,
                    timestamp: correction.timestamp
                }
            };

            return issue;
        });
    }

    // Type guard for ImportFix
    private isImportFix(obj: any): obj is ImportFix {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            typeof obj.filePath === 'string' &&
            typeof obj.originalLine === 'string' &&
            typeof obj.newLine === 'string' &&
            Array.isArray(obj.missingTypes) &&
            typeof obj.targetImportPath === 'string'
        );
    }

    private createValidationResult(issues: SnapshotValidationIssue[]): SnapshotValidationResult {
        const errors = issues.filter(issue =>
            issue.severity === 'critical' || issue.severity === 'high'
        );

        const warnings = issues.filter(issue =>
            issue.severity === 'medium' || issue.severity === 'low' 
        );

        // Calculate validation score (0-100)
        const score = issues.length === 0 ? 100 :
            Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

        return {
            isValid: errors.length === 0,
            issues,
            warnings,
            errors,
            score,
            timestamp: new Date(),
            validator: 'SnapshotValidators'
        };
    }

    private calculateObjectDepth(obj: any): number {
        if (!obj || typeof obj !== 'object') return 0;

        let maxDepth = 0;

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    const depth = 1 + this.calculateObjectDepth(value);
                    maxDepth = Math.max(maxDepth, depth);
                }
            }
        }

        return maxDepth;
    }

    // Utility methods
    clearCache(): void {
        this.validationCache.clear();
    }

    updateConfig(newConfig: Partial<SnapshotValidationConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.clearCache();
    }

    getConfig(): SnapshotValidationConfig {
        return { ...this.config };
    }
}

Singleton instance for easy import
export const snapshotValidators = new SnapshotValidators();

Example custom rules
export const defaultCustomRules: SnapshotValidationRule[] = [
    {
        name: 'no-empty-data',
        description: 'Snapshot data should not be empty',
        condition: (snapshot) => {
            return !snapshot.data ||
                (typeof snapshot.data === 'object' && Object.keys(snapshot.data).length > 0);
        },
        message: 'Snapshot data is empty',
        severity: 'medium',
        category: 'data',
        fix: 'Add meaningful data to the snapshot'
    },
    {
        name: 'has-version',
        description: 'Snapshot should have a version for compatibility',
        condition: (snapshot) => !!snapshot.version,
        message: 'Snapshot missing version field',
        severity: 'low',
        category: 'compatibility',
        fix: 'snapshot.version = "1.0.0"'
    }
];