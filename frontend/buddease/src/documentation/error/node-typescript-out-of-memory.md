# Node.js / TypeScript Out-Of-Memory Error (pnpm + nvm)

## Error Summary

When running TypeScript compilation via pnpm:

```bash
pnpm tsc
```

The process crashes with a Node.js out-of-memory error:

```text
FATAL ERROR: Ineffective mark-compacts near heap limit
Allocation failed - JavaScript heap out of memory
```

This typically appears after long GC cycles and ends with:

```text
Command was killed with SIGABRT (Aborted): tsc
```

---

## Root Cause

This issue was **not caused by pnpm itself**.

The root causes were:

1. **Using Node.js v22 (non‑LTS)**

   * Node 22 introduces GC and memory behavior changes
   * TypeScript 5.x + large path maps + `moduleResolution: bundler` can exceed heap limits

2. **Large TypeScript surface area**

   * Extensive `paths` mappings
   * Broad `include` globs
   * `strict` + `isolatedModules` + ESM bundler resolution

3. **Unpinned runtime versions**

   * Different developers using different Node versions
   * Inconsistent pnpm behavior across machines

---

## Resolution

### 1. Pin Node.js to LTS using nvm

Create a `.nvmrc` file at the project root:

```bash
echo "20" > .nvmrc
```

Activate it:

```bash
nvm install
nvm use
node -v
```

Expected:

```text
v20.x.x
```

> Node 20 LTS is the recommended baseline for TypeScript + Next.js projects.

---

### 2. Confirm pnpm compatibility

pnpm works **on top of Node** and is fully compatible with nvm.

Enable Corepack (required for pnpm):

```bash
corepack enable
```

Pin pnpm version in `package.json`:

```json
{
  "packageManager": "pnpm@9.15.0"
}
```

This ensures all developers use the same pnpm version.

---

### 3. Re-run TypeScript

After switching Node versions:

```bash
pnpm install
pnpm tsc
```

Result:

* Compilation completes
* No heap exhaustion
* Stable memory usage

---

## Why This Fix Works

* Node 20 has stable GC behavior for large TypeScript programs
* pnpm inherits the active Node runtime from nvm
* Consistent runtime versions eliminate memory regressions

---

## Preventive Guidance

### Required for all developers

```bash
nvm use
pnpm install
```

### CI recommendation

Ensure CI runs:

```bash
node -v
pnpm -v
pnpm tsc
```

Fail the build if Node is not v20.

---

## Related Issues

* TypeScript OOM during `tsc`
* Inconsistent behavior across machines
* pnpm behaving differently per developer

---

## Folder Placement Recommendation

Place this file at:

```text
/documentation/errors/node-typescript-out-of-memory.md
```

This keeps runtime and compiler errors grouped and discoverable.

---

## Status

**Resolved** — pinned Node.js LTS and standardized pnpm runtime.




# Recommended location in the repo:

/documentation/errors/node-typescript-out-of-memory.md


This write-up is structured for:

onboarding new developers

CI debugging

post-mortem reference when pnpm tsc crashes with OOM

If you want, next we can:

add a short TL;DR section for faster scanning

cross-link this from a central documentation/errors/README.md

add a CI guard that fails when Node ≠ 20

where am i adding   "packageManager": "pnpm@9.15.0"

You add "packageManager": "pnpm@9.15.0" at the top level of package.json, alongside name, version, and scripts.

```ts
Exact placement
{
  "name": "buddease",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "check:snapshots": "bash scripts/check-snapshot-imports.sh",
    "tsc": "tsc"
  }
}
```
# Why this matters

## Locks pnpm version for all developers

Works with Node 20 + Corepack

Prevents “works on my machine” issues

CI automatically installs the correct pnpm version

How developers activate it

With Node 20:
```ts
corepack enable
pnpm install
```

## Corepack will automatically enforce pnpm@9.15.0.