#!/usr/bin/env tsx

// scripts/type-imports/shared-imports.ts
// Shared imports for type import fixers

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
export {
    detectMixedImportFromText,
    MixedImport
} from './mixed-import-fixer';

import type { BackupInfo, GeneralFixResult,  ImportPattern} from '@/app/scripts/import-fix-types'

// Import utility functions
import {
    shouldBeTypeImport,
    fixImportStatement,
    findInterfaceExports,
    createBackup,
    groupFixesByFile,
    sortFixesDescending,
    getContextTips
} from '@/app/scripts/import-utils';

// Import specialized fixers
import { verifyNamespaceImports } from '@/app/scripts/verify-namespace-imports';
import { TypeImportFixerWithBackup } from '@/scripts/typescript/type-imports/fix-type-imports-with-backup';
import type { FixResult, TypeImportError } from '@/app/scripts/import-utils'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Re-export everything
export {
    execSync,
    fs,
    path,
    fileURLToPath,
    __filename,
    __dirname,
    // Types
    type FixResult,
    type TypeImportError,
    type BackupInfo,
    type GeneralFixResult,
    type ImportPattern,
    // Utilities
    shouldBeTypeImport,
    fixImportStatement,
    findInterfaceExports,
    createBackup,
    groupFixesByFile,
    sortFixesDescending,
    getContextTips,
    // Specialized fixers
    verifyNamespaceImports,
    TypeImportFixerWithBackup
};