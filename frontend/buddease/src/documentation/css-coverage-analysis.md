# CSS Coverage Analysis System
## 📋 Overview

A specialized analyzer for CSS coverage and styling patterns within the Phase-Based Development Suggestion System. Provides automated detection of missing CSS files, calculates coverage percentages by folder and file type, and suggests intelligent fixes for styling inconsistencies.
┌─────────────────────────────────────────────────────────────┐
│                  CSS ANALYSIS PIPELINE                      │
├─────────────────────────────────────────────────────────────┤
│  Phase 4: UI Layer → CSSAnalyzer                            │
│                                                             │
│  Capabilities:                                              │
│  • Detect missing CSS/SCSS/Module files                     │
│  • Calculate coverage by folder & file type                 │
│  • Identify components needing styles                       │
│  • Auto-generate CSS module files                           │
│  • Validate CSS import patterns                             │
└─────────────────────────────────────────────────────────────┘
# 🚀 Quick Start

##  Installation & Setup
The CSSAnalyzer is included in Phase 4 (UI Layer) of the phase-suggestion-system. No additional setup required.
```bash

# Verify CSSAnalyzer is available
tsx scripts/phase-suggestion-system.ts --list-analyzers | grep CSS

# Expected output:
# ✅ CSSAnalyzer (ui)
```

# Basic CSS Analysis Commands
```bash
# Analyze overall CSS coverage
pnpm analyze:css-coverage

# Generate detailed report
pnpm analyze:css-coverage --report

# Check specific folder
pnpm analyze:css-coverage --by-folder src/components

# Analyze specific file
pnpm analyze:css-coverage --by-file src/pages/Dashboard.tsx

# Auto-fix missing CSS
pnpm fix:css-imports
```

# 🔍 How CSSAnalyzer Works
## Detection Logic
TypeScript
// CSSAnalyzer scanning process:

1. File Discovery
   - Scans for .tsx/.jsx files with JSX elements
   - Excludes utility files (helpers, api clients, etc.)
   - Identifies UI components vs non-visual files

2. CSS File Check
   - Looks for corresponding CSS files with extensions:
     * .css
     * .scss
     * .sass
     * .less
     * .module.css
     * .module.scss

3. Coverage Calculation
   - Counts: total components / components with CSS
   - Calculates percentage by folder and file type
   - Identifies critical gaps (>20% missing CSS)

4. Suggestion Generation
   - Creates missing CSS file suggestions
   - Provides path-aware CSS module names
   - Estimates styling effort based on JSX complexity

# File Exclusion Rules
## CSSAnalyzer automatically excludes files that don't need CSS:

TypeScript
// Files skipped (no visual elements):
- Utility functions (helpers, utils)
- API clients and services
- Pure TypeScript definitions (.d.ts)
- Test files (.test.tsx, .spec.tsx)
- Configuration files
- hooks/use*.ts (when no JSX returned)

📊 Command Reference
Primary Commands

Table
| Command                                        | Purpose                       | Output                          |
| ---------------------------------------------- | ----------------------------- | ------------------------------- |
| `pnpm analyze:css-coverage`                    | Overall project CSS coverage  | Percentage + missing count      |
| `pnpm analyze:css-coverage --report`           | Generate markdown report      | Detailed report in `reports/`   |
| `pnpm analyze:css-coverage --by-folder <path>` | Folder-specific analysis      | Coverage for single folder      |
| `pnpm analyze:css-coverage --by-file <path>`   | Specific file analysis        | File-level CSS status           |
| `pnpm fix:css-imports`                         | Auto-create missing CSS files | Creates .module.css and imports |


Advanced Options
```bash
# Filter by confidence threshold
pnpm analyze:css-coverage --confidence 80

# Include/exclude patterns
pnpm analyze:css-coverage --include "**/*.component.tsx"
pnpm analyze:css-coverage --exclude "**/utils/*"

# Generate fix commands only
pnpm analyze:css-coverage --suggest-only

# Dry run (preview without changes)
pnpm fix:css-imports --dry-run
```

