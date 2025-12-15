// deployApp.ts
// scripts/deployApp.ts - A "big method" for deployment
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

const execAsync = promisify(exec);

/* ---------- Public API -------------------------------------------------- */

export class DeployAppScript {
  private readonly projectRoot = path.resolve(__dirname, '..');
  private readonly buildDir = path.join(this.projectRoot, '.next'); // adjust if needed
  private readonly revisionFile = path.join(this.buildDir, 'REVISION');
  private readonly healthEndpoint = process.env.HEALTH_URL || 'https://myapp.com/api/health';

  async execute(): Promise<void> {
    try {
      await this.validateEnvironment();
      await this.runTests();
      await this.buildAssets();
      await this.deployToServer();
      await this.runMigrations();
      await this.verifyDeployment();
      await this.notifyTeam('SUCCESS');
    } catch (raw) {
      const err = raw instanceof Error ? raw : new Error(String(raw));
      await this.notifyTeam('FAILURE', err);
      throw err;
    }
  }

  /* ---------- Validation ------------------------------------------------ */

  private async validateEnvironment(): Promise<void> {
    const required = [
      'NODE_ENV',
      'DATABASE_URL',
      'API_BASE_URL',
      'DEPLOY_TOKEN',
    ] as const;

    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing mandatory env var: ${key}`);
      }
    }
    console.log('✅ Environment variables validated');
  }

  /* ---------- Testing --------------------------------------------------- */

  private async runTests(): Promise<void> {
    console.log('🔍 Running test suite…');
    await execAsync('pnpm test:ci', { cwd: this.projectRoot });
    console.log('✅ Tests passed');
  }

  /* ---------- Build ----------------------------------------------------- */

  private async buildAssets(): Promise<void> {
    console.log('🏗️  Building application…');
    await fs.rm(this.buildDir, { recursive: true, force: true });
    await execAsync('pnpm build', { cwd: this.projectRoot });

    /* Embed git SHA so we can verify what is running */
    const { stdout: sha } = await execAsync('git rev-parse HEAD');
    await fs.writeFile(this.revisionFile, sha.trim(), 'utf-8');

    console.log('✅ Build complete');
  }

  /* ---------- Deploy ---------------------------------------------------- */

  private async deployToServer(): Promise<void> {
    console.log('🚀 Uploading artifacts…');

    /* Example: rsync to a remote host (can be swapped for S3, Docker, etc.) */
    const { DEPLOY_USER, DEPLOY_HOST, DEPLOY_PATH } = process.env;
    if (!DEPLOY_USER || !DEPLOY_HOST || !DEPLOY_PATH) {
      throw new Error('Missing deploy credentials');
    }

    const cmd = `rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" ${this.buildDir}/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}`;
    await execAsync(cmd);

    /* Restart PM2 / systemd / container – adjust as needed */
    await execAsync(`ssh ${DEPLOY_USER}@${DEPLOY_HOST} "sudo systemctl restart myapp"`);

    console.log('✅ Artifacts deployed');
  }

  /* ---------- Migrations ------------------------------------------------ */

  private async runMigrations(): Promise<void> {
    console.log('🗄️  Running database migrations…');
    await execAsync('pnpm migrate:deploy', { cwd: this.projectRoot });
    console.log('✅ Migrations finished');
  }

  /* ---------- Verification ---------------------------------------------- */

  private async verifyDeployment(): Promise<void> {
    console.log('🔎 Verifying deployment health…');

    for (let attempt = 1; attempt <= 10; attempt++) {
      try {
        const res = await fetch(this.healthEndpoint);
        if (res.ok) {
          const { sha } = await res.json();
          const localSha = await fs.readFile(this.revisionFile, 'utf-8');
          if (sha === localSha.trim()) {
            console.log('✅ Deployment verified');
            return;
          }
        }
      } catch {}
      await sleep(5_000);
    }
    throw new Error('Health check never passed');
  }

  /* ---------- Notifications --------------------------------------------- */

  private async notifyTeam(result: 'SUCCESS' | 'FAILURE', err?: Error): Promise<void> {
    const { NOTIFY_WEBHOOK } = process.env;
    if (!NOTIFY_WEBHOOK) return;

    const payload = {
      text:
        result === 'SUCCESS'
          ? '🟢 Deployment succeeded'
          : `🔴 Deployment failed: ${err?.message}`,
    };

    await fetch(NOTIFY_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }
  private async hashDirectory(dir: string): Promise<string> {
    const hash = createHash('sha256');

    const walk = async (current: string) => {
      const entries = await fs.readdir(current, { withFileTypes: true });

      for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        const fullPath = path.join(current, entry.name);

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          hash.update(await fs.readFile(fullPath));
        }
      }
    };

    await walk(dir);
    return hash.digest('hex');
  }
}

/* ---------- Utilities --------------------------------------------------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---------- CLI entry --------------------------------------------------- */

if (require.main === module) {
  new DeployAppScript()
    .execute()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

// This script gets reused across: staging, production, different apps