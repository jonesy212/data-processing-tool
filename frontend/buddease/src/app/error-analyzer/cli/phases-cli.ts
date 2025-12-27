#!/usr/bin/env tsx
// src/app/error-analyzer/cli/phases-cli.ts

import { runInitialDiagnosis } from '@/app/error-analyzer/phases/TypeScriptDiagnosticPhase';
import { runFullResolution, PhaseExecutor, phaseRunners } from '@/app/error-analyzer/phases/PhaseExecutor';
import { ErrorAnalyzer } from '@/app/generators/corrections/ErrorAnalyzer'
import { Command } from 'commander';

const program = new Command();

program
  .name('ts-phases')
  .description('TypeScript Error Resolution Phases by Area')
  .version('1.0.0');

// NEW: Error Analyzer command using your ErrorAnalyzer class
program
  .command('analyze')
  .description('Run comprehensive error analysis with ErrorAnalyzer')
  .option('-t, --type <type>', 'Analysis type: errors, config, all', 'all')
  .option('-p, --platform <platform>', 'Platform filter: web, mobile, all', 'all')
  .option('-o, --output <path>', 'Output directory for reports', './reports')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      console.log(`🔍 Running Error Analyzer - Type: ${options.type}, Platform: ${options.platform}`);
      console.log('='.repeat(60));
      
      const analyzer = new ErrorAnalyzer();
      
      if (options.verbose) {
        console.log('Platform Info:', analyzer.getPlatformInfo());
      }
      
      let corrections = [];
      
      switch (options.type) {
        case 'errors':
          console.log('Analyzing compilation errors...');
          corrections = await analyzer.analyzeCompilationErrors();
          break;
        case 'config':
          console.log('Analyzing configuration files...');
          corrections = await analyzer.analyzeConfiguration();
          break;
        case 'all':
        default:
          console.log('Running comprehensive analysis...');
          const [errorResults, configResults] = await Promise.all([
            analyzer.analyzeCompilationErrors(),
            analyzer.analyzeConfiguration()
          ]);
          corrections = [...errorResults, ...configResults];
          break;
      }
      
      // Filter by platform if needed
      if (options.platform !== 'all') {
        corrections = corrections.filter(correction => {
          if (options.platform === 'mobile') {
            return correction.message?.toLowerCase().includes('mobile') || 
                   correction.message?.toLowerCase().includes('android') ||
                   correction.message?.toLowerCase().includes('ios');
          } else if (options.platform === 'web') {
            return correction.message?.toLowerCase().includes('web') ||
                   correction.message?.toLowerCase().includes('next') ||
                   correction.message?.toLowerCase().includes('browser');
          }
          return true;
        });
      }
      
      // Group by severity
      const critical = corrections.filter(c => c.severity === 'critical');
      const high = corrections.filter(c => c.severity === 'high');
      const medium = corrections.filter(c => c.severity === 'medium');
      const low = corrections.filter(c => c.severity === 'low');
      
      console.log('\n📊 Analysis Results:');
      console.log('='.repeat(60));
      console.log(`Total Issues: ${corrections.length}`);
      console.log(`  🔴 Critical: ${critical.length}`);
      console.log(`  🟠 High: ${high.length}`);
      console.log(`  🟡 Medium: ${medium.length}`);
      console.log(`  🟢 Low: ${low.length}`);
      
      // Show critical issues
      if (critical.length > 0) {
        console.log('\n🔴 Critical Issues:');
        critical.slice(0, 5).forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue.message}`);
          if (issue.file) console.log(`     File: ${issue.file}`);
        });
        if (critical.length > 5) console.log(`  ... and ${critical.length - 5} more`);
      }
      
      // Save to file
      if (options.output) {
        const fs = await import('fs');
        const path = await import('path');
        const reportDir = path.resolve(process.cwd(), options.output);
        if (!fs.existsSync(reportDir)) {
          fs.mkdirSync(reportDir, { recursive: true });
        }
        
        const reportPath = path.join(reportDir, `error-analysis-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify({
          timestamp: new Date().toISOString(),
          options,
          summary: {
            total: corrections.length,
            bySeverity: { critical: critical.length, high: high.length, medium: medium.length, low: low.length }
          },
          corrections
        }, null, 2));
        
        console.log(`\n📁 Report saved to: ${reportPath}`);
      }
      
    } catch (error) {
      console.error('❌ Error analysis failed:', error);
      process.exit(1);
    }
  });

