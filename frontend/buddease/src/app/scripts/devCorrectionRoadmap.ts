#!/usr/bin/env tsx

// devCorrectionRoadmap.ts
import { CorrectionGenerator } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
const execa = promisify(exec);

const ROADMAP_FILE = './corrections/roadmap.json';
const CHECKLIST_MD  = './corrections/REVIEW_CHECKLIST.md';

type RoadmapItem = {
  id: number;
  file: string;
  line?: number;
  severity: 'critical'|'high'|'medium'|'low';
  title: string;
  description: string;
  originalCode: string;
  suggestedFix: string;
  status: 'todo'|'done'|'skipped';
};

/* -------------------------------------------------------------- */
/*  1.  SCAN  –  create the master map  (NO DISK CHANGES)        */
/* -------------------------------------------------------------- */
async function scanFullProject() {
  console.log('🔍  Scanning entire project…');
  const gen = new CorrectionGenerator();
  const report = await gen.generateCorrections(); // plain report, no files written

  const items: RoadmapItem[] = report.corrections.map((c, idx) => ({
    id: idx + 1,
    file: path.relative(process.cwd(), c.file),
    line: c.line,
    severity: c.severity,
    title: c.message.split('\n')[0],
    description: c.message,
    originalCode: c.code,
    suggestedFix: c.fix,
    status: 'todo'
  }));

  fs.mkdirSync('./corrections', { recursive: true });
  fs.writeFileSync(ROADMAP_FILE, JSON.stringify(items, null, 2));
  console.log(`✅  Found ${items.length} items – roadmap saved to ${ROADMAP_FILE}`);
}

/* -------------------------------------------------------------- */
/*  2.  REVIEW –  human checklist  (opens in VS Code)            */
/* -------------------------------------------------------------- */
async function openReviewChecklist(): Promise<void> {
  if (!fs.existsSync(ROADMAP_FILE)) {
    await scanFullProject();
    return openReviewChecklist();
  }

  const items: RoadmapItem[] = JSON.parse(fs.readFileSync(ROADMAP_FILE, 'utf-8'));
  const todo = items.filter(i => i.status === 'todo');

  const md: string[] = [];
  md.push('# 🛠️  Developer Correction Roadmap');
  md.push(`*Generated ${new Date().toISOString()}*`);
  md.push('');
  md.push('## How to use');
  md.push('1. Open this checklist side-by-side with your code (`Ctrl+\\`)');
  md.push('2. Work from **critical → high → medium → low**');
  md.push('3. Copy the **Suggested Fix** block into your file when you trust it');
  md.push('4. Run `pnpm mark:done <id>` to mark completed');
  md.push('');

  todo.sort((a, b) => {
    const sev = { critical: 0, high: 1, medium: 2, low: 3 };
    return sev[a.severity] - sev[b.severity];
  });

  todo.forEach(it => {
    md.push(`---`);
    md.push(`### ${it.id}. ${it.title}  *(**${it.severity.toUpperCase()}** – ${it.file}:${it.line ?? '?'})*`);
    md.push('');
    md.push('**Problem:**');
    md.push('```ts');
    md.push(it.originalCode);
    md.push('```');
    md.push('');
    md.push('**Suggested Fix:**');
    md.push('```ts');
    md.push(it.suggestedFix);
    md.push('```');
    md.push('');
  });

  fs.writeFileSync(CHECKLIST_MD, md.join('\n'));
  await execa(`code "${CHECKLIST_MD}"`);
  console.log('📋  Checklist opened in VS Code – start with item #1');
}
/* -------------------------------------------------------------- */
/*  3.  SINGLE-FILE REVIEW  (optional)                           */
/* -------------------------------------------------------------- */
async function reviewSingleFile(fileArg: string) {
  const full = path.resolve(fileArg);
  if (!fs.existsSync(full)) return console.error('❌  File not found:', full);

  const gen = new CorrectionGenerator();
  const report = await gen.generateCorrections('snapshots'); // focus on snapshots for speed
  const hits = report.corrections.filter(c => c.file === full);

  if (hits.length === 0) return console.log('✅  No issues in', fileArg);

  const items: RoadmapItem[] = hits.map((c, idx) => ({
    id: Date.now() + idx,
    file: path.relative(process.cwd(), c.file),
    line: c.line,
    severity: c.severity,
    title: c.message.split('\n')[0],
    description: c.message,
    originalCode: c.code,
    suggestedFix: c.fix,
    status: 'todo'
  }));

  const tmpMd = `./corrections/${path.basename(fileArg)}-review.md`;
  fs.writeFileSync(tmpMd, generateMiniChecklist(items));
  await execa(`code "${tmpMd}"`);
}

/* -------------------------------------------------------------- */
/*  4.  MARK DONE  –  update checklist                           */
/* -------------------------------------------------------------- */
async function markDone(idArg: string) {
  if (!fs.existsSync(ROADMAP_FILE)) return console.error('❌  No roadmap found – run scan first');

  const items: RoadmapItem[] = JSON.parse(fs.readFileSync(ROADMAP_FILE, 'utf-8'));
  const id = Number(idArg);
  const hit = items.find(i => i.id === id);
  if (!hit) return console.error('❌  ID not found');
  hit.status = 'done';
  fs.writeFileSync(ROADMAP_FILE, JSON.stringify(items, null, 2));
  console.log(`✅  Marked #${id} as done – ${items.filter(i => i.status === 'done').length}/${items.length} completed`);
}

/* -------------------------------------------------------------- */
/*  CLI dispatcher                                               */
/* -------------------------------------------------------------- */
const [, , cmd, arg] = process.argv;
(async () => {
  switch (cmd) {
    case 'scan':
      await scanFullProject();
      break;
    case 'review':
      await openReviewChecklist();
      break;
    case 'file':
      if (!arg) return console.error('❌  Usage: pnpm review:file <relative-path>');
      await reviewSingleFile(arg);
      break;
    case 'done':
      if (!arg) return console.error('❌  Usage: pnpm mark:done <id>');
      await markDone(arg);
      break;
    default:
      console.log(`
  Usage:
    pnpm dev:correction-roadmap   – full scan + open checklist
    pnpm scan:full                – scan only
    pnpm review:roadmap           – open checklist
    pnpm review:file <path>       – review single file
    pnpm mark:done <id>           – mark item completed
  `);
  }
  
  function generateMiniChecklist(items: RoadmapItem[]): string {
    const md: string[] = [];
    md.push('# 🛠️  File-Specific Review');
    md.push(`*Generated ${new Date().toISOString()}*`);
    md.push('');
    
    items.forEach(it => {
      md.push(`---`);
      md.push(`### ${it.title}  *(**${it.severity.toUpperCase()}** – Line ${it.line ?? '?'})*`);
      md.push('');
      md.push('**Problem:**');
      md.push('```ts');
      md.push(it.originalCode);
      md.push('```');
      md.push('');
      md.push('**Suggested Fix:**');
      md.push('```ts');
      md.push(it.suggestedFix);
      md.push('```');
      md.push('');
    });

    return md.join('\n');
  }

})();