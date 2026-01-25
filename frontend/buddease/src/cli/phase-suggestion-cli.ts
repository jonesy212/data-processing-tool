// phase-suggestion-cli.ts

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const system = new PhaseSuggestionSystem();
  
  switch (command) {
    case 'analyze':
      await system.analyze({
        phase: args[1], // optional: foundation|state|data|ui
        target: args[2], // optional: specific file/dir
        dryRun: args.includes('--dry-run'),
        report: args.includes('--report'),
        continueOnError: args.includes('--continue')
      });
      break;
      
    case 'fix':
      // Run analyzers that are auto-fixable
      await system.analyzeAndFix({
        confidenceThreshold: args.includes('--aggressive') ? 50 : 80,
        categories: args.includes('--category') ? [args[args.indexOf('--category') + 1]] : undefined
      });
      break;
      
    case 'verify':
      // Post-fix verification with suggestions
      await system.verify({
        generateReport: true,
        suggestNextSteps: true
      });
      break;
      
    case 'interactive':
      // Interactive mode per your pattern
      await system.runInteractive({
        showSuggestions: true,
        allowPhaseSelection: true
      });
      break;
  }
}