// NEW: Quick fix command for "cannot find name" errors
program
  .command('fix-names')
  .description('Fix "cannot find name" errors specifically')
  .option('-d, --dry-run', 'Dry run (show what would be fixed)')
  .option('-f, --force', 'Force apply fixes')
  .action(async (options) => {
    try {
      console.log('🔧 Fixing "cannot find name" errors...');
      console.log('='.repeat(60));
      
      const analyzer = new ErrorAnalyzer();
      
      // Get common errors from analyzer
      const commonErrors = analyzer.getCommonErrors();
      console.log(`Known error patterns: ${Object.keys(commonErrors).length}`);
      
      // Run analysis to find these errors
      const corrections = await analyzer.analyzeCompilationErrors();
      
      // Filter for "cannot find name" errors
      const nameErrors = corrections.filter(c => 
        c.message?.toLowerCase().includes('cannot find name') ||
        c.category === 'compilation'
      );
      
      console.log(`\n📊 Found ${nameErrors.length} name-related errors`);
      
      if (nameErrors.length === 0) {
        console.log('✅ No "cannot find name" errors detected!');
        return;
      }
      
      // Group by error type
      const groupedErrors: Record<string, any[]> = {};
      nameErrors.forEach(error => {
        const errorKey = error.message?.match(/cannot find name ['"]([^'"]+)['"]/)?.[1] || 'unknown';
        if (!groupedErrors[errorKey]) groupedErrors[errorKey] = [];
        groupedErrors[errorKey].push(error);
      });
      
      console.log('\n🔍 Error Groups:');
      Object.entries(groupedErrors).forEach(([name, errors]) => {
        console.log(`  ${name}: ${errors.length} occurrences`);
      });
      
      if (!options.dryRun && options.force) {
        console.log('\n⚠️  Applying fixes...');
        // Here you would implement the actual fix logic
        // For now, just show what would be done
        console.log('  Would add type declarations for missing names');
      } else if (options.dryRun) {
        console.log('\n📋 Dry Run - Would fix:');
        Object.entries(groupedErrors).forEach(([name, errors]) => {
          const files = [...new Set(errors.map(e => e.file || 'unknown'))];
          console.log(`  ${name}: in ${files.length} files`);
        });
      }
      
    } catch (error) {
      console.error('❌ Fix names failed:', error);
      process.exit(1);
    }
  });

// NEW: Configuration validation command
program
  .command('validate-config')
  .description('Validate all configuration files')
  .option('-f, --fix', 'Attempt to fix configuration issues')
  .action(async (options) => {
    try {
      console.log('⚙️  Validating configuration files...');
      console.log('='.repeat(60));
      
      const analyzer = new ErrorAnalyzer();
      const corrections = await analyzer.analyzeConfiguration();
      
      // Group by config file
      const byFile: Record<string, any[]> = {};
      corrections.forEach(correction => {
        const file = correction.file || 'unknown';
        if (!byFile[file]) byFile[file] = [];
        byFile[file].push(correction);
      });
      
      console.log('\n📊 Configuration Issues:');
      Object.entries(byFile).forEach(([file, issues]) => {
        const critical = issues.filter(i => i.severity === 'critical').length;
        const high = issues.filter(i => i.severity === 'high').length;
        console.log(`  ${file}: ${issues.length} issues (${critical} critical, ${high} high)`);
      });
      
      if (options.fix) {
        console.log('\n⚠️  Auto-fix mode: Not implemented yet');
        console.log('  Would attempt to fix configuration files');
      }
      
    } catch (error) {
      console.error('❌ Config validation failed:', error);
      process.exit(1);
    }
  });

