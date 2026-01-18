#!/usr/bin/env tsx
// fix-incorrect-filename-comments.ts

import fs from 'fs';
import path from 'path';

function fixIncorrectFilenameComments(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const actualFilename = path.basename(filePath);
  const actualFilenameNoExt = actualFilename.replace(/\.(ts|tsx|js|jsx)$/, '');
  
  let changed = false;
  const newLines: string[] = [];
  
  // Track which filename comments we've seen
  const seenComments = new Set<string>();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if this is a filename comment
    if (trimmed.startsWith('// ') && 
        (trimmed.includes('.ts') || trimmed.includes('.tsx') || 
         trimmed.includes('.js') || trimmed.includes('.jsx'))) {
      
      // Extract the filename from the comment
      const commentFilename = trimmed.substring(3).trim();
      const isActualFilename = commentFilename === actualFilename || 
                               commentFilename === actualFilenameNoExt;
      
      // If this is the FIRST filename comment and it's CORRECT, keep it
      if (seenComments.size === 0 && isActualFilename) {
        seenComments.add(commentFilename);
        newLines.push(`// ${actualFilename}`); // Use consistent format
        if (trimmed !== `// ${actualFilename}`) {
          changed = true;
        }
      } 
      // If this is the FIRST filename comment but it's WRONG, replace it
      else if (seenComments.size === 0 && !isActualFilename) {
        seenComments.add(actualFilename);
        newLines.push(`// ${actualFilename}`);
        changed = true;
        console.log(`Fixed incorrect filename comment: "${trimmed}" -> "// ${actualFilename}"`);
      }
      // If this is a DUPLICATE filename comment, skip it
      else if (seenComments.has(commentFilename)) {
        changed = true;
        console.log(`Removed duplicate filename comment: "${trimmed}"`);
      }
      // If this is a DIFFERENT filename comment, skip it
      else {
        changed = true;
        console.log(`Removed conflicting filename comment: "${trimmed}"`);
      }
    } else {
      newLines.push(line);
    }
  }
  
  // If no filename comment was found, add one at the top
  if (seenComments.size === 0) {
    newLines.unshift('', `// ${actualFilename}`);
    changed = true;
    console.log(`Added missing filename comment: "// ${actualFilename}"`);
  }
  
  // Remove leading blank lines
  while (newLines.length > 0 && newLines[0].trim() === '') {
    newLines.shift();
  }
  
  // Ensure we don't have consecutive blank lines at the top
  const finalLines: string[] = [];
  let lastLineWasBlank = false;
  
  for (const line of newLines) {
    const isBlank = line.trim() === '';
    if (!(isBlank && lastLineWasBlank)) {
      finalLines.push(line);
    }
    lastLineWasBlank = isBlank;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, finalLines.join('\n'), 'utf8');
  }
  
  return changed;
}

// Find files with CalendarEventActions in the name
function findCalendarEventActionsFiles(): string[] {
  const allFiles: string[] = [];
  
  function walk(dir: string) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        if (!item.name.includes('node_modules') && 
            !item.name.startsWith('.') && 
            !item.name.includes('dist') &&
            !item.name.includes('build')) {
          walk(fullPath);
        }
      } else if (/\.(ts|tsx)$/.test(item.name) && 
                 item.name.toLowerCase().includes('calendareventactions')) {
        allFiles.push(fullPath);
      }
    }
  }
  
  walk('.');
  return allFiles;
}

// Main execution
const target = process.argv[2];

if (target === '--find' || !target) {
  // Find all CalendarEventActions files
  console.log('🔍 Searching for CalendarEventActions files...');
  const files = findCalendarEventActionsFiles();
  
  if (files.length === 0) {
    console.log('❌ No CalendarEventActions files found.');
    console.log('\nUsage:');
    console.log('  tsx scripts/fix-incorrect-filename-comments.ts <file-path>');
    console.log('  tsx scripts/fix-incorrect-filename-comments.ts --find');
    process.exit(1);
  }
  
  console.log(`\n📁 Found ${files.length} CalendarEventActions file(s):`);
  files.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file}`);
  });
  
  console.log('\nTo fix a file, run:');
  console.log(`  tsx scripts/fix-incorrect-filename-comments.ts "${files[0]}"`);
  
} else {
  // Fix specific file
  const absPath = path.resolve(target);
  console.log(`🔧 Fixing filename comments in: ${absPath}`);
  
  if (fixIncorrectFilenameComments(absPath)) {
    console.log('✅ File fixed successfully!');
  } else {
    console.log('✅ No changes needed.');
  }
}