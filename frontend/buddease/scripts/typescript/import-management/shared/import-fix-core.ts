#!/usr/bin/env tsx
// scripts/typescript/import-management/shared/import-fix-core.ts
// Shared core functionality for import fixing

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { createBackup } from '@/app/scripts/import-utils';
import { fixInterfaceImports } from '@/app/scripts/fix-interface-imports'
import { fixGeneralImports } from '@/scripts/typescript/import-management/fix-general-imports'
import { fixMixedImports } from '@/app/scripts/fix-mixed-type-imports'
import type { FixResult, ImportFix } from '@/app/scripts/import-fix-types'

// ============ SHARED INTERFACES ============
export interface UnifiedFixOptions {
  dryRun?: boolean;
  backup?: boolean;
  skipMixed?: boolean;
  skipInterface?: boolean;
  skipGeneral?: boolean;
  verbose?: boolean;
  targetPath?: string;
  confidenceThreshold?: number;
}

export interface PassResult {
  modified: boolean;
  content: string;
  count: number;
  fixes: ImportFix[];
}

export interface FixSessionData {
  original: string;
  fixed: string;
  backupPath?: string;
  allFixes: ImportFix[];
  passResults: Record<string, PassResult>;
  errorsFixed: number;
  success: boolean;
}


/**
 * Resolves the source path for an import statement
 * Handles relative paths, absolute paths, and module aliases
 */
