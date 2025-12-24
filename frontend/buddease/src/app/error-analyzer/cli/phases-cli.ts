#!/usr/bin/env tsx
// src/app/error-analyzer/cli/phases-cli.ts

import { runInitialDiagnosis } from '../phases/TypeScriptDiagnosticPhase';
import { runFullResolution, PhaseExecutor } from '../phases/PhaseExecutor';
import { Command } from 'commander';

const program = new Command();

program
  .name('ts-phases')
  .description('TypeScript Error Resolution Phases')
  .version('1.0.0');

program
  .command('diagnose')
  .description('Run Phase 1: Initial Diagnosis')
  .option('-o, --output <path>', 'Output directory for reports', './reports')
  .action(async (options) => {
    try {
      await runInitialDiagnosis(process.cwd());
    } catch (error) {
      console.error('Diagnosis failed:', error);
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Run all resolution phases')
  .option('-s, --skip <phases>', 'Comma-separated phases to skip')
  .action(async (options) => {
    try {
      const result = await runFullResolution(process.cwd());
      console.log('\n🎉 All phases completed!');
    } catch (error) {
      console.error('Resolution failed:', error);
      process.exit(1);
    }
  });

program
  .command('phase <name>')
  .description('Run a specific phase')
  .action(async (phaseName) => {
    try {
      const executor = new PhaseExecutor();
      await executor.executePhase(phaseName);
    } catch (error) {
      console.error(`Phase ${phaseName} failed:`, error);
      process.exit(1);
    }
  });

program.parse(process.argv);