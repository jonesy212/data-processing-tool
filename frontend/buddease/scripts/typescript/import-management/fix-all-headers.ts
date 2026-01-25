#!/usr/bin/env tsx
// fix-all-headers.ts

import fs from 'fs';
import path from 'path';
import { FilenameCaseFixer } from '@/app/scripts/fixFilenameCases';
import { FileHeaderManager } from '@/utils/fileHeaderManager';

class UnifiedHeaderFixer {
  private fixer: FilenameCaseFixer;
  
  constructor() {
    this.fixer = new FilenameCaseFixer();
  }

  /**
   * Run all header fixes in sequence
   */
  async fixAll(inputPath?: string, dryRun = false): Promise<void> {
    console.log('🔧 Running ALL header fixes...\n');
    
    // First, find the actual file(s) to process
    const files = await this.resolveFiles(inputPath);
    
    if (files.length === 0) {
      console.log('❌ No files found to process');
      return;
    }
    
    console.log(`📁 Processing ${files.length} file(s):`);
    files.forEach(file => console.log(`   - ${path.relative(process.cwd(), file)}`));
    console.log('');
    
    // Process each file
    for (const file of files) {
      await this.fixFile(file, dryRun);
    }
    
    console.log('\n✅ All header fixes completed!');
  }

  /**
   * Fix all header issues for a single file
   */
  private async fixFile(filePath: string, dryRun: boolean): Promise<void> {
    console.log(`📄 Processing: ${path.relative(process.cwd(), filePath)}`);
    
    // Use the main fixer first (handles shebangs, comments, duplicates)
    const analysis = await this.fixer.analyzeFile(filePath);
    const mainFixerChanges = await this.fixer.fixFile(analysis, dryRun);
    
    // Then apply additional specific fixes
    const additionalChanges = this.fixSpecificIssues(filePath, dryRun);
    
    if (mainFixerChanges || additionalChanges) {
      console.log(`   ✅ Fixed issues`);
      if (mainFixerChanges) console.log(`      - ${mainFixerChanges}`);
    } else {
      console.log(`   ✅ No changes needed`);
    }
  }



  private fixSpecificIssues(filePath: string, dryRun: boolean): boolean {
    // Only fix issues that the main fixer doesn't handle:
    // 1. Bare filename lines without "//"
    // 2. Ensure consistent format
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const actualFilename = path.basename(filePath);
    
    let changed = false;
    
    // Remove bare filename lines (main fixer might miss some edge cases)
    const newLines = lines.filter(line => {
      const trimmed = line.trim();
      // Don't remove if it's a comment or has other content
      if (trimmed === actualFilename && !trimmed.startsWith('//')) {
        changed = true;
        return false;
      }
      return true;
    });
    
    if (changed && !dryRun) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    }
    
