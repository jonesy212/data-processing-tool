// src/app/error-analyzer/phases/DynamicPhaseSystem.ts

import { TypeScriptDiagnosticPhase } from '@/app/error-analyzer/phases/TypeScriptDiagnosticPhase';
import { ASTParserUtils } from '@/app/error-analyzer/utils/ASTParserUtils';
import { CodePatternDetector } from '@/app/error-analyzer/utils/CodePatternDetector';
import { ImportErrorSummaryGenerator } from '@/app/generators/corrections/ImportErrorSummary';
import { PhaseBackupSystem } from '@/app/models/phases/PhaseBackupSystem';
import { ExecutionContext, PhaseDefinition } from '@/app/models/phases/PhaseSystem';
import fs from 'fs';
import path from 'path';
// ========== TYPE DEFINITIONS ==========

export interface EntityAnalysis {
  entityName: string;
  filePath: string;
  hasTypeContext: boolean;
  patterns: Array<{
    name: string;
    description: string;
    context: string;
    line: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  dependencies: string[];
  circularDependencies: string[][];
  importErrors: number;
  typeErrors: number;
  configParams: {
    hasT: boolean;
    hasK: boolean;
    hasMeta: boolean;
    hasAttachment: boolean;
    hasExcludedFields: boolean;
    hasIncludedFields: boolean;
  };
  snapshotUsage: {
    usesSnapshot: boolean;
    usesSnapshotUnion: boolean;
    usesSnapshotWithCriteria: boolean;
    customConfigPatterns: string[];
  };
  phaseCompatibility: {
    canExecute: boolean;
    requiredAdapters: string[];
    testablePatterns: string[];
  };
}

export interface PatternAnalysis {
  patternName: string;
  entityCount: number;
  totalUsages: number;
  files: string[];
  variations: Map<string, number>;
  compatibilityMatrix: Map<string, string[]>;
}

export interface PhaseContext extends ExecutionContext {
  projectRoot: string;
  entityAnalysis: Map<string, EntityAnalysis>;
  patternAnalysis: Map<string, PatternAnalysis>;
  testResults: Map<string, any>;
  backupSystem: PhaseBackupSystem;
  config: PhaseSystemConfig;
}

export interface PhaseSystemConfig {
  entityDirectory: string;
  backupEnabled: boolean;
  validationStrictness: 'strict' | 'moderate' | 'lenient';
  autoFixPatterns: boolean;
  generateReports: boolean;
  parallelProcessing: boolean;
  maxConcurrentPhases: number;
}

export interface PhaseExecutionResult {
  phaseId: string;
  entityName: string;
  success: boolean;
  changes: Array<{
    type: 'add' | 'remove' | 'modify';
    description: string;
    location: string;
    diff?: string;
  }>;
  warnings: string[];
  errors: string[];
  duration: number;
  backupId?: string;
}

// ========== PATTERN DETECTION UTILITIES ==========

export class PatternAnalyzer {
  private typeIndicators = [
    ':',
    'interface',
    'type ',
    '=>',
    '<',
    'extends',
    'implements',
    'as ',
    'satisfies',
    'typeof',
    'keyof',
    'infer',
    'readonly',
    'partial',
    'required',
    'pick',
    'omit',
    'record',
    'promise',
    'array<'
  ];

  private snapshotPatterns = {
    snapshotUnion: /SnapshotUnion\s*<[^>]*>/g,
    snapshotConfigParams: /SnapshotConfigParams\s*<[^>]*>/g,
    updateSnapshotParams: /UpdateSnapshotParams\s*<[^>]*>/g,
    withCriteria: /SnapshotWithCriteria\s*<[^>]*>/g
  };

