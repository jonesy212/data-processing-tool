<!-- dev-correction-roadmap.md -->

Developer Correction Roadmap – Zero-Risk Walk-Through

A human-first workflow that:
Scans your entire codebase once and keeps a living map.
Prints a step-by-step checklist (nothing is overwritten).
Lets you copy / paste each fix in VS Code side-by-side.
Tracks progress so you can stop / resume at any time.

1. Quick Start (30 s)
bash
Copy
# 1️⃣  Generate the map + checklist (READ-ONLY)
pnpm dev:correction-roadmap

# 2️⃣  VS Code opens the checklist automatically
#    Put the checklist (right) next to your source file (left)
#    Work top → bottom (critical → low)

# 3️⃣  When you finish a block, mark it done
pnpm mark:done 42   # <-- id from checklist
Nothing is ever written to your real files unless you paste it.

2. Install the Commands
Add these four lines to package.json (already fits your existing scripts):
JSON
```ts
"scripts": {
  "...": "...",
  "dev:correction-roadmap": "pnpm run scan:full && pnpm run review:roadmap",
  "scan:full": "tsx scripts/devCorrectionRoadmap.ts scan",
  "review:roadmap": "tsx scripts/devCorrectionRoadmap.ts review",
  "review:file": "tsx scripts/devCorrectionRoadmap.ts file",
  "mark:done": "tsx scripts/devCorrectionRoadmap.ts done"
}
```

Create the script file:

mkdir -p scripts
touch scripts/devCorrectionRoadmap.ts


# paste the code from section 5 below
3. Follow-Along Process

| Step          | Command                                         | What happens                                                   |
| ------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| **A. Map**    | `pnpm dev:correction-roadmap`                   | Full scan → `corrections/roadmap.json` + `REVIEW_CHECKLIST.md` |
| **B. Review** | VS Code opens checklist                         | Work critical → high → medium → low                            |
| **C. Apply**  | Copy the **Suggested Fix** block into your file | Test / build / lint                                            |
| **D. Mark**   | `pnpm mark:done <id>`                           | Updates checklist & progress                                   |
| **E. Resume** | Close VS Code, come back later                  | `pnpm review:roadmap` continues where you left off             |



4. Checklist Format (human readable)
# 🛠️  Developer Correction Roadmap

*Generated 2025-11-12T14:23:45Z*

