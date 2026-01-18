#!/usr/bin/env node

import { readdirSync, existsSync, statSync } from 'fs';
import { dirname, join, basename } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TreeExplorer {
  constructor() {
    this.options = {
      depth: null,           // null = unlimited, 1 = current dir only, 2 = +1 level, etc.
      exclude: ['node_modules', '.git', '.next', 'dist', 'build'],
      targetFolder: null,    // Show specific folder only
      searchFile: null,      // Search for file and show context
      showParent: false,     // Show one level up when searching
      color: true,
      dirsFirst: false
    };
  }

  parseArgs() {
    const args = process.argv.slice(2);
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--depth' || arg === '-d') {
        this.options.depth = parseInt(args[++i], 10);
      } else if (arg === '--folder' || arg === '-f') {
        this.options.targetFolder = args[++i];
      } else if (arg === '--search' || arg === '-s') {
        this.options.searchFile = args[++i];
      } else if (arg === '--parent' || arg === '-p') {
        this.options.showParent = true;
      } else if (arg === '--exclude' || arg === '-e') {
        this.options.exclude = args[++i].split(',');
      } else if (arg === '--no-color') {
        this.options.color = false;
      } else if (arg === '--dirs-first') {
        this.options.dirsFirst = true;
      } else if (arg === '--help' || arg === '-h') {
        this.showHelp();
        process.exit(0);
      }
    }
  }

  showHelp() {
    console.log(`
🌳 Tree Explorer - Advanced Directory Tree Viewer

Usage:
  node tree-explorer.js [options]

Options:
  -d, --depth <number>     Limit tree depth (1 = current dir, 2 = +1 level, etc.)
  -f, --folder <name>      Show specific folder tree only
  -s, --search <pattern>   Search for file/folder and show context
  -p, --parent             Show one level up when searching (with -s)
  -e, --exclude <list>     Exclude folders (comma-separated)
  --dirs-first            Show directories before files
  --no-color              Disable color output
  -h, --help              Show this help

Examples:
  node tree-explorer.js                        # Show full tree
  node tree-explorer.js -d 2                   # Show 2 levels deep
  node tree-explorer.js -f "src"               # Show src folder tree
  node tree-explorer.js -s "package.json"      # Find and show package.json context
  node tree-explorer.js -s "App.tsx" -p        # Find App.tsx and show parent
  node tree-explorer.js -d 3 -e "node_modules,.git"
  
  # Using pnpm shortcut (add to package.json scripts)
  pnpm tree
  pnpm tree:depth 3
  pnpm tree:search "Component.tsx"
  pnpm tree:folder "design-workflows"
    `);
  }

  run() {
    this.parseArgs();
    
    if (this.options.searchFile) {
      this.searchAndShowFile();
    } else if (this.options.targetFolder) {
      this.showTargetFolder();
    } else {
      this.showFullTree();
    }
  }

  showFullTree() {
    const cwd = process.cwd();
    let command = 'tree';
    
    // Build tree command
    if (this.options.exclude.length > 0) {
      command += ` -I "${this.options.exclude.join('|')}"`;
    }
    
    if (this.options.depth) {
      command += ` -L ${this.options.depth}`;
    }
    
    if (this.options.color) {
      command += ' -C';
    }
    
    if (this.options.dirsFirst) {
      command += ' --dirsfirst';
    }
    
    try {
      console.log(`📁 ${cwd}\n`);
      const output = execSync(command, { encoding: 'utf8' });
      console.log(output);
    } catch (error) {
      // If tree command fails, fall back to custom implementation
      console.log('ℹ️ Using custom tree implementation...');
      this.customTree(cwd, '', 0);
    }
  }

  showTargetFolder() {
    const cwd = process.cwd();
    const targetPath = this.findFolder(this.options.targetFolder, cwd);
    
    if (!targetPath) {
      console.error(`❌ Folder "${this.options.targetFolder}" not found`);
      process.exit(1);
    }
    
    console.log(`📁 Target: ${this.options.targetFolder}`);
    console.log(`📍 Path: ${targetPath}\n`);
    
    let command = `tree "${targetPath}"`;
    
    if (this.options.exclude.length > 0) {
      command += ` -I "${this.options.exclude.join('|')}"`;
    }
    
    if (this.options.depth) {
      command += ` -L ${this.options.depth}`;
    }
    
    if (this.options.color) {
      command += ' -C';
    }
    
    try {
      const output = execSync(command, { encoding: 'utf8' });
      console.log(output);
    } catch (error) {
      this.customTree(targetPath, '', 0);
    }
  }

  searchAndShowFile() {
    const cwd = process.cwd();
    const foundPaths = this.findFile(this.options.searchFile, cwd);
    
    if (foundPaths.length === 0) {
      console.error(`❌ File "${this.options.searchFile}" not found`);
      process.exit(1);
    }
    
    console.log(`🔍 Found ${foundPaths.length} occurrence(s) of "${this.options.searchFile}":\n`);
    
    foundPaths.forEach((filePath, index) => {
      console.log(`${index + 1}. ${filePath}`);
      
      if (this.options.showParent) {
        const parentDir = dirname(filePath);
        const parentName = basename(parentDir);
        
        console.log(`   📂 Parent: ${parentName}/`);
        console.log(`   📍 Path: ${parentDir}\n`);
        
        // Show parent directory contents
        this.showParentContents(parentDir, filePath);
      }
      
      // Show the file's directory tree (2 levels)
      this.showFileContext(filePath);
      
      if (index < foundPaths.length - 1) {
        console.log('─'.repeat(50));
      }
    });
  }

  showParentContents(parentDir, targetFile) {
    const targetName = basename(targetFile);
    
    try {
      const items = readdirSync(parentDir, { withFileTypes: true });
      
      console.log('   📄 Siblings:');
      items.forEach(item => {
        const prefix = item.name === targetName ? '🎯 ' : '   ';
        const type = item.isDirectory() ? '📁' : '📄';
        console.log(`     ${prefix}${type} ${item.name}`);
      });
      console.log();
    } catch (error) {
      console.log('   (Cannot read parent directory)');
    }
  }

  showFileContext(filePath) {
    const dirPath = dirname(filePath);
    const fileName = basename(filePath);
    
    console.log(`📁 Context for: ${fileName}`);
    console.log(`📍 Directory: ${dirPath}\n`);
    
    // Show 2 levels around the file
    this.customTree(dirPath, '', 0, 2, fileName);
  }

  findFolder(folderName, startDir) {
    // First check current directory
    if (existsSync(join(startDir, folderName))) {
      return join(startDir, folderName);
    }
    
    // Recursive search
    try {
      const items = readdirSync(startDir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory() && !this.shouldExclude(item.name)) {
          const fullPath = join(startDir, item.name);
          
          // Check if this is the folder we're looking for
          if (item.name === folderName) {
            return fullPath;
          }
          
          // Recursively search subdirectories
          const found = this.findFolder(folderName, fullPath);
          if (found) {
            return found;
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return null;
  }

  findFile(fileName, startDir, found = []) {
    try {
      const items = readdirSync(startDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(startDir, item.name);
        
        if (this.shouldExclude(item.name)) {
          continue;
        }
        
        if (item.isDirectory()) {
          // Recursively search directories
          this.findFile(fileName, fullPath, found);
        } else if (item.name.includes(fileName)) {
          // Found a match
          found.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return found;
  }

  shouldExclude(name) {
    return this.options.exclude.some(exclude => 
      name.includes(exclude) || exclude.includes(name)
    );
  }

  customTree(dirPath, indent, currentDepth, maxDepth = null, highlightFile = null) {
    if (maxDepth && currentDepth >= maxDepth) {
      return;
    }
    
    try {
      const items = readdirSync(dirPath, { withFileTypes: true })
        .filter(item => !this.shouldExclude(item.name))
        .sort((a, b) => {
          // Directories first if option enabled
          if (this.options.dirsFirst && a.isDirectory() !== b.isDirectory()) {
            return a.isDirectory() ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const isLast = i === items.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        const newIndent = indent + (isLast ? '    ' : '│   ');
        
        const isHighlighted = highlightFile && item.name === highlightFile;
        const icon = item.isDirectory() ? '📁' : '📄';
        const nameColor = isHighlighted ? '\x1b[1;32m' : ''; // Green for highlighted
        const resetColor = '\x1b[0m';
        
        console.log(`${indent}${prefix}${nameColor}${icon} ${item.name}${resetColor}`);
        
        if (item.isDirectory()) {
          this.customTree(
            join(dirPath, item.name),
            newIndent,
            currentDepth + 1,
            maxDepth,
            highlightFile
          );
        }
      }
    } catch (error) {
      console.log(`${indent}└── (Cannot read directory)`);
    }
  }
}

// Run the explorer
const explorer = new TreeExplorer();

// Check if this is the main module (ES module equivalent)
if (import.meta.url === `file://${process.argv[1]}`) {
  explorer.run();
}

export { TreeExplorer };