export function resolveSourcePath(
  source: string,
  filePath: string,
  baseDir: string = process.cwd()
): string {
  // If it's already an absolute path, return as-is
  if (path.isAbsolute(source)) {
    return source;
  }

  // If it's a module alias (starts with @ or other pattern), handle it
  if (source.startsWith('@/') || source.startsWith('~')) {
    // For module aliases, we need to resolve to the actual path
    // This assumes your tsconfig has path mappings configured
    const tsConfig = require('../../tsconfig.json'); // Adjust path as needed
    const { paths = {}, baseUrl = '.' } = tsConfig.compilerOptions || {};
    
    // Check if the source matches any path alias
    for (const [alias, mappings] of Object.entries(paths)) {
      const aliasPattern = alias.replace('/*', '');
      if (source.startsWith(aliasPattern)) {
        const relativePath = source.substring(aliasPattern.length);
        // Use the first mapping (adjust as needed for your setup)
        const mappedPath = mappings[0].replace('/*', '') + relativePath;
        return path.resolve(baseDir, baseUrl, mappedPath);
      }
    }
    
    // If no alias matches, try to resolve from baseUrl
    return path.resolve(baseDir, baseUrl, source.replace(/^[@~]+\//, ''));
  }

  // For relative paths, resolve relative to the current file
  if (source.startsWith('./') || source.startsWith('../')) {
    const fileDir = path.dirname(filePath);
    return path.resolve(fileDir, source);
  }

  // For bare module imports (node_modules), return as-is
  // These will be resolved by Node.js/TypeScript
  return source;
}


// ============ SHARED HELPER FUNCTIONS ============
export function getDefaultOptions(options: UnifiedFixOptions = {}): Required<UnifiedFixOptions> {
  return {
    dryRun: options.dryRun ?? false,
    backup: options.backup ?? true,
    skipMixed: options.skipMixed ?? false,
    skipInterface: options.skipInterface ?? false,
    skipGeneral: options.skipGeneral ?? false,
    verbose: options.verbose ?? false,
    targetPath: options.targetPath ?? '',
    confidenceThreshold: options.confidenceThreshold ?? 70
  };
}

export function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

export function fixPhaseHookConfig(content: string, filePath: string): PassResult {
  const regex = /import\s+\{\s*([^}]*#PhaseHookConfig[^}]*)\}\s+from\s+(['"])([^'"]+)\2/g;
  const fixes: ImportFix[] = [];
  let modifiedContent = content;
  let count = 0;

  const matches = [...content.matchAll(regex)];
  for (const match of matches) {
    const [, imports, , sourcePath] = match;
    const importItems = imports.split(',').map(i => i.trim());
    
    const phaseHookItem = importItems.find(i => i.includes('#PhaseHookConfig'));
    const otherItems = importItems.filter(i => i !== phaseHookItem);

    if (phaseHookItem) {
      const newLines: string[] = [];
      
      if (otherItems.length > 0) {
        newLines.push(`import { ${otherItems.join(', ')} } from '${sourcePath}';`);
      }
      newLines.push(`import { ${phaseHookItem} } from '${sourcePath}';`);

      modifiedContent = modifiedContent.replace(match[0], newLines.join('\n'));
      
      fixes.push({
        filePath,
        lineNumber: getLineNumber(content, match.index || 0),
        originalLine: match[0],
        newLine: newLines.join('\n'),
        missingTypes: ['#PhaseHookConfig'],
        targetImportPath: sourcePath,
        reason: 'Separate #PhaseHookConfig from other imports',
        fixType: 'split-import',
        confidenceScore: 95,
        autoFixable: true,
        typeName: '#PhaseHookConfig',
        errorCode: 'TS1371',
        status: 'pending'
      });
      
      count++;
    }
  }

  return { modified: count > 0, content: modifiedContent, count, fixes };
}


/**
 * Converts a FixResult to a PassResult
 */
export function fixResultToPassResult(fixResult: FixResult): PassResult {
  return {
    modified: fixResult.success, // or fixResult.fixes && fixResult.fixes.length > 0
    content: fixResult.fixed,
    count: fixResult.fixes || 0,
    fixes: [] // You might need to extract fixes from fixResult.metadata
  };
}



/**
 * Converts a PassResult to a FixResult
 */
export function passResultToFixResult(
  passResult: PassResult,
  filePath: string,
  startTime: Date = new Date()
): FixResult {
  const endTime = new Date();
  const duration = endTime.getTime() - startTime.getTime();
  
  return {
    file: filePath,
    original: '', // You might need to pass original content
    fixed: passResult.content,
    success: passResult.modified,
    errorsFixed: passResult.count,
    timeSaved: Math.ceil(passResult.count * 2),
    timeTaken: duration,
    fixes: passResult.count,
    passSummary: {
      mixed: 0,
      interface: passResult.count,
      general: 0,
      total: passResult.count,
      typeOnlyImports: passResult.fixes.filter(f => f.fixType === 'add-type-keyword').length,
      separatedImports: passResult.fixes.filter(f => f.fixType === 'separate-type-imports').length,
      phaseHook: 0
    },
    metadata: {
      fixType: 'interface',
      area: 'interface-imports',
      tags: ['typescript', 'import'],
      timestamp: new Date()
    }
  };
}

export async function runAllFixPasses(
  content: string, 
  filePath: string, 
  options: Required<UnifiedFixOptions>
): Promise<FixSessionData> {
  const originalContent = content;
  const allFixes: ImportFix[] = [];
  const passResults: Record<string, PassResult> = {};
  let currentContent = content;

  // Pass 1: Fix #PhaseHookConfig patterns
  if (!options.skipGeneral) {
    const phaseResult = fixPhaseHookConfig(currentContent, filePath);
    if (phaseResult.modified) {
      currentContent = phaseResult.content;
      allFixes.push(...phaseResult.fixes);
      passResults.phaseHook = phaseResult;
    }
  }

  // Pass 2: Fix mixed type/value imports
  if (!options.skipMixed) {
    try {
      const mixedResult = await fixMixedImports(currentContent, filePath);
      if (mixedResult.modified) {
        currentContent = mixedResult.content;
        allFixes.push(...mixedResult.fixes);
        passResults.mixed = mixedResult;
      }
    } catch (error) {
      console.error('❌ Mixed import fixer failed:', error);
    }
  }

  // Pass 3: Fix interface/type-only imports
  if (!options.skipInterface) {
    try {
      const interfaceResult = await fixInterfaceImports(currentContent, filePath);
      if (interfaceResult.modified) {
        currentContent = interfaceResult.content;
        allFixes.push(...interfaceResult.fixes); // This should now work
        passResults.interface = interfaceResult;
      }
    } catch (error) {
      console.error('❌ Interface import fixer failed:', error);
    }
  }

  // Pass 4: Fix general import issues
  if (!options.skipGeneral) {
    try {
      const generalResult = await fixGeneralImports(currentContent, filePath);
      if (generalResult.modified) {
        currentContent = generalResult.content;
        allFixes.push(...generalResult.fixes);
        passResults.general = generalResult;
      }
    } catch (error) {
      console.error('❌ General import fixer failed:', error);
    }
  }

  const errorsFixed = allFixes.length;
  const success = errorsFixed > 0 && currentContent !== originalContent;

  return {
    original: originalContent,
    fixed: currentContent,
    allFixes,
    passResults,
    errorsFixed,
    success
  };
}

export function buildSuccessResult(
  filePath: string,
  data: FixSessionData & { backupPath?: string; startTime: Date },
  options: Required<UnifiedFixOptions>
): FixResult {
  const { original, fixed, backupPath, allFixes, passResults, errorsFixed } = data;
  
  const passSummary = {
    mixed: passResults.mixed?.count || 0,
    interface: passResults.interface?.count || 0,
    general: passResults.general?.count || 0,
    phaseHook: passResults.phaseHook?.count || 0,
    total: errorsFixed
  };

  const metadata: NonNullable<FixResult['metadata']> = {
    typeImports: [],
    runtimeImports: [],
    fixType: 'refactor',
    area: 'import-fixing',
    tags: ['unified-import-fixer', 'multi-pass'],
    timestamp: new Date(),
    passSummary,
    customFields: {
      passDetails: {
        phaseHook: { count: passResults.phaseHook?.count || 0 },
        mixed: { count: passResults.mixed?.count || 0 },
        interface: { count: passResults.interface?.count || 0 },
        general: { count: passResults.general?.count || 0 }
      },
      backupPath,
      confidenceThreshold: options.confidenceThreshold,
      totalFixes: errorsFixed,
      executionTime: new Date().getTime() - data.startTime.getTime()
    }
  };

  return {
    file: filePath,
    original,
    fixed,
    success: true,
    line: 0,
    typeName: 'UnifiedImportFixResult',
    category: 'imports',
    description: `Fixed ${errorsFixed} import issues across ${Object.keys(passResults).length} passes`,
    errorsFixed,
    timeSaved: Math.ceil(errorsFixed * 1.5),
    actualCount: errorsFixed,
    metadata,
    backupFilePath: backupPath,
    fixId: `unified-${Date.now()}`,
    status: 'applied',
    appliedAt: new Date()
  };
}
