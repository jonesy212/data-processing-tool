#!/usr/bin/env tsx
// fixFilenameCases.ts

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface FileAnalysis {
  filePath: string;
  content: string;
  hasShebang: boolean;
  needsShebang: boolean;
  hasFilenameComment: boolean;
  filenameComment: string | null;
  commentFilePath: string | null; // Path from existing comment (if any)
  actualFilename: string;
  correctFilename: string;
  needsCasingFix: boolean;
  needsCommentPathUpdate: boolean; // If comment path doesn't match actual path
}

class FilenameCaseFixer {
  private scriptsPattern = /scripts\/|cli\/|bin\//i;
  private tsxPattern = /\.(ts|tsx)$/;
  
	  private scriptDirPatterns = [
    /\/scripts\//,
    /\/cli\//,
    /\/bin\//,
    /\/tools\//,
    /\/scripts$/, // Directory named "scripts"
    /\/cli$/,     // Directory named "cli"
    /\/bin$/,     // Directory named "bin"
  ];

  // Files that should NOT get headers
  private excludePatterns = [
    /node_modules/,
    /dist\//,
    /build\//,
    /\.d\.ts$/,
    /\.test\.ts$/,
    /\.spec\.ts$/,
    /\.config\.ts$/,
  ];

  private isExcluded(filePath: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(filePath));
  }

  async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const content = fs.readFileSync(filePath, 'utf8');
    const actualFilename = path.basename(filePath);
    const correctFilename = this.getCorrectFilename(filePath, actualFilename);
    
    const hasShebang = content.startsWith('#!/usr/bin/env tsx') || 
                      content.startsWith('#!/usr/bin/env node') ||
                      content.startsWith('#!');
    
    const needsShebang = this.shouldHaveShebang(filePath) && !hasShebang;
    
    // Check for existing filename comment and extract path
    const lines = content.split('\n');
    let filenameComment: string | null = null;
    let commentFilePath: string | null = null;
    
    // Look in first 5 lines for filename comment
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.startsWith('// ') && (line.includes('.ts') || line.includes('.tsx') || line.includes('.js') || line.includes('.jsx'))) {
        filenameComment = line;
        
        // Extract path from comment (remove "// " prefix)
        const commentPath = line.substring(3).trim();
        commentFilePath = commentPath;
        
        // We'll check if it needs update in fixFile
        break;
      }
    }
    
    const hasFilenameComment = !!filenameComment;
    
    // NEW: Determine if comment needs update
    let needsCommentPathUpdate = false;
    if (hasFilenameComment && filenameComment) {
      const expectedComment = this.generateFilenameComment(filePath, true); // simple filename
      if (filenameComment !== expectedComment) {
        needsCommentPathUpdate = true;
      }
    }
    
    const needsCasingFix = actualFilename !== correctFilename && 
                          actualFilename.toLowerCase() === correctFilename.toLowerCase();
    
    return {
      filePath,
      content,
      hasShebang,
      needsShebang,
      hasFilenameComment,
      filenameComment,
      commentFilePath,
      actualFilename,
      correctFilename,
      needsCasingFix,
      needsCommentPathUpdate,
    };
  }

