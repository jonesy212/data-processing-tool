src/test-phase.ts
import { PhaseExecutor } from '@/core/error-analyzer/phases/PhaseExecutor';

async function testPhase(phaseName: string) {
  try {
    console.log(`🚀 Testing phase: ${phaseName}`);
    const executor = new PhaseExecutor();
    await executor.executePhase(phaseName);
    console.log(`✅ Phase ${phaseName} completed successfully`);
  } catch (error) {
    console.error(`❌ Phase ${phaseName} failed:`, error);
    process.exit(1);
  }
}

const phaseName = process.argv[2] || 'error-grouping';
testPhase(phaseName);