  private configPatterns = [
    { pattern: /T extends BaseDataEntity/, name: 'BaseDataEntity-T' },
    { pattern: /K extends T/, name: 'Generic-K-extends-T' },
    { pattern: /Meta extends DefaultMeta/, name: 'DefaultMeta-Meta' },
    { pattern: /AttachmentType extends Attachment/, name: 'Attachment-Type' },
    { pattern: /ExcludedFields extends keyof T/, name: 'ExcludedFields' },
    { pattern: /IncludedFields extends keyof T/, name: 'IncludedFields' },
    { pattern: /type\s+\w+\s*=\s*\[\s*T\s*,\s*K\s*,\s*Meta/, name: 'Config-Tuple' },
    { pattern: /interface\s+\w+\s*<\s*T\s*,\s*K\s*,\s*Meta/, name: 'Generic-Interface' }
  ];

async analyzeEntity(content: string, filePath: string): Promise<EntityAnalysis> {
    const astParser = new ASTParserUtils();
    const codeDetector = new CodePatternDetector();
    
    const { types, imports } = astParser.parseSourceFile(
      astParser['createSourceFile'](filePath, content, 99, true),
      filePath
    );

    // Check for type context
    const hasTypeContext = this.checkTypeContext(content);
    
    // Detect config parameter usage
    const configParams = this.analyzeConfigParams(content);
    
    // Detect snapshot usage
    const snapshotUsage = this.analyzeSnapshotUsage(content);
    
    // Extract dependencies from imports
    const dependencies = imports.map(i => i.module);
    
    // Find circular dependencies
    const circularDependencies = astParser.detectCircularDependencies(filePath);
    
    // Find patterns
    const patternMatches = codeDetector.detectPatterns(content, filePath);
    const patterns = patternMatches.map(match => ({
      name: match.pattern.name,
      description: match.pattern.description,
      context: match.context,
      line: match.line,
      severity: match.pattern.severity
    }));

    return {
      entityName: path.basename(filePath, '.ts'),
      filePath,
      hasTypeContext,
      patterns,
      dependencies,
      circularDependencies: await circularDependencies,
      importErrors: 0, // Would be calculated
      typeErrors: 0, // Would be calculated
      configParams,
      snapshotUsage,
      phaseCompatibility: this.analyzePhaseCompatibility(content, configParams, snapshotUsage)
    };
  }

  private checkTypeContext(content: string): boolean {
    const lines = content.split('\n');
    
    for (const line of lines) {
      for (const indicator of this.typeIndicators) {
        if (line.includes(indicator)) {
          return true;
        }
      }
    }
    
    return false;
  }

  private analyzeConfigParams(content: string): EntityAnalysis['configParams'] {
    return {
      hasT: /T\s+extends\s+BaseDataEntity/.test(content),
      hasK: /K\s+extends\s+T/.test(content),
      hasMeta: /Meta\s+extends\s+DefaultMeta/.test(content),
      hasAttachment: /AttachmentType\s+extends\s+Attachment/.test(content),
      hasExcludedFields: /ExcludedFields\s+extends\s+keyof\s+T/.test(content),
      hasIncludedFields: /IncludedFields\s+extends\s+keyof\s+T/.test(content)
    };
  }

  private analyzeSnapshotUsage(content: string): EntityAnalysis['snapshotUsage'] {
    const customPatterns: string[] = [];
    
    for (const [patternName, regex] of Object.entries(this.snapshotPatterns)) {
      if (regex.test(content)) {
        customPatterns.push(patternName);
      }
    }
    
    return {
      usesSnapshot: /Snapshot\s*</.test(content),
      usesSnapshotUnion: /SnapshotUnion\s*</.test(content),
      usesSnapshotWithCriteria: /SnapshotWithCriteria\s*</.test(content),
      customConfigPatterns: customPatterns
    };
  }

  private analyzePhaseCompatibility(
    content: string,
    configParams: EntityAnalysis['configParams'],
    snapshotUsage: EntityAnalysis['snapshotUsage']
  ): EntityAnalysis['phaseCompatibility'] {
    const requiredAdapters: string[] = [];
    const testablePatterns: string[] = [];
    let canExecute = true;

    // Check if entity has required generic parameters
    if (!configParams.hasT) {
      canExecute = false;
      requiredAdapters.push('BaseDataEntity-parameter-T');
    }

    // Check for snapshot compatibility
    if (snapshotUsage.usesSnapshotUnion) {
      testablePatterns.push('snapshot-union-pattern');
    }

    if (snapshotUsage.usesSnapshotWithCriteria) {
      testablePatterns.push('snapshot-with-criteria');
    }

    // Check for configuration pattern compatibility
    const hasTuplePattern = /type\s+\w+\s*=\s*\[\s*T\s*,\s*K/.test(content);
    const hasInterfacePattern = /interface\s+\w+\s*<\s*T\s*,\s*K/.test(content);

    if (hasTuplePattern) {
      testablePatterns.push('config-tuple-pattern');
    }

    if (hasInterfacePattern) {
      testablePatterns.push('generic-interface-pattern');
    }

    return {
      canExecute,
      requiredAdapters,
      testablePatterns
    };
  }
}

// ========== DYNAMIC PHASE EXECUTOR ==========

export class DynamicPhaseExecutor {
  private context: PhaseContext;
  private patternAnalyzer: PatternAnalyzer;
  private phaseRegistry: Map<string, PhaseDefinition>;
  private executionHistory: PhaseExecutionResult[] = [];

  constructor(config: Partial<PhaseSystemConfig> = {}) {
    this.context = {
      projectRoot: config.entityDirectory || process.cwd(),
      entityAnalysis: new Map(),
      patternAnalysis: new Map(),
      testResults: new Map(),
      backupSystem: new PhaseBackupSystem(),
      config: {
        entityDirectory: config.entityDirectory || process.cwd(),
        backupEnabled: config.backupEnabled !== undefined ? config.backupEnabled : true,
        validationStrictness: config.validationStrictness || 'moderate',
        autoFixPatterns: config.autoFixPatterns !== undefined ? config.autoFixPatterns : true,
        generateReports: config.generateReports !== undefined ? config.generateReports : true,
        parallelProcessing: config.parallelProcessing !== undefined ? config.parallelProcessing : false,
        maxConcurrentPhases: config.maxConcurrentPhases || 3
      },
      results: new Map(),
      diagnostics: [],
     
    };

    this.patternAnalyzer = new PatternAnalyzer();
    this.phaseRegistry = this.createDynamicPhaseRegistry();
  }

  private createDynamicPhaseRegistry(): Map<string, PhaseDefinition> {
    const phases: PhaseDefinition[] = [
      // PHASE 1: Entity Discovery
      {
        id: 'entity-discovery',
        name: 'Entity Discovery Phase',
        description: 'Scan and analyze all entity files in the project',
        dependencies: [],
        milestones: [
          {
            id: 'scan-directory',
            name: 'Scan Entity Directory',
            execute: async (ctx: PhaseContext) => await this.scanEntityDirectory(ctx)
          },
          {
            id: 'analyze-entities',
            name: 'Analyze Entity Patterns',
            execute: async (ctx: PhaseContext) => await this.analyzeAllEntities(ctx)
          },
          {
            id: 'generate-inventory',
            name: 'Generate Entity Inventory',
            execute: async (ctx: PhaseContext) => await this.generateEntityInventory(ctx)
          }
        ]
      },

      // PHASE 2: Pattern Analysis
      {
        id: 'pattern-analysis',
        name: 'Pattern Analysis Phase',
        description: 'Analyze patterns across all entities',
        dependencies: ['entity-discovery'],
        milestones: [
          {
            id: 'detect-patterns',
            name: 'Detect Common Patterns',
            execute: async (ctx: PhaseContext) => await this.detectCommonPatterns(ctx)
          },
          {
            id: 'analyze-configurations',
            name: 'Analyze Configuration Patterns',
            execute: async (ctx: PhaseContext) => await this.analyzeConfigurationPatterns(ctx)
          },
          {
            id: 'build-compatibility-matrix',
            name: 'Build Compatibility Matrix',
            execute: async (ctx: PhaseContext) => await this.buildCompatibilityMatrix(ctx)
          }
        ]
      },

      // PHASE 3: Type Safety Validation
      {
        id: 'type-validation',
        name: 'Type Safety Validation',
        description: 'Validate type consistency across patterns',
        dependencies: ['pattern-analysis'],
        milestones: [
          {
            id: 'validate-generics',
            name: 'Validate Generic Parameters',
            execute: async (ctx: PhaseContext) => await this.validateGenericParameters(ctx)
          },
          {
            id: 'check-type-consistency',
            name: 'Check Type Consistency',
            execute: async (ctx: PhaseContext) => await this.checkTypeConsistency(ctx)
          },
          {
            id: 'detect-type-errors',
            name: 'Detect Type Errors',
            execute: async (ctx: PhaseContext) => await this.detectTypeErrors(ctx)
          }
        ]
      },

      // PHASE 4: Pattern Standardization
      {
        id: 'pattern-standardization',
        name: 'Pattern Standardization',
        description: 'Standardize patterns across entities',
        dependencies: ['type-validation'],
        milestones: [
          {
            id: 'identify-deviations',
            name: 'Identify Pattern Deviations',
            execute: async (ctx: PhaseContext) => await this.identifyPatternDeviations(ctx)
          },
          {
            id: 'generate-fixes',
            name: 'Generate Standardization Fixes',
            execute: async (ctx: PhaseContext) => await this.generateStandardizationFixes(ctx)
          },
          {
            id: 'apply-standardization',
            name: 'Apply Pattern Standardization',
            execute: async (ctx: PhaseContext) => await this.applyPatternStandardization(ctx)
          }
        ]
      },

      // PHASE 5: Interchangeability Testing
      {
        id: 'interchangeability-testing',
        name: 'Interchangeability Testing',
        description: 'Test parameter interchangeability between patterns',
        dependencies: ['pattern-standardization'],
        milestones: [
          {
            id: 'test-parameter-swapping',
            name: 'Test Parameter Swapping',
            execute: async (ctx: PhaseContext) => await this.testParameterSwapping(ctx)
          },
          {
            id: 'test-config-patterns',
            name: 'Test Configuration Patterns',
            execute: async (ctx: PhaseContext) => await this.testConfigurationPatterns(ctx)
          },
          {
            id: 'test-snapshot-compatibility',
            name: 'Test Snapshot Compatibility',
            execute: async (ctx: PhaseContext) => await this.testSnapshotCompatibility(ctx)
          }
        ]
      },

      // PHASE 6: Fix Application
      {
        id: 'fix-application',
        name: 'Fix Application Phase',
        description: 'Apply fixes and validate changes',
        dependencies: ['interchangeability-testing'],
        milestones: [
          {
            id: 'apply-fixes',
            name: 'Apply Automated Fixes',
            execute: async (ctx: PhaseContext) => await this.applyAutomatedFixes(ctx)
          },
          {
            id: 'validate-fixes',
            name: 'Validate Applied Fixes',
            execute: async (ctx: PhaseContext) => await this.validateAppliedFixes(ctx)
          },
          {
            id: 'generate-report',
            name: 'Generate Final Report',
            execute: async (ctx: PhaseContext) => await this.generateFinalReport(ctx)
          }
        ]
      }
    ];

    return new Map(phases.map(p => [p.id, p]));
  }

  // ========== MILESTONE IMPLEMENTATIONS ==========

  private async scanEntityDirectory(ctx: PhaseContext): Promise<EntityAnalysis[]> {
    const entityDir = ctx.config.entityDirectory;
    console.log(`📁 Scanning entity directory: ${entityDir}`);
    
    if (!fs.existsSync(entityDir)) {
      throw new Error(`Entity directory not found: ${entityDir}`);
    }

    const entities: EntityAnalysis[] = [];
    const files = this.getAllFiles(entityDir, ['.ts']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const analysis = this.patternAnalyzer.analyzeEntity(content, file);
      ctx.entityAnalysis.set(analysis.entityName, analysis);
      entities.push(analysis);
    }

    console.log(`✅ Found ${entities.length} entity files`);
    return entities;
  }

  private async analyzeAllEntities(ctx: PhaseContext): Promise<Map<string, PatternAnalysis>> {
    console.log('🔍 Analyzing entity patterns...');
    
    const patternMap = new Map<string, PatternAnalysis>();
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      // Analyze patterns in this entity
      for (const pattern of analysis.patterns) {
        if (!patternMap.has(pattern.name)) {
          patternMap.set(pattern.name, {
            patternName: pattern.name,
            entityCount: 0,
            totalUsages: 0,
            files: [],
            variations: new Map(),
            compatibilityMatrix: new Map()
          });
        }
        
        const patternAnalysis = patternMap.get(pattern.name)!;
        patternAnalysis.entityCount++;
        patternAnalysis.totalUsages++;
        patternAnalysis.files.push(analysis.filePath);
        
        // Track variations
        const variationKey = `${pattern.severity}-${pattern.context.substring(0, 50)}`;
        patternAnalysis.variations.set(variationKey, 
          (patternAnalysis.variations.get(variationKey) || 0) + 1);
      }
    }
    
    ctx.patternAnalysis = patternMap;
    console.log(`📊 Analyzed ${patternMap.size} unique patterns`);
    return patternMap;
  }

  private async generateEntityInventory(ctx: PhaseContext): Promise<string> {
    const inventory: any[] = [];
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      inventory.push({
        entityName,
        filePath: analysis.filePath,
        hasTypeContext: analysis.hasTypeContext,
        configParams: analysis.configParams,
        snapshotUsage: analysis.snapshotUsage,
        phaseCompatibility: analysis.phaseCompatibility,
        totalPatterns: analysis.patterns.length,
        importErrors: analysis.importErrors,
        typeErrors: analysis.typeErrors
      });
    }
    
    const inventoryPath = path.join(ctx.projectRoot, 'entity-inventory.json');
    fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
    
    console.log(`📋 Entity inventory saved to: ${inventoryPath}`);
    return inventoryPath;
  }