    return changed;
  }

  /**
   * Resolve input path to actual file(s)
   */
  private async resolveFiles(inputPath?: string): Promise<string[]> {
    if (!inputPath) {
      return await this.findAllTypeScriptFiles('.');
    }
    
    // Check if it's a direct path
    if (fs.existsSync(inputPath)) {
      const stat = fs.statSync(inputPath);
      if (stat.isDirectory()) {
        return await this.findAllTypeScriptFiles(inputPath);
      } else {
        return [inputPath];
      }
    }
    
    // Try to find file by name
    const foundFile = await this.findFileByName(inputPath);
    return foundFile ? [foundFile] : [];
  }

  /**
   * Find file by partial name
   */
  private async findFileByName(fileName: string): Promise<string | null> {
    const allFiles = await this.findAllTypeScriptFiles('.');
    
    const searchTerm = fileName.toLowerCase();
    let bestMatch: {file: string, score: number} | null = null;
    
    for (const file of allFiles) {
      const basename = path.basename(file).toLowerCase();
      let score = 0;
      
      // Exact filename match (highest priority)
      if (basename === searchTerm) {
        return file; // Return immediately for exact match
      }
      
      // Filename contains search term
      if (basename.includes(searchTerm)) score += 100;
      
      // Full path contains search term
      if (file.toLowerCase().includes(searchTerm)) score += 50;
      
      // Keep best match
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { file, score };
      }
    }
    
    return bestMatch ? bestMatch.file : null;
  }

  /**
   * Fix incorrect filename comments in a file
   */
  private fixIncorrectCommentsInFile(filePath: string, dryRun: boolean): boolean {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const actualFilename = path.basename(filePath);
    const actualFilenameNoExt = actualFilename.replace(/\.(ts|tsx|js|jsx)$/, '');
    
    let changed = false;
    const newLines: string[] = [];
    let hasCorrectComment = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Check for filename comments
      if (trimmed.startsWith('// ') && this.isFilenameComment(trimmed)) {
        const commentName = trimmed.substring(3).trim();
        const commentNameNoExt = commentName.replace(/\.(ts|tsx|js|jsx)$/, '');
        
        // Check if this comment matches our filename (with or without correct extension)
        if (!hasCorrectComment && commentNameNoExt === actualFilenameNoExt) {
          // This is the correct file (even if extension is wrong)
          hasCorrectComment = true;
          // Use the CORRECT filename with correct extension
          newLines.push(`// ${actualFilename}`);
          if (trimmed !== `// ${actualFilename}`) {
            changed = true;
          }
        } 
        // Wrong comment or duplicate - skip it
        else {
          changed = true;
        }
      } 
      // Remove bare filename lines (check with and without extension)
      else if ((trimmed === actualFilenameNoExt || 
                trimmed === actualFilenameNoExt + '.ts' ||
                trimmed === actualFilenameNoExt + '.tsx' ||
                trimmed === actualFilenameNoExt + '.js' ||
                trimmed === actualFilenameNoExt + '.jsx') && 
              !trimmed.startsWith('//')) {
        changed = true;
      }
      else {
        newLines.push(line);
      }
    }
    
    // Add missing comment at correct position
    let finalLines = newLines;
    if (!hasCorrectComment) {
      const insertIndex = newLines[0]?.startsWith('#!') ? 1 : 0;
      finalLines = [...newLines];
      finalLines.splice(insertIndex, 0, `// ${actualFilename}`);
      changed = true;
    }
    
    if (changed && !dryRun) {
      fs.writeFileSync(filePath, finalLines.join('\n'), 'utf8');
    }
    
    return changed;
  }

  /**
   * Apply filename case fixes (simplified logic)
   */
  private async applyFilenameCaseFixes(filePath: string, dryRun: boolean): Promise<boolean> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const actualFilename = path.basename(filePath);
    
    let changed = false;
    
    // Remove duplicate shebangs
    const shebangLines = lines.filter(line => line.startsWith('#!'));
    if (shebangLines.length > 1) {
      changed = true;
      if (!dryRun) {
        const newLines = lines.filter((line, index) => 
          !line.startsWith('#!') || index === lines.findIndex(l => l.startsWith('#'))
        );
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
      }
    }
    
    // Update incorrect filename comments
    const filenameComments = lines.filter(line => 
      line.trim().startsWith('// ') && 
      this.isFilenameComment(line.trim()) &&
      line.trim() !== `// ${actualFilename}`
    );
    
    if (filenameComments.length > 0) {
      changed = true;
      if (!dryRun) {
        const newLines = lines.map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('// ') && this.isFilenameComment(trimmed)) {
            return `// ${actualFilename}`;
          }
          return line;
        });
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
      }
    }
    
    return changed;
  }

  /**
   * Check if a string looks like a filename comment
   */
  // private isFilenameComment(line: string): boolean {
  //   return /\.(ts|tsx|js|jsx)$/.test(line);
  // }

  // use above if this causes errors
  private isFilenameComment(line: string): boolean {
    const content = line.substring(3).trim(); // Remove "// "
    return /^[\w-]+\.(ts|tsx|js|jsx)$/.test(content) || 
          /\/\/.*\.(ts|tsx|js|jsx)/.test(line); // Path-like comments
  }
  /**
   * Find all TypeScript/JavaScript files
   */
  private async findAllTypeScriptFiles(rootDir: string): Promise<string[]> {
    const files: string[] = [];
    
    const traverse = (dir: string) => {
      try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dir, item.name);
          
          if (item.isDirectory()) {
            if (!item.name.includes('node_modules') && 
                !item.name.startsWith('.') && 
                !item.name.includes('dist')) {
              traverse(fullPath);
            }
          } else if (/\.(ts|tsx|js|jsx)$/.test(item.name)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not read directory ${dir}:`, error instanceof Error ? error.message : String(error));
      }
    };
    
    traverse(rootDir);
    return files;
  }
}

// CLI Interface (same as before)
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const help = args.includes('--help') || args.includes('-h');
  
  const fileArgs = args.filter(arg => 
    !arg.startsWith('--') && 
    !arg.startsWith('-')
  );

  if (help) {
    console.log(`
🔧 Unified Header Fixer
=======================

Fixes ALL filename/header issues in one command:
1. Incorrect/duplicate filename comments
2. Bare filename lines (without //)
3. Missing filename comments
4. Standardizes header format

📋 Header Fixer Strategy:
-------------------------
This is the AGGRESSIVE fixer:
• All conservative fixes (shebangs, comments, duplicates)
• Removes bare filename lines (without "//")
• Ensures consistent formatting
• Uses both FilenameCaseFixer and FileHeaderManager

For conservative fixes only (safer),
use: pnpm run fix:headers:conservative

Recommended workflow:
  1. pnpm run fix:headers:conservative:dry-run  # See safe changes
  2. pnpm run fix:headers:conservative          # Apply safe fixes
  3. pnpm run fix:headers:dry-run               # See additional fixes
  4. pnpm run fix:headers                       # Complete cleanup

Usage:
  tsx scripts/fix-all-headers.ts [options] [file-or-directory]

Options:
  --dry-run, -d      Preview changes without applying
  --help, -h         Show this help
  [file-or-directory] Specific file or directory to fix
  
Examples:
  # Fix all files in project
  tsx scripts/fix-all-headers.ts
  
  # Dry run on specific file
  tsx scripts/fix-all-headers.ts --dry-run src/core/actions/CalendarEventActions.tsx
  
  # Fix specific directory
  tsx scripts/fix-all-headers.ts src/core/actions/
    `);
    return;
  }

  const fixer = new UnifiedHeaderFixer();
  const target = fileArgs.length > 0 ? fileArgs[0] : undefined;
  
  await fixer.fixAll(target, dryRun);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { UnifiedHeaderFixer };