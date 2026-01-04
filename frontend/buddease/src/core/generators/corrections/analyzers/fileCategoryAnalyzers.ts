fileCategoryAnalyzers.ts
src/app/analyzers/fileCategoryAnalyzers.ts
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import { CorrectionCategory, CorrectionSeverity } from '@/core/typings/correctionTypes';

/* ------------------------------------------------------------------ */
/*  Web-3  (Solidity, deployment scripts, ABIs, etc.)                 */
/* ------------------------------------------------------------------ */
export function analyzeWeb3File(fileName: string, fileData: any): Correction[] {
  const issues: Correction[] = [];
  const content = String(fileData.content ?? '');

  // 1.  Solidity version pragma
  if (fileName.endsWith('.sol') && !/^pragma\s+solidity\s+\^?\d+\.\d+\.\d+;/m.test(content)) {
    issues.push(makeIssue(fileName, 'Missing or invalid solidity pragma', 'high', 'web3'));
  }

  // 2.  No access control on sensitive functions
  const hasOwnable = /(?:contract|abstract\s+contract)\s+\w+.*is.*Ownable/m.test(content);
  const hasRole = /\bonlyRole\(/m.test(content);
  if (fileName.endsWith('.sol') && !hasOwnable && !hasRole) {
    issues.push(makeIssue(fileName, 'Consider adding Ownable or AccessControl for privileged functions', 'medium', 'web3'));
  }

  // 3.  Floating pragma (security)
  if (/pragma\s+solidity\s+\^/m.test(content) && !/^pragma\s+solidity\s+\^0\.\d+\.\d+;/m.test(content)) {
    issues.push(makeIssue(fileName, 'Avoid floating pragma in production contracts', 'high', 'web3'));
  }

  return issues;
}

/* ------------------------------------------------------------------ */
/*  Security  (JWT, crypto-keys, env-vars, headers, etc.)             */
/* ------------------------------------------------------------------ */
export function analyzeSecurityFile(fileName: string, fileData: any): Correction[] {
  const issues: Correction[] = [];
  const content = String(fileData.content ?? '');

  // 1.  Hard-coded secrets
  if (/(password|secret|apikey|api_key|privatekey|private_key)\s*[:=]\s*["'][^"']+["']/i.test(content)) {
    issues.push(makeIssue(fileName, 'Possible hard-coded secret detected', 'critical', 'security'));
  }

  // 2.  Weak JWT algo
  if (fileName.includes('jwt') && /algorithm\s*:\s*['"]none['"]/i.test(content)) {
    issues.push(makeIssue(fileName, 'JWT "none" algorithm disables signature verification', 'critical', 'security'));
  }

  // 3.  Missing helmet / security headers mention
  if (fileName.includes('server') || fileName.includes('express')) {
    if (!/helmet/i.test(content)) {
      issues.push(makeIssue(fileName, 'Consider using helmet to set secure HTTP headers', 'medium', 'security'));
    }
  }

  return issues;
}

/* ------------------------------------------------------------------ */
/*  Performance  (bundle, loops, queries, images, etc.)               */
/* ------------------------------------------------------------------ */
export function analyzePerformanceFile(fileName: string, fileData: any): Correction[] {
  const issues: Correction[] = [];
  const content = String(fileData.content ?? '');

  // 1.  Console.log in production code
  if (/console\.(log|warn|error|info)\(/m.test(content)) {
    issues.push(makeIssue(fileName, 'Remove console statements for production builds', 'low', 'performance'));
  }

  // 2.  No lazy-loading for heavy assets
  if ((fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) && /import.*\.(png|jpg|jpeg|svg|mp4)/i.test(content)) {
    if (!/lazy|Suspense|dynamic\(\)/i.test(content)) {
      issues.push(makeIssue(fileName, 'Large assets should be lazy-loaded or dynamically imported', 'medium', 'performance'));
    }
  }

  // 3.  Nested loops (naïve O(n²) smell)
  const nested = content.match(/for\s*\([^)]*\)\s*\{[^{}]*for\s*\([^)]*\)\s*\{/g);
  if (nested && nested.length > 2) {
    issues.push(makeIssue(fileName, 'Deeply nested loops may cause performance bottlenecks', 'medium', 'performance'));
  }

  return issues;
}

/* ------------------------------------------------------------------ */
/*  Helper to build a Correction quickly                              */
/* ------------------------------------------------------------------ */
function makeIssue(
  file: string,
  message: string,
  severity: CorrectionSeverity,
  category: CorrectionCategory
): Correction {
  return {
    id: `${category}-${file}-${Date.now()}`,
    type: category === 'security' ? 'error' : 'warning',
    severity,
    file,
    line: 1, // we don’t parse AST here
    message,
    code: `"${file}"`,
    fix: 'See detailed description above.',
    category,
  };
}