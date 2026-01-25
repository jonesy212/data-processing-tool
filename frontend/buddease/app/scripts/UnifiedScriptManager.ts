#!/usr/bin/env tsx
// UnifiedScriptManager.ts
// Single entry point for ALL scripts with categorization

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== SCRIPT REGISTRY ==========
export interface ScriptDefinition {
  id: string;
  name: string;
  description: string;
  category: ScriptCategory;
  file: string; // Relative path from app/scripts/
  dependencies: string[]; // Other script IDs
  estimatedTime: number; // minutes
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
  aliases: string[];
  options?: ScriptOption[];
}

export type ScriptCategory = 
  | 'type-imports' 
  | 'code-quality' 
  | 'import-management'
  | 'infrastructure' 
  | 'deployment' 
  | 'backup' 
  | 'code-gen' 
  | 'file-management'
  | 'testing';

export interface ScriptOption {
  name: string;
  type: 'boolean' | 'string' | 'number';
  description: string;
  defaultValue?: any;
  required?: boolean;
}

// ========== COMPLETE SCRIPT REGISTRY ==========
export const scriptRegistry: Record<string, ScriptDefinition> = {
  // 🎯 TYPE IMPORT FIXERS (consolidated)
  'type-imports:unified': {
    id: 'type-imports:unified',
    name: 'Unified Type Import Fixer',
    description: 'Comprehensive type import fixing with backup and verification',
    category: 'type-imports',
    file: 'unified-type-import-fixer.ts',
    dependencies: [],
    estimatedTime: 5,
    riskLevel: 'low',
    tags: ['typescript', 'imports', 'fix', 'automated'],
    aliases: ['fix-types', 'fix-type-imports', 'type-fix'],
    options: [
      {
        name: 'dry-run',
        type: 'boolean',
        description: 'Preview changes without applying',
        defaultValue: false
      },
      {
        name: 'verbose',
        type: 'boolean',
        description: 'Show detailed output',
        defaultValue: false
      }
    ]
  },

  'type-imports:namespace': {
    id: 'type-imports:namespace',
    name: 'Namespace Import Fixer',
    description: 'Fix namespace imports (* as) only',
    category: 'type-imports',
    file: 'fix-type-imports-with-backup.ts',
    dependencies: [],
    estimatedTime: 2,
    riskLevel: 'low',
    tags: ['namespace', 'imports', 'typescript'],
    aliases: ['fix-namespace', 'namespace-fix'],
    options: [
      {
        name: 'namespace-only',
        type: 'boolean',
        description: 'Fix only namespace imports',
        defaultValue: true
      }
    ]
  },

  'type-imports:verify': {
    id: 'type-imports:verify',
    name: 'Type Import Verification',
    description: 'Check current type import status',
    category: 'type-imports',
    file: 'verify-namespace-imports.ts',
    dependencies: [],
    estimatedTime: 1,
    riskLevel: 'low',
    tags: ['verify', 'check', 'typescript'],
    aliases: ['check-types', 'verify-types'],
    options: []
  },

  // 🔍 CODE QUALITY & ANALYSIS
  'quality:analyze-errors': {
    id: 'quality:analyze-errors',
    name: 'Error Analysis',
    description: 'Analyze TypeScript errors and generate reports',
    category: 'code-quality',
    file: 'analyze-errors.ts',
    dependencies: [],
    estimatedTime: 3,
    riskLevel: 'low',
    tags: ['analysis', 'typescript', 'errors'],
    aliases: ['analyze-ts', 'ts-analysis'],
    options: [
      {
        name: 'output',
        type: 'string',
        description: 'Output directory for reports',
        defaultValue: './reports'
      }
    ]
  },

  'quality:circular-deps': {
    id: 'quality:circular-deps',
    name: 'Circular Dependency Detection',
    description: 'Find and report circular dependencies',
    category: 'code-quality',
    file: 'detect-all-circular-deps.ts',
    dependencies: [],
    estimatedTime: 5,
    riskLevel: 'low',
    tags: ['circular', 'dependencies', 'analysis'],
    aliases: ['check-circular', 'circular-check'],
    options: []
  },

  'quality:code-smells': {
    id: 'quality:code-smells',
    name: 'Code Smell Analysis',
    description: 'Detect code smells and anti-patterns',
    category: 'code-quality',
    file: 'analyzeCodeSmells.ts',
    dependencies: [],
    estimatedTime: 4,
    riskLevel: 'low',
    tags: ['refactoring', 'analysis', 'quality'],
    aliases: ['smells', 'code-quality'],
    options: []
  },

  // 📦 IMPORT MANAGEMENT
  'imports:deduplicate': {
    id: 'imports:deduplicate',
    name: 'Import Deduplication',
    description: 'Remove duplicate imports and organize',
    category: 'import-management',
    file: 'deduplicate-imports.ts',
    dependencies: [],
    estimatedTime: 3,
    riskLevel: 'low',
    tags: ['imports', 'cleanup', 'organization'],
    aliases: ['clean-imports', 'dedupe-imports'],
    options: [
      {
        name: 'dry-run',
        type: 'boolean',
        description: 'Preview changes without applying',
        defaultValue: false
      }
    ]
  },

  'imports:cleanup': {
    id: 'imports:cleanup',
    name: 'Import Cleanup',
    description: 'Comprehensive import cleanup and organization',
    category: 'import-management',
    file: 'import-cleanup.ts',
    dependencies: [],
    estimatedTime: 5,
    riskLevel: 'medium',
    tags: ['imports', 'cleanup', 'refactor'],
    aliases: ['import-clean', 'clean-imports'],
    options: []
  },

  'imports:fix-all': {
    id: 'imports:fix-all',
    name: 'Comprehensive Import Fix',
    description: 'Fix all import-related issues',
    category: 'import-management',
    file: 'fix-imports.ts',
    dependencies: [],
    estimatedTime: 10,
    riskLevel: 'medium',
    tags: ['imports', 'fix', 'comprehensive'],
    aliases: ['fix-imports-complete', 'import-fix-all'],
    options: [
      {
        name: 'dry-run',
        type: 'boolean',
        description: 'Preview changes without applying',
        defaultValue: false
      },
      {
        name: 'force',
        type: 'boolean',
        description: 'Force fixes even with warnings',
        defaultValue: false
      }
    ]
  },

  // 🏗️ INFRASTRUCTURE
  'infra:bootstrap': {
    id: 'infra:bootstrap',
    name: 'Project Bootstrap',
    description: 'Bootstrap project with all required setup',
    category: 'infrastructure',
    file: 'BootstrappingWorkflowManager.ts',
    dependencies: [],
    estimatedTime: 15,
    riskLevel: 'medium',
    tags: ['setup', 'bootstrap', 'infrastructure'],
    aliases: ['bootstrap', 'setup-project'],
    options: []
  },

  'infra:scaffold': {
    id: 'infra:scaffold',
    name: 'Code Scaffolding',
    description: 'Generate code templates and structure',
    category: 'infrastructure',
    file: 'CodeScaffoldingScript.ts',
    dependencies: [],
    estimatedTime: 8,
    riskLevel: 'low',
    tags: ['scaffold', 'templates', 'generator'],
    aliases: ['scaffold', 'generate-code'],
    options: [
      {
        name: 'template',
        type: 'string',
        description: 'Template to use',
        required: true
      },
      {
        name: 'name',
        type: 'string',
        description: 'Component/feature name',
        required: true
      }
    ]
  },

  'infra:database': {
    id: 'infra:database',
    name: 'Database Setup',
    description: 'Setup and configure database',
    category: 'infrastructure',
    file: 'DatabaseSetupScript.ts',
    dependencies: [],
    estimatedTime: 20,
    riskLevel: 'high',
    tags: ['database', 'setup', 'configuration'],
    aliases: ['db-setup', 'setup-db'],
    options: []
  },

  // 🚀 DEPLOYMENT
  'deploy:app': {
    id: 'deploy:app',
    name: 'Application Deployment',
    description: 'Deploy application to production',
    category: 'deployment',
    file: 'deployApp.ts',
    dependencies: [],
    estimatedTime: 30,
    riskLevel: 'high',
    tags: ['deployment', 'production', 'release'],
    aliases: ['deploy', 'release'],
    options: [
      {
        name: 'environment',
        type: 'string',
        description: 'Deployment environment',
        defaultValue: 'production',
        required: true
      },
      {
        name: 'dry-run',
        type: 'boolean',
        description: 'Simulate deployment',
        defaultValue: false
      }
    ]
  },

  'deploy:config-sync': {
    id: 'deploy:config-sync',
    name: 'Configuration Sync',
    description: 'Sync configurations across environments',
    category: 'deployment',
    file: 'sync-configs.js',
    dependencies: [],
    estimatedTime: 5,
    riskLevel: 'medium',
    tags: ['configuration', 'sync', 'deployment'],
    aliases: ['sync-config', 'config-sync'],
    options: []
  },

  // 💾 BACKUP & RECOVERY
  'backup:smart-rollback': {
    id: 'backup:smart-rollback',
    name: 'Smart Rollback',
    description: 'Rollback changes with intelligence',
    category: 'backup',
    file: 'smart-rollback.ts',
    dependencies: [],
    estimatedTime: 3,
    riskLevel: 'low',
    tags: ['rollback', 'backup', 'recovery'],
    aliases: ['rollback', 'undo-changes'],
    options: []
  },

  'backup:safe-fixer': {
    id: 'backup:safe-fixer',
    name: 'Safe Code Fixer',
    description: 'Apply fixes with automatic backups',
    category: 'backup',
    file: 'safe-fixer.ts',
    dependencies: [],
    estimatedTime: 5,
    riskLevel: 'low',
    tags: ['safe', 'backup', 'fix'],
    aliases: ['safe-fix', 'backup-fix'],
    options: [
      {
        name: 'session-id',
        type: 'string',
        description: 'Session identifier for grouping',
        defaultValue: `session-${Date.now()}`
      }
    ]
  },

  'backup:utils': {
    id: 'backup:utils',
    name: 'Backup Utilities',
    description: 'Backup management utilities',
    category: 'backup',
    file: 'backup-utils.ts',
    dependencies: [],
    estimatedTime: 2,
    riskLevel: 'low',
    tags: ['backup', 'utilities', 'management'],
    aliases: ['backup-manage', 'backup-tools'],
    options: []
  },

  // 🛠️ CODE GENERATION
  'codegen:components': {
    id: 'codegen:components',
    name: 'Component Generator',
    description: 'Generate React components with best practices',
    category: 'code-gen',
    file: 'generateComponentsScript.ts',
    dependencies: [],
    estimatedTime: 3,
    riskLevel: 'low',
    tags: ['generator', 'components', 'react'],
    aliases: ['gen-components', 'create-component'],
    options: [
      {
        name: 'type',
        type: 'string',
        description: 'Component type (functional, class, hook)',
        defaultValue: 'functional'
      },
      {
        name: 'name',
        type: 'string',
        description: 'Component name',
        required: true
      }
    ]
  },

  'codegen:interface-imports': {
    id: 'codegen:interface-imports',
    name: 'Interface Import Fixer',
    description: 'Fix interface imports automatically',
    category: 'code-gen',
    file: 'fix-interface-imports.ts',
    dependencies: [],
    estimatedTime: 4,
    riskLevel: 'medium',
    tags: ['interface', 'imports', 'fix'],
    aliases: ['fix-interfaces', 'interface-imports'],
    options: [
      {
        name: 'dry-run',
        type: 'boolean',
        description: 'Preview changes',
        defaultValue: false
      }
    ]
  },

  // 📁 FILE MANAGEMENT
  'files:fix-filenames': {
    id: 'files:fix-filenames',
    name: 'Filename Case Fixer',
    description: 'Fix filename casing issues',
    category: 'file-management',
    file: 'fixFilenameCases.ts',
    dependencies: [],
    estimatedTime: 5,
    riskLevel: 'low',
    tags: ['files', 'names', 'casing'],
    aliases: ['fix-names', 'filename-fix'],
    options: [
      {
        name: 'dry-run',
        type: 'boolean',
        description: 'Preview changes',
        defaultValue: false
      }
    ]
  },

  'files:fix-comments': {
    id: 'files:fix-comments',
    name: 'Comment Fixer',
    description: 'Fix missing and incorrect comments',
    category: 'file-management',
    file: 'fix-missing-comment-errors.ts',
    dependencies: [],
    estimatedTime: 6,
    riskLevel: 'low',
    tags: ['comments', 'documentation', 'fix'],
    aliases: ['fix-comments', 'comment-fix'],
    options: []
  },

  'files:verify-comments': {
    id: 'files:verify-comments',
    name: 'Comment Verification',
    description: 'Verify comment integrity',
    category: 'file-management',
    file: 'verify-comment-fixes.ts',
    dependencies: [],
    estimatedTime: 2,
    riskLevel: 'low',
    tags: ['comments', 'verify', 'quality'],
    aliases: ['check-comments', 'verify-docs'],
    options: []
  },

  // 🧪 TESTING & DEBUG
  'test:error-analysis': {
    id: 'test:error-analysis',
    name: 'Error Analysis Testing',
    description: 'Test error analysis system',
    category: 'testing',
    file: 'test-error-analysis.ts',
    dependencies: [],
    estimatedTime: 3,
    riskLevel: 'low',
    tags: ['test', 'errors', 'analysis'],
    aliases: ['test-errors', 'error-test'],
    options: []
  },

  'test:debug-ts': {
    id: 'test:debug-ts',
    name: 'TypeScript Debug',
    description: 'Debug TypeScript issues',
    category: 'testing',
    file: 'debug-ts-error.ts',
    dependencies: [],
    estimatedTime: 4,
    riskLevel: 'low',
    tags: ['debug', 'typescript', 'testing'],
    aliases: ['ts-debug', 'debug-typescript'],
    options: []
  },

  'test:diagnose': {
    id: 'test:diagnose',
    name: 'Issue Diagnosis',
    description: 'Diagnose specific issues',
    category: 'testing',
    file: 'diagnose-line-specific.js',
    dependencies: [],
    estimatedTime: 5,
    riskLevel: 'low',
    tags: ['diagnose', 'debug', 'issues'],
    aliases: ['diagnose', 'troubleshoot'],
    options: []
  }
};