# 💡 Usage Examples
Example 1: Overall CSS Health Check
```bash
$ pnpm analyze:css-coverage

📊 CSS COVERAGE ANALYSIS
════════════════════════════════════════════════════
Overall Coverage: 67% (134/200 files have CSS files)

📁 BY FOLDER:
├── src/components: 85% (34/40) ✅
├── src/features: 72% (56/78) ⚠️
├── src/pages: 45% (9/20) ❌ CRITICAL
└── src/shared: 90% (35/39) ✅

📊 BY FILE TYPE:
├── .tsx files: 70% (130/186)
├── .jsx files: 25% (4/16) ⚠️
└── index files: 0% (0/8) ✅ (excluded)

⚠️  CRITICAL GAPS:
• src/pages/: 11 components lack CSS
• src/features/dashboard/: 6 components lack CSS

💡 RECOMMENDATION:
Run: pnpm fix:css-imports --path-pattern src/pages/
Example 2: Fix CSS in Specific Folder
bash
$ pnpm fix:css-imports --path-pattern src/pages/

🎯 Targeting: src/pages/
📊 Found 11 components without CSS
```

# Component Analysis:
┌──────────────────────────────┬──────────┬─────────────────────┐
│ Component                    │ JSX El   │ Suggested CSS File  │
├──────────────────────────────┼──────────┼─────────────────────┤
│ Dashboard.tsx                │ 12       │ Dashboard.module.css│
│ Profile.tsx                  │ 8        │ Profile.module.css  │
│ Settings.tsx                 │ 15       │ Settings.module.css │
│ ...                          │ ...      │ ...                 │
└──────────────────────────────┴──────────┴─────────────────────┘

🚀 Create 11 CSS files and add imports? (y/n) › y

✅ Created: src/pages/Dashboard.module.css
✅ Updated: src/pages/Dashboard.tsx (added import)
✅ Created: src/pages/Profile.module.css
✅ Updated: src/pages/Profile.tsx (added import)
...
✅ Successfully created 11 CSS files and 11 imports
Example 3: Detailed File-Level Analysis
```bash
$ pnpm analyze:css-coverage --by-file src/components/Button.tsx

📄 FILE ANALYSIS: src/components/Button.tsx
════════════════════════════════════════════════════

Component Details:
• Has JSX: Yes (returns <button>)
• JSX Elements: 3 (button, span, icon)
• Current CSS: ❌ None found
• CSS Complexity Score: 7/10 (high complexity)
• Estimated Styling Effort: 15-20 minutes
```

# 💡 Suggestion:
## Create: src/components/Button.module.css

# Recommended CSS Structure:

```css
/* Button.module.css */
.button {
  /* Base styles */
}

.variantPrimary {
  /* Primary variant */
}

.variantSecondary {
  /* Secondary variant */
}

.disabled {
  /* Disabled state */
}
```

# Quick Fix Command:
pnpm analyze:css-coverage --by-file src/components/Button.tsx --create

---

## 📈 Report Format

### Markdown Report Structure

```markdown
# CSS Coverage Report - 2026-01-22

## Executive Summary
- **Total Components Scanned**: 200
- **Components with CSS**: 134 (67%)
- **Components Missing CSS**: 66 (33%)
- **Folder with Lowest Coverage**: src/pages/ (45%)
- **Overall Grade**: C+ (Needs Improvement)
```

## Detailed Breakdown

### By Folder
| Folder | Coverage | Files | Missing | Priority |
|--------|----------|-------|---------|----------|
| src/shared | 90% | 39 | 4 | Low |
| src/components | 85% | 40 | 6 | Medium |
| src/features | 72% | 78 | 22 | Medium |
| src/pages | 45% | 20 | 11 | **High** |

### By File Type
| Extension | Coverage | Total | Notes |
|-----------|----------|-------|-------|
| .tsx | 70% | 186 | Primary component format  |
| .jsx | 25% | 16  | Consider migration to TSX |
| .ts | 0%   | 45  | Utility files (excluded)  |

### Missing CSS Files (Top 10)
1. **src/pages/Dashboard.tsx** - 12 JSX elements, high complexity
2. **src/features/dashboard/Widget.tsx** - 8 JSX elements
3. **src/components/DataTable.tsx** - 15 JSX elements, high complexity
4. **src/pages/Profile.tsx** - 8 JSX elements
5. **src/pages/Settings.tsx** - 19 JSX elements, critical component

### Recommendations

