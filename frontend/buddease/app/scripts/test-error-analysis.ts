// test-error-analysis.ts
import { ErrorManager } from '@/utils/ErrorManager';
import { DuplicateDetector } from '@/utils/DuplicateDetector';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

/* ----------  colour palette (muted)  ---------- */
const c = {
  ok   : chalk.green,
  info : chalk.cyan,
  dim  : chalk.gray,
  warn : chalk.hex('#FFA500'), // orange
  err  : chalk.red,
  bold : chalk.bold,
  hdr  : chalk.hex('#6A0DAD').bold,   // purple header
  sec  : chalk.hex('#2E8B57').bold,   // sea-green section
};

/* -------------------------------------------------
 * 1.  UNIT-TEST  :  can we recognise common logs?
 * ------------------------------------------------- */
function unitTestPatterns() {
  console.log(c.hdr('\n🧪 1. Unit-test: can we recognise common build-log patterns?\n'));

  const patterns = [
    'Error [TransformError]: Transform failed with 1 error: /Users/…/ReactNativeAnalyzer.ts:163:71: ERROR: Expected ")" but found "{"',
    'Duplicate function implementation',
    'Duplicate identifier "analyzeAppConfig"',
    'SyntaxError: Unexpected token',
    'TypeError: Cannot read property',
    'Module not found: Error: Can\'t resolve',
    'Failed to parse JSON config file',
    'Cannot find module',
    'Property \'name\' does not exist on type'
  ] as const;

  patterns.forEach((raw, idx) => {
    console.log(c.dim(`--- pattern ${idx + 1} ---`));
    console.log(c.info(`Raw log : ${raw}`));

    const cat = ErrorManager.categorizeError(raw);
    if (!cat) return console.log(c.warn('❌  No pattern match\n'));

    console.log(c.ok(`✅  Category : ${cat.title}`));
    console.log(`    Severity : ${cat.severity}`);
    console.log(`    Action   : ${cat.immediateAction}\n`);
  });
}

/* -------------------------------------------------
 * 2.  LIVE FILE SCAN  :  duplicates / syntax
 * ------------------------------------------------- */


function scanRealFile() {
  const target = path.resolve(process.cwd(), 'src/app/generators/corrections/analyzers/ReactNativeAnalyzer.ts');
  if (!fs.existsSync(target)) return console.log(c.warn('Target file not found – skipping live scans.'));

  console.log(c.hdr('\n🔍 2. Live file scan\n'));

  // ---- duplicates ----
  console.log(c.sec(' 2a. Duplicate method check'));
  const dupReport = DuplicateDetector.analyzeFileForDuplicates(target);
  console.log(dupReport.includes('No duplicates') ? c.ok(dupReport) : c.warn(dupReport));

  // ---- brace balance ----
  console.log(c.sec('\n 2b. Brace balance & call-vs-declare check'));
  const issues = quickSanityScan(target);
  console.log(issues.length ? issues.join('\n') : c.ok('✅  No obvious problems'));
}

/* crude but fast – only for the test script */
function quickSanityScan(file: string): string[] {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  const issues: string[] = [];
  let openBraces = 0;

  lines.forEach((l, i) => {
    openBraces += (l.match(/{/g) || []).length;
    openBraces -= (l.match(/}/g) || []).length;
    if (openBraces < 0) issues.push(c.err(`Extra closing brace ~ line ${i + 1}`));
  });
  if (openBraces > 0) issues.push(c.warn(`${openBraces} unclosed brace(s)`));

  /* ignore inherited BaseAnalyzer methods */
  const inherited = new Set([
    'createCorrection',
    'create',
    'getPriority',
    'hasReactNative', // Add inherited methods here
    'analyzeReactNativeConfig',
    'analyzeMetroBundler',
    'analyzeReactNativeErrorPatterns',
    'analyzePlatformConfigs',
    'hasReactNativeConfigFiles'
  ]);

  const calls = new Set<string>();
  const defs = new Set<string>();

  lines.forEach(l => {
    (l.match(/this\.(\w+)\(/g) || []).forEach(m => calls.add(m.replace(/this\.|\(/g, '')));
    (l.match(/\b(?:private|public|protected|async\s+)?(\w+)\s*\([^)]*\)\s*\{/g) || [])
      .forEach(m => defs.add(m.split('(')[0].trim().split(/\s+/).pop()!));
  });

  const missing = Array.from(calls).filter(m => !defs.has(m) && !inherited.has(m));
  if (missing.length) issues.push(c.err(`Calls not defined here: ${missing.join(', ')}`));

  return issues;
}


/* -------------------------------------------------
 * 3.  ENTRY POINT
 * ------------------------------------------------- */
console.log(c.hdr('\n🧪  Error-Analysis System Health Check\n'));

unitTestPatterns();   // 1. static patterns
scanRealFile();       // 2. real file sanity

console.log(c.dim('\n––– finished –––\n'));