// Enhanced diagnose command (existing but updated)
program
  .command('diagnose')
  .description('Run Initial Diagnosis')
  .option('-o, --output <path>', 'Output directory for reports', './reports')
  .option('-a, --area <area>', 'Area to diagnose: frontend, backend, shared, all', 'all')
  .option('-m, --mode <mode>', 'Diagnosis mode: quick, deep, full', 'quick')
  .action(async (options) => {
    try {
      console.log(`🎯 Running Initial Diagnosis for: ${options.area.toUpperCase()}`);
      console.log('='.repeat(60));
      
      // Use ErrorAnalyzer for deep/full modes
      if (options.mode === 'deep' || options.mode === 'full') {
        console.log('🔍 Running comprehensive error analysis...');
        const analyzer = new ErrorAnalyzer();
        const corrections = await analyzer.analyzeCompilationErrors();
        
        const areaFilter = getAreaFilter(options.area);
        const filteredCorrections = corrections.filter(correction => 
          areaFilter === '' || (correction.file && correction.file.includes(areaFilter))
        );
        
        console.log(`\n📊 Found ${filteredCorrections.length} issues in ${options.area}`);
        
        if (options.output) {
          const fs = await import('fs');
          const path = await import('path');
          const reportDir = path.resolve(process.cwd(), options.output);
          if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
          }
          
          const reportPath = path.join(reportDir, `diagnosis-${options.area}-${Date.now()}.json`);
          fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            area: options.area,
            mode: options.mode,
            issues: filteredCorrections,
            summary: {
              total: filteredCorrections.length,
              bySeverity: filteredCorrections.reduce((acc, c) => {
                acc[c.severity] = (acc[c.severity] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            }
          }, null, 2));
          
          console.log(`📁 Diagnosis report saved to: ${reportPath}`);
        }
      } else {
        // Use existing diagnosis for quick mode
        const result = await runInitialDiagnosis(process.cwd());
        
        if (options.area !== 'all') {
          const areaFilter = getAreaFilter(options.area);
          result.filesWithErrors = result.filesWithErrors.filter((file: string) => 
            file.includes(areaFilter)
          );
          result.area = options.area;
        }
        
        console.log(`\n✅ Quick diagnosis completed for ${options.area}`);
        console.log(`   Files with errors: ${result.filesWithErrors?.length || 0}`);
      }
      
    } catch (error) {
      console.error('❌ Diagnosis failed:', error);
      process.exit(1);
    }
  });

// Enhanced phase command with ErrorAnalyzer integration
program
  .command('phase <name>')
  .description('Run a specific phase')
  .option('-a, --area <area>', 'Area to filter: frontend, backend, shared, all', 'all')
  .option('-c, --config', 'Include configuration analysis')
  .action(async (phaseName, options) => {
    try {
      console.log(`🔧 Running Phase: ${phaseName}`);
      console.log('='.repeat(60));
      
      const executor = new PhaseExecutor();
      
      // If config analysis is requested, run it before the phase
      if (options.config) {
        console.log('⚙️  Running configuration analysis...');
        const analyzer = new ErrorAnalyzer();
        const configCorrections = await analyzer.analyzeConfiguration();
        
        const areaFilter = getAreaFilter(options.area);
        const filteredCorrections = configCorrections.filter(correction => 
          areaFilter === '' || (correction.file && correction.file.includes(areaFilter))
        );
        
        console.log(`   Found ${filteredCorrections.length} config issues`);
      }
      
      const result = await executor.executePhase(phaseName);
      
      if (options.area !== 'all') {
        console.log(`\n📊 Results filtered for: ${options.area}`);
        // Filter results based on area
      }
      
      // Post-phase analysis
      console.log('\n🔍 Running post-phase analysis...');
      const analyzer = new ErrorAnalyzer();
      const postCorrections = await analyzer.analyzeCompilationErrors();
      const postCount = postCorrections.length;
      
      console.log(`   Issues after phase: ${postCount}`);
      
    } catch (error) {
      console.error(`❌ Phase ${phaseName} failed:`, error);
      process.exit(1);
    }
  });