#### High Priority (Fix This Week)
1. **Add CSS to src/pages/** (11 files)
   - Estimated effort: 3-4 hours
   - Impact: User-facing pages will have consistent styling
   - Command: `pnpm fix:css-imports --path-pattern src/pages/`

2. **Migrate JSX to TSX** (16 files)
   - Estimated effort: 2 hours
   - Benefit: Better type safety for CSS classes
   - Command: `pnpm analyze:css-coverage --by-file src/**/*.jsx --suggest-migration`

#### Medium Priority (Fix This Sprint)
3. **Standardize CSS modules in src/features/dashboard/** (6 files)
   - Estimated effort: 1.5 hours
   - Command: `pnpm analyze:css-coverage --path-pattern src/features/dashboard/ --create`

4. **Add CSS to complex components** (files with >10 JSX elements)
   - Estimated effort: 2 hours
   - Command: `pnpm analyze:css-coverage --jsx-threshold 10 --create`

#### Low Priority (Optional)
5. **Review utility files** (excluded from CSS analysis)
   - These files correctly excluded (no visual elements)
   - No action needed







```JSON
scrpts: {
  "// ===== PHASE 1: FOUNDATION =====",
  "phase:foundation": "tsx scripts/phase-suggestion-system.ts analyze foundation",
  "phase:foundation:fix": "tsx scripts/phase-suggestion-system.ts fix --category config --category types",
  "phase:foundation:verify": "tsx scripts/phase-suggestion-system.ts verify --phase foundation",
  
  "// ===== PHASE 2: STATE LAYER =====",
  "phase:state": "tsx scripts/phase-suggestion-system.ts analyze state",
  "phase:state:fix": "tsx scripts/phase-suggestion-system.ts fix --category mobx-redux",
  "phase:state:verify": "tsx scripts/phase-suggestion-system.ts verify --phase state",
  
  "// ===== PHASE 3: DATA LAYER =====",
  "phase:data": "tsx scripts/phase-suggestion-system.ts analyze data",
  "phase:data:fix": "tsx scripts/phase-suggestion-system.ts fix --category api --category middleware",
  "phase:data:verify": "tsx scripts/phase-suggestion-system.ts verify --phase data",
  
  "// ===== PHASE 4: UI LAYER (includes CSS) =====",
  "phase:ui": "tsx scripts/phase-suggestion-system.ts analyze ui",
  "phase:ui:fix": "tsx scripts/phase-suggestion-system.ts fix --category component --category css",
  "phase:ui:verify": "tsx scripts/phase-suggestion-system.ts verify --phase ui",
  
  "// ===== CSS COVERAGE ANALYSIS =====",
  "analyze:css-coverage": "tsx scripts/phase-suggestion-system.ts analyze css --report",
  "analyze:css-coverage:by-folder": "tsx scripts/phase-suggestion-system.ts analyze css --by-folder",
  "analyze:css-coverage:by-file": "tsx scripts/phase-suggestion-system.ts analyze css --by-file",
  "fix:css-imports": "tsx scripts/phase-suggestion-system.ts fix --category css",
  "fix:css-imports:dry-run": "tsx scripts/phase-suggestion-system.ts fix --category css --dry-run",
  
  "// ===== COMPLETE WORKFLOW =====",
  "dev:suggest": "tsx scripts/phase-suggestion-system.ts interactive",
  "dev:analyze": "tsx scripts/phase-suggestion-system.ts analyze --report",
  "dev:fix:all": "run-s phase:foundation:fix phase:state:fix phase:data:fix phase:ui:fix",
  "dev:verify": "tsx scripts/phase-suggestion-system.ts verify --generate-report --suggest-next-steps"
}
```

## Action Plan

### Quick Wins (Under 30 minutes each)
```bash
# Fix all low-hanging fruit
pnpm analyze:css-coverage --complexity-threshold low --fix

# Expected: 15 files fixed in ~2 hours
Strategic Improvements
Week 1: Fix src/pages/ CSS coverage
Week 2: Migrate remaining JSX to TSX
Week 3: Standardize CSS modules across features
Week 4: Set up pre-commit CSS coverage check
Pre-commit Hook

