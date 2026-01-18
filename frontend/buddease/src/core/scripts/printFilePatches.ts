#!/usr/bin/env tsx
// printFilePatches.ts
import fs from 'fs';
import path from 'path';
import { createTwoFilesPatch } from 'diff';

const outDir = process.argv[2] || './corrections';
const jsonPath = path.join(outDir, 'full-report.json');
const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('======================  GIT DIFF PATCHES  ======================\n');
for (const c of report.corrections) {
  if (!c.code || !c.fix) continue;
  const rel = path.relative(process.cwd(), c.file);
  const patch = createTwoFilesPatch(
    rel,
    rel,
    c.code,
    c.fix,
    'original',
    'suggested'
  );
  console.log(patch);
  console.log('\n\n');
}