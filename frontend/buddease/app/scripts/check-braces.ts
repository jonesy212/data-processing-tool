#!/usr/bin/env tsx
// check-braces.ts
import { readFileSync } from 'fs';

const USAGE = `Usage:  pnpm tsx check-braces.ts <file1> [file2] …`;

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(USAGE);
  process.exit(1);
}

for (const file of args) {
  const src   = readFileSync(file, 'utf8');
  const lines = src.split('\n');

  type Frame = { line: number; col: number; open: number };
  const stack: Frame[] = [];

  let open = 0;

  lines.forEach((raw, idx) => {
    const l = raw.replace(/\/\/.*$/, '')          // strip single-line comments
                .replace(/\/\*[\s\S]*?\*\//g, ''); // strip multi-line comments

    for (let ch of l) {
      if (ch === '{') {
        open++;
        stack.push({ line: idx + 1, col: 0, open });
      }
      if (ch === '}') {
        open--;
        if (stack.length && stack[stack.length - 1].open === open + 1) stack.pop();
      }
    }
  });

  if (open > 0) {
    console.log(`❌  ${file}  – missing ${open} closing brace(es)`);
    stack.forEach(f => console.log(`      still open at line ${f.line}`));
  } else if (open < 0) {
    console.log(`❌  ${file}  – ${Math.abs(open)} extra closing brace(es)`);
  } else {
    console.log(`✅  ${file}  – braces balance`);
  }
}