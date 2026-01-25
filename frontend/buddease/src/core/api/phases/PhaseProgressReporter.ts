class PhaseProgressReporter {
  private startTime = Date.now();
  private phaseStats = new Map<string, PhaseStats>();
  
  onFileAnalyzed(filePath: string, result: AnalysisResult) {
    const phase = this.detectPhase(filePath);
    const stats = this.phaseStats.get(phase) || { files: 0, errors: 0, warnings: 0, suggestions: 0 };
    
    stats.files++;
    stats.errors += result.issues.filter(i => i.severity === 'error').length;
    stats.warnings += result.issues.filter(i => i.severity === 'warning').length;
    stats.suggestions += result.issues.filter(i => i.suggestion).length;
    
    this.phaseStats.set(phase, stats);
    
    // Real-time progress bar like your import fixer
    if (process.stdout.isTTY) {
      this.updateProgressBar(phase, stats);
    }
  }
  
  printFinalReport() {
    console.log('\n📊 PHASE EXECUTION REPORT');
    console.log('='.repeat(80));
    
    for (const [phase, stats] of this.phaseStats) {
      console.log(`\n${phase.toUpperCase()}:`);
      console.log(`  📁 Files analyzed: ${stats.files}`);
      console.log(`  ❌ Errors: ${stats.errors}`);
      console.log(`  ⚠️ Warnings: ${stats.warnings}`);
      console.log(`  💡 Suggestions: ${stats.suggestions}`);
      
      if (stats.errors > 0) {
        console.log(`  🔧 Fix command: pnpm phase:${phase}:fix`);
      }
    }
    
    const totalErrors = Array.from(this.phaseStats.values()).reduce((sum, s) => sum + s.errors, 0);
    console.log(`\n🎯 Next action: ${totalErrors > 0 ? `Run "pnpm dev:fix:all" to apply ${totalErrors} fixes` : 'All phases passed!'}`);
  }
}