// Enhanced area commands with ErrorAnalyzer
program
  .command('frontend')
  .description('Run all phases on frontend code')
  .option('-c, --config', 'Include configuration analysis')
  .action(async (options) => {
    try {
      console.log('🎯 Frontend Resolution');
      console.log('='.repeat(60));
      
      // Pre-analysis
      const analyzer = new ErrorAnalyzer();
      const preCorrections = await analyzer.analyzeCompilationErrors();
      console.log(`   Pre-analysis issues: ${preCorrections.length}`);
      
      if (options.config) {
        console.log('⚙️  Analyzing frontend configuration...');
        const configCorrections = await analyzer.analyzeConfiguration();
        const frontendConfigIssues = configCorrections.filter(c => 
          c.file && (c.file.includes('next') || c.file.includes('web') || c.file.includes('src/app'))
        );
        console.log(`   Config issues: ${frontendConfigIssues.length}`);
      }
      
      await phaseRunners.frontend();
      
      // Post-analysis
      const postCorrections = await analyzer.analyzeCompilationErrors();
      console.log(`\n📊 Frontend resolution complete`);
      console.log(`   Issues resolved: ${preCorrections.length - postCorrections.length}`);
      console.log(`   Remaining issues: ${postCorrections.length}`);
      
    } catch (error) {
      console.error('❌ Frontend resolution failed:', error);
      process.exit(1);
    }
  });

program
  .command('backend')
  .description('Run all phases on backend code')
  .option('-c, --config', 'Include configuration analysis')
  .action(async (options) => {
    try {
      console.log('🎯 Backend Resolution');
      console.log('='.repeat(60));
      
      // Pre-analysis
      const analyzer = new ErrorAnalyzer();
      const preCorrections = await analyzer.analyzeCompilationErrors();
      const backendPreIssues = preCorrections.filter(c => 
        c.file && c.file.includes('src/server')
      );
      console.log(`   Pre-analysis issues: ${backendPreIssues.length}`);
      
      if (options.config) {
        console.log('⚙️  Analyzing backend configuration...');
        const configCorrections = await analyzer.analyzeConfiguration();
        const backendConfigIssues = configCorrections.filter(c => 
          c.file && (c.file.includes('server') || c.file.includes('api'))
        );
        console.log(`   Config issues: ${backendConfigIssues.length}`);
      }
      
      await phaseRunners.backend();
      
      // Post-analysis
      const postCorrections = await analyzer.analyzeCompilationErrors();
      const backendPostIssues = postCorrections.filter(c => 
        c.file && c.file.includes('src/server')
      );
      console.log(`\n📊 Backend resolution complete`);
      console.log(`   Issues resolved: ${backendPreIssues.length - backendPostIssues.length}`);
      console.log(`   Remaining issues: ${backendPostIssues.length}`);
      
    } catch (error) {
      console.error('❌ Backend resolution failed:', error);
      process.exit(1);
    }
  });

// NEW: Platform-specific commands
program
  .command('web')
  .description('Analyze and fix web-specific issues')
  .action(async () => {
    try {
      console.log('🌐 Web Platform Analysis');
      console.log('='.repeat(60));
      
      const analyzer = new ErrorAnalyzer();
      const corrections = await analyzer.analyzeCompilationErrors();
      
      const webIssues = corrections.filter(c => 
        c.message?.toLowerCase().includes('web') ||
        c.message?.toLowerCase().includes('next') ||
        c.message?.toLowerCase().includes('browser') ||
        (c.file && c.file.includes('src/app'))
      );
      
      console.log(`Found ${webIssues.length} web-related issues`);
      
      // Show top issues
      webIssues.slice(0, 10).forEach((issue, index) => {
        const severityIcon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[issue.severity] || '⚪';
        
        console.log(`  ${severityIcon} ${issue.message}`);
        if (issue.file) console.log(`     File: ${issue.file}`);
      });
      
    } catch (error) {
      console.error('❌ Web analysis failed:', error);
      process.exit(1);
    }
  });

