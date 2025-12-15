// CorrectionGenerator.ts
import { PatternAnalyzer } from '@/app/generators/corrections/analyzers/PatternAnalyzer'
import { ReactNativeAnalyzer } from './analyzers/ReactNativeAnalyzer';
import { ReactWebAnalyzer } from './analyzers/ReactWebAnalyzer';
import { BuildAnalyzer } from './analyzers/BuildAnalyzer';
import { PlatformDetector } from './analyzers/PlatformDetector';
import { CircularDependencyDetector } from '@/app/generators/corrections/CircularDependencyDetector';
import { MetroConfigAnalyzer } from '@/app/generators/corrections/analyzers/react-native/config/MetroConfigAnalyzer';
import { MetroLogAnalyzer } from '@/app/generators/corrections/analyzers/react-native/errors/MetroLogAnalyzer';
import { CorrectionType, CorrectionSeverity, CorrectionCategory } from '@/app/typings/correctionTypes'
import { ComprehensiveBreakdownAnalyzer, ComprehensiveBreakdown } from '@/app/generators/corrections/analyzers/ComprehensiveBreakdownAnalyzer'
import { BreakdownReportGenerator } from '@/app/generators/corrections/BreakdownReportGenerator';
import { SnapshotIssue } from '@/app/generators/corrections/SnapshotAnalyzer'
import { ErrorTracker } from '@/app/generators/corrections/ErrorTracker';
import { SecurityAuditor } from '@/app/generators/corrections/SecurityAuditor';
import { TypeHierarchy } from '@/app/generators/corrections/TypeRelationshipMapper';
import { ProjectTreeAnalyzer } from '@/app/scripts/generateTree';
import { ErrorAnalyzer } from './ErrorAnalyzer';
import { ImportFix } from '@/app/generators/corrections/ImportFixServicies';
import { ReportGenerators } from './ReportGenerators';
import { SnapshotAnalyzer } from './SnapshotAnalyzer';
import { StructureValidator } from './StructureValidator';
import { TypeRelationshipMapper } from './TypeRelationshipMapper';
import { BuildErrorHandler } from '@/utils/BuildErrorHandler'
import { FileHeaderManager } from '@/utils/fileHeaderManager';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

interface Correction {
    id: string;
    type: CorrectionType;
    severity: CorrectionSeverity;

    file: string;
    message: string;
    category: CorrectionCategory;
    line?: number;
    title?: string;
    description?: string
    code?: string;
    complexFix?: ComplexFix; // New property for structured fixes
    fix?: string | ImportFix; // Union type
    suggestedFix?: string;
    codeSnippet?: string;
    suggestion?: string;
    priority?: number;
    timestamp?: string;
    documentationLink?: string;
}

// Add new interface for complex fixes
export interface ComplexFix {
    type: 'import' | 'refactor' | 'move' | 'rename';
    data: any;
    apply: () => Promise<boolean>;
}


export interface ImportCorrection extends Correction {
    fixType: 'import';
    importFix: ImportFix;
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

/* ---------- 1-shot file cache ---------- */
type Cached = { mtime: number; issues: Correction[] };
const fileCache = new Map<string, Cached>();



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
    private patternAnalyzer: PatternAnalyzer;
    private buildAnalyzer: BuildAnalyzer;
    private platformDetector: PlatformDetector;
    private reactNativeAnalyzer: ReactNativeAnalyzer;
    private reactWebAnalyzer: ReactWebAnalyzer;
    private comprehensiveBreakdownAnalyzer: ComprehensiveBreakdownAnalyzer;

    private cachedAnalyze(filePath: string, analyzer: (content: string) => Correction[]): Correction[] {
        const key = resolve(filePath);
        const mtime = statSync(key).mtimeMs;
        const hit = fileCache.get(key);
        if (hit && hit.mtime === mtime) return hit.issues;

        const content = readFileSync(key, 'utf8');
        const issues = analyzer(content);          // your current logic
        fileCache.set(key, { mtime, issues });
        return issues;
    }

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

