<!-- PRECOMMIT_SETUP.md -->
# Pre-Commit Hook Setup & Documentation

This document explains the **pre-commit hook setup** for the project, including its purpose, how it works, and step-by-step instructions for ensuring everything runs correctly before committing code.

---

## ⚡ Quick Start (5-Minute Setup)

Follow these commands to get the pre-commit hook running immediately:

```bash
# 1️⃣ Navigate to project root
cd /path/to/project

# 2️⃣ Install Husky (if not already installed)
pnpm install husky --save-dev

# 3️⃣ Enable Husky hooks
npx husky install

# 4️⃣ Add the pre-commit hook
npx husky add .husky/pre-commit "bash scripts/pre-commit.sh"

# 5️⃣ Make the pre-commit script executable
chmod +x scripts/pre-commit.sh

# ✅ Test the hook manually (optional)
bash scripts/pre-commit.sh

# 6️⃣ Attempt a test commit to confirm everything works
git add .
git commit -m "Test pre-commit hook"
Once this is done, your pre-commit hook will automatically:

Run TypeScript validation on all tsconfig*.json files.

Check for disallowed backup or temporary files.

Run lint-staged for linting and formatting.

Execute any dynamic scripts in app/scripts/.

Purpose
The pre-commit hook enforces the following:

TypeScript Validation

Runs tsc --noEmit on all tsconfig*.json files to catch compilation errors before commit.

Backup & Temporary File Protection

Blocks accidental commits of old or temporary backup files (e.g., .bak, .backup-*, .dedup-backup.*), unless explicitly allowed.

Commentary:

Sometimes older backups exist from prior edits or scripts. These should not be committed unless explicitly included in the ALLOWED_PATTERNS.

Staging them accidentally will cause the pre-commit hook to block your commit.

To fix, either remove them from staging:

bash
Copy code
git restore --staged path/to/backup-file
Or add the pattern to ALLOWED_PATTERNS in scripts/pre-commit.sh if the backup must be committed.

Linting & Formatting Enforcement

Runs lint-staged to ensure all staged files meet code style, linting, and formatting requirements.

Dynamic Script Execution

Detects and executes scripts in app/scripts/ to validate code quality, generate required files, or perform other project-specific checks.

Future-Proof Configuration

Automatically picks up new TypeScript configurations, scripts, or backup exceptions without requiring manual hook updates.

How It Works
mermaid
Copy code
flowchart TD
    A[Start: User runs git commit] --> B[Check staged files for backup/temp files]
    B -->|Disallowed files found| X[Block commit & show error]
    B -->|No disallowed files| C[Run TypeScript validation (tsc --noEmit)]
    C -->|Errors found| X
    C -->|No errors| D[Run lint-staged on staged files]
    D -->|Lint/format errors| X
    D -->|All pass| E[Run dynamic scripts in app/scripts/]
    E -->|Errors found| X
    E -->|All pass| F[Commit allowed: git commit succeeds]

    A --> F

    X: Represents any step failing and blocking the commit with a clear error message.
Usage
Whenever a commit is attempted:

bash
Copy code
git add .
git commit -m "Your commit message"
The pre-commit hook will automatically:

Run TypeScript validation on all tsconfig*.json files.

Check for disallowed backup/temp files.

Run linting/formatting via lint-staged.

Run any dynamic scripts in app/scripts/.

If any of these steps fail, the commit is blocked, and an error report is shown.

Step-by-Step Checklist for Users
1️⃣ Verify Husky Installation

bash
Copy code
npx husky install
Check that .husky/pre-commit exists.

2️⃣ Check Script Permissions

bash
Copy code
chmod +x scripts/pre-commit.sh
3️⃣ Run Pre-Commit Manually (Optional)

bash
Copy code
bash scripts/pre-commit.sh
Ensure there are no TypeScript errors, no disallowed files, and linting passes.

4️⃣ Attempt a Test Commit

bash
Copy code
git add .
git commit -m "Test pre-commit hook"
Confirm that the hook runs and allows or blocks the commit correctly.

5️⃣ Handle Backup Files Correctly

If your commit is blocked because of backup files:

bash
Copy code
git restore --staged path/to/backup-file
Only explicitly allowed backup files (.bak, .backup-*, .dedup-backup.*) can be staged.

If a backup file must be committed, add its pattern to ALLOWED_PATTERNS in scripts/pre-commit.sh.

6️⃣ Fix Any Issues

Resolve TypeScript errors, linting issues, or remove any disallowed backup files.

Re-run the hook manually if needed, then commit.

Notes & Recommendations
This hook is dynamic: adding new scripts or tsconfig files will automatically be included in future commits.

Keep lint-staged configuration updated to cover all relevant file types and rules.

Users should always test the hook locally after pulling new updates to ensure consistency.

References
Husky Git Hooks Documentation

lint-staged

TypeScript Compiler Options

yaml
Copy code

This version explicitly explains:

- Why backups might appear in your staging area.  
- How to remove them or allow them intentionally.  
- Keeps the Quick Start commands front and center.  

---