  private async detectCommonPatterns(ctx: PhaseContext): Promise<PatternAnalysis[]> {
    console.log('🎭 Detecting common patterns across entities...');
    
    const commonPatterns: PatternAnalysis[] = [];
    const threshold = Math.floor(ctx.entityAnalysis.size * 0.3); // 30% threshold
    
    for (const [patternName, analysis] of ctx.patternAnalysis) {
      if (analysis.entityCount >= threshold) {
        commonPatterns.push(analysis);
        console.log(`   📌 ${patternName}: ${analysis.entityCount} entities`);
      }
    }
    
    console.log(`✅ Found ${commonPatterns.length} common patterns`);
    return commonPatterns;
  }

  private async analyzeConfigurationPatterns(ctx: PhaseContext): Promise<Map<string, string[]>> {
    console.log('⚙️ Analyzing configuration patterns...');
    
    const configPatterns = new Map<string, string[]>();
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      const patterns: string[] = [];
      
      if (analysis.configParams.hasT) patterns.push('BaseDataEntity-T');
      if (analysis.configParams.hasK) patterns.push('Generic-K-extends-T');
      if (analysis.configParams.hasMeta) patterns.push('DefaultMeta-Meta');
      if (analysis.configParams.hasAttachment) patterns.push('Attachment-Type');
      if (analysis.configParams.hasExcludedFields) patterns.push('ExcludedFields');
      if (analysis.configParams.hasIncludedFields) patterns.push('IncludedFields');
      
      configPatterns.set(entityName, patterns);
    }
    
    // Group entities by configuration pattern
    const patternGroups = new Map<string, string[]>();
    for (const [entityName, patterns] of configPatterns) {
      const patternKey = patterns.sort().join('-');
      if (!patternGroups.has(patternKey)) {
        patternGroups.set(patternKey, []);
      }
      patternGroups.get(patternKey)!.push(entityName);
    }
    
    console.log(`📊 Found ${patternGroups.size} unique configuration patterns`);
    return patternGroups;
  }

  private async buildCompatibilityMatrix(ctx: PhaseContext): Promise<Map<string, string[]>> {
    console.log('🔗 Building compatibility matrix...');
    
    const compatibility = new Map<string, string[]>();
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      const compatibleWith: string[] = [];
      
      for (const [otherName, otherAnalysis] of ctx.entityAnalysis) {
        if (entityName === otherName) continue;
        
        // Check if entities have compatible patterns
        const compatible = this.areEntitiesCompatible(analysis, otherAnalysis);
        if (compatible) {
          compatibleWith.push(otherName);
        }
      }
      
      compatibility.set(entityName, compatibleWith);
    }
    