        this.patternAnalyzer = new PatternAnalyzer();
        this.securityAuditor = new SecurityAuditor();
        this.errorAnalyzer = new ErrorAnalyzer();
        this.buildAnalyzer = new BuildAnalyzer();
        this.platformDetector = new PlatformDetector();
        this.reactNativeAnalyzer = new ReactNativeAnalyzer();
        this.reactWebAnalyzer = new ReactWebAnalyzer();
        this.comprehensiveBreakdownAnalyzer = new ComprehensiveBreakdownAnalyzer();

    }

    async generateCorrections(focusArea?: string): Promise<CorrectionReport> {

        // ✅ First fix any case issues, then ensure headers
        console.log('📝 Fixing filename comment cases...');
        FileHeaderManager.fixFilenameCaseComments('src/app', ['.ts', '.tsx']);

        console.log('📝 Ensuring file headers are correct...');
        FileHeaderManager.batchUpdateHeaders('src/app', ['.ts', '.tsx']);

        if (this.hasInitialized) {
            console.log('♻️  Re-using already-initialized analysers');
        } else {
            console.log('🔧 Analysing project for corrections...');
            this.hasInitialized = true;
        }


        const projectStructure = await this.analyzer.analyzeProjectTree();

        // Use typed variables for each analysis
        const compilationErrors: Correction[] = await this.errorAnalyzer.analyzeCompilationErrors();
        const structureIssues: Correction[] = await this.structureValidator.validateStructure(projectStructure);
        const typeHierarchies: Map<string, TypeHierarchy> = await this.typeMapper.mapTypeRelationships(projectStructure);
        const circularReport =
        await this.circularDetector.detectCircularDependencies(projectStructure);

        const circularDeps = circularReport.circularDependencies;

        // Convert security issues to corrections
        const rawSecurityIssues = await this.securityAuditor.auditSecurity(projectStructure);
        const securityIssues: Correction[] = rawSecurityIssues.map(issue => this.convertSecurityIssueToCorrection(issue));

        /* ---- web ---- */
        const metroConfigIssues = this.cachedAnalyze(
            'metro.config.js',
            () => this.metroConfigAnalyzer.analyzeFile('metro.config.js')
        );
        const metroLogIssues = this.cachedAnalyze(
            'metro.config.js',
            () => this.metroLogAnalyzer.analyzeFile('metro.config.js')
        );


        /* ---- mobile ---- (same physical file, now served from cache) */
        const metroConfigIssuesMob = this.cachedAnalyze(
            'metro.config.js',
            () => this.metroConfigAnalyzer.analyzeFile('metro.config.js')
        );
        const metroLogIssuesMob = this.cachedAnalyze(
            'metro.config.js',
            () => this.metroLogAnalyzer.analyzeFile('metro.config.js')
        );

        let snapshotIssues: Correction[] = [];
        if (focusArea === 'snapshots') {
            snapshotIssues = await this.snapshotAnalyzer.analyzeSnapshotIssues();
        }

        let allCorrections = [
            ...compilationErrors,
            ...structureIssues,
            ...securityIssues,
            ...metroConfigIssues,
            ...metroLogIssues,
            ...metroConfigIssuesMob,
            ...metroLogIssuesMob,
        ];

        this.analyzeProblematicCorrections(allCorrections);

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

        const directoryCorrections = allCorrections.filter(c =>
            c.file.includes('ios') || c.file.includes('android')
        );
        if (directoryCorrections.length > 0) {
            console.log('🔍 DEBUG: Found directory corrections:');
            directoryCorrections.forEach(corr => {
                console.log(`  - File: ${corr.file}`);
                console.log(`    Type: ${corr.type}`);
                console.log(`    Message: ${corr.message}`);
            });
        }



        // In generateCorrections method - ENHANCED DEBUG
        const problematicCorrections = allCorrections.filter(c =>
            !c.message || c.message === 'undefined' ||
            c.file === 'ios' || c.file === 'android' ||
            !c.file.includes('.')
        );

        if (problematicCorrections.length > 0) {
            console.log('🔍 DEBUG: Found problematic corrections with sources:');
            problematicCorrections.forEach((corr, index) => {
                console.log(`  ${index + 1}. File: ${corr.file}`);
                console.log(`     Type: ${corr.type}`);
                console.log(`     Message: ${corr.message}`);
                console.log(`     Category: ${corr.category}`);
                console.log(`     ID: ${corr.id}`);
                console.log(`     Source Analyzer: ${this.identifyAnalyzerSource(corr)}`);
            });
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
            type: securityIssue.type,
            severity: this.getSecuritySeverity(securityIssue.type),
            file: securityIssue.file,
            line: securityIssue.line,
            message: securityIssue.message,
            code: securityIssue.code || securityIssue.context || '',
            fix: securityIssue.fix || securityIssue.recommendation || 'Implement security best practices',
            category: 'security',
        }
    }

    private getSecuritySeverity(securityType: string): CorrectionSeverity {
        switch (securityType) {
            case 'sensitive_data': return 'critical';
            case 'missing_sanitization': return 'high';
            case 'role_violation': return 'high';
            case 'insecure_pattern': return 'medium';
            default: return 'medium';
        }
    }

    /**
   * Map snapshot issue types to standard CorrectionType
   */
    private static mapSnapshotIssueType(snapshotType: string): CorrectionType {
        const typeMap: Record<string, CorrectionType> = {
            'import': 'import',
            'type': 'types',
            'serialization': 'runtime',
            'compatibility': 'compatibility',
            'data-model': 'structure',
            'validation': 'runtime',
            'performance': 'performance'
        };

        return typeMap[snapshotType] || 'general';
    }

    /**
 * Map snapshot severity to standard CorrectionSeverity
 */
    private static mapSnapshotSeverity(snapshotSeverity: string): CorrectionSeverity {
        const severityMap: Record<string, CorrectionSeverity> = {
            'blocking': 'critical',
            'high': 'high',
            'medium': 'medium',
            'low': 'low',
            'info': 'low'
        };

        return severityMap[snapshotSeverity] || 'medium';
    }


    /**
   * Generate context-aware fixes for snapshot issues
   */
    private static generateSnapshotFix(issue: SnapshotIssue): string {
        switch (issue.type) {
            case 'import':
                return `// Fix import paths for snapshot utilities
// Ensure all snapshot-related imports use correct paths
import { snapshotUtils } from '@/utils/snapshot';`;

            case 'type':
                return `// Align snapshot types with main application types
// Update type definitions to match component expectations
interface SnapshotData<T> {
  timestamp: string;
  data: T;
  version: string;
}`;

            case 'serialization':
                return `// Fix serialization/deserialization issues
// Use proper data transformation for snapshots
const serializedData = JSON.stringify(data, null, 2);
const deserializedData = JSON.parse(serializedData);`;

            case 'compatibility':
                return `// Ensure snapshot compatibility
// Add version checks and migration logic
if (snapshot.version !== CURRENT_VERSION) {
  return migrateSnapshot(snapshot);
}`;

            default:
                return `// Fix snapshot issue: ${issue.message}
// Review snapshot implementation and data flow`;
        }
    }

    private static convertSnapshotIssueToCorrection(snapshotIssue: any): Correction {
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
    /**
     * Process snapshot folder and convert all issues
     */
    static processSnapshotIssues(snapshotIssues: SnapshotIssue[]): Correction[] {
        return snapshotIssues.map(issue =>
            this.convertSnapshotIssueToCorrection(issue)
        );
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

        // Comprehensive breakdown summary
        if ('comprehensiveBreakdown' in report && report.comprehensiveBreakdown) {
            console.log('\n📊 COMPREHENSIVE BREAKDOWN:');
            console.log('═'.repeat(50));
            console.log(`Components : ${report.comprehensiveBreakdown.summary.affectedComponents}/${report.comprehensiveBreakdown.summary.totalComponents} affected`);
            console.log(`Methods    : ${report.comprehensiveBreakdown.summary.affectedMethods}/${report.comprehensiveBreakdown.summary.totalMethods} affected`);
            console.log(`Interfaces : ${report.comprehensiveBreakdown.summary.affectedInterfaces}/${report.comprehensiveBreakdown.summary.totalInterfaces} affected`);

            const riskScore = BreakdownReportGenerator.generateNumericalSummary(report.comprehensiveBreakdown).riskAssessment;
            console.log(`Overall Risk Score : ${riskScore}/100`);

            /* --------------  daily burn-down -------------- */
            console.log('\n📈 90-DAY FIX PLAN');
            console.log('═'.repeat(50));
            const raw = report.summary;
            const total = raw.totalErrors;
            const daily = Math.ceil(total / 90);
            console.log(`Total Issues : ${total}`);
            console.log(`Critical     : ${raw.critical}`);
            console.log(`High         : ${raw.high}`);
            console.log(`Medium       : ${raw.medium}`);
            console.log(`Low          : ${raw.low}`);
            console.log('');
            console.log(`To finish in 90 days → fix ${daily} issue${daily === 1 ? '' : 's'} per day.`);
            /* ---------------------------------------------- */
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

    private isImportFix(fix: any): fix is ImportFix {
        return fix && 
            typeof fix === 'object' && 
            'newLine' in fix && 
            'filePath' in fix &&
            'missingTypes' in fix;
    }
    private getFixText(correction: Correction): string {
        let fixType = 'unknown';
        let result = '';

        if (typeof correction.fix === 'string') {
            fixType = 'string';
            result = correction.fix;
        } else if (this.isImportFix(correction.fix)) {
            fixType = 'import';
            result = correction.fix.newLine;
        } else if (correction.suggestedFix) {
            fixType = 'suggested';
            result = correction.suggestedFix;
        } else if (correction.complexFix) {
            fixType = 'complex';
            result = `[Complex ${correction.complexFix.type} fix]`;
        } else {
            fixType = 'fallback';
            result = '// Manual fix implementation required';
        }

        // Optional: track fix type usage
        console.log(`Fix type used: ${fixType} for ${correction.id}`);
        
        return result;
    }


    private getCodeDisplay(correction: Correction): string {
        if (correction.code) {
            return correction.code;
        }
        
        if (correction.codeSnippet) {
            return correction.codeSnippet;
        }
        
        // Fallback options
        if (correction.file && correction.line) {
            return `// Code from ${path.basename(correction.file)}:${correction.line}`;
        }
        
        return '// No code context available';
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
                    lines.push(this.getCodeDisplay(fix));
                    lines.push('```');
                    lines.push('');
                }

                lines.push('**Fix:**');
                lines.push('```typescript');
                lines.push(this.getFixText(fix));
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

    private static getErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }

    private static diagnoseExtractionIssue(filePath: string): string {
        // ✅ ADD THIS CHECK FIRST
        if (!fs.existsSync(filePath)) {
            return `🔍 File not found: ${filePath}`;
        }

        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            return `📁 Path is a directory, not a file: ${filePath}`;
        }
        const issues: string[] = [];
        const fixes: string[] = [];

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const filename = path.basename(filePath, path.extname(filePath)); // "UserPreference"

            // Check file header
            const headerFixed = FileHeaderManager.ensureFilenameComment(filePath);
            if (headerFixed) {
                fixes.push('✅ Added missing filename header');
            }

            // Detect component name mismatches
            const componentNameMatch = content.match(/const\s+(\w+)\s*:\s*React\.FC/);
            const exportDefaultMatch = content.match(/export\s+default\s+(\w+)/);

            if (componentNameMatch && exportDefaultMatch) {
                const componentName = componentNameMatch[1];
                const exportName = exportDefaultMatch[1];
                const expectedName = filename.replace(/\.[^/.]+$/, ""); // Remove extension

                // Check component vs export name
                if (componentName !== exportName) {
                    issues.push(`Component name (${componentName}) doesn't match export name (${exportName})`);
                }

                // Check component vs filename
                if (componentName !== expectedName) {
                    issues.push(`Component name (${componentName}) doesn't match filename (${expectedName}.tsx)`);
                }

                // Check export vs filename  
                if (exportName !== expectedName) {
                    issues.push(`Export name (${exportName}) doesn't match filename (${expectedName}.tsx)`);
                }
            } else if (componentNameMatch && !exportDefaultMatch) {
                issues.push('Component defined but no default export found');
            } else if (!componentNameMatch && exportDefaultMatch) {
                issues.push('Default export found but no React component definition');
            }

            // Additional checks...
            if (content.length === 0) {
                issues.push('File is empty');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            issues.push(`File access error: ${errorMessage}`);
        }

        // Build specific, actionable diagnostic message
        let message = `🔍 Analysis Issue: Unable to extract code from ${path.basename(filePath)}\n`;
        const filename = path.basename(filePath, path.extname(filePath));

        if (issues.length > 0) {
            message += `\n🔧 Detected Issues:\n${issues.map(issue => `• ${issue}`).join('\n')}`;

            // Add specific fix suggestions for component mismatches
            if (issues.some(issue => issue.includes('Component name') || issue.includes('Export name'))) {
                message += `\n\n💡 Fix Component Mismatch:\n`;
                message += `1. Ensure component name matches filename\n`;
                message += `2. Ensure export default matches component name\n`;
                message += `3. Example: const ${filename} = () => { ... }; export default ${filename};`;
            }
        } else {
            message += `\n⚠️ No specific issues detected - file may have complex syntax`;
        }

        if (fixes.length > 0) {
            message += `\n\n✅ Auto-fixes Applied:\n${fixes.join('\n')}`;
        }

        message += `\n\n📝 Please review the file structure and naming conventions.`;

        return message.split('\n').map(line => line.trim()).join('\n');
    }


    private analyzeProblematicCorrections(allCorrections: Correction[]): void {
        const problematic = allCorrections.filter(c =>
            !c.message || c.message === 'undefined' ||
            !c.file.includes('.') || c.file === 'ios' || c.file === 'android'
        );

        if (problematic.length === 0) return;

        console.log('🔍 DEBUG: Analyzing problematic corrections by source...');

        // Group by identified source
        const bySource: Record<string, Correction[]> = {};
        problematic.forEach(corr => {
            const source = this.identifyAnalyzerSource(corr);
            if (!bySource[source]) bySource[source] = [];
            bySource[source].push(corr);
        });

        // Print results by source
        Object.entries(bySource).forEach(([source, corrections]) => {
            console.log(`\n📁 ${source}: ${corrections.length} issues`);
            corrections.forEach(corr => {
                console.log(`   📄 ${corr.file}`);
                console.log(`      Type: ${corr.type}, Message: ${corr.message || 'undefined'}`);
                console.log(`      ID: ${corr.id}`);
            });
        });

        // Special focus on directory issues
        const directoryIssues = problematic.filter(c =>
            c.file === 'ios' || c.file === 'android' || !c.file.includes('.')
        );
        if (directoryIssues.length > 0) {
            console.log('\n🚨 DIRECTORY ISSUES FOUND:');
            directoryIssues.forEach(corr => {
                console.log(`   📁 ${corr.file} - ${this.identifyAnalyzerSource(corr)}`);
            });
        }

        // ID pattern analysis for undefined messages
        const undefinedMessages = problematic.filter(c => !c.message || c.message === 'undefined');
        if (undefinedMessages.length > 0) {
            console.log('\n❌ CORRECTIONS WITH UNDEFINED MESSAGES:');

            const idPatterns: Record<string, Correction[]> = {};
            undefinedMessages.forEach(corr => {
                const pattern = this.extractIdPattern(corr.id);
                if (!idPatterns[pattern]) idPatterns[pattern] = [];
                idPatterns[pattern].push(corr);
            });

            Object.entries(idPatterns).forEach(([pattern, corrections]) => {
                console.log(`   ${pattern}: ${corrections.length} issues`);
                console.log(`      Sample: ${corrections[0]?.file}`);
            });
        }
    }

    private extractIdPattern(id: string): string {
        if (!id) return 'no-id';

        // Extract the main pattern before the timestamp
        const match = id.match(/^([a-z-]+)-\d+/);
        return match ? match[1] : 'unknown-pattern';
    }

    private identifyAnalyzerSource(correction: Correction): string {
        const { id, category, type, file } = correction;

        // Check ID patterns first (most reliable)
        if (id?.includes('security-')) return 'SecurityAuditor';
        if (id?.includes('structure-')) return 'StructureValidator';
        if (id?.includes('type-')) return 'TypeRelationshipMapper';
        if (id?.includes('circular-')) return 'CircularDependencyDetector';
        if (id?.includes('compilation-')) return 'ErrorAnalyzer';
        if (id?.includes('snapshot-')) return 'SnapshotAnalyzer';
        if (id?.includes('metro-')) return 'MetroConfigAnalyzer';
        if (id?.includes('missing-directory-')) return 'StructureValidator';
        if (id?.includes('package-json-')) {
            return id.includes('missing-react-native') ? 'StructureValidator' : 'ErrorAnalyzer';
        }

        // ✅ ADDED: Performance and runtime patterns from second version
        if (id?.includes('unsafe-json-parse-')) return 'SecurityAuditor'; // or PatternAnalyzer
        if (id?.includes('date-creation-render-') || id?.includes('inline-styles-')) {
            return 'PatternAnalyzer';
        }
        if (id?.includes('console-statement-') || id?.includes('console-in-production-')) {
            return 'PatternAnalyzer';
        }
        if (id?.includes('timer-without-cleanup-')) return 'PatternAnalyzer';

        // Check category patterns from both versions
        if (category === 'security') return 'SecurityAuditor';
        if (category === 'structure') return 'StructureValidator';
        if (category === 'compilation') return 'ErrorAnalyzer';
        if (category === 'performance') return 'PatternAnalyzer';

        // ✅ ADDED: Runtime category handling
        if (category === 'runtime') {
            // Runtime issues could be from multiple analyzers
            if (id?.includes('unsafe-')) return 'SecurityAuditor';
            return 'PatternAnalyzer'; // Default for runtime
        }

        // File-based detection from second version
        if (file === 'ios' || file === 'android' || file === 'src/components') {
            return 'StructureValidator';
        }
        if (file.includes('tsconfig.json') || file.includes('package.json')) {
            return id?.includes('structure-') ? 'StructureValidator' : 'ErrorAnalyzer';
        }

        return 'Unknown';
    }
}

// CLI execution
if (process.argv[1] && process.argv[1].includes('CorrectionGenerator.ts')) {
    const args = process.argv.slice(2);
    const generator = new CorrectionGenerator();
    generator.runFromCLI(args).catch(console.error);
}
export type { Correction, CorrectionReport };