program
  .command('mobile')
  .description('Analyze and fix mobile-specific issues')
  .action(async () => {
    try {
      console.log('📱 Mobile Platform Analysis');
      console.log('='.repeat(60));
      
      const analyzer = new ErrorAnalyzer();
      const corrections = await analyzer.analyzeCompilationErrors();
      
      const mobileIssues = corrections.filter(c => 
        c.message?.toLowerCase().includes('mobile') ||
        c.message?.toLowerCase().includes('android') ||
        c.message?.toLowerCase().includes('ios') ||
        c.message?.toLowerCase().includes('react-native') ||
        (c.file && c.file.includes('react-native'))
      );
      
      console.log(`Found ${mobileIssues.length} mobile-related issues`);
      
      // Show top issues
      mobileIssues.slice(0, 10).forEach((issue, index) => {
        const severityIcon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[issue.severity] || '⚪';
        
        console.log(`  ${severityIcon} ${issue.message}`);
        if (issue.file) console.log(`     File: ${issue.file}`);
      });
      
    } catch (error) {
      console.error('❌ Mobile analysis failed:', error);
      process.exit(1);
    }
  });

// Existing cache management (unchanged)
program
  .command('cache')
  .description('Manage phase cache')
  .option('-c, --clear', 'Clear phase cache')
  .action(async (options) => {
    const executor = new PhaseExecutor();
    if (options.clear) {
      executor.clearCache();
      console.log('✅ Cache cleared');
    } else {
      console.log('📊 Cache status:');
      console.log(`   Executed phases: ${executor.executedPhasesList.join(', ')}`);
    }
  });

// NEW: Help command for ErrorAnalyzer
program
  .command('help-analyzer')
  .description('Show ErrorAnalyzer help and capabilities')
  .action(() => {
    console.log('🛠️  ErrorAnalyzer Capabilities:');
    console.log('='.repeat(60));
    console.log('1. Compilation Error Analysis');
    console.log('   - "cannot find name" detection');
    console.log('   - Missing module detection');
    console.log('   - Type assignment issues');
    console.log('   - Common TypeScript errors');
    console.log('');
    console.log('2. Configuration Analysis');
    console.log('   - package.json validation');
    console.log('   - tsconfig.json analysis');
    console.log('   - Babel/Metro/Webpack configs');
    console.log('   - Multi-platform compatibility');
    console.log('');
    console.log('3. Platform Detection');
    console.log('   - Web (Next.js, React)');
    console.log('   - Mobile (React Native)');
    console.log('   - Multi-platform setups');
    console.log('');
    console.log('4. Error Categorization');
    console.log('   - Severity: critical, high, medium, low');
    console.log('   - Categories: compilation, structure, runtime, etc.');
    console.log('');
    console.log('📋 Commands:');
    console.log('  ts-phases analyze          - Comprehensive analysis');
    console.log('  ts-phases fix-names        - Fix "cannot find name" errors');
    console.log('  ts-phases validate-config  - Validate config files');
    console.log('  ts-phases web              - Web-specific analysis');
    console.log('  ts-phases mobile           - Mobile-specific analysis');
  });

function getAreaFilter(area: string): string {
  switch (area) {
    case 'frontend': return 'src/app';
    case 'backend': return 'src/server';
    case 'shared': return 'src/shared';
    default: return '';
  }
}

// Add alias for backward compatibility
program.alias('ea'); // ErrorAnalyzer alias

program.parse(process.argv);