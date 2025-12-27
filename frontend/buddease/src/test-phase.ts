import { PhaseExecutor } from './app/error-analyzer/phases/PhaseExecutor';

async function main() {
  const phaseName = process.argv[2];
  if (!phaseName) {
    console.log('Usage: pnpm run ts:phase <phase-name>');
    process.exit(1);
  }

  console.log(`🚀 Executing phase: ${phaseName}`);
  const executor = new PhaseExecutor();
  await executor.executePhase(phaseName);
  console.log(`✅ Phase ${phaseName} completed`);
}

main().catch(console.error);