    console.log(`✅ Built compatibility matrix for ${ctx.entityAnalysis.size} entities`);
    return compatibility;
  }

  private areEntitiesCompatible(a: EntityAnalysis, b: EntityAnalysis): boolean {
    // Check config parameters compatibility
    if (a.configParams.hasT !== b.configParams.hasT) return false;
    if (a.configParams.hasK !== b.configParams.hasK) return false;
    
    // Check snapshot usage compatibility
    if (a.snapshotUsage.usesSnapshot !== b.snapshotUsage.usesSnapshot) return false;
    
    // Check for common patterns
    const aPatterns = new Set(a.patterns.map(p => p.name));
    const bPatterns = new Set(b.patterns.map(p => p.name));
    const commonPatterns = new Set([...aPatterns].filter(x => bPatterns.has(x)));
    
    return commonPatterns.size > 0;
  }

  private async validateGenericParameters(ctx: PhaseContext): Promise<Array<{
    entityName: string;
    parameter: string;
    isValid: boolean;
    error?: string;
  }>> {
    console.log('🔍 Validating generic parameters...');
    
    const validations: Array<{
      entityName: string;
      parameter: string;
      isValid: boolean;
      error?: string;
    }> = [];
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      if (analysis.configParams.hasT) {
        const content = fs.readFileSync(analysis.filePath, 'utf-8');
        const isValid = this.validateTParameter(content);
        validations.push({
          entityName,
          parameter: 'T',
          isValid,
          error: isValid ? undefined : 'T must extend BaseDataEntity or BaseDataRoot'
        });
      }
      
      if (analysis.configParams.hasK) {
        const content = fs.readFileSync(analysis.filePath, 'utf-8');
        const isValid = this.validateKParameter(content);
        validations.push({
          entityName,
          parameter: 'K',
          isValid,
          error: isValid ? undefined : 'K must extend T'
        });
      }
    }
    
    const invalidCount = validations.filter(v => !v.isValid).length;
    console.log(`✅ Validated ${validations.length} parameters, ${invalidCount} invalid`);
    
    return validations;
  }

  private validateTParameter(content: string): boolean {
    const patterns = [
      /T\s+extends\s+BaseDataEntity/,
      /T\s+extends\s+BaseDataRoot/,
      /T\s+extends\s+\w+\s*=\s*BaseDataEntity/,
      /T\s+extends\s+\w+\s*=\s*BaseDataRoot/
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  private validateKParameter(content: string): boolean {
    const patterns = [
      /K\s+extends\s+T/,
      /K\s+extends\s+\w+\s*=\s*T/
    ];
    
    return patterns.some(pattern => pattern.test(content));
  }

  private async checkTypeConsistency(ctx: PhaseContext): Promise<Array<{
    entityName: string;
    type: string;
    isConsistent: boolean;
    variations: string[];
  }>> {
    console.log('📐 Checking type consistency...');
    
    const typeConsistency: Array<{
      entityName: string;
      type: string;
      isConsistent: boolean;
      variations: string[];
    }> = [];
    
    // Group entities by their type patterns
    const typeGroups = new Map<string, Map<string, string[]>>();
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      const content = fs.readFileSync(analysis.filePath, 'utf-8');
      const typeDeclarations = this.extractTypeDeclarations(content);
      
      for (const [typeName, declarations] of typeDeclarations) {
        if (!typeGroups.has(typeName)) {
          typeGroups.set(typeName, new Map());
        }
        
        const declarationGroup = typeGroups.get(typeName)!;
        const declarationKey = declarations.join('|');
        
        if (!declarationGroup.has(declarationKey)) {
          declarationGroup.set(declarationKey, []);
        }
        declarationGroup.get(declarationKey)!.push(entityName);
      }
    }
    
    // Analyze consistency
    for (const [typeName, declarationGroups] of typeGroups) {
      const variations = Array.from(declarationGroups.values());
      const isConsistent = variations.length === 1;
      
      typeConsistency.push({
        entityName: typeName,
        type: typeName,
        isConsistent,
        variations: variations.map(v => v.join(', '))
      });
    }
    
    const inconsistentCount = typeConsistency.filter(t => !t.isConsistent).length;
    console.log(`📊 Type consistency: ${typeConsistency.length} types, ${inconsistentCount} inconsistent`);
    
    return typeConsistency;
  }

  private extractTypeDeclarations(content: string): Map<string, string[]> {
    const declarations = new Map<string, string[]>();
    
    // Extract interface declarations
    const interfaceMatches = content.matchAll(/interface\s+(\w+)\s*{([^}]+)}/g);
    for (const match of interfaceMatches) {
      const [, name, body] = match;
      declarations.set(name, [body.trim()]);
    }
    
    // Extract type alias declarations
    const typeMatches = content.matchAll(/type\s+(\w+)\s*=\s*([^;]+);/g);
    for (const match of typeMatches) {
      const [, name, definition] = match;
      declarations.set(name, [definition.trim()]);
    }
    
    return declarations;
  }

  private async detectTypeErrors(ctx: PhaseContext): Promise<Array<{
    entityName: string;
    error: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
  }>> {
    console.log('🔎 Detecting type errors...');
    
    const errors: Array<{
      entityName: string;
      error: string;
      location: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];
    
    // Run TypeScript diagnostics
    const diagnosticPhase = new TypeScriptDiagnosticPhase(ctx.projectRoot);
    
    try {
      const diagnosticResult = await diagnosticPhase.execute();
      
      // Filter errors for entity files
      const entityErrors = diagnosticResult.filesWithErrors.filter(file => 
        file.includes(ctx.config.entityDirectory)
      );
      
      for (const errorFile of entityErrors) {
        const entityName = path.basename(errorFile, '.ts');
        errors.push({
          entityName,
          error: `TypeScript errors in file`,
          location: errorFile,
          severity: 'high'
        });
      }
      
    } catch (error) {
      console.warn('Could not run TypeScript diagnostics:', error);
    }
    
    // Check for import errors
    const importAnalyzer = new ImportErrorSummaryGenerator();
    const importErrors = await importAnalyzer.generateSummary();
    
    for (const error of importErrors.errors) {
      if (error.filePath.includes(ctx.config.entityDirectory)) {
        errors.push({
          entityName: path.basename(error.filePath, '.ts'),
          error: `Import error: ${error.importPath}`,
          location: `${error.filePath}:${error.lineNumber}`,
          severity: error.severity
        });
      }
    }
    
    console.log(`⚠️ Found ${errors.length} type-related errors`);
    return errors;
  }

  private async identifyPatternDeviations(ctx: PhaseContext): Promise<Array<{
    entityName: string;
    pattern: string;
    deviation: string;
    recommendation: string;
  }>> {
    console.log('🔄 Identifying pattern deviations...');
    
    const deviations: Array<{
      entityName: string;
      pattern: string;
      deviation: string;
      recommendation: string;
    }> = [];
    
    // Get the most common patterns
    const commonPatterns = Array.from(ctx.patternAnalysis.values())
      .sort((a, b) => b.entityCount - a.entityCount)
      .slice(0, 10);
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      for (const commonPattern of commonPatterns) {
        const hasPattern = analysis.patterns.some(p => p.name === commonPattern.patternName);
        
        if (!hasPattern && commonPattern.entityCount > ctx.entityAnalysis.size * 0.5) {
          // Entity is missing a common pattern
          deviations.push({
            entityName,
            pattern: commonPattern.patternName,
            deviation: `Missing common pattern: ${commonPattern.patternName}`,
            recommendation: `Consider implementing the ${commonPattern.patternName} pattern`
          });
        }
      }
    }
    
    console.log(`📝 Found ${deviations.length} pattern deviations`);
    return deviations;
  }

  private async generateStandardizationFixes(ctx: PhaseContext): Promise<Array<{
    entityName: string;
    fixType: string;
    description: string;
    codeChanges: string[];
  }>> {
    console.log('🔧 Generating standardization fixes...');
    
    const fixes: Array<{
      entityName: string;
      fixType: string;
      description: string;
      codeChanges: string[];
    }> = [];
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      const entityFixes: string[] = [];
      
      // Fix 1: Ensure T parameter extends BaseDataEntity
      if (analysis.configParams.hasT) {
        const content = fs.readFileSync(analysis.filePath, 'utf-8');
        if (!this.validateTParameter(content)) {
          entityFixes.push('Update T parameter to extend BaseDataEntity');
        }
      }
      
      // Fix 2: Ensure K parameter extends T
      if (analysis.configParams.hasK) {
        const content = fs.readFileSync(analysis.filePath, 'utf-8');
        if (!this.validateKParameter(content)) {
          entityFixes.push('Update K parameter to extend T');
        }
      }
      
      // Fix 3: Add missing common patterns
      const commonPatterns = Array.from(ctx.patternAnalysis.values())
        .filter(p => p.entityCount > ctx.entityAnalysis.size * 0.6)
        .map(p => p.patternName);
      
      for (const pattern of commonPatterns) {
        const hasPattern = analysis.patterns.some(p => p.name === pattern);
        if (!hasPattern) {
          entityFixes.push(`Add missing pattern: ${pattern}`);
        }
      }
      
      if (entityFixes.length > 0) {
        fixes.push({
          entityName,
          fixType: 'standardization',
          description: `Standardize ${entityName} to match common patterns`,
          codeChanges: entityFixes
        });
      }
    }
    
    console.log(`⚡ Generated ${fixes.length} standardization fixes`);
    return fixes;
  }

  private async applyPatternStandardization(ctx: PhaseContext): Promise<PhaseExecutionResult[]> {
    console.log('🔄 Applying pattern standardization...');
    
    const results: PhaseExecutionResult[] = [];
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      const result: PhaseExecutionResult = {
        phaseId: 'pattern-standardization',
        entityName,
        success: true,
        changes: [],
        warnings: [],
        errors: [],
        duration: 0
      };
      
      const startTime = Date.now();
      
      try {
        // Create backup if enabled
        if (ctx.config.backupEnabled) {
          const backup = await ctx.backupSystem.backupEntity(
            entityName,
            analysis.filePath,
            'pattern-standardization',
            ['standardization', entityName]
          );
          result.backupId = backup.id;
        }
        
        // Read current content
        let content = fs.readFileSync(analysis.filePath, 'utf-8');
        let modified = false;
        
        // Apply fixes based on analysis
        if (!analysis.configParams.hasT && analysis.configParams.hasK) {
          // Add missing T parameter
          content = this.addTParameter(content);
          result.changes.push({
            type: 'add',
            description: 'Added T parameter extending BaseDataEntity',
            location: 'Generic parameters'
          });
          modified = true;
        }
        
        if (analysis.configParams.hasT && !this.validateTParameter(content)) {
          // Fix T parameter
          content = this.fixTParameter(content);
          result.changes.push({
            type: 'modify',
            description: 'Fixed T parameter to extend BaseDataEntity',
            location: 'Generic parameters'
          });
          modified = true;
        }
        
        // Write changes if any
        if (modified) {
          fs.writeFileSync(analysis.filePath, content, 'utf-8');
          console.log(`✅ Standardized ${entityName}`);
        }
        
      } catch (error: any) {
        result.success = false;
        result.errors.push(error.message);
        console.error(`❌ Failed to standardize ${entityName}:`, error.message);
      }
      
      result.duration = Date.now() - startTime;
      results.push(result);
      this.executionHistory.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`📊 Standardization complete: ${successCount}/${results.length} successful`);
    
    return results;
  }

  private addTParameter(content: string): string {
    // Find interface or type with K but no T
    const lines = content.split('\n');
    const newLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      newLines.push(line);
      
      // Look for interface/type with K parameter
      if (line.includes('interface') || line.includes('type')) {
        const nextLine = lines[i + 1];
        if (nextLine && nextLine.includes('K extends')) {
          // Insert T parameter
          newLines.push('  T extends BaseDataEntity,');
        }
      }
    }
    
    return newLines.join('\n');
  }

  private fixTParameter(content: string): string {
    // Replace incorrect T parameter definitions
    return content
      .replace(/T\s+extends\s+\w+(?!BaseDataEntity|BaseDataRoot)/g, 'T extends BaseDataEntity')
      .replace(/T\s+extends\s+any/g, 'T extends BaseDataEntity');
  }

  private async testParameterSwapping(ctx: PhaseContext): Promise<Array<{
    entityA: string;
    entityB: string;
    parameters: string[];
    success: boolean;
    error?: string;
  }>> {
    console.log('🔄 Testing parameter swapping...');
    
    const tests: Array<{
      entityA: string;
      entityB: string;
      parameters: string[];
      success: boolean;
      error?: string;
    }> = [];
    
    const entities = Array.from(ctx.entityAnalysis.entries());
    
    // Test swapping between compatible entities
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const [entityAName, entityA] = entities[i];
        const [entityBName, entityB] = entities[j];
        
        if (this.areEntitiesCompatible(entityA, entityB)) {
          const parameters = this.getSwappableParameters(entityA, entityB);
          
          if (parameters.length > 0) {
            const success = await this.testSwap(entityA, entityB, parameters);
            tests.push({
              entityA: entityAName,
              entityB: entityBName,
              parameters,
              success,
                            error: success ? undefined : 'Parameter swap test failed'
            });
          }
        }
      }
    }
    
    const successCount = tests.filter(t => t.success).length;
    console.log(`✅ Parameter swapping tests: ${successCount}/${tests.length} successful`);
    
    return tests;
  }

  private getSwappableParameters(entityA: EntityAnalysis, entityB: EntityAnalysis): string[] {
    const swappable: string[] = [];
    
    // Check T parameter
    if (entityA.configParams.hasT && entityB.configParams.hasT) {
      swappable.push('T');
    }
    
    // Check K parameter
    if (entityA.configParams.hasK && entityB.configParams.hasK) {
      swappable.push('K');
    }
    
    // Check Meta parameter
    if (entityA.configParams.hasMeta && entityB.configParams.hasMeta) {
      swappable.push('Meta');
    }
    
    // Check AttachmentType parameter
    if (entityA.configParams.hasAttachment && entityB.configParams.hasAttachment) {
      swappable.push('AttachmentType');
    }
    
    return swappable;
  }

  private async testSwap(entityA: EntityAnalysis, entityB: EntityAnalysis, parameters: string[]): Promise<boolean> {
    try {
      // Read both entity files
      const contentA = fs.readFileSync(entityA.filePath, 'utf-8');
      const contentB = fs.readFileSync(entityB.filePath, 'utf-8');
      
      // Create test versions with swapped parameters
      const testContentA = this.swapParameters(contentA, parameters, entityB.entityName);
      const testContentB = this.swapParameters(contentB, parameters, entityA.entityName);
      
      // Test 1: Check if swapped code compiles (syntax validation)
      const testFileA = path.join(path.dirname(entityA.filePath), `test_swap_${Date.now()}_A.ts`);
      const testFileB = path.join(path.dirname(entityB.filePath), `test_swap_${Date.now()}_B.ts`);
      
      fs.writeFileSync(testFileA, testContentA, 'utf-8');
      fs.writeFileSync(testFileB, testContentB, 'utf-8');
      
      // Test 2: Run TypeScript compiler on test files
      const { execSync } = require('child_process');
      
      try {
        execSync(`npx tsc --noEmit --skipLibCheck "${testFileA}"`, { stdio: 'pipe' });
        execSync(`npx tsc --noEmit --skipLibCheck "${testFileB}"`, { stdio: 'pipe' });
        
        // Clean up test files
        fs.unlinkSync(testFileA);
        fs.unlinkSync(testFileB);
        
        return true;
      } catch (compileError) {
        // Clean up test files even on failure
        try { fs.unlinkSync(testFileA); } catch {}
        try { fs.unlinkSync(testFileB); } catch {}
        return false;
      }
      
    } catch (error) {
      console.error(`Swap test failed between ${entityA.entityName} and ${entityB.entityName}:`, error);
      return false;
    }
  }

  private swapParameters(content: string, parameters: string[], targetEntityName: string): string {
    let swapped = content;
    
    // Replace generic parameter references with target entity equivalents
    for (const param of parameters) {
      const pattern = new RegExp(`\\b${param}\\b(?!\\s*:)`, 'g');
      swapped = swapped.replace(pattern, `${param}_${targetEntityName}`);
    }
    
    // Add import/type reference to target entity
    const importStatement = `import { ${parameters.map(p => `${p} as ${p}_${targetEntityName}`).join(', ')} } from './${targetEntityName}';`;
    
    // Insert import at the beginning of the file
    const lines = swapped.split('\n');
    let importIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('import ') && lines[i].includes('from')) {
        importIndex = i;
        break;
      }
    }
    
    if (importIndex === -1) {
      // No imports found, add at the top
      lines.unshift(importStatement);
    } else {
      // Insert after the last import
      lines.splice(importIndex + 1, 0, importStatement);
    }
    
    return lines.join('\n');
  }

  private async testConfigurationPatterns(ctx: PhaseContext): Promise<Array<{
    patternName: string;
    testType: string;
    success: boolean;
    entitiesTested: string[];
    errors: string[];
  }>> {
    console.log('🧪 Testing configuration patterns...');
    
    const tests: Array<{
      patternName: string;
      testType: string;
      success: boolean;
      entitiesTested: string[];
      errors: string[];
    }> = [];
    
    // Test 1: Tuple Pattern (Option 1)
    const tupleEntities = Array.from(ctx.entityAnalysis.entries())
      .filter(([, analysis]) => analysis.patterns.some(p => p.name === 'config-tuple-pattern'))
      .map(([name]) => name);
    
    if (tupleEntities.length > 0) {
      const tupleTest = await this.testTuplePattern(ctx, tupleEntities);
      tests.push({
        patternName: 'Tuple Pattern',
        testType: 'Parameter Extraction',
        success: tupleTest.success,
        entitiesTested: tupleEntities,
        errors: tupleTest.errors
      });
    }
    
    // Test 2: Interface Pattern (Option 2)
    const interfaceEntities = Array.from(ctx.entityAnalysis.entries())
      .filter(([, analysis]) => analysis.patterns.some(p => p.name === 'generic-interface-pattern'))
      .map(([name]) => name);
    
    if (interfaceEntities.length > 0) {
      const interfaceTest = await this.testInterfacePattern(ctx, interfaceEntities);
      tests.push({
        patternName: 'Interface Pattern',
        testType: 'Generic Compatibility',
        success: interfaceTest.success,
        entitiesTested: interfaceEntities,
        errors: interfaceTest.errors
      });
    }
    
    // Test 3: ExtractUpdateParamsFromConfig (Option 2 utility)
    const configEntities = Array.from(ctx.entityAnalysis.entries())
      .filter(([, analysis]) => 
        analysis.snapshotUsage.customConfigPatterns.includes('snapshotConfigParams') &&
        analysis.snapshotUsage.customConfigPatterns.includes('updateSnapshotParams')
      )
      .map(([name]) => name);
    
    if (configEntities.length > 0) {
      const configTest = await this.testExtractUpdateParams(ctx, configEntities);
      tests.push({
        patternName: 'ExtractUpdateParamsFromConfig',
        testType: 'Configuration Mapping',
        success: configTest.success,
        entitiesTested: configEntities,
        errors: configTest.errors
      });
    }
    
    console.log(`🧪 Configuration pattern tests: ${tests.filter(t => t.success).length}/${tests.length} successful`);
    return tests;
  }

  private async testTuplePattern(ctx: PhaseContext, entityNames: string[]): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    for (const entityName of entityNames) {
      const analysis = ctx.entityAnalysis.get(entityName)!;
      const content = fs.readFileSync(analysis.filePath, 'utf-8');
      
      // Extract tuple pattern
      const tupleMatch = content.match(/type\s+\w+\s*=\s*\[\s*T\s*,\s*K\s*,\s*Meta/);
      if (!tupleMatch) {
        errors.push(`${entityName}: No valid tuple pattern found`);
        continue;
      }
      
      // Test parameter extraction
      try {
        const extracted = this.extractTupleParameters(content);
        if (!extracted || extracted.length < 3) {
          errors.push(`${entityName}: Failed to extract tuple parameters`);
        }
      } catch (error: any) {
        errors.push(`${entityName}: ${error.message}`);
      }
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }

  private extractTupleParameters(content: string): string[] | null {
    const tupleRegex = /type\s+(\w+)\s*=\s*\[([^\]]+)\]/;
    const match = content.match(tupleRegex);
    
    if (!match) return null;
    
    const [, , paramsString] = match;
    return paramsString.split(',').map(p => p.trim()).filter(p => p.length > 0);
  }

  private async testInterfacePattern(ctx: PhaseContext, entityNames: string[]): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    for (const entityName of entityNames) {
      const analysis = ctx.entityAnalysis.get(entityName)!;
      const content = fs.readFileSync(analysis.filePath, 'utf-8');
      
      // Extract interface with generics
      const interfaceRegex = /interface\s+(\w+)\s*<\s*([^>]+)\s*>/;
      const match = content.match(interfaceRegex);
      
      if (!match) {
        errors.push(`${entityName}: No valid interface pattern found`);
        continue;
      }
      
      const [, interfaceName, genericsString] = match;
      const generics = genericsString.split(',').map(g => g.trim());
      
      // Validate generic constraints
      const hasValidConstraints = generics.every(g => {
        return g.includes('extends') || g.includes('=');
      });
      
      if (!hasValidConstraints) {
        errors.push(`${entityName}: Missing constraints on generic parameters`);
      }
      
      // Check for proper default values
      const hasDefaults = generics.some(g => g.includes('='));
      if (!hasDefaults && generics.length > 2) {
        errors.push(`${entityName}: Consider adding default values for optional generics`);
      }
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }

  private async testExtractUpdateParams(ctx: PhaseContext, entityNames: string[]): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    for (const entityName of entityNames) {
      const analysis = ctx.entityAnalysis.get(entityName)!;
      const content = fs.readFileSync(analysis.filePath, 'utf-8');
      
      // Check if ExtractUpdateParamsFromConfig type exists
      if (!content.includes('ExtractUpdateParamsFromConfig')) {
        errors.push(`${entityName}: Missing ExtractUpdateParamsFromConfig type`);
        continue;
      }
      
      // Check if it's properly implemented
      const extractRegex = /type\s+ExtractUpdateParamsFromConfig\s*<[^>]+>\s*=\s*UpdateSnapshotParams\s*<[^>]+>/;
      if (!extractRegex.test(content)) {
        errors.push(`${entityName}: ExtractUpdateParamsFromConfig not properly defined`);
        continue;
      }
      
      // Test type inference
      try {
        const testCode = `
// Test type extraction
type TestConfig = [BaseDataEntity, any, any];
type TestParams = ExtractUpdateParamsFromConfig<TestConfig>;
const test: TestParams = {} as any;
`;
        
        const testFile = path.join(ctx.projectRoot, `test_extract_${Date.now()}.ts`);
        fs.writeFileSync(testFile, content + '\n' + testCode, 'utf-8');
        
        const { execSync } = require('child_process');
        execSync(`npx tsc --noEmit --skipLibCheck "${testFile}"`, { stdio: 'pipe' });
        
        fs.unlinkSync(testFile);
      } catch (error) {
        errors.push(`${entityName}: Type extraction test failed`);
      }
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }

  private async testSnapshotCompatibility(ctx: PhaseContext): Promise<Array<{
    entityName: string;
    snapshotType: string;
    compatibleWith: string[];
    incompatibleWith: string[];
  }>> {
    console.log('📸 Testing snapshot compatibility...');
    
    const compatibilityResults: Array<{
      entityName: string;
      snapshotType: string;
      compatibleWith: string[];
      incompatibleWith: string[];
    }> = [];
    
    // Group entities by snapshot usage patterns
    const snapshotGroups = new Map<string, string[]>();
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      if (analysis.snapshotUsage.usesSnapshot) {
        const key = 'basic-snapshot';
        if (!snapshotGroups.has(key)) snapshotGroups.set(key, []);
        snapshotGroups.get(key)!.push(entityName);
      }
      
      if (analysis.snapshotUsage.usesSnapshotUnion) {
        const key = 'snapshot-union';
        if (!snapshotGroups.has(key)) snapshotGroups.set(key, []);
        snapshotGroups.get(key)!.push(entityName);
      }
      
      if (analysis.snapshotUsage.usesSnapshotWithCriteria) {
        const key = 'snapshot-with-criteria';
        if (!snapshotGroups.has(key)) snapshotGroups.set(key, []);
        snapshotGroups.get(key)!.push(entityName);
      }
    }
    
    // Test compatibility within and between groups
    for (const [snapshotType, entities] of snapshotGroups) {
      for (const entityName of entities) {
        const compatibleWith: string[] = [];
        const incompatibleWith: string[] = [];
        
        for (const otherEntityName of entities) {
          if (entityName === otherEntityName) continue;
          
          const entityA = ctx.entityAnalysis.get(entityName)!;
          const entityB = ctx.entityAnalysis.get(otherEntityName)!;
          
          const compatible = await this.testSnapshotTypeCompatibility(entityA, entityB);
          
          if (compatible) {
            compatibleWith.push(otherEntityName);
          } else {
            incompatibleWith.push(otherEntityName);
          }
        }
        
        compatibilityResults.push({
          entityName,
          snapshotType,
          compatibleWith,
          incompatibleWith
        });
      }
    }
    
    console.log(`📊 Snapshot compatibility analysis complete`);
    return compatibilityResults;
  }

  private async testSnapshotTypeCompatibility(entityA: EntityAnalysis, entityB: EntityAnalysis): Promise<boolean> {
    try {
      // Create a test that tries to use entityA's snapshot with entityB's parameters
      const testCode = `
// Test snapshot compatibility between ${entityA.entityName} and ${entityB.entityName}
import type {  Snapshot } from '@/app/snapshots/Snapshot';

// Simulate using ${entityA.entityName} snapshot with ${entityB.entityName} parameters
type TestCompatibility = Snapshot<
  ${entityB.entityName}['T'],
  ${entityB.entityName}['K'],
  ${entityB.entityName}['Meta'],
  ${entityB.entityName}['AttachmentType'],
  ${entityB.entityName}['ExcludedFields'],
  ${entityB.entityName}['IncludedFields']
>;

// Try to assign ${entityA.entityName} snapshot to the test type
declare const snapshotA: ${entityA.entityName}['Snapshot'];
const test: TestCompatibility = snapshotA;
`;
      
      const testFile = path.join(path.dirname(entityA.filePath), `test_snapshot_comp_${Date.now()}.ts`);
      fs.writeFileSync(testFile, testCode, 'utf-8');
      
      const { execSync } = require('child_process');
      execSync(`npx tsc --noEmit --skipLibCheck "${testFile}"`, { stdio: 'pipe' });
      
      fs.unlinkSync(testFile);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async applyAutomatedFixes(ctx: PhaseContext): Promise<PhaseExecutionResult[]> {
    console.log('⚡ Applying automated fixes...');
    
    const results: PhaseExecutionResult[] = [];
    
    // Get all fixes from previous analysis phases
    const typeErrors = await this.detectTypeErrors(ctx);
    const deviations = await this.identifyPatternDeviations(ctx);
    const fixes = await this.generateStandardizationFixes(ctx);
    
    // Apply type error fixes
    for (const error of typeErrors) {
      if (ctx.config.autoFixPatterns && error.severity === 'high') {
        const result = await this.applyTypeFix(ctx, error);
        results.push(result);
      }
    }
    
    // Apply standardization fixes
    for (const fix of fixes) {
      const result = await this.applyStandardizationFix(ctx, fix);
      results.push(result);
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Automated fixes: ${successCount}/${results.length} successful`);
    
    return results;
  }

  private async applyTypeFix(ctx: PhaseContext, error: any): Promise<PhaseExecutionResult> {
    const result: PhaseExecutionResult = {
      phaseId: 'fix-application',
      entityName: error.entityName,
      success: false,
      changes: [],
      warnings: [],
      errors: [],
      duration: 0
    };
    
    const startTime = Date.now();
    
    try {
      const analysis = ctx.entityAnalysis.get(error.entityName);
      if (!analysis) {
        throw new Error(`Entity analysis not found: ${error.entityName}`);
      }
      
      // Create backup
      if (ctx.config.backupEnabled) {
        const backup = await ctx.backupSystem.backupEntity(
          error.entityName,
          analysis.filePath,
          'type-fix',
          ['type-fix', error.severity]
        );
        result.backupId = backup.id;
      }
      
      // Read and fix the file
      let content = fs.readFileSync(analysis.filePath, 'utf-8');
      let modified = false;
      
      // Apply fix based on error type
      if (error.error.includes('Import error')) {
        // Fix import errors
        content = this.fixImportError(content, error);
        result.changes.push({
          type: 'modify',
          description: `Fixed import error: ${error.error}`,
          location: error.location
        });
        modified = true;
      } else if (error.error.includes('TypeScript errors')) {
        // Attempt to fix TypeScript errors
        content = await this.fixTypeScriptErrors(content, analysis.filePath);
        result.changes.push({
          type: 'modify',
          description: 'Attempted to fix TypeScript errors',
          location: analysis.filePath
        });
        modified = true;
      }
      
      // Write changes
      if (modified) {
        fs.writeFileSync(analysis.filePath, content, 'utf-8');
        result.success = true;
        console.log(`✅ Fixed ${error.entityName}: ${error.error}`);
      } else {
        result.warnings.push('No automatic fix available for this error');
      }
      
    } catch (error: any) {
      result.errors.push(error.message);
      console.error(`❌ Failed to apply fix to ${error.entityName}:`, error.message);
    }
    
    result.duration = Date.now() - startTime;
    return result;
  }

  private fixImportError(content: string, error: any): string {
    // Simple import error fix - add missing import or fix path
    const lines = content.split('\n');
    const errorLine = parseInt(error.location.split(':').pop() || '1') - 1;
    
    if (errorLine >= 0 && errorLine < lines.length) {
      const line = lines[errorLine];
      
      // Try to extract module name from error
      const moduleMatch = error.error.match(/module ['"]([^'"]+)['"]/);
      if (moduleMatch) {
        const moduleName = moduleMatch[1];
        
        // Add import statement
        const importStatement = `import * as ${moduleName.split('/').pop()} from '${moduleName}';`;
        lines.splice(errorLine, 0, importStatement);
        
        return lines.join('\n');
      }
    }
    
    return content;
  }

  private async fixTypeScriptErrors(content: string, filePath: string): Promise<string> {
    // Run TypeScript auto-fixer (simplified)
    // In production, you would use the TypeScript language service
    
    const lines = content.split('\n');
    const fixedLines = [...lines];
    
    // Simple fixes
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Fix missing semicolons
      if (!line.trim().endsWith(';') && !line.trim().endsWith('{') && !line.trim().endsWith('}')) {
        if (line.includes('=') || line.includes(':') || line.includes('return')) {
          fixedLines[i] = line + ';';
        }
      }
      
      // Fix 'any' usage
      if (line.includes(': any') && !line.includes('//')) {
        fixedLines[i] = line.replace(': any', ': unknown');
      }
    }
    
    return fixedLines.join('\n');
  }

  private async applyStandardizationFix(ctx: PhaseContext, fix: any): Promise<PhaseExecutionResult> {
    const result: PhaseExecutionResult = {
      phaseId: 'fix-application',
      entityName: fix.entityName,
      success: false,
      changes: [],
      warnings: [],
      errors: [],
      duration: 0
    };
    
    const startTime = Date.now();
    
    try {
      const analysis = ctx.entityAnalysis.get(fix.entityName);
      if (!analysis) {
        throw new Error(`Entity analysis not found: ${fix.entityName}`);
      }
      
      // Create backup
      if (ctx.config.backupEnabled) {
        const backup = await ctx.backupSystem.backupEntity(
          fix.entityName,
          analysis.filePath,
          'standardization-fix',
          ['standardization']
        );
        result.backupId = backup.id;
      }
      
      // Read and apply fixes
      let content = fs.readFileSync(analysis.filePath, 'utf-8');
      let modified = false;
      
      for (const codeChange of fix.codeChanges) {
        if (codeChange.includes('Add missing pattern')) {
          const pattern = codeChange.match(/Add missing pattern: (\w+)/)?.[1];
          if (pattern) {
            content = this.addPatternToEntity(content, pattern, analysis);
            result.changes.push({
              type: 'add',
              description: `Added missing pattern: ${pattern}`,
              location: analysis.filePath
            });
            modified = true;
          }
        } else if (codeChange.includes('Update T parameter')) {
          content = this.fixTParameter(content);
          result.changes.push({
            type: 'modify',
            description: 'Updated T parameter to extend BaseDataEntity',
            location: 'Generic parameters'
          });
          modified = true;
        }
      }
      
      // Write changes
      if (modified) {
        fs.writeFileSync(analysis.filePath, content, 'utf-8');
        result.success = true;
        console.log(`✅ Applied standardization to ${fix.entityName}`);
      }
      
    } catch (error: any) {
      result.errors.push(error.message);
      console.error(`❌ Failed to apply standardization to ${fix.entityName}:`, error.message);
    }
    
    result.duration = Date.now() - startTime;
    return result;
  }

  private addPatternToEntity(content: string, pattern: string, analysis: EntityAnalysis): string {
    // Add common pattern to entity
    const patternImplementations: Record<string, string> = {
      'config-tuple-pattern': `
// Configuration tuple pattern
type ${analysis.entityName}Config = [
  T,
  K,
  Meta,
  AttachmentType,
  ExcludedFields,
  IncludedFields
];
`,
      'generic-interface-pattern': `
// Generic interface pattern
interface ${analysis.entityName}Interface<
  T extends BaseDataEntity,
  K extends T,
  Meta extends DefaultMeta<T, K>
> {
  entity: T;
  key: K;
  meta: Meta;
}
`
    };
    
    const implementation = patternImplementations[pattern];
    if (implementation) {
      // Add before the last closing brace or at the end
      if (content.includes('}')) {
        const lastBraceIndex = content.lastIndexOf('}');
        return content.slice(0, lastBraceIndex) + implementation + content.slice(lastBraceIndex);
      } else {
        return content + '\n' + implementation;
      }
    }
    
    return content;
  }

  private async validateAppliedFixes(ctx: PhaseContext): Promise<Array<{
    entityName: string;
    validationType: string;
    passed: boolean;
    issues: string[];
  }>> {
    console.log('✅ Validating applied fixes...');
    
    const validations: Array<{
      entityName: string;
      validationType: string;
      passed: boolean;
      issues: string[];
    }> = [];
    
    // Run TypeScript diagnostics again
    const diagnosticPhase = new TypeScriptDiagnosticPhase(ctx.projectRoot);
    
    try {
      const newDiagnostics = await diagnosticPhase.execute();
      
      // Check each entity file
      for (const [entityName, analysis] of ctx.entityAnalysis) {
        const issues: string[] = [];
        
        // Check if file still has TypeScript errors
        if (newDiagnostics.filesWithErrors.includes(analysis.filePath)) {
          issues.push('File still contains TypeScript errors');
        }
        
        // Check import errors
        const importAnalyzer = new ImportErrorSummaryGenerator();
        const importSummary = await importAnalyzer.generateSummary();
        const entityImportErrors = importSummary.errors.filter(e => 
          e.filePath === analysis.filePath
        );
        
        if (entityImportErrors.length > 0) {
          issues.push(`Has ${entityImportErrors.length} import errors`);
        }
        
        validations.push({
          entityName,
          validationType: 'post-fix-validation',
          passed: issues.length === 0,
          issues
        });
      }
      
    } catch (error) {
      console.error('Failed to run validation:', error);
    }
    
    const passedCount = validations.filter(v => v.passed).length;
    console.log(`📊 Validation results: ${passedCount}/${validations.length} entities passed`);
    
    return validations;
  }

  private async generateFinalReport(ctx: PhaseContext): Promise<string> {
    console.log('📋 Generating final report...');
    
    const reportLines: string[] = [
      '# PHASE SYSTEM EXECUTION REPORT',
      `**Generated:** ${new Date().toISOString()}`,
      `**Project Root:** ${ctx.projectRoot}`,
      `**Entities Analyzed:** ${ctx.entityAnalysis.size}`,
      ''
    ];
    
    // Execution Summary
    reportLines.push('## 🎯 EXECUTION SUMMARY');
    reportLines.push('');
    
    const phaseResults = new Map<string, PhaseExecutionResult[]>();
    for (const result of this.executionHistory) {
      if (!phaseResults.has(result.phaseId)) {
        phaseResults.set(result.phaseId, []);
      }
      phaseResults.get(result.phaseId)!.push(result);
    }
    
    for (const [phaseId, results] of phaseResults) {
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      const phase = this.phaseRegistry.get(phaseId);
      
      reportLines.push(`### ${phase?.name || phaseId}`);
      reportLines.push(`**Success Rate:** ${successCount}/${totalCount} (${((successCount/totalCount)*100).toFixed(1)}%)`);
      reportLines.push(`**Total Changes:** ${results.reduce((sum, r) => sum + r.changes.length, 0)}`);
      reportLines.push('');
    }
    
    // Entity Analysis
    reportLines.push('## 📊 ENTITY ANALYSIS');
    reportLines.push('');
    reportLines.push('| Entity | Type Context | Config Pattern | Snapshot Usage | Compatibility |');
    reportLines.push('|--------|--------------|----------------|----------------|---------------|');
    
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      const configPattern = Object.entries(analysis.configParams)
        .filter(([, has]) => has)
        .map(([key]) => key)
        .join(', ');
      
      const snapshotUsage = analysis.snapshotUsage.usesSnapshot ? '✓' : '✗';
      const compatibility = analysis.phaseCompatibility.canExecute ? '✓' : '✗';
      
      reportLines.push(`| ${entityName} | ${analysis.hasTypeContext ? '✓' : '✗'} | ${configPattern} | ${snapshotUsage} | ${compatibility} |`);
    }
    
    reportLines.push('');
    
    // Pattern Analysis
    reportLines.push('## 🎭 PATTERN ANALYSIS');
    reportLines.push('');
    
    const topPatterns = Array.from(ctx.patternAnalysis.values())
      .sort((a, b) => b.entityCount - a.entityCount)
      .slice(0, 10);
    
    for (const pattern of topPatterns) {
      reportLines.push(`### ${pattern.patternName}`);
      reportLines.push(`**Usage:** ${pattern.entityCount} entities`);
      reportLines.push(`**Files:** ${pattern.files.length}`);
      reportLines.push('');
    }
    
    // Recommendations
    reportLines.push('## 💡 RECOMMENDATIONS');
    reportLines.push('');
    
    // Check for missing patterns
    const commonPatternThreshold = Math.floor(ctx.entityAnalysis.size * 0.6);
    const missingPatterns: string[] = [];
    
    for (const [patternName, analysis] of ctx.patternAnalysis) {
      if (analysis.entityCount >= commonPatternThreshold) {
        // This is a common pattern, check which entities are missing it
        const missingEntities = Array.from(ctx.entityAnalysis.entries())
          .filter(([, entityAnalysis]) => 
            !entityAnalysis.patterns.some(p => p.name === patternName)
          )
          .map(([name]) => name);
        
        if (missingEntities.length > 0) {
          missingPatterns.push(`${patternName} (missing in ${missingEntities.length} entities)`);
        }
      }
    }
    
    if (missingPatterns.length > 0) {
      reportLines.push('### Add Missing Common Patterns');
      for (const pattern of missingPatterns) {
        reportLines.push(`- ${pattern}`);
      }
      reportLines.push('');
    }
    
    // Configuration standardization
    const configVariations = new Map<string, string[]>();
    for (const [entityName, analysis] of ctx.entityAnalysis) {
      const configKey = Object.entries(analysis.configParams)
        .map(([key, has]) => has ? '1' : '0')
        .join('');
      
      if (!configVariations.has(configKey)) {
        configVariations.set(configKey, []);
      }
      configVariations.get(configKey)!.push(entityName);
    }
    
    if (configVariations.size > 1) {
      reportLines.push('### Standardize Configuration Patterns');
      reportLines.push(`Found ${configVariations.size} different configuration patterns`);
      reportLines.push('Consider standardizing to the most common pattern');
      reportLines.push('');
    }
    
    // Save report
    const reportPath = path.join(ctx.projectRoot, 'phase-system-report.md');
    fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf-8');
    
    console.log(`📄 Final report saved to: ${reportPath}`);
    return reportPath;
  }

  // ========== PUBLIC API ==========

  async executeAllPhases(): Promise<Map<string, any>> {
    console.log('🚀 Starting Dynamic Phase System');
    console.log(`📁 Entity Directory: ${this.context.config.entityDirectory}`);
    console.log(`⚙️  Configuration: ${JSON.stringify(this.context.config, null, 2)}`);
    console.log('='.repeat(60));
    
    const results = new Map<string, any>();
    
    for (const [phaseId, phase] of this.phaseRegistry) {
      console.log(`\n🎯 Executing Phase: ${phase.name}`);
      console.log(phase.description);
      console.log('-'.repeat(40));
      
      const phaseResult = await this.executePhaseWithTracking(phaseId, phase);
      results.set(phaseId, phaseResult);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All phases completed!');
    console.log('='.repeat(60));
    
    return results;
  }

  async executePhase(phaseId: string): Promise<any> {
    const phase = this.phaseRegistry.get(phaseId);
    if (!phase) {
      throw new Error(`Phase not found: ${phaseId}`);
    }
    
    return await this.executePhaseWithTracking(phaseId, phase);
  }

  async executeMilestone(phaseId: string, milestoneId: string): Promise<any> {
    const phase = this.phaseRegistry.get(phaseId);
    if (!phase) {
      throw new Error(`Phase not found: ${phaseId}`);
    }
    
    const milestone = phase.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      throw new Error(`Milestone not found: ${milestoneId} in phase ${phaseId}`);
    }
    
    console.log(`🎯 Executing Milestone: ${milestone.name}`);
    return await milestone.execute(this.context);
  }

  getExecutionHistory(): PhaseExecutionResult[] {
    return [...this.executionHistory];
  }

  getEntityAnalysis(): Map<string, EntityAnalysis> {
    return new Map(this.context.entityAnalysis);
  }

  getPatternAnalysis(): Map<string, PatternAnalysis> {
    return new Map(this.context.patternAnalysis);
  }

  // ========== UTILITY METHODS ==========

  private async executePhaseWithTracking(phaseId: string, phase: PhaseDefinition): Promise<any> {
    const phaseResult: any = {
      startTime: new Date(),
      milestones: [],
      dependencies: phase.dependencies
    };
    
    try {
      // Execute dependencies first
      for (const depId of phase.dependencies) {
        if (!this.context.testResults.has(depId)) {
          await this.executePhase(depId);
        }
      }
      
      // Execute milestones
      for (const milestone of phase.milestones) {
        const milestoneResult = await milestone.execute(this.context);
        phaseResult.milestones.push({
          id: milestone.id,
          name: milestone.name,
          result: milestoneResult
        });
      }
      
      phaseResult.endTime = new Date();
      phaseResult.success = true;
      
    } catch (error: any) {
      phaseResult.endTime = new Date();
      phaseResult.success = false;
      phaseResult.error = error.message;
      console.error(`❌ Phase ${phaseId} failed:`, error.message);
    }
    
    phaseResult.duration = phaseResult.endTime.getTime() - phaseResult.startTime.getTime();
    this.context.testResults.set(phaseId, phaseResult);
    
    console.log(`✅ ${phase.name}: ${phaseResult.success ? 'Success' : 'Failed'} (${phaseResult.duration}ms)`);
    
    return phaseResult;
  }

  private getAllFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!item.name.includes('node_modules') && !item.name.startsWith('.')) {
            files.push(...this.getAllFiles(fullPath, extensions));
          }
        } else if (item.isFile() && extensions.some(ext => item.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory ${dir}:`, error);
    }
    
    return files;
  }

  private createSourceFile(filePath: string, content: string, target: number, setParentNodes: boolean): any {
    // This is a placeholder for the actual AST parser method
    // In the actual implementation, this would use TypeScript's createSourceFile
    return {
      fileName: filePath,
      text: content,
      getLineAndCharacterOfPosition: () => ({ line: 1, character: 1 })
    };
  }
}

// ========== FACTORY FUNCTIONS ==========

export async function runDynamicPhaseSystem(config?: Partial<PhaseSystemConfig>): Promise<DynamicPhaseExecutor> {
  const executor = new DynamicPhaseExecutor(config);
  await executor.executeAllPhases();
  return executor;
}

export async function analyzeEntityPatterns(directory: string): Promise<Map<string, EntityAnalysis>> {
  const executor = new DynamicPhaseExecutor({ entityDirectory: directory });
  await executor.executePhase('entity-discovery');
  return executor.getEntityAnalysis();
}

export async function testParameterInterchangeability(directory: string): Promise<Array<{
  entityA: string;
  entityB: string;
  parameters: string[];
  success: boolean;
}>> {
  const executor = new DynamicPhaseExecutor({ entityDirectory: directory });
  await executor.executePhase('interchangeability-testing');
  
  // Extract test results
  const results = executor.getExecutionHistory();
  const interchangeabilityResults = results
    .filter(r => r.phaseId === 'interchangeability-testing')
    .flatMap(r => r.changes)
    .filter(c => c.type === 'test' && c.description.includes('parameter swap'));
  
  return interchangeabilityResults.map(r => ({
    entityA: r.description.split(' ')[2],
    entityB: r.description.split(' ')[4],
    parameters: ['T', 'K', 'Meta'], // Extract from actual test
    success: !r.diff // No diff means success
  }));
}

// ========== BACKUP SYSTEM EXTENSION ==========

// Extend PhaseBackupSystem for entity-specific backups
declare module '@/app/error-analyzer/phases/PhaseBackupSystem' {
  interface PhaseBackupSystem {
    backupEntity(
      entityName: string,
      filePath: string,
      operation: string,
      tags: string[]
    ): Promise<{ id: string }>;
  }
}

PhaseBackupSystem.prototype.backupEntity = async function(
  entityName: string,
  filePath: string,
  operation: string,
  tags: string[]
): Promise<{ id: string }> {
  // Implementation for backing up entity files
  const timestamp = new Date();
  const backupId = `entity-${entityName}-${timestamp.getTime()}`;
  const backupPath = path.join(this.backupDir, 'entities', `${backupId}.bak`);
  
  // Ensure directory exists
  const entityBackupDir = path.join(this.backupDir, 'entities');
  if (!fs.existsSync(entityBackupDir)) {
    fs.mkdirSync(entityBackupDir, { recursive: true });
  }
  
  // Copy entity file
  fs.copyFileSync(filePath, backupPath);
  
  console.log(`💾 Entity backup created: ${entityName} (${operation})`);
  
  return { id: backupId };
};

// ========== CLI INTERFACE ==========

if (require.main === module) {
  const args = process.argv.slice(2);
  
  async function main() {
    if (args.length === 0) {
      console.log(`
Dynamic Phase System for Entity Pattern Analysis
===============================================

Usage:
  tsx DynamicPhaseSystem.ts <command> [options]

Commands:
  analyze <directory>         - Analyze entity patterns in directory
  test-interchangeability    - Test parameter interchangeability
  run-all                    - Run all phases
  run-phase <phaseId>        - Run specific phase
  run-milestone <phase> <milestone> - Run specific milestone

Options:
  --no-backup                - Disable backup system
  --strict                   - Use strict validation
  --parallel                 - Enable parallel processing

Examples:
  tsx DynamicPhaseSystem.ts analyze ./src/app/models
  tsx DynamicPhaseSystem.ts test-interchangeability
  tsx DynamicPhaseSystem.ts run-all --strict --parallel
      `);
      process.exit(0);
    }
    
    const command = args[0];
    
    try {
      switch (command) {
        case 'analyze':
          const directory = args[1] || process.cwd();
          console.log(`🔍 Analyzing entity patterns in: ${directory}`);
          const analysis = await analyzeEntityPatterns(directory);
          console.log(`✅ Analyzed ${analysis.size} entities`);
          break;
          
        case 'test-interchangeability':
          console.log('🔄 Testing parameter interchangeability...');
          const results = await testParameterInterchangeability(process.cwd());
          console.log(`✅ ${results.filter(r => r.success).length}/${results.length} swaps successful`);
          break;
          
        case 'run-all':
          const config: Partial<PhaseSystemConfig> = {
            backupEnabled: !args.includes('--no-backup'),
            validationStrictness: args.includes('--strict') ? 'strict' : 'moderate',
            parallelProcessing: args.includes('--parallel')
          };
          console.log('🚀 Running all phases...');
          await runDynamicPhaseSystem(config);
          break;
          
        case 'run-phase':
          const phaseId = args[1];
          if (!phaseId) {
            console.error('Error: Phase ID required');
            process.exit(1);
          }
          const executor = new DynamicPhaseExecutor();
          await executor.executePhase(phaseId);
          break;
          
        case 'run-milestone':
          const milestonePhase = args[1];
          const milestoneId = args[2];
          if (!milestonePhase || !milestoneId) {
            console.error('Error: Phase and Milestone IDs required');
            process.exit(1);
          }
          const milestoneExecutor = new DynamicPhaseExecutor();
          await milestoneExecutor.executeMilestone(milestonePhase, milestoneId);
          break;
          
        default:
          console.error(`Unknown command: ${command}`);
          process.exit(1);
      }
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
  
  main().catch(console.error);
}

export default DynamicPhaseExecutor;