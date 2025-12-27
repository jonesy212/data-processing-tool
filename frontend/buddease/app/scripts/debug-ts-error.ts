#!/usr/bin/env tsx
// src/app/scripts/debug-ts-error.ts
// Debug specific TypeScript file errors

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

function debugFile(filePath: string) {
  const fullPath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }

  console.log(`🔍 Debugging: ${filePath}\n`);
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  // Show lines around line 20
  const startLine = Math.max(1, 20 - 5);
  const endLine = Math.min(lines.length, 20 + 5);
  
  console.log(`Lines ${startLine}-${endLine} (error at line 20):`);
  console.log('='.repeat(60));
  
  for (let i = startLine - 1; i < endLine; i++) {
    const lineNum = i + 1;
    const marker = lineNum === 20 ? '>>>' : '   ';
    console.log(`${marker} ${lineNum.toString().padStart(3)}: ${lines[i]}`);
  }
  
  console.log('='.repeat(60));
  
  // Try to parse with TypeScript compiler to get better error
  console.log('\n🔧 TypeScript parsing analysis:\n');
  
  try {
    const sourceFile = ts.createSourceFile(
      fullPath,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    
    // Find the node at position (line 20, column 3)
    // Convert line/column to position
    const lineStarts = sourceFile.getLineStarts();
    const position = lineStarts[19] + 2; // Line 20 (0-indexed), column 3 (0-indexed)
    
    const node = getNodeAtPosition(sourceFile, position);
    
    if (node) {
      console.log(`Node at position (line 20, col 3):`);
      console.log(`  Kind: ${ts.SyntaxKind[node.kind]}`);
      console.log(`  Text: "${node.getText().substring(0, 50)}${node.getText().length > 50 ? '...' : ''}"`);
      
      // Show parent nodes for context
      console.log(`\nParent context:`);
      let parent = node.parent;
      let depth = 0;
      
      while (parent && depth < 5) {
        const indent = '  '.repeat(depth);
        console.log(`${indent}${ts.SyntaxKind[parent.kind]}: "${parent.getText().substring(0, 60)}${parent.getText().length > 60 ? '...' : ''}"`);
        parent = parent.parent;
        depth++;
      }
    }
    
  } catch (error: any) {
    console.log('Could not parse with TypeScript compiler:', error.message);
  }
  
  // Common issues to check for
  console.log('\n🔍 Checking for common issues:');
  
  // Check line 20 specifically
  const line20 = lines[19]; // 0-indexed
  
  // 1. Check for unclosed JSX tags
  const jsxTags = (line20.match(/<[^>]*$/g) || []).length;
  if (jsxTags > 0) {
    console.log('⚠️  Possible unclosed JSX tag on line 20');
  }
  
  // 2. Check for missing closing brace
  const openBraces = (line20.match(/{/g) || []).length;
  const closeBraces = (line20.match(/}/g) || []).length;
  const openParens = (line20.match(/\(/g) || []).length;
  const closeParens = (line20.match(/\)/g) || []).length;
  
  if (openBraces !== closeBraces) {
    console.log(`⚠️  Mismatched braces: ${openBraces} opening vs ${closeBraces} closing`);
  }
  
  if (openParens !== closeParens) {
    console.log(`⚠️  Mismatched parentheses: ${openParens} opening vs ${closeParens} closing`);
  }
  
  // 3. Check for invalid characters
  const invalidChars = line20.match(/[^\x00-\x7F]/g);
  if (invalidChars) {
    console.log(`⚠️  Non-ASCII characters found: ${invalidChars.join(', ')}`);
  }
  
  // 4. Check the line before
  const line19 = lines[18];
  console.log(`\nLine 19 context: "${line19?.trim()}"`);
  console.log(`Line 20 content: "${line20?.trim()}"`);
  console.log(`Line 21 context: "${lines[20]?.trim()}"`);
}

function getNodeAtPosition(node: ts.Node, position: number): ts.Node | null {
  if (position >= node.getStart() && position < node.getEnd()) {
    const children: ts.Node[] = [];
    node.forEachChild(child => children.push(child));
    
    for (const child of children) {
      const result = getNodeAtPosition(child, position);
      if (result) return result;
    }
    
    return node;
  }
  return null;
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: pnpm run debug-ts-error <file-path>');
    process.exit(1);
  }
  
  debugFile(filePath);
}

export { debugFile };