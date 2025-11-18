// CorrectionGenerator.ts
import { CircularDependencyDetector } from '@/app/generators/corrections/CircularDependencyDetector';
import { MetroConfigAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/MetroConfigAnalyzer';
import { MetroLogAnalyzer } from '@/app/generators/corrections/analyzers/react-native/errors/MetroLogAnalyzer';
import { CorrectionType, CorrectionSeverity, CorrectionCategory } from '@/app/typings/correctionTypes';
import { ComprehensiveBreakdownAnalyzer, ComprehensiveBreakdown } from '@/app/generators/corrections/analyzers/ComprehensiveBreakdownAnalyzer'
import { BreakdownReportGenerator } from '@/app/generators/corrections/BreakdownReportGenerator';

import { ErrorTracker } from '@/app/generators/corrections/ErrorTracker';
import { SecurityAuditor } from '@/app/generators/corrections/SecurityAuditor';
import { TypeHierarchy } from '@/app/generators/corrections/TypeRelationshipMapper';
import { ProjectTreeAnalyzer } from '@/app/scripts/generateTree';
import fs from 'fs';
import path from 'path';
import { ErrorAnalyzer } from './ErrorAnalyzer';
import { ReportGenerators } from './ReportGenerators';
import { SnapshotAnalyzer } from './SnapshotAnalyzer';
import { StructureValidator } from './StructureValidator';
import { TypeRelationshipMapper } from './TypeRelationshipMapper';
import { BuildErrorHandler } from '@/utils/BuildErrorHandler'

interface Correction {
    id: string;
    type: 'error' | 'warning' | 'suggestion' | 'info' | 'sensitive_data' | 'missing_sanitization' | 'role_violation' | 'insecure_pattern' | 'types' | 'react' | 'sensitive_data';
    severity: 'critical' | 'high' | 'medium' | 'low';
    file: string;
    line?: number;
    title?: string;
    message: string;
    descriptiion?: string
    code: string;
    fix: string;
    codeSnippet?: string;
    suggestion?: string; 
    priority?: number;   
    timestamp?: string;  
    category: 'compilation' | 'runtime' | 'security' 
    | 'performance' | 'structure' | 'maintainability' 
    | 'compatibility' | 'readability' | 'dependencies' 
    | 'native-modules' | 'ios' | 'configuration' 
    | 'quality' | 'ui' | 'development' | 'deployment' 
    | 'linting' | 'import'| 'nextjs'| 'bundler'
    | 'formatting' | 'styling' | 'testing' | 'authentication'
    | 'database' | 'api'| 'mobile'| 'web3' | 'filesystem' 
    | 'general' | 'network' | 'platform' | 'types' | 'react' | 'react-native' | 'function'
    | 'class';
}

interface CorrectionReport {
    timestamp: string;
    summary: {
        totalErrors: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        byCategory: Record<string, number>;
    };
    corrections: Correction[];
    fileAssociations: Map<string, string[]>;
    typeHierarchies: Map<string, TypeHierarchy>; // More specific type
    circularDependencies: string[];
    securityIssues: Correction[];
    snapshotIssues?: Correction[];
    comprehensiveBreakdown?: ComprehensiveBreakdown;
    numericalSummary?: Record<string, any>;
}

export class CorrectionGenerator {
    private analyzer: ProjectTreeAnalyzer;
    private errorAnalyzer: ErrorAnalyzer;
    private hasInitialized = false;
    private structureValidator: StructureValidator;
    private typeMapper: TypeRelationshipMapper;
    private circularDetector: CircularDependencyDetector;
    private securityAuditor: SecurityAuditor;
    private snapshotAnalyzer: SnapshotAnalyzer;
    private errorTracker: ErrorTracker;
    private metroConfigAnalyzer: MetroConfigAnalyzer; 
    private metroLogAnalyzer: MetroLogAnalyzer;       
    private breakdownAnalyzer = new ComprehensiveBreakdownAnalyzer();

    /* ------------------------------------------------------------------ */
    /*  Human Review Guide – zero-touch instructions                      */
    /* ------------------------------------------------------------------ */
    private async generateReviewGuide(
    outputDir: string,
    focusArea?: string
    ): Promise<void> {
    const report = await this.generateCorrections(focusArea);

    // 1.  Build a step-by-step markdown checklist
    const steps: string[] = [];
    let stepNum = 1;

    const addStep = (title: string, body: string) => {
        steps.push(`## Step ${stepNum++}: ${title}`);
        steps.push('');
        steps.push(body);
        steps.push('');
        steps.push('---');
        steps.push('');
    };

    /* -------------------------------------------------------------- */
    /*  A.  Critical errors first                                     */
    /* -------------------------------------------------------------- */
    const critical = report.corrections.filter(c => c.severity === 'critical');
    if (critical.length) {
        addStep(
        '🚨 Fix Critical Blockers',
        `These **must** be resolved before anything else works.\n\n` +
            critical.map(c => {
            const rel = path.relative(process.cwd(), c.file);
            return (
                `- **File**: \`${rel}\`  \n` +
                `  **Line**: ${c.line ?? '?'}  \n` +
                `  **Problem**: ${c.message}  \n` +
                `  **Suggested fix**:\n` +
                `  \`\`\`typescript\n${c.fix}\n\`\`\``
            );
            }).join('\n\n')
        );
    }

    /* -------------------------------------------------------------- */
    /*  B.  Quick wins (< 5 min each)                                */
    /* -------------------------------------------------------------- */
    const quick = report.corrections.filter(
        c => c.severity === 'low' || (c.category === 'structure' && c.severity === 'medium')
    );
    if (quick.length) {
        addStep(
        '⚡ Quick Wins – Copy/Paste Fixes',
        `Each item below should take < 5 min.\n\n` +
            quick.map(c => {
            const rel = path.relative(process.cwd(), c.file);
            return (
                `- **File**: \`${rel}\`  \n` +
                `  **Replace** (around line ${c.line ?? '?'}):\n` +
                `  \`\`\`typescript\n${c.code}\n\`\`\`\n` +
                `  **With**:\n` +
                `  \`\`\`typescript\n${c.fix}\n\`\`\``
            );
            }).join('\n\n')
        );
    }

    /* -------------------------------------------------------------- */
    /*  C.  Security audit                                            */
    /* -------------------------------------------------------------- */
    if (report.securityIssues.length) {
        addStep(
        '🔒 Security Review',
        report.securityIssues.map(c => {
            const rel = path.relative(process.cwd(), c.file);
            return (
            `- **File**: \`${rel}\`  \n` +
            `  **Issue**: ${c.message}  \n` +
            `  **Remediation**:\n` +
            `  \`\`\`typescript\n${c.fix}\n\`\`\``
            );
        }).join('\n\n')
        );
    }

    /* -------------------------------------------------------------- */
    /*  D.  Snapshot-only walk-through (if --snapshots)               */
    /* -------------------------------------------------------------- */
    if (focusArea === 'snapshots' && report.snapshotIssues?.length) {
        addStep(
        '📸 Snapshot Folder Fixes',
        `Folder: \`/src/app/snapshots\`\n\n` +
            report.snapshotIssues.map(c => {
            const rel = path.relative(process.cwd(), c.file);
            return (
                `- **File**: \`${rel}\`  \n` +
                `  **Line**: ${c.line ?? '?'}  \n` +
                `  **Problem**: ${c.message}  \n` +
                `  **Fix**:\n` +
                `  \`\`\`typescript\n${c.fix}\n\`\`\``
            );
            }).join('\n\n')
        );
    }

    /* -------------------------------------------------------------- */
    /*  E.  Git-style diff for entire files (optional section)        */
    /* -------------------------------------------------------------- */
    addStep(
        '📋 Full-File Patches (Optional)',
        `If you prefer to see entire file rewrites, run:\n` +
        `\`\`\`bash\n` +
        `pnpm tsx scripts/printFilePatches.ts ${outputDir}\n` +
        `\`\`\`\n` +
        `This prints **git diff** blocks you can apply with \`git apply\` **after** you review them.`
    );

    /* -------------------------------------------------------------- */
    /*  F.  Finish checklist                                          */
    /* -------------------------------------------------------------- */
    addStep(
        '✅ Ready to Apply?',
        `1. Open this guide in VS Code:\n` +
        `   \`\`\`bash\n` +
        `   code ${path.join(outputDir, 'REVIEW.md')}\n` +
        `   \`\`\`\n` +
        `2. Put your source files side-by-side (Ctrl+\\\\)\n` +
        `3. Work through the steps above – copy/paste only what you trust\n` +
        `4. When happy, run the normal command (without \`--review\`) to auto-apply anything you skipped`
    );

    // 2.  Write the guide
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const reviewFile = path.join(outputDir, 'REVIEW.md');
    fs.writeFileSync(reviewFile, steps.join('\n'), 'utf8');

    // 3.  Open in VS Code so you can start immediately
    const { exec } = await import('child_process');
    exec(`code "${reviewFile}"`);

    // 4.  Console summary
    this.printConsoleSummary(report);
    console.log(`\n📖  Review guide opened in VS Code → ${reviewFile}`);
    console.log('Nothing on disk has changed yet. Copy/paste at your own pace.');
    }
    constructor() {
        this.analyzer = new ProjectTreeAnalyzer();
        this.errorAnalyzer = new ErrorAnalyzer();
        this.structureValidator = new StructureValidator();
        this.typeMapper = new TypeRelationshipMapper();
        this.circularDetector = new CircularDependencyDetector();
        this.securityAuditor = new SecurityAuditor();
        this.snapshotAnalyzer = new SnapshotAnalyzer();
        this.errorTracker = new ErrorTracker();
        this.metroConfigAnalyzer = new MetroConfigAnalyzer(); // ← INITIALIZE
        this.metroLogAnalyzer = new MetroLogAnalyzer();       // ← INITIALIZE

    }



    async generateCorrections(focusArea?: string): Promise<CorrectionReport> {
        console.log('🔧 Analyzing project for corrections...');

        const projectStructure = await this.analyzer.analyzeProjectTree();

        // Use typed variables for each analysis
        const compilationErrors: Correction[] = await this.errorAnalyzer.analyzeCompilationErrors();
        const structureIssues: Correction[] = await this.structureValidator.validateStructure(projectStructure);
        const typeHierarchies: Map<string, TypeHierarchy> = await this.typeMapper.mapTypeRelationships(projectStructure);
        const circularDeps: string[] = await this.circularDetector.detectCircularDependencies(projectStructure);

        // Convert security issues to corrections
        const rawSecurityIssues = await this.securityAuditor.auditSecurity(projectStructure);
        const securityIssues: Correction[] = rawSecurityIssues.map(issue => this.convertSecurityIssueToCorrection(issue));
    
        const metroConfigIssues: Correction[] = await this.metroConfigAnalyzer.analyze();
        const metroLogIssues: Correction[] = await this.metroLogAnalyzer.analyze();

        
        let snapshotIssues: Correction[] = [];
        if (focusArea === 'snapshots') {
            snapshotIssues = await this.snapshotAnalyzer.analyzeSnapshotIssues();
        }

        let allCorrections = [
            ...compilationErrors,
            ...structureIssues,
            ...securityIssues,
            ...metroConfigIssues, 
            ...metroLogIssues  
        ];

        // If focusing on snapshots, filter to only snapshot-related issues
        if (focusArea === 'snapshots') {
            allCorrections = [
                ...snapshotIssues,
                ...allCorrections.filter(correction =>
                    correction.file.includes('snapshot') ||
                    correction.file.includes('snapshots')
                )
            ];
        }


        // Generate comprehensive breakdown
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.generateSummary(allCorrections),
            corrections: allCorrections,
            fileAssociations: this.typeMapper.getFileAssociations(),
            typeHierarchies: typeHierarchies,
            circularDependencies: circularDeps,
            securityIssues: securityIssues,
            snapshotIssues: focusArea === 'snapshots' ? snapshotIssues : undefined
        };

        // THEN generate breakdown
        const breakdown = await this.breakdownAnalyzer.generateBreakdown(report);

        const enhancedReport = {
            ...report,
            comprehensiveBreakdown: breakdown,
            numericalSummary: BreakdownReportGenerator.generateNumericalSummary(breakdown)
        };
        // Record snapshot for tracking
        await this.errorTracker.recordSnapshot(report, focusArea);

        return enhancedReport;
    }

    private convertSecurityIssueToCorrection(securityIssue: any): Correction {
        // Map security issue types to correction types
        const typeMap: Record<string, CorrectionType> = {
            'sensitive_data': 'error',
            'missing_sanitization': 'error',
            'role_violation': 'error',
            'insecure_pattern': 'warning'
        };

        const severityMap: Record<string, CorrectionSeverity> = {
            'sensitive_data': 'critical',
            'missing_sanitization': 'high',
            'role_violation': 'high',
            'insecure_pattern': 'medium'
        };

        return {
            id: `security-${securityIssue.id || Date.now()}`,
            type: typeMap[securityIssue.type] || 'warning',
            severity: severityMap[securityIssue.type] || 'medium',
            file: securityIssue.file,
            line: securityIssue.line,
            message: securityIssue.message,
            code: securityIssue.code || securityIssue.context || '',
            fix: securityIssue.fix || securityIssue.recommendation || 'Implement security best practices',
            category: 'security'
        };
    }

    private convertSnapshotIssueToCorrection(snapshotIssue: any): Correction {
        return {
            id: `snapshot-${snapshotIssue.id || Date.now()}`,
            type: snapshotIssue.type === 'error' ? 'error' : 'warning',
            severity: snapshotIssue.severity || 'medium',
            file: snapshotIssue.file,
            line: snapshotIssue.line,
            message: snapshotIssue.message,
            code: snapshotIssue.code || '',
            fix: snapshotIssue.fix || 'Review and update snapshot',
            category: 'structure' as CorrectionCategory// or create a 'snapshot' category
        };
    }
    private generateSummary(corrections: Correction[]) {
        const byCategory: Record<string, number> = {};
        const bySeverity = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        corrections.forEach(correction => {
            bySeverity[correction.severity]++;
            byCategory[correction.category] = (byCategory[correction.category] || 0) + 1;
        });

        return {
            totalErrors: corrections.length,
            ...bySeverity,
            byCategory
        };
    }

    async generateCorrectionFiles(outputDir: string = './corrections', focusArea?: string): Promise<string[]> {
        const report = await this.generateCorrections(focusArea);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const files: string[] = [];

        // 1. Snapshot-specific report
        if (focusArea === 'snapshots') {
            const snapshotFile = path.join(outputDir, 'snapshot-issues.md');
            fs.writeFileSync(snapshotFile, this.generateSnapshotReport(report));
            files.push(snapshotFile);
        }

        // 2. Critical Errors (Blocking) - Always generate
        const criticalFile = path.join(outputDir, 'critical-errors.md');
        fs.writeFileSync(criticalFile, this.generateCriticalErrorsReport(report));
        files.push(criticalFile);

        // 3. Metro Configuration Report
        const metroFile = path.join(outputDir, 'metro-configuration.md');
        fs.writeFileSync(metroFile, ReportGenerators.generateMetroConfigReport(report));
        files.push(metroFile);

        // 4. Security Audit Report
        const securityFile = path.join(outputDir, 'security-audit.md');
        fs.writeFileSync(securityFile, ReportGenerators.generateSecurityReport(report));
        files.push(securityFile);

        // 5. Structural Issues
        const structuralFile = path.join(outputDir, 'structural-issues.md');
        fs.writeFileSync(structuralFile, this.generateStructuralReport(report));
        files.push(structuralFile);

        // 6. Type Relationships
        const typeFile = path.join(outputDir, 'type-relationships.md');
        fs.writeFileSync(typeFile, this.generateTypeRelationshipsReport(report));
        files.push(typeFile);

        // 7. Quick Fixes
        const quickFixesFile = path.join(outputDir, 'quick-fixes.md');
        fs.writeFileSync(quickFixesFile, this.generateQuickFixesReport(report));
        files.push(quickFixesFile);

        // 8. NEW: Comprehensive Breakdown Report (if available)
        if ('comprehensiveBreakdown' in report && report.comprehensiveBreakdown) {
            const breakdownFile = path.join(outputDir, 'comprehensive-breakdown.md');
            fs.writeFileSync(
                breakdownFile, 
                BreakdownReportGenerator.generateComprehensiveReport(
                    report.comprehensiveBreakdown, 
                    report
                )
            );
            files.push(breakdownFile);

            // NEW: Generate numerical data (JSON)
            const numericalFile = path.join(outputDir, 'numerical-summary.json');
            fs.writeFileSync(
                numericalFile,
                JSON.stringify(BreakdownReportGenerator.generateNumericalSummary(report.comprehensiveBreakdown), null, 2)
            );
            files.push(numericalFile);
        }

        // 9. Full JSON Report (should be last since it contains everything)
        const jsonFile = path.join(outputDir, 'full-report.json');
        fs.writeFileSync(jsonFile, JSON.stringify(report, null, 2));
        files.push(jsonFile);

        // Console summary (AFTER all files are generated)
        console.log(`✅ Generated ${files.length} correction files in ${outputDir}`);

        // NEW: Comprehensive breakdown summary
        if ('comprehensiveBreakdown' in report && report.comprehensiveBreakdown) {
            console.log('\n📊 COMPREHENSIVE BREAKDOWN:');
            console.log('═'.repeat(50));
            console.log(`Components: ${report.comprehensiveBreakdown.summary.affectedComponents}/${report.comprehensiveBreakdown.summary.totalComponents} affected`);
            console.log(`Methods: ${report.comprehensiveBreakdown.summary.affectedMethods}/${report.comprehensiveBreakdown.summary.totalMethods} affected`);
            console.log(`Interfaces: ${report.comprehensiveBreakdown.summary.affectedInterfaces}/${report.comprehensiveBreakdown.summary.totalInterfaces} affected`);
            
            const riskScore = BreakdownReportGenerator.generateNumericalSummary(report.comprehensiveBreakdown).riskAssessment;
            console.log(`Overall Risk Score: ${riskScore}/100`);
        }

        return files;
    }
    private generateCriticalErrorsReport(report: CorrectionReport): string {
        return ReportGenerators.generateCriticalErrorsReport(report);
    }

    private generateStructuralReport(report: CorrectionReport): string {
        return ReportGenerators.generateStructuralReport(report);
    }

    private generateTypeRelationshipsReport(report: CorrectionReport): string {
        return ReportGenerators.generateTypeRelationshipsReport(report);
    }

    private generateQuickFixesReport(report: CorrectionReport): string {
        const quickFixes = report.corrections.filter(c =>
            c.severity === 'low' ||
            (c.category === 'structure' && c.severity === 'medium')
        );

        const lines: string[] = [];
        lines.push('# 🚀 Quick Fixes - Easy Wins');
        lines.push(`**Generated:** ${report.timestamp}`);
        lines.push(`**Total Quick Fixes:** ${quickFixes.length}`);
        lines.push('');
        lines.push('> 💡 These fixes can be completed in under 5 minutes each');
        lines.push('');

        // Group by file for easier navigation
        const fixesByFile = new Map<string, Correction[]>();
        quickFixes.forEach(fix => {
            if (!fixesByFile.has(fix.file)) {
                fixesByFile.set(fix.file, []);
            }
            fixesByFile.get(fix.file)!.push(fix);
        });

        fixesByFile.forEach((fixes, file) => {
            lines.push(`## 📄 ${path.basename(file)}`);
            lines.push(`**Path:** ${file}`);
            lines.push('');

            fixes.forEach((fix, index) => {
                lines.push(`### ${index + 1}. ${fix.message}`);
                lines.push(`**Type:** ${fix.type}`);
                lines.push(`**Category:** ${fix.category}`);
                lines.push('');

                if (fix.line) {
                    lines.push(`**Line ${fix.line}:**`);
                    lines.push('```typescript');
                    lines.push(fix.code);
                    lines.push('```');
                    lines.push('');
                }

                lines.push('**Fix:**');
                lines.push('```typescript');
                lines.push(fix.fix);
                lines.push('```');
                lines.push('');
            });
        });

        return lines.join('\n');
    }

    private generateSnapshotReport(report: CorrectionReport): string {
        const snapshotFolderPath = '/src/app/snapshots';
        return ReportGenerators.generateSnapshotFolderReport(report, snapshotFolderPath);
    }

    private printConsoleSummary(report: CorrectionReport): void {
        console.log('\n📊 CORRECTION SUMMARY:');
        console.log('═'.repeat(50));
        console.log(`Total Issues: ${report.summary.totalErrors}`);
        console.log(`🚨 Critical: ${report.summary.critical}`);
        console.log(`⚠️  High: ${report.summary.high}`);
        console.log(`🔧 Medium: ${report.summary.medium}`);
        console.log(`💡 Low: ${report.summary.low}`);
        console.log('');

        // Count Metro-specific issues
        const metroIssues = report.corrections.filter(c => 
            c.file.includes('metro.config') || c.message?.includes('Metro')
        ).length;
        if (metroIssues > 0) {
            console.log(`🚇 Metro Issues: ${metroIssues}`);
        }

        Object.entries(report.summary.byCategory).forEach(([category, count]) => {
            console.log(`📁 ${category}: ${count}`);
        });

        if (report.summary.critical > 0) {
            console.log('\n🚨 IMMEDIATE ACTION REQUIRED:');
            console.log('Check ./corrections/critical-errors.md for blocking issues');
        }

        if (metroIssues > 0) {
            console.log('\n🚇 METRO CONFIGURATION:');
            console.log('Check ./corrections/metro-configuration.md for build performance issues');
        }

        if (report.snapshotIssues && report.snapshotIssues.length > 0) {
            console.log('\n📸 SNAPSHOT FOCUS:');
            console.log(`Found ${report.snapshotIssues.length} snapshot-specific issues`);
            console.log('Check ./corrections/snapshot-issues.md for detailed analysis');
        }
    }


    async analyzeBuildErrors(): Promise<void> {
        console.log('🚨 Starting comprehensive build error analysis...');
        
        // Analyze build errors
        const buildSuccess = await BuildErrorHandler.analyzeAndFixBuild();
        
        if (!buildSuccess) {
        console.log('\n🎯 Focus on fixing critical build errors first');
        console.log('   Then run: pnpm analyze:build-errors');
        }
        
        // Analyze TypeScript errors
        await BuildErrorHandler.handleTypeCheck();
        
        console.log('\n📋 Next steps:');
        console.log('   1. Check the generated error reports');
        console.log('   2. Fix critical errors first');
        console.log('   3. Run analysis again to verify fixes');
    }

    // CLI entry point
    async runFromCLI(args: string[] = []): Promise<void> {
        console.log(`🎯 Running correction analysis...`);

        const outputIndex = args.indexOf('--output');
        const outputDir = outputIndex !== -1 ? args[outputIndex + 1] : './corrections';
        const reviewMode = args.includes('--review');

        let focusArea: string | undefined;

        if (args.includes('--analyze-errors') || args.includes('--build-errors')) {
            await this.analyzeBuildErrors();
            return;
        }
        
        // Check for focus flags
        if (args.includes('--snapshots') || args.includes('--snapshot')) {
            focusArea = 'snapshots';
        } else if (args.includes('--critical')) {
            focusArea = 'critical';
        }


        if (focusArea) {
            console.log(`   Focus: ${focusArea}`);
        }
        console.log(`   Output: ${outputDir}`);


        try {
            if (reviewMode) {
            await this.generateReviewGuide(outputDir, focusArea);
            } else {
            await this.generateCorrectionFiles(outputDir, focusArea);
            }            
            console.log('\n🎉 Correction analysis complete!');
            console.log('Next steps:');
            console.log('1. Review critical errors first');
            console.log('2. Address quick fixes for fast wins');
            console.log('3. Use type relationships to understand dependencies');
            console.log('4. Run again after fixes to track progress');
        } catch (error) {
            console.error('❌ Error generating corrections:', error);
            process.exit(1);
        }


        try {
            console.log(`🎯 Running correction analysis...`);
            if (focusArea) {
                console.log(`   Focus: ${focusArea}`);
            }
            console.log(`   Output: ${outputDir}`);

            await this.generateCorrectionFiles(outputDir, focusArea);

            console.log('\n🎉 Correction analysis complete!');
            console.log('\n📋 Recommended next steps:');

            if (focusArea === 'snapshots') {
                console.log('1. Review ./corrections/snapshot-issues.md for snapshot-specific problems');
                console.log('2. Fix critical errors in the snapshot folder first');
                console.log('3. Run "pnpm analyze:snapshots" again to verify fixes');
            } else if (focusArea === 'critical') {
                console.log('1. Review ./corrections/critical-errors.md for blocking issues');
                console.log('2. Address all critical errors before continuing development');
                console.log('3. Run "pnpm analyze:critical" again after fixes');
            } else if (focusArea === 'quick') {
                console.log('1. Review ./corrections/quick-fixes.md for easy wins');
                console.log('2. These fixes take <5 minutes each');
                console.log('3. Run "pnpm analyze:all-issues" for complete analysis');
            } else {
                console.log('1. Start with ./corrections/critical-errors.md (blocking issues)');
                console.log('2. Then check ./corrections/quick-fixes.md (easy wins)');
                console.log('3. Use ./corrections/type-relationships.md for structural understanding');
            }

            console.log('\n🚀 Available analysis commands:');
            console.log('   pnpm analyze:snapshots     - Focus on snapshot folder issues');
            console.log('   pnpm analyze:critical      - Show only critical errors');
            console.log('   pnpm analyze:quick-fixes   - Show only quick fixes');
            console.log('   pnpm analyze:all-issues    - Complete analysis');
            console.log('   pnpm dev:snapshots-first   - Analyze snapshots then start dev');
            console.log('   pnpm dev:critical-first    - Check critical errors then start dev');

        } catch (error) {
            console.error('❌ Error generating corrections:', error);
            process.exit(1);
        }
    }
}

// CLI execution
if (process.argv[1] && process.argv[1].includes('CorrectionGenerator.ts')) {
  const args = process.argv.slice(2);
  const generator = new CorrectionGenerator();
  generator.runFromCLI(args).catch(console.error);
}
export type { Correction, CorrectionReport };