```bash
# Add to .husky/pre-commit
pnpm analyze:css-coverage --fail-threshold 70
🔧 CSSAnalyzer Implementation
TypeScript
// analyzers/CSSAnalyzer.ts
import { BaseAnalyzer } from './BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';

export class CSSAnalyzer extends BaseAnalyzer {
  name = 'css-coverage';
  filePatterns = ['**/*.tsx', '**/*.jsx'];
  cssExtensions = ['.css', '.scss', '.sass', '.less', '.module.css', '.module.scss'];

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const files = await this.getFiles(this.filePatterns);
    
    const cssStats = {
      totalFiles: files.length,
      filesWithCSS: 0,
      filesWithoutCSS: 0,
      coverageByFolder: new Map<string, { total: number; covered: number }>(),
      filesWithoutCSSList: [] as string[]
    };

    for (const file of files) {
      const hasCSS = await this.checkForCSSFile(file);
      const folder = path.dirname(file);
      
      // Update folder statistics
      const folderStats = cssStats.coverageByFolder.get(folder) || { total: 0, covered: 0 };
      folderStats.total++;
      if (hasCSS) folderStats.covered++;
      cssStats.coverageByFolder.set(folder, folderStats);

      if (hasCSS) {
        cssStats.filesWithCSS++;
      } else {
        cssStats.filesWithoutCSS++;
        cssStats.filesWithoutCSSList.push(file);
        
        // Create correction suggestion
        if (await this.shouldHaveCSS(file)) {
          corrections.push(this.createCSSCorrection(file));
        }
      }
    }

    // Add summary correction
    corrections.unshift(this.createSummaryCorrection(cssStats));
    
    return corrections;
  }

  private async checkForCSSFile(file: string): Promise<boolean> {
    const basePath = file.replace(/\.(tsx|jsx)$/, '');
    const extensions = ['.css', '.scss', '.sass', '.less', '.module.css', '.module.scss'];
    
    for (const ext of extensions) {
      try {
        await fs.access(basePath + ext);
        return true;
      } catch {
        // Continue to next extension
      }
    }
    return false;
  }

  private async shouldHaveCSS(file: string): Promise<boolean> {
    try {
      const content = await fs.readFile(file, 'utf8');
      // Check for JSX/React elements that would benefit from styling
      const hasJSX = content.includes('return') && 
                     (content.includes('jsx') || content.includes('React.createElement') || 
                      content.includes('className=') || content.includes('style='));
      const isUtility = this.isUtilityFile(file, content);
      
      return hasJSX && !isUtility;
    } catch {
      return false;
    }
  }

  private isUtilityFile(file: string, content: string): boolean {
    // Utility files (no visual elements) should not have CSS
    if (file.includes('utils/') || file.includes('helpers/') || file.includes('api/')) {
      return true;
    }
    
    // Check if file only exports functions/hooks without JSX
    const hasExport = content.includes('export');
    const hasJSXReturn = content.includes('return') && 
                        (content.includes('<') || content.includes('React.createElement'));
    
    return hasExport && !hasJSXReturn;
  }

  private createCSSCorrection(file: string): Correction {
    const filename = path.basename(file, path.extname(file));
    const suggestedCSS = this.suggestCSSFilename(file);
    
    return this.createCorrection(
      `missing-css-${this.hashPath(file)}`,
      'suggestion' as CorrectionType,
      'low' as CorrectionSeverity,
      `Missing CSS file for component: ${filename}`,
      file,
      `// Component: ${filename}\n// Missing: ${suggestedCSS}`,
      `Create ${suggestedCSS} for component styling`,
      'css' as CorrectionCategory,
      1,
      `Component ${file} would benefit from a CSS file for styling`
    );
  }

  private createSummaryCorrection(stats: any): Correction {
    const coveragePercent = Math.round((stats.filesWithCSS / stats.totalFiles) * 100);
    const snippet = this.generateCoverageSnippet(stats);
    
    return this.createCorrection(
      'css-coverage-summary',
      'info' as CorrectionType,
      coveragePercent < 50 ? 'high' : coveragePercent < 80 ? 'medium' : 'low',
      `CSS Coverage: ${coveragePercent}% (${stats.filesWithCSS}/${stats.totalFiles})`,
      './',
      snippet,
      coveragePercent < 80 ? 'Add CSS files to improve coverage' : 'Good CSS coverage',
      'css' as CorrectionCategory
    );
  }

  private suggestCSSFilename(file: string): string {
    const baseName = path.basename(file, path.extname(file));
    const dir = path.dirname(file);
    return `${dir}/${baseName}.module.css`;
  }

  private generateCoverageSnippet(stats: any): string {
    let snippet = `// CSS Coverage Summary:\n`;
    snippet += `// Total Files: ${stats.totalFiles}\n`;
    snippet += `// With CSS: ${stats.filesWithCSS}\n`;
    snippet += `// Without CSS: ${stats.filesWithoutCSS}\n\n`;
    
    snippet += `// By Folder:\n`;
    for (const [folder, data] of stats.coverageByFolder) {
      const percent = Math.round((data.covered / data.total) * 100);
      snippet += `// ${folder}: ${percent}% (${data.covered}/${data.total})\n`;
    }
    
    return snippet;
  }

  private hashPath(filePath: string): string {
    return Buffer.from(filePath).toString('base64').slice(0, 10);
  }

  private extractCodeSnippet(content: string, pattern: RegExp | string, contextLines: number = 2): string {
    const lines = content.split('\n');
    const searchPattern = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const matchIndex = lines.findIndex(line => searchPattern.test(line));
    
    if (matchIndex === -1) return '// Pattern not found';
    
    const start = Math.max(0, matchIndex - contextLines);
    const end = Math.min(lines.length, matchIndex + contextLines + 1);
    
    return lines.slice(start, end).join('\n');
  }

  private getLineNumber(content: string, search: string): number {
    const lines = content.split('\n');
    const index = lines.findIndex(line => line.includes(search));
    return index === -1 ? 1 : index + 1;
  }
}
✅ Best Practices
Daily CSS Workflow
bash
# Before starting UI work
pnpm analyze:css-coverage --by-folder src/components