private getCorrectFilename(filePath: string, currentFilename: string): string {
  // Keep the filename EXACTLY as it is
  return currentFilename;
}

  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private toCamelCase(str: string): string {
    const parts = str.split(/[-_]/);
    return parts
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }


  private shouldHaveShebang(filePath: string): boolean {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file is in a script directory
		const isInScriptDir = this.scriptDirPatterns.some(pattern => pattern.test(filePath));

    if (!isInScriptDir) {
      // Not in a script directory, very unlikely to need shebang
      return false;
    }
    
    // Check first 30 lines for CLI indicators
    const lines = content.split('\n').slice(0, 30);
    
    // Look for clear CLI/script patterns
    const hasCliIndicators = lines.some(line => {
      const trimmed = line.trim();
      return (
        trimmed.includes('process.argv') ||
        trimmed.includes('process.exit') ||
        trimmed.includes('console.error') ||
        trimmed.includes('console.warn') ||
        
        // CLI library patterns
        trimmed.includes('commander') ||
        trimmed.includes('yargs') ||
        trimmed.includes('minimist') ||
        trimmed.includes('argparse') ||
        trimmed.includes('oclif') ||
        
        // Function definitions that suggest CLI
        trimmed.match(/^function\s+main\s*\(/) ||
        trimmed.match(/^const\s+main\s*=/) ||
        trimmed.match(/^async\s+function\s+main\s*\(/) ||
        trimmed.match(/^export\s+(async\s+)?function\s+main\s*\(/) ||
        
        // CLI command parsing
        (trimmed.includes('command') && trimmed.includes('parse')) ||
        (trimmed.includes('option') && trimmed.includes('parse')) ||
        
        // Entry point patterns
        trimmed.includes('if (require.main === module)') ||
        trimmed.includes('if (!module.parent)')
      );
    });
    
    return hasCliIndicators;
  }


  private shouldHaveFilenameComment(filePath: string): boolean {
    // Don't add headers to excluded files
    if (this.isExcluded(filePath)) {
      return false;
    }
    
    const ext = path.extname(filePath);
    const isSourceFile = ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
    const isConfig = filePath.includes('.config.') || 
                     filePath.includes('.test.') ||
                     filePath.includes('.spec.');
    
    return isSourceFile && !isConfig;
  }

  private generateFilenameComment(filePath: string, preferSimple: boolean = true): string {
    if (preferSimple) {
      // Return just the filename (preferred)
      return `// ${path.basename(filePath)}`;
    } else {
      // Return full relative path
      const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
      return `// ${relativePath}`;
    }
  }

  async fixFile(analysis: FileAnalysis, dryRun = false): Promise<string | null> {
    const { filePath, content, needsShebang, needsCommentPathUpdate } = analysis;
    let changes: string[] = [];

    // Read content
    let lines = content.split('\n');
    const actualFilename = path.basename(filePath);
    const filenameWithoutExt = actualFilename.replace(/\.(ts|tsx|js|jsx)$/, '');

    // FIX 0: First, remove bare filename lines BEFORE checking for existing comments
    const bareFilenameLines: number[] = [];
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check if line is just the filename (with extension) WITHOUT comment markers
      if (trimmed === actualFilename && !trimmed.startsWith('//')) {
        bareFilenameLines.push(index);
      }
      
      // Also check for filename without extension
      if (trimmed === filenameWithoutExt && !trimmed.startsWith('//')) {
        bareFilenameLines.push(index);
      }
    });

    // Remove bare filename lines (backwards to maintain indices)
    bareFilenameLines.reverse().forEach(index => {
      if (index > 0) { // Don't remove if it's the first line (could be shebang)
        lines.splice(index, 1);
        changes.push('Removed bare filename line');
      }
    });

    // FIX 1: Update comment path if file was moved or comment is wrong
    if (needsCommentPathUpdate) {
      const currentCommentIndex = lines.findIndex(line => 
        line.trim().startsWith('// ') && 
        (line.includes('.ts') || line.includes('.tsx') || line.includes('.js') || line.includes('.jsx'))
      );
      
      if (currentCommentIndex !== -1) {
        const correctComment = this.generateFilenameComment(filePath, true); // true = simple filename
        lines[currentCommentIndex] = correctComment;
        changes.push(`Updated file comment: ${correctComment}`);
      }
    }

    // FIX 2: Add shebang if needed (VERY conservative)
    if (needsShebang) {
      lines.unshift('#!/usr/bin/env tsx');
      changes.push('Added shebang: #!/usr/bin/env tsx');
    }

    // FIX 3: Ensure proper filename comment (if not already present or updated)
    // Now check if we have a proper filename comment AFTER removing bare filenames
    const hasProperFilenameComment = lines.some(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('// ') && 
            (trimmed.includes(actualFilename) || 
              trimmed.includes(filenameWithoutExt));
    });

    const hasAnyCommentWithExtension = lines.some(line => 
      line.trim().startsWith('// ') && 
      (line.includes('.ts') || line.includes('.tsx') || line.includes('.js') || line.includes('.jsx'))
    );

    // Only add filename comment if we don't have a proper one already
    if (!hasProperFilenameComment && this.shouldHaveFilenameComment(filePath)) {
      const filenameComment = this.generateFilenameComment(filePath, true); // true = simple filename
      
      // Find where to insert (after shebang if present, otherwise at top)
      const insertIndex = lines[0]?.startsWith('#!') ? 1 : 0;
      lines.splice(insertIndex, 0, filenameComment);
      
      // Add blank line after comment if needed
      if (lines[insertIndex + 1]?.trim() !== '') {
        lines.splice(insertIndex + 1, 0, '');
      }
      
      changes.push(`Added filename comment: ${filenameComment}`);
    }

    // FIX 4: Remove duplicate filename comments (comments that mention the filename)
    let foundFirst = false;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      
      if (trimmed.startsWith('// ') && 
          (trimmed.includes(actualFilename) || trimmed.includes(filenameWithoutExt))) {
        if (foundFirst) {
          // Remove duplicate comment
          lines.splice(i, 1);
          i--; // Adjust index after removal
          changes.push('Removed duplicate filename comment');
        } else {
          foundFirst = true;
          
          // Also ensure this comment is in the correct format (simple filename)
          const expectedComment = this.generateFilenameComment(filePath, true);
          if (trimmed !== expectedComment) {
            lines[i] = expectedComment;
            changes.push(`Updated filename comment to: ${expectedComment}`);
          }
        }
      }
    }

    // FIX 5: Remove duplicate comments with file extensions (even if they don't match this filename)
    const extensionComments = lines.filter((line, index) => {
      const trimmed = line.trim();
      return trimmed.startsWith('// ') && 
            (trimmed.includes('.ts') || trimmed.includes('.tsx') || trimmed.includes('.js') || trimmed.includes('.jsx'));
    });

    if (extensionComments.length > 1) {
      // Keep only the first one
      let firstFound = false;
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.startsWith('// ') && 
            (trimmed.includes('.ts') || trimmed.includes('.tsx') || trimmed.includes('.js') || trimmed.includes('.jsx'))) {
          if (firstFound) {
            lines.splice(i, 1);
            i--;
            changes.push('Removed duplicate file extension comment');
          } else {
            firstFound = true;
          }
        }
      }
    }

    // FIX 6: Ensure no duplicate shebangs
    const shebangCount = lines.filter(line => line.startsWith('#!')).length;
    if (shebangCount > 1) {
      let foundFirst = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#!')) {
          if (foundFirst) {
            lines.splice(i, 1);
            i--;
            changes.push('Removed duplicate shebang');
          } else {
            foundFirst = true;
          }
        }
      }
    }

    if (changes.length > 0 && !dryRun) {
      const newContent = lines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
      return changes.join(', ');
    } else if (changes.length > 0 && dryRun) {
      return changes.join(', ');
    }

    return null;
  }

  async findFiles(rootDir: string = '.'): Promise<string[]> {
    const files: string[] = [];

    const traverse = (dir: string) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          if (item.startsWith('.') || item === 'node_modules' || item === 'dist' || item === 'build') {
            continue;
          }

          const fullPath = path.join(dir, item);
          
          try {
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
              traverse(fullPath);
            } else if (/\.(ts|tsx|js|jsx)$/.test(item)) {
              if (!this.isExcluded(fullPath)) {
                files.push(fullPath);
              }
            }
          } catch (error) {
            console.warn(`⚠️ Could not access ${fullPath}:`, error instanceof Error ? error.message : String(error));
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not read directory ${dir}:`, error instanceof Error ? error.message : String(error));
      }
    };

    traverse(rootDir);
    return files;
  }


  async run(dryRun = false, specificFiles?: string[]): Promise<void> {
    console.log('🔧 Fixing filename headers (Conservative Mode)...\n');
    console.log('📝 This script will:');
    console.log('   • Add filename comments matching exact filenames');
    console.log('   • Update moved file paths in comments');
    console.log('   • Add #!/usr/bin/env tsx shebangs ONLY to actual CLI scripts');
    console.log('   • Remove duplicate headers');
    console.log('   • NEVER rename files\n');
    
    let files: string[] = [];
    
    if (specificFiles && specificFiles.length > 0) {
      // First, check if any arguments are file names (not paths) and try to find them
      const resolvedFiles: string[] = [];
      
      for (const arg of specificFiles) {
        // Check if it looks like a path (has slashes, dots, or exists)
        const looksLikePath = arg.includes('/') || arg.includes('\\') || arg.includes('.');
        const absolutePath = path.resolve(process.cwd(), arg);
        const pathExists = fs.existsSync(absolutePath);
        
        if (looksLikePath && pathExists) {
          // It's a valid existing path
          if (fs.statSync(absolutePath).isDirectory()) {
            const dirFiles = this.getFilesInDirectory(absolutePath);
            resolvedFiles.push(...dirFiles);
            console.log(`📁 Found directory: ${arg} (${dirFiles.length} files)`);
          } else {
            resolvedFiles.push(absolutePath);
            console.log(`📄 Found file: ${arg}`);
          }
        } else if (looksLikePath && !pathExists) {
          // Looks like a path but doesn't exist - try to find similar
          console.log(`🔍 "${arg}" not found. Searching for similar files...`);
          const foundFiles = await this.findFileByName(arg);
          if (foundFiles.length === 0) {
            console.log(`   ❌ No files found matching: ${arg}`);
          } else if (foundFiles.length === 1) {
            console.log(`   ✅ Found: ${path.relative(process.cwd(), foundFiles[0])}`);
            resolvedFiles.push(foundFiles[0]);
          } else {
            console.log(`   ❓ Multiple files found matching "${arg}":`);
            foundFiles.slice(0, 5).forEach((file, index) => {
              console.log(`      ${index + 1}. ${path.relative(process.cwd(), file)}`);
            });
            if (foundFiles.length > 5) {
              console.log(`      ... and ${foundFiles.length - 5} more`);
            }
            console.log(`   ⚠️  Please be more specific or use exact path`);
            // For now, take the first match (most relevant)
            resolvedFiles.push(foundFiles[0]);
            console.log(`   📝 Using first match: ${path.relative(process.cwd(), foundFiles[0])}`);
          }
        } else {
          // Doesn't look like a path - search by name
          console.log(`🔍 Searching for files matching: "${arg}"`);
          const foundFiles = await this.findFileByName(arg);
          if (foundFiles.length === 0) {
            console.log(`   ❌ No files found matching: ${arg}`);
          } else if (foundFiles.length === 1) {
            console.log(`   ✅ Found: ${path.relative(process.cwd(), foundFiles[0])}`);
            resolvedFiles.push(foundFiles[0]);
          } else {
            console.log(`   ❓ Found ${foundFiles.length} files matching "${arg}":`);
            foundFiles.slice(0, 5).forEach((file, index) => {
              console.log(`      ${index + 1}. ${path.relative(process.cwd(), file)}`);
            });
            if (foundFiles.length > 5) {
              console.log(`      ... and ${foundFiles.length - 5} more`);
            }
            console.log(`   📝 Using first match: ${path.relative(process.cwd(), foundFiles[0])}`);
            resolvedFiles.push(foundFiles[0]);
          }
        }
      }
      
      files = [...new Set(resolvedFiles)]; // Remove duplicates
      
      if (files.length > 0) {
        console.log(`\n🎯 Targeting ${files.length} file(s):`);
        files.forEach(file => console.log(`   - ${path.relative(process.cwd(), file)}`));
        console.log('');
      } else {
        console.log('\n❌ No valid files found to process');
        return;
      }
    } else {
      files = await this.findFiles();
      console.log(`📊 Scanning entire project: ${files.length} files found\n`);
    }
    
    // Filter out non-existent files (just in case)
    files = files.filter(file => fs.existsSync(file));
    
    if (files.length === 0) {
      console.log('❌ No files to process');
      return;
    }
    
    const results: Array<{file: string, changes: string | null}> = [];
    
    for (const file of files) {
      try {
        const analysis = await this.analyzeFile(file);
        
        if (analysis.needsShebang || analysis.needsCommentPathUpdate || 
            (!analysis.hasFilenameComment && this.shouldHaveFilenameComment(file))) {
          
          const changes = await this.fixFile(analysis, dryRun);
          
          if (changes) {
            results.push({ file, changes });
            console.log(`✅ ${path.relative(process.cwd(), file)}`);
            console.log(`   ${changes}`);
            console.log('');
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error processing ${file}:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    if (results.length === 0) {
      console.log('🎉 No files needed fixes!');
    } else {
      console.log(`\n📈 Summary:`);
      console.log(`   Files processed: ${files.length}`);
      console.log(`   Files fixed: ${results.length}`);
      console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes made)' : 'APPLIED CHANGES'}`);
      
      // Count shebang additions separately
      const shebangAdditions = results.filter(r => r.changes?.includes('shebang')).length;
      if (shebangAdditions > 0) {
        console.log(`   Shebangs added: ${shebangAdditions} (only to actual CLI scripts)`);
      }
    }
  }

  // Add this helper method to the class
  private async findFileByName(fileName: string): Promise<string[]> {
    const allFiles = await this.findFiles();
    const matches: Array<{file: string, score: number}> = [];
    
    // Clean the search term
    const searchTerm = fileName.toLowerCase().trim();
    const searchTermNoExt = searchTerm.replace(/\.(ts|tsx|js|jsx)$/, '');
    
    for (const file of allFiles) {
      const basename = path.basename(file).toLowerCase();
      const basenameNoExt = basename.replace(/\.(ts|tsx|js|jsx)$/, '');
      const dirname = path.dirname(file).toLowerCase();
      
      let score = 0;
      
      // 1. EXACT filename match (highest priority)
      if (basename === searchTerm) {
        score += 1000;
      }
      
      // 2. Exact filename without extension
      if (basenameNoExt === searchTermNoExt) {
        score += 900;
      }
      
      // 3. Filename ends with search term (partial match)
      if (basenameNoExt.endsWith(searchTermNoExt)) {
        score += 200;
      }
      
      // 4. Filename contains search term
      if (basenameNoExt.includes(searchTermNoExt)) {
        score += 100;
      }
      
      // 5. Directory contains search term
      if (dirname.includes(searchTermNoExt)) {
        score += 50;
      }
      
      // PENALTY for unrelated files
      if (dirname.includes('node_modules') || dirname.includes('dist') || dirname.includes('build')) {
        score = 0; // Skip these completely
      }
      
      // PENALTY for files in platform/shared when looking for actions
      if (searchTermNoExt.includes('actions') && !dirname.includes('actions')) {
        score -= 100;
      }
      
      if (score > 0) {
        matches.push({ file, score });
      }
    }
    
    // Sort by score (highest first)
    const sortedMatches = matches.sort((a, b) => b.score - a.score);
    
    // Debug: Show top 5 matches
    if (sortedMatches.length > 1) {
      console.log(`🔍 Search results for "${fileName}":`);
      sortedMatches.slice(0, 5).forEach((match, idx) => {
        const relPath = path.relative(process.cwd(), match.file);
        console.log(`   ${idx + 1}. ${relPath} (score: ${match.score})`);
      });
    }
    
    return sortedMatches.map(m => m.file);
  }
  
	  private getFilesInDirectory(dir: string): string[] {
    const files: string[] = [];
    
    const traverse = (currentDir: string) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules' || item === 'dist' || item === 'build') {
          continue;
        }
        
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(item) && !this.isExcluded(fullPath)) {
          files.push(fullPath);
        }
      }
    };
    
    traverse(dir);
    return files;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const help = args.includes('--help') || args.includes('-h');
  const forceShebang = args.includes('--force-shebang'); // Optional flag to force shebang check
  
  // Get all non-option arguments as file paths
  const fileArgs = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'));
  
  if (help) {
    console.log(`
🔧 Fix Filename Headers (SUPER Conservative)

Usage:
  tsx app/scripts/fixFilenameCases.ts [options] [files...]

Options:
  --dry-run, -d      Preview changes without applying them
  --help, -h         Show this help message
  --force-shebang    Force shebang check (use cautiously)
  [files...]         Specific files or directories to fix

Examples:
  tsx app/scripts/fixFilenameCases.ts --dry-run
  tsx app/scripts/fixFilenameCases.ts --dry-run src/utils/fluencePlugin.ts
  tsx app/scripts/fixFilenameCases.ts src/utils/fluencePlugin.ts
  tsx app/scripts/fixFilenameCases.ts src/scripts/  # All files in scripts folder

Features:
  ✓ Adds filename comments matching EXACT filename
  ✓ Updates moved file paths in existing comments  
  ✓ Adds #!/usr/bin/env tsx shebangs ONLY to actual CLI scripts
  ✓ Removes duplicate headers
  ✗ NEVER renames files (preserves all filename casing)

Shebang Rules (very conservative):
  • Only files in /scripts/, /cli/, /bin/ folders
  • Must contain CLI indicators (process.argv, commander, etc.)
  • Never added to regular source files
    `);
    return;
  }
  
  const fixer = new FilenameCaseFixer();
  await fixer.run(dryRun, fileArgs.length > 0 ? fileArgs : undefined);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { FilenameCaseFixer };