interface ScriptExecutionMetrics {
  duration: number;
  success: boolean;
  // ... other properties
}

// ========== SCRIPT MANAGER ==========
export class UnifiedScriptManager {
  private executedScripts: string[] = [];
  private scriptMetrics: Record<string, any> = {};
  private scriptDir: string;

  constructor() {
    this.scriptDir = path.join(__dirname);
  }

  async run(scriptId: string, options: Record<string, any> = {}): Promise<ScriptResult> {
    const script = scriptRegistry[scriptId];
    if (!script) {
      throw new Error(`Script ${scriptId} not found. Use 'list' to see available scripts.`);
    }

    console.log(`🚀 Running: ${script.name}`);
    console.log('='.repeat(60));
    console.log(`📝 Description: ${script.description}`);
    console.log(`⏱️  Estimated Time: ${script.estimatedTime} minutes`);
    console.log(`⚠️  Risk Level: ${script.riskLevel.toUpperCase()}`);
    console.log('='.repeat(60));

    const startTime = Date.now();

    try {
      // Check dependencies
      await this.checkDependencies(script);

      // Build command with options
      const command = this.buildCommand(script, options);

      // Execute script
      const result = await this.executeCommand(command);

      // Record metrics
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.recordMetrics(scriptId, duration, true);

      this.executedScripts.push(scriptId);

      return {
        success: true,
        scriptId,
        duration,
        output: result,
        nextScripts: this.suggestNextScripts(script)
      };

    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      this.recordMetrics(scriptId, duration, false);

      return {
        success: false,
        scriptId,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runBatch(scriptIds: string[], options: Record<string, any> = {}): Promise<BatchResult> {
    console.log(`🔄 Running batch of ${scriptIds.length} scripts`);
    console.log('='.repeat(60));

    const results: ScriptResult[] = [];
    const failed: string[] = [];

    for (const scriptId of scriptIds) {
      try {
        const result = await this.run(scriptId, options);
        results.push(result);
        
        if (!result.success) {
          failed.push(scriptId);
        }
      } catch (error) {
        failed.push(scriptId);
        results.push({
          success: false,
          scriptId,
          error: error instanceof Error ? error.message : 'Batch execution error'
        });
      }
    }

    return {
      total: scriptIds.length,
      success: scriptIds.length - failed.length,
      failed,
      results,
      totalTime: results.reduce((sum, r) => sum + (r.duration || 0), 0)
    };
  }

  async runByCategory(category: ScriptCategory, options: Record<string, any> = {}): Promise<BatchResult> {
    const scriptIds = Object.values(scriptRegistry)
      .filter(script => script.category === category)
      .map(script => script.id);

    console.log(`📁 Running all scripts in category: ${category} (${scriptIds.length} scripts)`);
    return this.runBatch(scriptIds, options);
  }

  async runWorkflow(workflowName: string): Promise<WorkflowResult> {
    const workflows: Record<string, string[]> = {
      'type-import-fix': [
        'type-imports:verify',
        'type-imports:unified',
        'type-imports:verify'
      ],
      'code-quality-check': [
        'quality:analyze-errors',
        'quality:circular-deps',
        'quality:code-smells'
      ],
      'import-cleanup': [
        'imports:cleanup',
        'imports:deduplicate',
        'imports:fix-all'
      ],
      'pre-deployment': [
        'type-imports:verify',
        'quality:analyze-errors',
        'imports:cleanup',
        'test:error-analysis'
      ],
      'project-setup': [
        'infra:bootstrap',
        'infra:scaffold',
        'infra:database'
      ]
    };

    const workflow = workflows[workflowName];
    if (!workflow) {
      throw new Error(`Workflow ${workflowName} not found. Available: ${Object.keys(workflows).join(', ')}`);
    }

    console.log(`🔄 Running Workflow: ${workflowName}`);
    console.log('='.repeat(60));

    const results = await this.runBatch(workflow);

    return {
      workflowName,
      ...results,
      recommendation: this.generateWorkflowRecommendation(workflowName, results)
    };
  }

  private async checkDependencies(script: ScriptDefinition): Promise<void> {
    for (const depId of script.dependencies) {
      if (!this.executedScripts.includes(depId)) {
        console.log(`⚠️  Dependency ${depId} not run. Running it now...`);
        await this.run(depId);
      }
    }
  }

  private buildCommand(script: ScriptDefinition, options: Record<string, any>): string {
    const scriptPath = path.join(this.scriptDir, script.file);
    
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Script file not found: ${scriptPath}`);
    }

    let command = `tsx "${scriptPath}"`;

    // Add options
    if (script.options && script.options.length > 0) {
      for (const option of script.options) {
        if (options[option.name] !== undefined) {
          if (option.type === 'boolean') {
            if (options[option.name] === true) {
              command += ` --${option.name}`;
            }
          } else {
            command += ` --${option.name} "${options[option.name]}"`;
          }
        } else if (option.required) {
          throw new Error(`Required option missing: ${option.name}`);
        }
      }
    }

    return command;
  }

  private async executeCommand(command: string): Promise<string> {
    console.log(`💻 Executing: ${command}`);
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });
      
      console.log(output);
      return output;
    } catch (error: any) {
      console.error('❌ Command failed:', error.message);
      if (error.stdout) console.log('STDOUT:', error.stdout.toString());
      if (error.stderr) console.log('STDERR:', error.stderr.toString());
      throw error;
    }
  }

  private recordMetrics(scriptId: string, duration: number, success: boolean): void {
    if (!this.scriptMetrics[scriptId]) {
      this.scriptMetrics[scriptId] = [];
    }
    
    this.scriptMetrics[scriptId].push({
      timestamp: new Date().toISOString(),
      duration,
      success,
      scriptId
    });
  }

  private suggestNextScripts(script: ScriptDefinition): string[] {
    const suggestions: string[] = [];
    const categories = script.tags;

    if (categories.includes('typescript')) {
      suggestions.push('quality:analyze-errors');
    }
    
    if (categories.includes('imports')) {
      suggestions.push('imports:deduplicate');
    }
    
    if (categories.includes('fix')) {
      suggestions.push('type-imports:verify');
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  private generateWorkflowRecommendation(workflowName: string, results: BatchResult): string {
    if (results.failed.length === 0) {
      return '✅ All steps completed successfully!';
    }
    
    if (workflowName === 'type-import-fix' && results.failed.includes('type-imports:verify')) {
      return '⚠️ Some type import errors remain. Consider manual review.';
    }
    
    if (workflowName === 'pre-deployment' && results.failed.length > 0) {
      return '❌ Pre-deployment checks failed. Do not deploy.';
    }
    
    return `⚠️ ${results.failed.length} steps failed. Review before proceeding.`;
  }

  listScripts(category?: ScriptCategory): void {
    console.log('📋 Available Scripts');
    console.log('='.repeat(60));
    
    const scripts = category 
      ? Object.values(scriptRegistry).filter(s => s.category === category)
      : Object.values(scriptRegistry);
    
    // Group by category
    const byCategory: Record<string, ScriptDefinition[]> = {};
    
    scripts.forEach(script => {
      if (!byCategory[script.category]) {
        byCategory[script.category] = [];
      }
      byCategory[script.category].push(script);
    });

    for (const [categoryName, categoryScripts] of Object.entries(byCategory)) {
      console.log(`\n📁 ${categoryName.toUpperCase()}`);
      console.log('─'.repeat(40));
      
      categoryScripts.forEach(script => {
        console.log(`  ${script.id}`);
        console.log(`    ${script.name}`);
        console.log(`    📝 ${script.description}`);
        console.log(`    ⏱️  ${script.estimatedTime} min | ⚠️ ${script.riskLevel}`);
        console.log(`    🏷️  ${script.tags.join(', ')}`);
        if (script.aliases.length > 0) {
          console.log(`    🔤 Aliases: ${script.aliases.join(', ')}`);
        }
        console.log();
      });
    }
  }

  listWorkflows(): void {
    console.log('🔄 Available Workflows');
    console.log('='.repeat(60));
    
    const workflows = {
      'type-import-fix': 'Complete type import fixing workflow',
      'code-quality-check': 'Comprehensive code quality analysis',
      'import-cleanup': 'Import cleanup and organization',
      'pre-deployment': 'Pre-deployment checks and fixes',
      'project-setup': 'Complete project setup'
    };

    for (const [name, description] of Object.entries(workflows)) {
      console.log(`  ${name}`);
      console.log(`    📝 ${description}`);
      console.log(`    Run: pnpm script:run --workflow=${name}`);
      console.log();
    }
  }

  getMetrics(): ScriptMetrics {
    const totalExecutions = Object.values(this.scriptMetrics).flat().length;
    const successful = Object.values(this.scriptMetrics)
      .flat()
      .filter((m: ScriptExecutionMetrics) => m.success).length;
    
    const totalTime = Object.values(this.scriptMetrics)
      .flat()
      .reduce((sum: number, m: ScriptExecutionMetrics) => sum + m.duration, 0);

    return {
      totalExecutions,
      successRate: totalExecutions > 0 ? (successful / totalExecutions) * 100 : 0,
      totalTime,
      recentScripts: this.executedScripts.slice(-10),
      scriptStats: Object.entries(this.scriptMetrics).map(([id, metrics]) => ({
        scriptId: id,
        executions: metrics.length,
        avgDuration: metrics.reduce((sum: number, m: ScriptExecutionMetrics) => sum + m.duration, 0) / metrics.length,
        successRate: metrics.filter((m: ScriptExecutionMetrics) => m.success).length / metrics.length * 100
      }))
    };
  }
}

// ========== SUPPORTING TYPES ==========
export interface ScriptResult {
  success: boolean;
  scriptId: string;
  duration?: number;
  output?: string;
  error?: string;
  nextScripts?: string[];
}

export interface BatchResult {
  total: number;
  success: number;
  failed: string[];
  results: ScriptResult[];
  totalTime: number;
}

export interface WorkflowResult extends BatchResult {
  workflowName: string;
  recommendation: string;
}

export interface ScriptMetrics {
  totalExecutions: number;
  successRate: number;
  totalTime: number;
  recentScripts: string[];
  scriptStats: ScriptStat[];
}

export interface ScriptStat {
  scriptId: string;
  executions: number;
  avgDuration: number;
  successRate: number;
}

// ========== CLI INTERFACE ==========
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1];
  const options: Record<string, any> = {};

  // Parse options
  for (let i = 2; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const [key, value] = args[i].substring(2).split('=');
      if (value === undefined) {
        options[key] = true;
      } else if (value === 'true') {
        options[key] = true;
      } else if (value === 'false') {
        options[key] = false;
      } else if (!isNaN(Number(value))) {
        options[key] = Number(value);
      } else {
        options[key] = value;
      }
    }
  }

    const manager = new UnifiedScriptManager();

  try {
    switch (command) {
      case 'run':
        if (!target) {
          console.error('❌ Please specify a script ID');
          console.log('Usage: pnpm script:run <script-id> [options]');
          process.exit(1);
        }
        
        const result = await manager.run(target, options);
        
        if (result.success) {
          console.log(`\n✅ Script ${target} completed successfully in ${result.duration}s`);
          if (result.nextScripts && result.nextScripts.length > 0) {
            console.log('💡 Suggested next scripts:');
            result.nextScripts.forEach(next => console.log(`  - ${next}`));
          }
        } else {
          console.log(`\n❌ Script ${target} failed: ${result.error}`);
          process.exit(1);
        }
        break;

      case 'batch':
        if (!target) {
          console.error('❌ Please specify script IDs (comma-separated)');
          console.log('Usage: pnpm script:batch <script-id,script-id2,...>');
          process.exit(1);
        }
        
        const scriptIds = target.split(',');
        const batchResult = await manager.runBatch(scriptIds, options);
        
        console.log(`\n📊 Batch Results:`);
        console.log(`   Total: ${batchResult.total}`);
        console.log(`   Success: ${batchResult.success}`);
        console.log(`   Failed: ${batchResult.failed.length > 0 ? batchResult.failed.join(', ') : 'None'}`);
        console.log(`   Total Time: ${batchResult.totalTime}s`);
        break;

      case 'category':
        if (!target) {
          console.error('❌ Please specify a category');
          console.log('Available categories:');
          const categories = [...new Set(Object.values(scriptRegistry).map(s => s.category))];
          categories.forEach(cat => console.log(`  - ${cat}`));
          process.exit(1);
        }
        
        const categoryResult = await manager.runByCategory(target as ScriptCategory, options);
        
        console.log(`\n📊 Category Results (${target}):`);
        console.log(`   Total: ${categoryResult.total}`);
        console.log(`   Success: ${categoryResult.success}`);
        console.log(`   Failed: ${categoryResult.failed.length}`);
        console.log(`   Total Time: ${categoryResult.totalTime}s`);
        break;

      case 'workflow':
        if (!target) {
          console.error('❌ Please specify a workflow');
          manager.listWorkflows();
          process.exit(1);
        }
        
        const workflowResult = await manager.runWorkflow(target);
        
        console.log(`\n📊 Workflow Results (${target}):`);
        console.log(`   Total Steps: ${workflowResult.total}`);
        console.log(`   Successful: ${workflowResult.success}`);
        console.log(`   Failed: ${workflowResult.failed.length > 0 ? workflowResult.failed.join(', ') : 'None'}`);
        console.log(`   Total Time: ${workflowResult.totalTime}s`);
        console.log(`   Recommendation: ${workflowResult.recommendation}`);
        break;

      case 'list':
        if (target) {
          manager.listScripts(target as ScriptCategory);
        } else {
          manager.listScripts();
        }
        break;

      case 'workflows':
        manager.listWorkflows();
        break;

      case 'metrics':
        const metrics = manager.getMetrics();
        console.log(JSON.stringify(metrics, null, 2));
        break;

      case 'help':
      default:
        console.log(`
Unified Script Manager
======================

Commands:
  run <script-id> [options]    Run a single script
  batch <id1,id2,...>          Run multiple scripts
  category <category>          Run all scripts in a category
  workflow <workflow>          Run a predefined workflow
  list [category]              List available scripts
  workflows                    List available workflows
  metrics                      Show execution metrics
  help                         Show this help

Examples:
  pnpm script:run type-imports:unified --dry-run
  pnpm script:batch type-imports:verify,quality:analyze-errors
  pnpm script:category code-quality
  pnpm script:workflow pre-deployment
  pnpm script:list type-imports
`);
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run only if this file is executed directly
if (import.meta.url === fileURLToPath(import.meta.url)) {
  main().catch(console.error);
}