# After creating new components
pnpm analyze:css-coverage --by-file src/components/MyNewComponent.tsx

# Before committing
pnpm analyze:css-coverage --fail-threshold 70
CSS Coverage Goals
Table
Folder	Target	Enforcement
src/components	90%+	Pre-commit hook
src/pages	95%+	CI check
src/features/*	80%+	Sprint review
React Native StyleSheet Migration
bash
# Phase 3 automatically handles React Native
pnpm phase:data:fix

# Converts: style={{ color: 'red' }}
# To: styles.container + StyleSheet.create({})
🚨 Troubleshooting
CSS Files Not Detected
bash
# Check supported extensions
pnpm analyze:css-coverage --verbose

# Should show: Checking .css, .scss, .sass, .less, .module.css, .module.scss

# Add custom extension if needed:
# CSSAnalyzer.cssExtensions.push('.custom.css');
False Positives (Non-UI Files)
bash
# CSSAnalyzer auto-detects utility files
# If false positive occurs, add to ignore:

# .css-analyzer-ignore
src/utils/api-client.ts
src/helpers/data-transform.ts
Coverage Threshold Not Met
bash
# Override threshold for specific folder
pnpm analyze:css-coverage --path-pattern src/pages/ --threshold 50

# Focus on critical files only
pnpm analyze:css-coverage --jsx-threshold 10 --fix
🔗 Integration with Phase System
CSS in Phase 4 (UI Layer)
TypeScript
// Phase 4 includes CSSAnalyzer alongside ComponentAnalyzer
{
  phase: 'ui',
  analyzers: [
    ComponentAnalyzer,  // Checks component patterns
    HookAnalyzer,       // Validates hooks
    CSSAnalyzer,        // ✅ Analyzes CSS coverage
    ThemeAnalyzer       // Validates theme usage
  ]
}


# Quick CSS Commands
pnpm analyze:css-coverage              # Full coverage report
pnpm analyze:css-coverage --report     # Save to reports/
pnpm analyze:css-coverage:by-folder    # Folder-specific
pnpm fix:css-imports                   # Auto-fix missing CSS
pnpm phase:ui                          # Run full UI analysis (includes CSS)
pnpm phase:ui:fix                      # Fix UI issues (including CSS)


Running CSS Analysis as Part of Full Workflow
bash
# Run full UI layer (includes CSS)
pnpm phase:ui

# Run only CSS analysis
pnpm phase:ui --category css

# Fix CSS issues specifically
pnpm phase:ui:fix --category css

# Verify CSS fixes
pnpm phase:ui:verify
CI/CD Integration
yaml
# .github/workflows/css-coverage.yml
- name: Check CSS Coverage
  run: pnpm analyze:css-coverage --fail-threshold 70
  
- name: Upload CSS Report
  uses: actions/upload-artifact@v3
  with:
    name: css-coverage-report
    path: reports/css-coverage-*.md
The CSS Coverage Analysis System provides automated, intelligent CSS management integrated seamlessly into your phase-based development workflow.
