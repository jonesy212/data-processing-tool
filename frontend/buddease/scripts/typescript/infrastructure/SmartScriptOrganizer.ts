#!/usr/bin/env tsx
// scripts/smart-organizer/SmartScriptOrganizer.ts

import fs from 'fs';
import path from 'path';


interface SymlinkRecord {
  originalPath: string;
  targetPath: string;
  created: Date;
  scriptId?: string;
  category: string;
  status: 'active' | 'broken' | 'removed';
}

interface SymlinkReport {
  timestamp: Date;
  totalSymlinks: number;
  active: number;
  broken: number;
  symlinks: SymlinkRecord[];
  brokenSymlinks: SymlinkRecord[];
}


interface ScriptInfo {
  path: string;
  name: string;
  type: 'shell' | 'typescript' | 'binary' | 'unknown';
  category: string;
  language: string;
  shebang?: string;
  size: number;
  isExecutable: boolean;
}

interface CategoryRule {
  pattern: RegExp;
  category: string;
  destination: string;
  priority: number;
}

class SmartScriptOrganizer {
  private symlinksCreated: SymlinkRecord[] = [];
  private symlinkReportPath = path.resolve('symlink-report.json');

  private categories: CategoryRule[] = [
    // ========== HIGHEST PRIORITY: YOUR SPECIFIC FILES ==========

    { pattern: /test-.*\.(js|mjs|cjs|ts)$/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /debug-.*\.(js|mjs|cjs|ts)$/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /fix-.*\.(js|mjs|cjs)$/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    { pattern: /type-import-fixer-with-backup/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 1 },
    
    // Type Import Fixers
    { pattern: /fix-all-type-imports/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 1 },
    { pattern: /fix-all-type-imports-comprehensive/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 1 },
    { pattern: /fix-type-imports-with-backup/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 1 },
    { pattern: /fix-mixed-type-imports/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 1 },
    { pattern: /verify-namespace-imports/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 1 },
    { pattern: /type-import-fixer-with-backup\.ts$/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 1 },
    
    // Import Management
    { pattern: /fix-imports\.ts$/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    { pattern: /deduplicate-imports/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    { pattern: /import-cleanup/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    { pattern: /fix-interface-imports/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    { pattern: /import-utils/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    { pattern: /import-validator/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    { pattern: /find-draft-js-imports\.ts$/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    { pattern: /fix-all-headers\.ts$/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    { pattern: /standalone-import-scanner\.ts$/i, category: 'import-management', destination: 'typescript/import-management', priority: 1 },
    
    // Code Quality
    { pattern: /analyze-errors\.ts$/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /detect-all-circular-deps/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /analyzeCodeSmells/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /debug-ts-error/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /check-type-consistency/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /check-braces/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /CodeQualityScript\.ts$/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /debug-typescript-errors\.ts$/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /debug-babel\.ts$/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    { pattern: /debug-roadmaps\.ts$/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 1 },
    
    // Infrastructure
    { pattern: /BootstrappingWorkflowManager/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 1 },
    { pattern: /ProjectPhaseWorkflowManager/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 1 },
    { pattern: /CodeScaffoldingScript/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 1 },
    { pattern: /DatabaseSetupScript/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 1 },
    { pattern: /DependencyInstallationScript/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 1 },
    { pattern: /ApiSynchronizationScript\.ts$/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 1 },
    { pattern: /ApplicationSetupScript\.ts$/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 1 },
    { pattern: /SmartScriptOrganizer\.ts$/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 1 },
    { pattern: /snapshot-authority\.ts$/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 1 },
    
    // File Management
    { pattern: /fixFilenameCases/i, category: 'file-management', destination: 'typescript/file-management', priority: 1 },
    { pattern: /fix-missing-comment-errors/i, category: 'file-management', destination: 'typescript/file-management', priority: 1 },
    { pattern: /verify-comment-fixes/i, category: 'file-management', destination: 'typescript/file-management', priority: 1 },
    { pattern: /standardize-entry-points/i, category: 'file-management', destination: 'typescript/file-management', priority: 1 },
    { pattern: /fix-incorrect-filename-comments/i, category: 'file-management', destination: 'typescript/file-management', priority: 1 },
    
    // Backup & Recovery
    { pattern: /safe-fixer/i, category: 'backup-recovery', destination: 'typescript/backup-recovery', priority: 1 },
    { pattern: /smart-rollback/i, category: 'backup-recovery', destination: 'typescript/backup-recovery', priority: 1 },
    { pattern: /backup-utils/i, category: 'backup-recovery', destination: 'typescript/backup-recovery', priority: 1 },
    { pattern: /run-phase-safely/i, category: 'backup-recovery', destination: 'typescript/backup-recovery', priority: 1 },
    { pattern: /DataBackup\.ts$/i, category: 'backup-recovery', destination: 'typescript/backup-recovery', priority: 1 },
    
    // Testing & Debug
    { pattern: /test-error-analysis/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /diagnose-line-specific/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /diagnose-snapshots/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /test-import/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /test-headers-fix\.ts$/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /run-report-tests\.ts$/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /test-reports-now\.ts$/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /DiagnoseSnippet\.tsx$/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /SnippetTest\.tsx$/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /TestSnippet\.tsx$/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /TestSnippetHelp\.tsx$/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    { pattern: /test-analyzer\.ts$/i, category: 'testing', destination: 'typescript/testing', priority: 1 },
    
    // Code Generation
    { pattern: /generateComponentsScript/i, category: 'code-generation', destination: 'typescript/code-generation', priority: 1 },
    { pattern: /TemplateGenerator/i, category: 'code-generation', destination: 'typescript/code-generation', priority: 1 },
    { pattern: /ConfigurationGenerationScript/i, category: 'code-generation', destination: 'typescript/code-generation', priority: 1 },
    { pattern: /QualityChecksScript/i, category: 'code-generation', destination: 'typescript/code-generation', priority: 1 },
    { pattern: /generateComponentsScript\.ts$/i, category: 'code-generation', destination: 'typescript/code-generation', priority: 1 },
    
    // Config files
    { pattern: /vite\.config\.ts$/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /\.config\.(ts|js)$/i, category: 'config', destination: 'typescript/config', priority: 10 },
    { pattern: /vite\.config/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /webpack\.config/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /next\.config/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /rollup\.config/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /babel\.config/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /\.eslintrc\.js$/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /metro\.config\.js$/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /jest\.config\.js$/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /vitest\.config\.js$/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /DynamicFormConfig\.ts$/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /BackendStructureComponent\.tsx$/i, category: 'config', destination: 'typescript/config', priority: 1 },
    { pattern: /appDetailsConfig\.ts$/i, category: 'config', destination: 'typescript/config', priority: 1 },
    
    // Utility files
    { pattern: /CallButton\.tsx$/i, category: 'utils', destination: 'typescript/utils', priority: 1 },
    { pattern: /DIDProfile\.tsx$/i, category: 'utils', destination: 'typescript/utils', priority: 1 },
    
    // Unified
    { pattern: /UnifiedScriptManager/i, category: 'unified', destination: 'unified', priority: 1 },
    
    // ========== HIGH PRIORITY SHELL SCRIPTS ==========
    { pattern: /check-snapshot-imports\.sh/i, category: 'build', destination: 'shell/build', priority: 1 },
    { pattern: /pre-commit\.sh/i, category: 'git', destination: 'shell/git', priority: 1 },
    { pattern: /header-test\.sh/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /compare-comments-backup\.sh/i, category: 'backup', destination: 'shell/backup', priority: 1 },
    { pattern: /sync_shared_code\.sh/i, category: 'git', destination: 'shell/git', priority: 1 },
    { pattern: /track-progress\.sh/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /update-tsconfig-exclude\.sh/i, category: 'config', destination: 'shell/config', priority: 1 },
    { pattern: /verify-remaining-issues\.sh/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /test-video-sagas/i, category: 'test', destination: 'shell/test', priority: 1 },
    
    // Shell scripts - specific patterns
    { pattern: /fix-all-type-imports\.sh$/i, category: 'backup', destination: 'shell/backup', priority: 1 },
    { pattern: /emergency-rollback\.sh$/i, category: 'git', destination: 'shell/git', priority: 1 },
    { pattern: /smart-rollback\.sh$/i, category: 'backup', destination: 'shell/backup', priority: 1 },
    { pattern: /husky\.sh$/i, category: 'git', destination: 'shell/git', priority: 1 },
    { pattern: /cleanup-snippets\.sh$/i, category: 'file-management', destination: 'shell/file-management', priority: 1 },
    { pattern: /bug-status\.sh$/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /diagnose-snippets\.sh$/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /find-real-ts1434-video\.sh$/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /fix-chat-sidebar\.sh$/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /fixed-bug-report\.sh$/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /generate-bug-report\.sh$/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /interactive-fixer\.sh$/i, category: 'dev', destination: 'shell/dev', priority: 1 },
    { pattern: /capture-type-errors\.sh$/i, category: 'build', destination: 'shell/build', priority: 1 },
    { pattern: /migrate-type-fixes\.sh$/i, category: 'build', destination: 'shell/build', priority: 1 },
    { pattern: /check-comment-integrity\.sh$/i, category: 'file-management', destination: 'shell/file-management', priority: 1 },
    { pattern: /fix-generate-tree-comments\.sh$/i, category: 'file-management', destination: 'shell/file-management', priority: 1 },
    { pattern: /repair-symlinks\.sh$/i, category: 'file-management', destination: 'shell/file-management', priority: 1 },
    { pattern: /smart-fix-comments\.sh$/i, category: 'file-management', destination: 'shell/file-management', priority: 1 },
    { pattern: /fix-video-sagas-mac\.sh$/i, category: 'backup', destination: 'shell/backup', priority: 1 },
    { pattern: /fix-video-sagas\.sh$/i, category: 'backup', destination: 'shell/backup', priority: 1 },
    { pattern: /one-command-migration\.sh$/i, category: 'backup', destination: 'shell/backup', priority: 1 },
    { pattern: /fix-with-error-patterns\.sh$/i, category: 'test', destination: 'shell/test', priority: 1 },
    { pattern: /unify-scripts\.sh$/i, category: 'infrastructure', destination: 'shell/infrastructure', priority: 1 },
    
    // ========== MEDIUM PRIORITY: MORE SPECIFIC PATTERNS ==========
    // Type import fixers - only match actual FIXER scripts
    
    { pattern: /^fix.*type.*import/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 2 },
    { pattern: /^unified.*type.*fixer/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 2 },
    { pattern: /^verify.*namespace.*import/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 2 },
    { pattern: /unified-type-import-fixer/i, category: 'type-imports', destination: 'typescript/type-imports', priority: 2 },
    
    // Code quality scripts
    { pattern: /^analyze.*error/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 2 },
    { pattern: /^check.*brace/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 2 },
    { pattern: /^detect.*circular/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 2 },
    { pattern: /^debug.*ts.*error/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 2 },
    
    // Import management scripts
    { pattern: /^fix.*import/i, category: 'import-management', destination: 'typescript/import-management', priority: 2 },
    { pattern: /^deduplicate.*import/i, category: 'import-management', destination: 'typescript/import-management', priority: 2 },
    { pattern: /^import.*cleanup/i, category: 'import-management', destination: 'typescript/import-management', priority: 2 },
    { pattern: /^import.*validator/i, category: 'import-management', destination: 'typescript/import-management', priority: 2 },
    
    // Infrastructure scripts
    { pattern: /^(Bootstrap|Workflow|Manager|Setup|Install|Config)/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 2 },
    { pattern: /Scaffolding/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 2 },
    { pattern: /Database.*Setup/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 2 },
    { pattern: /Dependency.*Install/i, category: 'infrastructure', destination: 'typescript/infrastructure', priority: 2 },
    
    // File management scripts
    { pattern: /fix.*filename/i, category: 'file-management', destination: 'typescript/file-management', priority: 2 },
    { pattern: /standardize.*entry/i, category: 'file-management', destination: 'typescript/file-management', priority: 2 },
    { pattern: /fix.*comment/i, category: 'file-management', destination: 'typescript/file-management', priority: 2 },
    
    // Backup & recovery scripts
    { pattern: /safe.*fixer/i, category: 'backup-recovery', destination: 'typescript/backup-recovery', priority: 2 },
    { pattern: /smart.*rollback/i, category: 'backup-recovery', destination: 'typescript/backup-recovery', priority: 2 },
    { pattern: /run.*phase.*safely/i, category: 'backup-recovery', destination: 'typescript/backup-recovery', priority: 2 },
    
    // Testing scripts
    { pattern: /test.*error.*analysis/i, category: 'testing', destination: 'typescript/testing', priority: 2 },
    { pattern: /diagnose.*line/i, category: 'testing', destination: 'typescript/testing', priority: 2 },
    { pattern: /diagnose.*snapshot/i, category: 'testing', destination: 'typescript/testing', priority: 2 },
    { pattern: /test.*import/i, category: 'testing', destination: 'typescript/testing', priority: 2 },
    
    // Code generation scripts
    { pattern: /generate.*component/i, category: 'code-generation', destination: 'typescript/code-generation', priority: 2 },
    { pattern: /Template.*Generator/i, category: 'code-generation', destination: 'typescript/code-generation', priority: 2 },
    { pattern: /Configuration.*Generation/i, category: 'code-generation', destination: 'typescript/code-generation', priority: 2 },
    { pattern: /Quality.*Check/i, category: 'code-generation', destination: 'typescript/code-generation', priority: 2 },
    
    // ========== GENERIC PATTERNS FOR COMMON FILE TYPES ==========
    // Lint config files
    { pattern: /lint\/configs\/.*\.js$/i, category: 'config', destination: 'typescript/config', priority: 10 },
    { pattern: /lint\/rules\/.*\.js$/i, category: 'config', destination: 'typescript/config', priority: 10 },
    
    // Test files pattern
    { pattern: /test-.*\.(js|mjs|cjs|ts)$/i, category: 'testing', destination: 'typescript/testing', priority: 20 },
    
    // Debug files pattern  
    { pattern: /debug-.*\.(js|mjs|cjs|ts)$/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 20 },
    
    // Fix files pattern
    { pattern: /fix-.*\.(js|mjs|cjs)$/i, category: 'import-management', destination: 'typescript/import-management', priority: 20 },
    
    // Import scanner files
    { pattern: /.*import.*scanner.*\.(js|ts|cjs|mjs)$/i, category: 'import-management', destination: 'typescript/import-management', priority: 15 },
    
    // Check files pattern
    { pattern: /check-.*\.(mjs|cjs)$/i, category: 'import-management', destination: 'typescript/import-management', priority: 20 },
    
    // Binary backup files
    { pattern: /sync-configs-with-backup\.js$/i, category: 'backup', destination: 'typescript/backup', priority: 15 },
    { pattern: /restore-original-imports\.mjs$/i, category: 'backup', destination: 'typescript/backup', priority: 15 },
    { pattern: /simple-import-scanner\.cjs$/i, category: 'import-management', destination: 'typescript/import-management', priority: 15 },
    { pattern: /simple-import-scanner\.js$/i, category: 'import-management', destination: 'typescript/import-management', priority: 15 },
    
    // Config files (catch-all for config directory)
    { pattern: /src\/core\/config\/.*\.tsx?$/i, category: 'config', destination: 'typescript/config', priority: 15 },
    
    // Utility files in src/utils
    { pattern: /src\/utils\/.*\.tsx?$/i, category: 'utils', destination: 'typescript/utils', priority: 15 },
    
    // ========== MEDIUM PRIORITY SHELL PATTERNS (more specific) ==========
    { pattern: /backup.*\.sh$/i, category: 'backup', destination: 'shell/backup', priority: 2 },
    { pattern: /test.*\.sh$/i, category: 'test', destination: 'shell/test', priority: 2 },
    { pattern: /sync.*\.sh$/i, category: 'git', destination: 'shell/git', priority: 2 },
    { pattern: /setup.*\.sh$/i, category: 'setup', destination: 'shell/setup', priority: 2 },
    { pattern: /init.*\.sh$/i, category: 'setup', destination: 'shell/setup', priority: 2 },
    { pattern: /config.*\.sh$/i, category: 'config', destination: 'shell/config', priority: 2 },
    { pattern: /build.*\.sh$/i, category: 'build', destination: 'shell/build', priority: 2 },
    { pattern: /dev.*\.sh$/i, category: 'dev', destination: 'shell/dev', priority: 2 },
    
    // Shell Script Categories (generic patterns - LOWER priority)
    { pattern: /(sync|push|pull|merge|commit|branch|git).*\.sh$/i, category: 'git', destination: 'shell/git', priority: 3 },
    { pattern: /(build|compile|bundle|pack|dist|make).*\.sh$/i, category: 'build', destination: 'shell/build', priority: 3 },
    { pattern: /(deploy|publish|release|upload|docker).*\.sh$/i, category: 'deploy', destination: 'shell/deploy', priority: 3 },
    { pattern: /(backup|restore|rollback|revert|snapshot).*\.sh$/i, category: 'backup', destination: 'shell/backup', priority: 3 },
    { pattern: /(test|spec|jest|vitest|coverage|unit).*\.sh$/i, category: 'test', destination: 'shell/test', priority: 3 },
    { pattern: /(setup|install|init|configure|env).*\.sh$/i, category: 'setup', destination: 'shell/setup', priority: 3 },
    { pattern: /(config|tsconfig|webpack|eslint).*\.sh$/i, category: 'config', destination: 'shell/config', priority: 3 },
    { pattern: /(dev|watch|serve|start|hot).*\.sh$/i, category: 'dev', destination: 'shell/dev', priority: 4 },
    
    // ========== LOWEST PRIORITY: FALLBACKS ==========
    // Shell catch-all (should catch scripts that didn't match above)
    { pattern: /\.sh$/i, category: 'shell-misc', destination: 'shell/misc', priority: 100 },
    
    // TypeScript catch-all for actual script files
    { 
      pattern: /\.ts$/i, 
      category: 'typescript-misc', 
      destination: 'typescript/misc', 
      priority: 200 
    },
    
    // TypeScript/JSX catch-all
    { 
      pattern: /\.tsx$/i, 
      category: 'typescript-misc', 
      destination: 'typescript/misc', 
      priority: 200 
    },
    
    // Binary/JS files catch-all
    { pattern: /\.(js|mjs|cjs)$/i, category: 'binary-misc', destination: 'bin/misc', priority: 200 },
  ];

  private async scanDirectory(dir: string, depth = 0, maxDepth = 5): Promise<string[]> {
    if (depth > maxDepth) return [];
    
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .git, and other system directories
        if (!['node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(entry.name)) {
          const subFiles = await this.scanDirectory(fullPath, depth + 1, maxDepth);
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private detectScriptType(filePath: string): 'shell' | 'typescript' | 'binary' | 'unknown' {
    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath, 'utf8').slice(0, 100); // Read first 100 chars
    
    // Check for shebang
    if (content.startsWith('#!')) {
      const shebang = content.split('\n')[0];
      if (shebang.includes('bash') || shebang.includes('sh')) {
        return 'shell';
      }
      return 'binary';
    }
    
    // Check extension
    if (ext === '.sh') return 'shell';
    if (ext === '.ts' || ext === '.tsx') return 'typescript';
    if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return 'binary';
    
    return 'unknown';
  }

private getScriptCategory(filePath: string, type: string, fileName: string): CategoryRule {
  const content = fs.readFileSync(filePath, 'utf8').slice(0, 500);
  const dir = path.dirname(filePath);
  
  // Skip .d.ts files (type definitions, not runnable scripts)
  if (fileName.endsWith('.d.ts')) {
    return {
      pattern: /.*/,
      category: 'skip',
      destination: '',
      priority: 999
    };
  }
  
  // Quick check: If it's a source file from src/ that's not a script, skip it
  if (dir.includes('src/') && !dir.includes('/scripts')) {
    const hasShebang = content.startsWith('#!');
    const isLikelyScript = /^\/\/.*script|^\/\*.*script|function main|export default|module\.exports/.test(content);
    
    if (!hasShebang && !isLikelyScript) {
      return {
        pattern: /.*/,
        category: 'skip',
        destination: '',
        priority: 999
      };
    }
  }
  
  // Try to match by filename FIRST (most reliable)
  const nameMatches = this.categories
    .filter(rule => {
      if (type === 'shell' && !rule.destination.startsWith('shell/') && rule.destination !== 'unified') {
        return false;
      }
      if (type === 'typescript' && !rule.destination.startsWith('typescript/') && rule.destination !== 'unified') {
        return false;
      }
      return rule.pattern.test(fileName);
    })
    .sort((a, b) => a.priority - b.priority);
  
  if (nameMatches.length > 0) {
    return nameMatches[0];
  }
  
  // Then try content matches
  const contentMatches = this.categories
    .filter(rule => {
      if (type === 'shell' && !rule.destination.startsWith('shell/') && rule.destination !== 'unified') {
        return false;
      }
      if (type === 'typescript' && !rule.destination.startsWith('typescript/') && rule.destination !== 'unified') {
        return false;
      }
      return rule.pattern.test(content);
    })
    .sort((a, b) => a.priority - b.priority);
  
  if (contentMatches.length > 0) {
    return contentMatches[0];
  }
  
  // Fallback
  return {
    pattern: /.*/,
    category: `${type}-misc`,
    destination: type === 'shell' ? 'shell/misc' : 'typescript/misc',
    priority: 999
  };
}


  async discoverScripts(rootDir: string = '.'): Promise<ScriptInfo[]> {
    console.log('🔍 Discovering scripts...');
    
    const allFiles = await this.scanDirectory(rootDir);
    const scriptExtensions = ['.sh', '.ts', '.tsx', '.js', '.mjs', '.cjs'];
    
    const scriptFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      const name = path.basename(file);
      const dir = path.dirname(file);
      
      // 1. Must have a script extension
      if (!scriptExtensions.includes(ext)) {
        return false;
      }
      
      // 2. Include files in known script directories
      const isInScriptDir = 
        // Script directories
        dir.includes('scripts/') || 
        dir.includes('app/scripts/') || 
        dir.includes('src/core/scripts/') ||
        dir.includes('src/scripts/') ||
        
        // Utility directories that often contain scripts
        dir.includes('src/utils/') ||
        dir.includes('src/tools/') ||
        dir.includes('src/tooling/') ||
        
        // Bin directories
        file.includes('/bin/') ||
        dir.includes('/bin/') ||
        
        // Config and tool directories
        dir.includes('lint/') ||
        dir.includes('configs/') ||
        dir.includes('config/') ||
        dir.includes('.vscode/') ||
        dir.includes('.husky/') ||
        dir.includes('.github/') ||
        dir.includes('tools/') ||
        dir.includes('tooling/') ||
        dir.includes('build/') ||
        dir.includes('deploy/') ||
        
        // Root-level scripts (files directly in project root or scripts folder)
        dir === '.' || dir === '' || dir === 'scripts';
      
      // 3. Include files with obvious script names (anywhere)
      const isNamedLikeScript = /(script|fix|fixer|unified|verify|check|analyze|generate|setup|init|config|backup|rollback|migrate|deploy|build|test|run|exec)\.(ts|js|sh|mjs|cjs)$/i.test(name);
      
      // 4. Always include shell scripts (they're always scripts)
      const isShellScript = ext === '.sh';
      
      // 5. EXCLUDE regular source files from src/ UNLESS they're in script directories or have script names
      const isSourceFile = dir.includes('src/') && 
                          !isInScriptDir &&
                          !isNamedLikeScript &&
                          !/\.(config|setup|init|build|script)\.(ts|js)$/i.test(name);
      
      // 6. EXCLUDE test files that aren't scripts
      const isTestFile = /\.(test|spec)\.(ts|tsx|js)$/i.test(name) && !isNamedLikeScript;
      
      // 7. EXCLUDE backup directories and temporary files
      const isBackupFile = dir.includes('backup') || 
                          dir.includes('.backup') || 
                          dir.includes('-backup') ||
                          dir.includes('.temp') ||
                          dir.includes('temp-') ||
                          /\.(bak|backup|old|tmp)$/i.test(name);
      
      // Include if ANY of the positive conditions are true, AND NOT excluded
      return (isInScriptDir || isNamedLikeScript || isShellScript) && 
            !isSourceFile && 
            !isTestFile &&
            !isBackupFile;
    });

    const scripts: ScriptInfo[] = [];

    scriptFiles.forEach(filePath => {
      try {
        const stats = fs.statSync(filePath);
        const fileName = path.basename(filePath);
        const type = this.detectScriptType(filePath);
        
        // Skip if not a script type we handle
        if (type === 'unknown') return;
        
        const categoryRule = this.getScriptCategory(filePath, type, fileName);
        
        // Skip files marked as 'skip' (source files that slipped through)
        if (categoryRule.category === 'skip') {
          console.log(`⏭️  Skipping source file: ${filePath}`);
          return;
        }
        
        const isExecutable = (fs.statSync(filePath).mode & 0o111) !== 0;
        
        scripts.push({
          path: filePath,
          name: fileName,
          type,
          category: categoryRule.category,
          language: path.extname(filePath).replace('.', '') || 'sh',
          size: stats.size,
          isExecutable,
        });
        
      } catch (error) {
        console.warn(`⚠️  Could not analyze ${filePath}:`, error);
      }
    });

    // Log what we found
    console.log(`📊 Found ${scriptFiles.length} potential script files`);
    console.log(`📄 After filtering: ${scripts.length} actual scripts to organize\n`);
    
    // Debug: show where scripts are coming from
    const dirCounts: Record<string, number> = {};
    scripts.forEach(script => {
      const dir = path.dirname(script.path);
      dirCounts[dir] = (dirCounts[dir] || 0) + 1;
    });
    
    console.log('📁 Script sources by directory:');
    Object.entries(dirCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .forEach(([dir, count]) => {
        console.log(`  ${dir}: ${count} scripts`);
      });
    console.log();
    
    return scripts;
  }

  async createDirectoryStructure(baseDir: string = 'scripts') {
    console.log('📁 Creating directory structure...');
    
    const directories = [
      'typescript/type-imports',
      'typescript/code-quality',
      'typescript/import-management',
      'typescript/infrastructure',
      'typescript/deployment',
      'typescript/backup',
      'typescript/code-gen',
      'typescript/file-management',
      'typescript/testing',
      'typescript/utils',
    
      'typescript/reporting',
      'typescript/misc',
      
      'shell/build',
      'shell/infrastructure',
      'shell/deploy',
      'shell/git',
      'shell/backup',
      'shell/dev',
      'shell/config',
      'shell/setup',
      'shell/test',
      'shell/misc',
      
      'unified',
      'bin',
    ];

    for (const dir of directories) {
      const fullPath = path.join(baseDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`  📂 Created: ${fullPath}`);
      }
    }
  }



  async showStatistics(scripts: ScriptInfo[]): Promise<void> {
    console.log('📊 Detailed Statistics\n');
    console.log('='.repeat(60));
    
    // Total by type
    const byType: Record<string, ScriptInfo[]> = {};
    scripts.forEach(script => {
      byType[script.type] = byType[script.type] || [];
      byType[script.type].push(script);
    });
    
    console.log('📁 By Type:');
    Object.entries(byType).forEach(([type, typeScripts]) => {
      console.log(`  ${type.padEnd(12)}: ${typeScripts.length} scripts`);
    });
    
    console.log('\n📁 By Category:');
    const byCategory: Record<string, ScriptInfo[]> = {};
    scripts.forEach(script => {
      byCategory[script.category] = byCategory[script.category] || [];
      byCategory[script.category].push(script);
    });
    
    Object.entries(byCategory)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([category, categoryScripts]) => {
        console.log(`  ${category.padEnd(20)}: ${categoryScripts.length} scripts`);
      });
    
    // Show top 10 largest files
    console.log('\n📦 Largest Files:');
    const sortedBySize = [...scripts].sort((a, b) => b.size - a.size).slice(0, 10);
    sortedBySize.forEach((script, i) => {
      const sizeKB = (script.size / 1024).toFixed(1);
      console.log(`  ${i + 1}. ${path.basename(script.path).padEnd(30)} ${sizeKB} KB (${script.category})`);
    });
    
    // Show executable scripts
    const executable = scripts.filter(s => s.isExecutable);
    console.log(`\n⚡ Executable Scripts: ${executable.length}`);
    if (executable.length > 0) {
      executable.forEach(script => {
        console.log(`  📄 ${script.path}`);
      });
    }
    
    // Save detailed statistics
    const stats = {
      timestamp: new Date().toISOString(),
      totalScripts: scripts.length,
      byType,
      byCategory,
      largestFiles: sortedBySize.map(s => ({
        path: s.path,
        size: s.size,
        sizeKB: (s.size / 1024).toFixed(1),
        category: s.category
      })),
      executableScripts: executable.map(s => s.path)
    };
    
    fs.writeFileSync(
      'scripts-statistics.json',
      JSON.stringify(stats, null, 2),
      'utf8'
    );
    
    console.log('\n📄 Statistics saved to scripts-statistics.json');
  }

  async moveScripts(scripts: ScriptInfo[], dryRun = true, createSymlinks = true): Promise<void> {
      console.log(`🚚 ${dryRun ? 'Planning' : 'Moving'} scripts...\n`);
      
      let moved = 0;
      let skipped = 0;
      let symlinksCreated = 0;
      let destinationStats: Record<string, { count: number, totalSize: number }> = {};
      

      for (const script of scripts) {
          // Check for skip category HERE, INSIDE the loop
          if (script.category === 'skip') {
              console.log(`⏭️  Skipping source file: ${script.path}`);
              skipped++;
              continue;  // <-- Now this is inside the loop, so it's valid!
          }
          
          // Determine destination based on category rules
          const categoryRule = this.categories.find(r => r.category === script.category) ||
                          this.categories.find(r => r.destination.includes(script.type === 'shell' ? 'shell/' : 'typescript/'));
          
          if (!categoryRule) {
              console.log(`⚠️  No destination for ${script.path}`);
              skipped++;
              continue;
          }
          
          const newFileName = script.name.replace(/\.tsx?$/, '.ts'); // Normalize TypeScript extensions
          const destination = path.join('scripts', categoryRule.destination, newFileName);
          
          console.log(`${script.type.toUpperCase().padEnd(12)} ${script.category.padEnd(20)}`);
          console.log(`  📍 ${script.path}`);
          console.log(`  ➡️  ${destination}`);
          
          // Track destination statistics
          const destFolder = path.dirname(destination);
          if (!destinationStats[destFolder]) {
              destinationStats[destFolder] = { count: 0, totalSize: 0 };
          }
          destinationStats[destFolder].count++;
          destinationStats[destFolder].totalSize += script.size;
          
          if (!dryRun) {
              try {
                  // Check if destination already exists
                  if (fs.existsSync(destination)) {
                      console.log(`  ⚠️  Destination exists: ${destination}`);
                      // Optionally: add timestamp or version
                      const timestamp = Date.now();
                      const backupDestination = destination.replace(/\.(ts|sh)$/, `.backup-${timestamp}.$1`);
                      fs.renameSync(destination, backupDestination);
                      console.log(`  📦 Backed up existing to: ${backupDestination}`);
                  }
                  
                  // Create destination directory
                  const destDir = path.dirname(destination);
                  if (!fs.existsSync(destDir)) {
                      fs.mkdirSync(destDir, { recursive: true });
                  }
                  
                  // Move the file
                  fs.renameSync(script.path, destination);
                  
                  // If it's a shell script and was executable, preserve permissions
                  if (script.isExecutable && script.type === 'shell') {
                      fs.chmodSync(destination, 0o755);
                  }
                  
                  console.log(`  ✅ Moved successfully`);
                  moved++;
                  
                  // Create symlink at original location if requested
                  if (createSymlinks) {
                      try {
                          // Calculate relative path for symlink
                          const relativePath = path.relative(path.dirname(script.path), destination);
                          
                          // Create symlink (delete if exists)
                          if (fs.existsSync(script.path)) {
                              fs.unlinkSync(script.path);
                          }
                          
                          fs.symlinkSync(relativePath, script.path, 'file');
                          console.log(`  🔗 Symlink created: ${script.path} -> ${relativePath}`);
                          symlinksCreated++;
                      } catch (symlinkError) {
                          console.log(`  ⚠️  Could not create symlink: ${symlinkError.message}`);
                      }
                  }
                  
                  console.log();
                  
              } catch (error: any) {
                  console.error(`  ❌ Failed to move:`, error.message);
                  skipped++;
              }
          } else {
              console.log(`  📋 (Dry run - not actually moved)`);
              if (createSymlinks) {
                  console.log(`  🔗 Would create symlink at original location`);
              }
              console.log();
          }
      }
      
      // Print detailed statistics
      console.log(`\n📊 DETAILED STATISTICS:`);
      console.log('='.repeat(60));
      
      // Group by main category (typescript/shell/unified)
      const categoryGroups: Record<string, Array<[string, { count: number, totalSize: number }]>> = {};
      
      for (const [folder, stats] of Object.entries(destinationStats)) {
          const mainCategory = folder.split('/')[1] || 'other'; // Get 'typescript', 'shell', etc.
          if (!categoryGroups[mainCategory]) {
              categoryGroups[mainCategory] = [];
          }
          categoryGroups[mainCategory].push([folder, stats]);
      }
      
      let totalFiles = 0;
      let totalSize = 0;
      
      // Print organized by main category
      for (const [mainCategory, folders] of Object.entries(categoryGroups)) {
          console.log(`\n${mainCategory.toUpperCase()}:`);
          console.log('-'.repeat(40));
          
          // Sort folders alphabetically
          folders.sort(([a], [b]) => a.localeCompare(b));
          
          for (const [folder, stats] of folders) {
              totalFiles += stats.count;
              totalSize += stats.totalSize;
              
              const folderName = folder.replace('scripts/', '');
              const sizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
              
              console.log(`  📁 ${folderName.padEnd(40)}`);
              console.log(`     📄 Files: ${stats.count.toString().padStart(3)} | Size: ${sizeMB} MB`);
          }
      }
      
      // Summary
      console.log('\n' + '='.repeat(60));
      console.log('📋 SUMMARY:');
      console.log(`  📊 Total files to move: ${scripts.length}`);
      console.log(`  📁 Destination folders: ${Object.keys(destinationStats).length}`);
      console.log(`  ✅ Would be moved: ${moved}`);
      console.log(`  🔗 Would get symlinks: ${symlinksCreated}`);
      console.log(`  ⚠️  Would be skipped: ${skipped}`);
      
      // Total size information
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`\n💾 Total size of moving files: ${totalSizeMB} MB`);
      
      if (!dryRun && createSymlinks && symlinksCreated > 0) {
          console.log(`\n💡 Backward compatibility: Original paths now point to organized locations`);
          console.log(`   Example: app/scripts/unified-type-import-fixer.ts -> scripts/typescript/type-imports/unified-fixer.ts`);
      }
  }



  // Add these methods to your SmartScriptOrganizer class
  async debugCategory(categoryName: string): Promise<void> {
    console.log(`🔍 Debugging category: ${categoryName}\n`);
    
    const scripts = await this.discoverScripts();
    const categoryScripts = scripts.filter(s => s.category === categoryName);
    
    if (categoryScripts.length === 0) {
      console.log(`No scripts found in category: ${categoryName}`);
      return;
    }
    
    console.log(`Found ${categoryScripts.length} scripts:\n`);
    categoryScripts.forEach(script => {
      console.log(`📄 ${script.name}`);
      console.log(`   Path: ${script.path}`);
      console.log(`   Type: ${script.type}`);
      console.log(`   Destination: scripts/${this.getDestinationPath(script)}`);
      console.log();
    });
  }

  async debugTopMisclassified(): Promise<void> {
    console.log('🔍 Debugging potentially misclassified scripts...\n');
    
    const scripts = await this.discoverScripts();
    
    // Look for scripts that might be in wrong category
    const miscScripts = scripts.filter(s => 
      s.category.includes('misc') || 
      s.category === 'unknown'
    );
    
    if (miscScripts.length === 0) {
      console.log('✅ All scripts have clear classifications!');
      return;
    }
    
    console.log(`Found ${miscScripts.length} scripts in 'misc' or 'unknown' categories:\n`);
    miscScripts.forEach(script => {
      console.log(`📄 ${script.name}`);
      console.log(`   Current category: ${script.category}`);
      console.log(`   Suggested category: ${this.suggestBetterCategory(script)}`);
      console.log(`   File path: ${script.path}`);
      console.log();
    });
  }

private suggestBetterCategory(script: ScriptInfo): string {
  const fileName = script.name.toLowerCase();
  
  // Add your custom logic here
  if (fileName.includes('test') || fileName.includes('spec')) {
    return 'testing';
  }
  if (fileName.includes('config') || fileName.includes('setup')) {
    return 'config';
  }
  if (fileName.includes('util') || fileName.includes('helper')) {
    return 'utils';
  }
  
  return 'unknown';
}

async debugMiscFiles(): Promise<void> {
  console.log('🔍 Debugging miscellaneous files...\n');
  
  const scripts = await this.discoverScripts();
  const miscFiles = scripts.filter(s => 
    s.category === 'typescript-misc' || 
    s.category === 'shell-misc'
  );
  
  console.log(`Found ${miscFiles.length} miscellaneous files:\n`);
  
  miscFiles.forEach((script, index) => {
    console.log(`${index + 1}. ${script.name}`);
    console.log(`   Path: ${script.path}`);
    console.log(`   Type: ${script.type}`);
    console.log(`   Size: ${script.size} bytes`);
    console.log(`   Why misc?: ${this.explainMiscClassification(script)}`);
    console.log();
  });
}


  async generateSymlinks(scripts: ScriptInfo[]) {
    console.log('🔗 Generating backward compatibility symlinks...\n');
    
    const symlinks: { source: string; target: string }[] = [];
    
    for (const script of scripts) {
      // Only create symlinks for scripts moved from root or important locations
      if (script.path.startsWith('./') && !script.path.includes('scripts/')) {
        const symlinkPath = script.path; // Original location
        const targetPath = path.join('scripts', this.getDestinationPath(script));
        
        symlinks.push({
          source: symlinkPath,
          target: targetPath
        });
      }
    }
    
    for (const { source, target } of symlinks) {
      console.log(`  ${source} -> ${target}`);
      
      if (fs.existsSync(source)) {
        // Remove existing file/symlink
        fs.unlinkSync(source);
      }
      
      // Create symlink
      const relativeTarget = path.relative(path.dirname(source), target);
      fs.symlinkSync(relativeTarget, source, 'file');
    }
    
    console.log(`\n✅ Created ${symlinks.length} symlinks`);
  }

  private getDestinationPath(script: ScriptInfo): string {
    const categoryRule = this.categories.find(r => r.category === script.category);
    if (!categoryRule) return `misc/${script.name}`;
    
    return path.join(categoryRule.destination, script.name);
  }

  async generatePackageJsonUpdates(scripts: ScriptInfo[]): Promise<Record<string, string>> {
    console.log('📦 Generating package.json script updates...\n');
    
    const updates: Record<string, string> = {};
    
    for (const script of scripts) {
      const scriptName = path.basename(script.path, path.extname(script.path));
      const normalizedName = scriptName
        .replace(/-/g, ':')
        .replace(/_/g, ':')
        .toLowerCase();
      
      const destination = this.getDestinationPath(script);
      
      if (script.type === 'shell') {
        updates[`script:${normalizedName}`] = `bash scripts/${destination}`;
      } else if (script.type === 'typescript') {
        updates[`script:${normalizedName}`] = `tsx scripts/${destination}`;
      }
    }
    
    // Add some common script aliases
    updates['scripts:organize'] = 'tsx scripts/smart-organizer/SmartScriptOrganizer.ts run';
    updates['scripts:analyze'] = 'tsx scripts/smart-organizer/SmartScriptOrganizer.ts analyze';
    updates['scripts:symlinks'] = 'tsx scripts/smart-organizer/SmartScriptOrganizer.ts symlinks';
    
    return updates;
  }

async debugMiscFiles(): Promise<void> {
  console.log('🔍 Debugging miscategorized files...\n');
  
  const scripts = await this.discoverScripts();
  const miscFiles = scripts.filter(s => s.category && s.category.includes('misc'));
  
  console.log(`Found ${miscFiles.length} files in misc categories:\n`);
  
  // Group by type
  const byType: Record<string, ScriptInfo[]> = {};
  miscFiles.forEach(script => {
    const type = script.type || 'unknown';
    if (!byType[type]) byType[type] = [];
    byType[type].push(script);
  });
  
  for (const [type, files] of Object.entries(byType)) {
    console.log(`${type.toUpperCase()} misc files (${files.length}):`);
    files.forEach((script, i) => {
      console.log(`  ${i + 1}. ${script.name} (${script.path})`);
      console.log(`     Category: ${script.category || 'unknown'}`);
    });
    console.log();
  }
  
  // Generate category suggestions
  console.log('💡 Suggested category fixes:');
  console.log('='.repeat(40));
  
  const suggestions: Array<{name: string, current: string, suggested: string}> = [];
  
  miscFiles.forEach(script => {
    if (!script.category) return;
    
    let suggestion = '';
    const name = script.name.toLowerCase();
    const currentCategory = script.category;
    
    // Binary files (.js, .mjs, .cjs)
    if (script.type === 'binary') {
      if (name.includes('.eslintrc')) suggestion = 'config';
      else if (name.includes('check-imports')) suggestion = 'import-management';
      else if (name.includes('debug-')) suggestion = 'code-quality';
      else if (name.includes('fix-')) suggestion = 'import-management';
      else if (name.includes('test-')) suggestion = 'testing';
      else if (name.includes('metro.config')) suggestion = 'config';
      else if (name.includes('babel.config')) suggestion = 'config';
      else if (name.includes('jest.config')) suggestion = 'config';
      else if (name.includes('vitest.config')) suggestion = 'config';
      else if (name.includes('webpack.config')) suggestion = 'config';
      else if (name.includes('next.config')) suggestion = 'config';
      else if (name.includes('rollup.config')) suggestion = 'config';
      else if (name.includes('lint-staged.config')) suggestion = 'config';
      else if (name.includes('simple-import-scanner')) suggestion = 'import-management';
      else if (name.includes('standalone-import-scanner')) suggestion = 'import-management';
      else if (name.includes('type-import-fixer-with-backup')) suggestion = 'type-imports';
      else if (name.includes('fix-backup-log')) suggestion = 'backup';
      else if (name.includes('sync-configs-with-backup')) suggestion = 'backup';
      else if (name.includes('restore-original-imports')) suggestion = 'backup';
      else if (name.includes('test-correctiongen') || name.includes('test-fix') || name.includes('test-tsc')) suggestion = 'testing';
      else if (name.includes('lint/configs/') || name.includes('lint/rules/')) suggestion = 'config';
    }
    
    // TypeScript files
    else if (script.type === 'typescript') {
      if (name.includes('diagnosesnippet') || name.includes('snippettest') || name.includes('testsnippet')) suggestion = 'testing';
      else if (name.includes('debug-babel') || name.includes('debug-roadmaps')) suggestion = 'code-quality';
      else if (name.includes('dynamicformconfig') || name.includes('backendstructurecomponent') || name.includes('appdetailsconfig')) suggestion = 'config';
      else if (name.includes('databackup')) suggestion = 'backup-recovery';
      else if (name.includes('callbutton') || name.includes('didprofile')) suggestion = 'testing';
      else if (name.includes('snapshot-authority')) suggestion = 'infrastructure';
      else if (name.includes('fix-all-headers')) suggestion = 'file-management';
      else if (name.includes('quick-type-check')) suggestion = 'code-quality';
      else if (name.includes('test-analyzer')) suggestion = 'testing';
    }
    
    // Shell files
    else if (script.type === 'shell') {
      if (name.includes('husky')) suggestion = 'git';
      else if (name.includes('cleanup-snippets')) suggestion = 'file-management';
      else if (name.includes('bug-status')) suggestion = 'dev';
      else if (name.includes('capture-type-errors')) suggestion = 'build';
      else if (name.includes('check-comment-integrity')) suggestion = 'file-management';
      else if (name.includes('diagnose-snippets')) suggestion = 'dev';
      else if (name.includes('find-real-ts1434-video')) suggestion = 'dev';
      else if (name.includes('fix-chat-sidebar')) suggestion = 'dev';
      else if (name.includes('fix-generate-tree-comments')) suggestion = 'file-management';
      else if (name.includes('fix-video-sagas')) suggestion = 'backup';
      else if (name.includes('fix-with-error-patterns')) suggestion = 'test';
      else if (name.includes('fixed-bug-report') || name.includes('generate-bug-report')) suggestion = 'dev';
      else if (name.includes('interactive-fixer')) suggestion = 'dev';
      else if (name.includes('migrate-type-fixes')) suggestion = 'build';
      else if (name.includes('smart-fix-comments')) suggestion = 'file-management';
      else if (name.includes('one-command-migration')) suggestion = 'backup';
      else if (name.includes('repair-symlinks')) suggestion = 'file-management';
      else if (name.includes('unify-scripts')) suggestion = 'infrastructure';
    }
    
    if (suggestion && currentCategory !== suggestion) {
      suggestions.push({
        name: script.name,
        current: currentCategory,
        suggested: suggestion
      });
    }
  });
  
  // Print suggestions
  if (suggestions.length > 0) {
    console.log('\nFile                           Current Category       → Suggested');
    console.log('-'.repeat(80));
    
    suggestions.forEach(({name, current, suggested}) => {
      console.log(`  ${name.padEnd(30)} ${current.padEnd(20)} → ${suggested}`);
    });
    
    console.log('\n📋 To fix these, add these patterns to your categories array:');
    console.log('='.repeat(80));
    
    // Generate category patterns
    const patternsToAdd: string[] = [];
    
    suggestions.forEach(({name, suggested}) => {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      if (name.endsWith('.js') || name.endsWith('.mjs') || name.endsWith('.cjs')) {
        patternsToAdd.push(`{ pattern: /${escapedName}$/i, category: '${suggested}', destination: 'typescript/${suggested}', priority: 1 },`);
      } else if (name.endsWith('.ts') || name.endsWith('.tsx')) {
        patternsToAdd.push(`{ pattern: /${escapedName}$/i, category: '${suggested}', destination: 'typescript/${suggested}', priority: 1 },`);
      } else if (name.endsWith('.sh')) {
        patternsToAdd.push(`{ pattern: /${escapedName}$/i, category: '${suggested}', destination: 'shell/${suggested}', priority: 1 },`);
      }
    });
    
    // Remove duplicates
    const uniquePatterns = [...new Set(patternsToAdd)];
    console.log('\nAdd these to your HIGH PRIORITY section:');
    uniquePatterns.forEach(pattern => console.log(`  ${pattern}`));
    
  } else {
    console.log('  No suggestions - all files seem properly categorized!');
  }
  
  console.log('\n📊 Summary:');
  console.log(`  Total files in misc categories: ${miscFiles.length}`);
  console.log(`  Binary misc: ${byType['binary']?.length || 0}`);
  console.log(`  TypeScript misc: ${byType['typescript']?.length || 0}`);
  console.log(`  Shell misc: ${byType['shell']?.length || 0}`);
  
  // Show quick fix categories
  console.log('\n🎯 Quick fix - add these generic patterns:');
  console.log('='.repeat(60));
  console.log(`// For lint/configs files`);
  console.log(`{ pattern: /lint\\/configs\\/.*\\.js$/i, category: 'config', destination: 'typescript/config', priority: 10 },`);
  console.log(`// For lint/rules files`);
  console.log(`{ pattern: /lint\\/rules\\/.*\\.js$/i, category: 'config', destination: 'typescript/config', priority: 10 },`);
  console.log(`// For test files`);
  console.log(`{ pattern: /test-.*\\.(js|mjs|cjs|ts)$/i, category: 'testing', destination: 'typescript/testing', priority: 20 },`);
  console.log(`// For debug files`);
  console.log(`{ pattern: /debug-.*\\.(js|mjs|cjs|ts)$/i, category: 'code-quality', destination: 'typescript/code-quality', priority: 20 },`);
  console.log(`// For fix files`);
  console.log(`{ pattern: /fix-.*\\.(js|mjs|cjs)$/i, category: 'import-management', destination: 'typescript/import-management', priority: 20 },`);
}
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';
  
  // Parse options
  const options = {
    createSymlinks: !args.includes('--no-symlinks')
  };
  
  const organizer = new SmartScriptOrganizer();
  
  switch (command) {
    case 'analyze':
      console.log('📊 Analyzing current script structure...\n');
      const scripts = await organizer.discoverScripts();
      
      console.log(`Found ${scripts.length} scripts:\n`);
      
      // Group by type
      const byType: Record<string, ScriptInfo[]> = {};
      scripts.forEach(script => {
        byType[script.type] = byType[script.type] || [];
        byType[script.type].push(script);
      });
      
      for (const [type, typeScripts] of Object.entries(byType)) {
        console.log(`\n${type.toUpperCase()} (${typeScripts.length}):`);
        typeScripts.forEach(s => {
          console.log(`  📄 ${s.path} -> ${s.category}`);
        });
      }
      
      // Save analysis report
      fs.writeFileSync(
        'scripts-analysis.json',
        JSON.stringify({ scripts, timestamp: new Date().toISOString() }, null, 2)
      );
      console.log('\n📄 Analysis saved to scripts-analysis.json');
      break;
      
    case 'run':
      console.log('🚀 Running script organization...\n');
      if (!options.createSymlinks) {
        console.log('⚠️  Running WITHOUT symlinks (--no-symlinks flag detected)');
        console.log('   Old script paths will break! Update package.json after migration.\n');
      } else {
        console.log('✅ Running WITH symlinks (default)');
        console.log('   Backward compatibility preserved via symlinks.\n');
      }
      
      // Create directory structure
      await organizer.createDirectoryStructure();
      
      // Discover and move scripts
      const allScripts = await organizer.discoverScripts();
      await organizer.moveScripts(allScripts, false, options.createSymlinks); // false = actually move
      
      // Generate package.json updates
      const updates = await organizer.generatePackageJsonUpdates(allScripts);
      fs.writeFileSync(
        'package-script-updates.json',
        JSON.stringify(updates, null, 2)
      );
      
      console.log('\n📄 Package.json updates saved to package-script-updates.json');
      
      if (options.createSymlinks) {
        console.log('\n💡 Next steps:');
        console.log('   1. Test that old scripts still work via symlinks');
        console.log('   2. Gradually update package.json with new paths');
        console.log('   3. Remove symlinks when all scripts are updated');
      } else {
        console.log('\n⚠️  IMPORTANT: Update package.json scripts NOW!');
        console.log('   Old script paths no longer exist.');
        console.log('   Use the suggestions in package-script-updates.json');
      }
      break;
      
    case 'dry-run':
      console.log('🧪 Dry run - showing what would be moved...\n');
      const symlinksOption = !args.includes('--no-symlinks');
      
      if (symlinksOption) {
        console.log('✅ Would create symlinks for backward compatibility');
      } else {
        console.log('⚠️  Would NOT create symlinks (--no-symlinks flag)');
      }
      console.log();
      
      const dryScripts = await organizer.discoverScripts();
      await organizer.moveScripts(dryScripts, true, symlinksOption); // true = dry run
      break;
      
    case 'symlinks':
      console.log('🔗 Creating backward compatibility symlinks...\n');
      const linkScripts = await organizer.discoverScripts();
      await organizer.generateSymlinks(linkScripts);
      break;
      
    case 'structure':
      console.log('📁 Creating directory structure only...\n');
      await organizer.createDirectoryStructure();
      break;
      
    case 'test':
      console.log('🧪 Testing symlink functionality...\n');
      const testScripts = await organizer.discoverScripts();
      
      // Test a few key scripts
      const keyScripts = testScripts.filter(s => 
        s.name.includes('unified-type-import-fixer') ||
        s.name.includes('fix-all-type-imports') ||
        s.name.includes('verify-namespace-imports')
      );
      
      if (keyScripts.length > 0) {
        console.log(`Testing ${keyScripts.length} key scripts:\n`);
        keyScripts.forEach(script => {
          console.log(`📄 ${script.name}: ${script.path}`);
        });
        
        console.log('\n✅ These scripts would get symlinks for backward compatibility');
        console.log('   Example: app/scripts/unified-type-import-fixer.ts → scripts/typescript/type-imports/unified-fixer.ts');
      } else {
        console.log('No key scripts found to test');
      }
      break;

    case 'verify-symlinks':
      console.log('🔍 Verifying symlink integrity...\n');
      const report = await organizer.verifySymlinks();
      
      if (report.broken > 0) {
        console.log('\n⚠️  BROKEN SYMLINKS DETECTED!');
        console.log('='.repeat(60));
        
        // Generate repair instructions
        const instructions = organizer.generateRepairInstructions(report.brokenSymlinks);
        const instructionsPath = path.resolve('symlink-repair-instructions.md');
        fs.writeFileSync(instructionsPath, instructions, 'utf8');
        
        // Generate quick repair script
        const repairScript = organizer.generateQuickUpdateScript();
        const repairScriptPath = path.resolve('repair-symlinks.sh');
        fs.writeFileSync(repairScriptPath, repairScript, 'utf8');
        fs.chmodSync(repairScriptPath, 0o755);
        
        console.log(`📄 Repair instructions: ${instructionsPath}`);
        console.log(`⚡ Quick repair script: ${repairScriptPath}`);
        console.log(`   Run: bash ${repairScriptPath}`);
        
        // Show broken symlinks
        console.log('\n🔗 Broken symlinks:');
        report.brokenSymlinks.forEach(s => {
          console.log(`  ❌ ${s.originalPath}`);
        });
      } else {
        console.log('✅ All symlinks are healthy!');
      }
      break;
      
    case 'repair-symlinks':
      console.log('🔧 Repairing symlinks...\n');
      
      // Check if repair script exists
      const repairScriptPath = path.resolve('repair-symlinks.sh');
      if (fs.existsSync(repairScriptPath)) {
        console.log('Running repair script...\n');
        const { execSync } = require('child_process');
        execSync(`bash ${repairScriptPath}`, { stdio: 'inherit' });
      } else {
        console.log('No repair script found. Run verification first:');
        console.log('  pnpm script:verify-symlinks');
      }
      break;
      
    case 'show-symlinks':
      console.log('🔗 Active Symlinks Report\n');
      console.log('='.repeat(60));
      
      try {
        const reportContent = fs.readFileSync('symlink-report.json', 'utf8');
        const report = JSON.parse(reportContent);
        
        console.log(`Total symlinks: ${report.totalSymlinks}`);
        console.log(`Created: ${new Date(report.timestamp).toLocaleString()}\n`);
        
        console.log('Symlinks:');
        report.symlinks.forEach((s: SymlinkRecord, i: number) => {
          console.log(`\n${i + 1}. ${path.basename(s.originalPath)}`);
          console.log(`   Source: ${s.originalPath}`);
          console.log(`   Target: ${s.targetPath}`);
          console.log(`   Category: ${s.category}`);
        });
        
        // Generate package.json update suggestions
        console.log('\n💡 Package.json Update Suggestions:');
        console.log('='.repeat(60));
        
        report.symlinks.forEach((s: SymlinkRecord) => {
          const oldCommand = `tsx "${s.originalPath}"`;
          const newCommand = `tsx "${s.targetPath}"`;
          console.log(`\n# ${path.basename(s.originalPath)}`);
          console.log(`"script:name": "${oldCommand}",  # ← OLD (via symlink)`);
          console.log(`"script:name": "${newCommand}",  # ← NEW (direct path)`);
        });
        
      } catch (error) {
        console.log('No symlink report found. Run migration first:');
        console.log('  pnpm script:run');
      }
      break;
      
    case 'generate-update-guide':
      console.log('📋 Generating package.json update guide...\n');
      
      try {
        const reportContent = fs.readFileSync('symlink-report.json', 'utf8');
        const report = JSON.parse(reportContent);
        
        let guide = '# 🔄 Package.json Update Guide\n\n';
        guide += `Generated: ${new Date().toISOString()}\n`;
        guide += `Total scripts to update: ${report.symlinks.length}\n\n`;
        
        guide += '## Update Strategy:\n';
        guide += '1. Update one script at a time\n';
        guide += '2. Test after each update\n';
        guide += '3. Remove symlink after confirming it works\n\n';
        
        guide += '## Script Updates:\n\n';
        
        report.symlinks.forEach((s: SymlinkRecord, i: number) => {
          const scriptName = path.basename(s.originalPath, path.extname(s.originalPath))
            .replace(/-/g, ':')
            .replace(/_/g, ':')
            .toLowerCase();
          
          guide += `### ${i + 1}. ${scriptName}\n`;
          guide += '```json\n';
          guide += `// BEFORE (using symlink):\n`;
          guide += `"${scriptName}": "tsx ${s.originalPath}",\n\n`;
          guide += `// AFTER (direct path):\n`;
          guide += `"${scriptName}": "tsx ${s.targetPath}",\n`;
          guide += '```\n\n';
          
          guide += `**Test command:**\n`;
          guide += '```bash\n';
          guide += `# Test old path (should work via symlink)\n`;
          guide += `tsx ${s.originalPath} --dry-run\n\n`;
          guide += `# Test new path\n`;
          guide += `tsx ${s.targetPath} --dry-run\n`;
          guide += '```\n\n';
          
          guide += `**Cleanup after update:**\n`;
          guide += '```bash\n';
          guide += `# Remove symlink (after confirming new path works)\n`;
          guide += `rm ${s.originalPath}\n`;
          guide += '```\n\n';
        });
        
        const guidePath = path.resolve('package-update-guide.md');
        fs.writeFileSync(guidePath, guide, 'utf8');
        
        console.log(`✅ Update guide saved to: ${guidePath}`);
        console.log('\n💡 Use this guide to systematically update package.json');
        
      } catch (error) {
        console.log('No symlink report found. Run migration first:');
        console.log('  pnpm script:run');
      }
      break;

    case 'stats':
      console.log('📊 Showing detailed statistics...\n');
      const statsScripts = await organizer.discoverScripts(); // This gets filtered scripts
      await organizer.showStatistics(statsScripts); // Pass the filtered scripts
      break;

    case 'debug':
      // Use the already-defined `args` variable from line 2
      if (args[1]) {
        // Debug specific file/category
        await organizer.debugCategory(args[1]);
      } else {
        // Debug top misclassified
        await organizer.debugTopMisclassified();
      }
      break;

    case 'debug-misc':
      await organizer.debugMiscFiles();
      break;

    default:
      console.log(`
🤖 Smart Script Organizer
=========================

Commands:
  analyze           - Analyze current script structure
  stats             - Show detailed statistics
  dry-run           - Show what would be moved (no changes)
  run               - Actually move and organize scripts
  symlinks          - Create backward compatibility symlinks only
  structure         - Create directory structure only
  test              - Test symlink functionality

Options:
  --no-symlinks     - Don't create symlinks (for clean migration)

Usage:
  tsx scripts/smart-organizer/SmartScriptOrganizer.ts analyze
  tsx scripts/smart-organizer/SmartScriptOrganizer.ts run
  tsx scripts/smart-organizer/SmartScriptOrganizer.ts run --no-symlinks

Migration Strategies:
  
  Strategy A: WITH SYMLINKS (recommended)
  ---------------------------------------
  pnpm script:analyze                    # Analyze current structure
  pnpm script:dry-run                    # Preview changes
  pnpm migration:backup                  # Create backup before migration
  pnpm script:run                        # Move scripts with symlinks
  # Result: Old paths work via symlinks, you can migrate gradually

  Strategy B: WITHOUT SYMLINKS (clean break)
  ------------------------------------------
  pnpm script:analyze
  pnpm script:dry-run --no-symlinks
  pnpm migration:backup
  pnpm script:run --no-symlinks          # Move scripts, no symlinks
  # Result: Update package.json immediately with new paths

Example workflow (recommended):
  1. Analyze:        pnpm script:analyze
  2. Review:         cat scripts-analysis.json
  3. Dry run:        pnpm script:dry-run
  4. Backup:         pnpm migration:backup "Before script organization"
  5. Run migration:  pnpm script:run
  6. Verify:         pnpm fix:types --dry-run  (should still work via symlink)
  
Key Features:
  • Automatic script discovery and categorization
  • Backward compatibility via symlinks (optional)
  • Package.json update suggestions
  • Safe migration with backup system
      `);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SmartScriptOrganizer };