## How to use
1. Open this checklist side-by-side with your code (`Ctrl+\`)
2. Work from **critical → high → medium → low**
3. Copy the **Suggested Fix** block into your file when you trust it
4. Run `pnpm mark:done <id>` to mark completed

---

### 1. Missing import in useSnapshot.ts (**CRITICAL** – src/app/snapshots/useSnapshot.ts:17)

**Problem:**
```ts
import { Snapshot } from './Snapshot';
```

# 🛠️  Developer Correction Roadmap
*Generated 2025-11-12T14:23:45Z*

## How to use
1. Open this checklist side-by-side with your code (`Ctrl+\`)
2. Work from **critical → high → medium → low**
3. Copy the **Suggested Fix** block into your file when you trust it
4. Run `pnpm mark:done <id>` to mark completed

---

### 1. Missing import in useSnapshot.ts (**CRITICAL** – src/app/snapshots/useSnapshot.ts:17)
**Problem:**
```ts
import { Snapshot } from './snap';   // ← file does not exist
Suggested Fix:
TypeScript
Copy
```
import { Snapshot } from './Snapshot';
2. …
---

## 5. Drop-In Script

Save as `scripts/devCorrectionRoadmap.ts`:

```ts
#!/usr/bin/env tsx
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

async function scanFullProject() {
  console.log('🔍  Scanning entire project…');
  const gen = new CorrectionGenerator();
  const report = await gen.generateCorrections();
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
  console.log(`✅  Found ${items.length} items – roadmap saved`);
}

async function openReviewChecklist() {
  if (!fs.existsSync(ROADMAP_FILE)) return scanFullProject().then(() => openReviewChecklist());
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
  todo.sort((a,b)=> ({critical:0,high:1,medium:2,low:3})[a.severity] - ({critical:0,high:1,medium:2,low:3})[b.severity]);
  todo.forEach(it=>{
    md.push(`---`);
    md.push(`### ${it.id}. ${it.title}  *(**${it.severity.toUpperCase()}** – ${it.file}:${it.line ?? '?'})*`);
    md.push('**Problem:**'); md.push('```ts'); md.push(it.originalCode); md.push('```');
    md.push('**Suggested Fix:**'); md.push('```ts'); md.push(it.suggestedFix); md.push('```'); md.push('');
  });
  fs.writeFileSync(CHECKLIST_MD, md.join('\n'));
  await execa(`code "${CHECKLIST_MD}"`);
  console.log('📋  Checklist opened – start with item #1');
}

async function markDone(idArg: string) {
  if (!fs.existsSync(ROADMAP_FILE)) return console.error('❌  No roadmap – run scan first');
  const items: RoadmapItem[] = JSON.parse(fs.readFileSync(ROADMAP_FILE, 'utf-8'));
  const hit = items.find(i => i.id === Number(idArg));
  if (!hit) return console.error('❌  ID not found');
  hit.status = 'done';
  fs.writeFileSync(ROADMAP_FILE, JSON.stringify(items, null, 2));
  const done = items.filter(i => i.status === 'done').length;
  console.log(`✅  Marked #${hit.id} as done – ${done}/${items.length} completed`);
}

const [, , cmd] = process.argv;
(async () => {
  switch (cmd) {
    case 'scan': await scanFullProject(); break;
    case 'review': await openReviewChecklist(); break;
    case 'done': {
      const id = process.argv[3];
      if (!id) return console.error('Usage: pnpm mark:done <id>');
      await markDone(id);
      break;
    }
    default:
      console.log(`\nUsage:
  pnpm dev:correction-roadmap   – scan + open checklist
  pnpm scan:full                – scan only
  pnpm review:roadmap           – open checklist
  pnpm mark:done <id>           – mark item completed`);
  }
})();
```
---

## 5. Drop-In Script

Save as `scripts/devCorrectionRoadmap.ts`:


```ts
#!/usr/bin/env tsx
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

async function scanFullProject() {
  console.log('🔍  Scanning entire project…');
  const gen = new CorrectionGenerator();
  const report = await gen.generateCorrections();
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
  console.log(`✅  Found ${items.length} items – roadmap saved`);
}

async function openReviewChecklist() {
  if (!fs.existsSync(ROADMAP_FILE)) return scanFullProject().then(() => openReviewChecklist());
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
  todo.sort((a,b)=> ({critical:0,high:1,medium:2,low:3})[a.severity] - ({critical:0,high:1,medium:2,low:3})[b.severity]);
  todo.forEach(it=>{
    md.push(`---`);
    md.push(`### ${it.id}. ${it.title}  *(**${it.severity.toUpperCase()}** – ${it.file}:${it.line ?? '?'})*`);
    md.push('**Problem:**'); md.push('```ts'); md.push(it.originalCode); md.push('```');
    md.push('**Suggested Fix:**'); md.push('```ts'); md.push(it.suggestedFix); md.push('```'); md.push('');
  });
  fs.writeFileSync(CHECKLIST_MD, md.join('\n'));
  await execa(`code "${CHECKLIST_MD}"`);
  console.log('📋  Checklist opened – start with item #1');
}

async function markDone(idArg: string) {
  if (!fs.existsSync(ROADMAP_FILE)) return console.error('❌  No roadmap – run scan first');
  const items: RoadmapItem[] = JSON.parse(fs.readFileSync(ROADMAP_FILE, 'utf-8'));
  const hit = items.find(i => i.id === Number(idArg));
  if (!hit) return console.error('❌  ID not found');
  hit.status = 'done';
  fs.writeFileSync(ROADMAP_FILE, JSON.stringify(items, null, 2));
  const done = items.filter(i => i.status === 'done').length;
  console.log(`✅  Marked #${hit.id} as done – ${done}/${items.length} completed`);
}

const [, , cmd] = process.argv;
(async () => {
  switch (cmd) {
    case 'scan': await scanFullProject(); break;
    case 'review': await openReviewChecklist(); break;
    case 'done': {
      const id = process.argv[3];
      if (!id) return console.error('Usage: pnpm mark:done <id>');
      await markDone(id);
      break;
    }
    default:
      console.log(`\nUsage:
  pnpm dev:correction-roadmap   – scan + open checklist
  pnpm scan:full                – scan only
  pnpm review:roadmap           – open checklist
  pnpm mark:done <id>           – mark item completed`);
  }
})();
6. Incorporating Your Existing Files
The script re-uses everything you already built:
Table
Copy
Your file	How it’s used
CorrectionGenerator.ts	Called directly to produce the report
ErrorAnalyzer.ts	Runs inside CorrectionGenerator
StructureValidator.ts	Runs inside CorrectionGenerator
SecurityAuditor.ts	Runs inside CorrectionGenerator
SnapshotAnalyzer.ts	Runs when you --snapshots
CircularDependencyDetector.ts	Runs inside CorrectionGenerator
TypeRelationshipMapper.ts	Runs inside CorrectionGenerator
No duplication—just a thin CLI wrapper that turns the machine report into a human checklist.
7. Tips & Shortcuts
Table
Copy
Goal	Command
Quick safety check before push	pnpm dev:with-critical-fixes
Only snapshot folder	pnpm generate:corrections:snapshots
Laser-focus one file	pnpm review:file src/app/snapshots/useSnapshot.ts
See overall progress	cat corrections/roadmap.json | jq '.[] | select(.status=="done") | .id'
8. Finish Line
When the checklist shows 0 todo items you have:
Zero critical errors
Zero high-severity issues
A clean error-tracking/progress-report.md
A commit history you chose line-by-line.
