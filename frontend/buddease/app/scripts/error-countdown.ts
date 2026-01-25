#!/usr/bin/env tsx
// Error Countdown Tracker
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ErrorStats {
  timestamp: string;
  totalErrors: number;
  byCategory: Record<string, number>;
  filesWithErrors: number;
  progressPercentage: number;
}

class ErrorCountdown {
  private statsFile = path.join(process.cwd(), '.error-stats.json');
  private baselineErrors = 100; // Adjust based on your current count
  
  async run() {
    console.log('🎯 ERROR COUNTDOWN SYSTEM');
    console.log('='.repeat(60));
    
    const stats = await this.collectErrorStats();
    this.displayProgress(stats);
    this.saveStats(stats);
    this.generateRecommendations(stats);
  }
  
  async collectErrorStats(): Promise<ErrorStats> {
    console.log('📊 Collecting error statistics...');
    
    try {
      // Run TypeScript check
      const output = execSync('pnpm tsc --noEmit 2>&1', { encoding: 'utf-8' });
      
      // Parse errors
      const lines = output.split('\n');
      const errorLines = lines.filter(line => line.includes('error TS'));
      
      // Categorize errors
      const categories: Record<string, number> = {};
      const errorFiles = new Set<string>();
      
      errorLines.forEach(line => {
        // Extract error type
        const match = line.match(/error TS(\d+):/);
        if (match) {
          const code = `TS${match[1]}`;
          categories[code] = (categories[code] || 0) + 1;
        }
        
        // Extract file path
        const fileMatch = line.match(/(src\/[^:]+):\d+:/);
        if (fileMatch) {
          errorFiles.add(fileMatch[1]);
        }
      });
      
      // Calculate progress
      const totalErrors = errorLines.length;
      const progress = this.baselineErrors > 0 
        ? Math.max(0, Math.min(100, ((this.baselineErrors - totalErrors) / this.baselineErrors) * 100))
        : totalErrors === 0 ? 100 : 0;
      
      return {
        timestamp: new Date().toISOString(),
        totalErrors,
        byCategory: categories,
        filesWithErrors: errorFiles.size,
        progressPercentage: Math.round(progress)
      };
      
    } catch (error: any) {
      console.error('❌ Failed to collect error stats:', error.message);
      return {
        timestamp: new Date().toISOString(),
        totalErrors: 999, // Indicates collection failed
        byCategory: {},
        filesWithErrors: 0,
        progressPercentage: 0
      };
    }
  }
  
  displayProgress(stats: ErrorStats) {
    console.log('\n📈 ERROR COUNTDOWN REPORT');
    console.log('='.repeat(60));
    
    if (stats.totalErrors === 999) {
      console.log('❌ Could not collect error statistics');
      return;
    }
    
    console.log(`🎯 Target: 0 Errors`);
    console.log(`📊 Current: ${stats.totalErrors} Errors`);
    console.log(`📁 Files with errors: ${stats.filesWithErrors}`);
    console.log(`📈 Progress: ${stats.progressPercentage}% complete`);
    
    // Progress bar
    const barLength = 30;
    const filled = Math.round((stats.progressPercentage / 100) * barLength);
    const empty = barLength - filled;
    console.log(`[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${stats.progressPercentage}%`);
    
    // Top error categories
    if (Object.keys(stats.byCategory).length > 0) {
      console.log('\n🔍 Top Error Categories:');
      const sorted = Object.entries(stats.byCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      sorted.forEach(([code, count], i) => {
        console.log(`  ${i+1}. ${code}: ${count} errors`);
      });
    }
    
    // Countdown message
    if (stats.totalErrors === 0) {
      console.log('\n🎉 CONGRATULATIONS! ZERO ERRORS ACHIEVED! 🎉');
    } else if (stats.totalErrors <= 10) {
      console.log(`\n🔥 ALMOST THERE! Only ${stats.totalErrors} errors remaining!`);
    } else if (stats.totalErrors <= 50) {
      console.log(`\n🚀 Making progress! ${stats.totalErrors} errors to go.`);
    } else {
      console.log(`\n🛠️ Work in progress. ${stats.totalErrors} errors remaining.`);
    }
  }
  
  saveStats(stats: ErrorStats) {
    try {
      let allStats = [];
      if (fs.existsSync(this.statsFile)) {
        allStats = JSON.parse(fs.readFileSync(this.statsFile, 'utf-8'));
      }
      
      allStats.push(stats);
      
      // Keep only last 100 entries
      if (allStats.length > 100) {
        allStats = allStats.slice(-100);
      }
      
      fs.writeFileSync(this.statsFile, JSON.stringify(allStats, null, 2));
      console.log(`\n📝 Stats saved to ${this.statsFile}`);
      
    } catch (error) {
      console.warn('⚠️ Could not save stats:', error);
    }
  }
  
  generateRecommendations(stats: ErrorStats) {
    if (stats.totalErrors === 0 || stats.totalErrors === 999) return;
    
    console.log('\n🎯 RECOMMENDED NEXT STEPS:');
    
    if (stats.byCategory['TS2307']) {
      console.log('1. Fix module imports: pnpm fix:types --dry-run');
    }
    
    if (stats.byCategory['TS2322'] || stats.byCategory['TS2345']) {
      console.log('2. Fix type mismatches: pnpm ts:strict-type');
    }
    
    if (stats.filesWithErrors > 20) {
      console.log(`3. Focus on high-error files (${stats.filesWithErrors} files affected)`);
    }
    
    console.log(`4. Run verification: pnpm verify:types`);
    console.log(`5. Check app sections: pnpm dev:isolated`);
  }
}

// Run the countdown
const tracker = new ErrorCountdown();
tracker.run().catch(console.error);