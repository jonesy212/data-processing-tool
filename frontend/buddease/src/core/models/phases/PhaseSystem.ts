// PhaseSystem.ts
src/core/error-analyzer/phases/PhaseSystem.ts
import type{ PhaseContext } from '@/core/error-analyzer/phases/DynamicPhaseSystem'
import type { PhaseBackupSystem } from '@/src/core/error-analyzer/phases/PhaseBackupSystem';
import { PhaseBackupSystemImpl } from '@/src/core/error-analyzer/phases/PhaseBackupSystem';

export interface PhaseDefinition {
    id: string;
    name: string;
    description: string;
    dependencies: string[]; // Phase IDs that must run before this
    milestones: PhaseMilestoneDefinition[]; // Or MilestoneDefinition<PhaseContext>[]

    skipCondition?: (context: ExecutionContext) => boolean;
    isSubPhase?: boolean;
    parentPhaseId?: string;
}

export interface MilestoneDefinition<TContext extends ExecutionContext = ExecutionContext> {
    id: string;
    name: string;
    execute: (context: TContext) => Promise<any>;
    skipCondition?: (context: TContext) => boolean;
    requiredForPhaseCompletion?: boolean;
}


export interface PhaseMilestoneDefinition extends MilestoneDefinition<PhaseContext> {
    // You can add phase-specific properties here if needed
}

export interface ExecutionContext {
    projectRoot: string;
    results: Map<string, any>;
    diagnostics: any;
    config: any;
}







export class HierarchicalPhaseExecutor {
    private context: ExecutionContext;
    private phaseDefinitions: Map<string, PhaseDefinition>;
    private executionOrder: string[] = [];

    constructor(projectRoot: string = process.cwd()) {
        this.context = {
            projectRoot,
            results: new Map(),
            diagnostics: null,
            config: {}
        };

        this.phaseDefinitions = this.createPhaseDefinitions();
        this.calculateExecutionOrder();
    }


    // Helper function to safely get error message
    getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    } else if (typeof error === 'string') {
        return error;
    } else if (error && typeof error === 'object' && 'message' in error) {
        return String((error as any).message);
    }
    return 'Unknown error';
    }



    private createBackupSystem(): PhaseBackupSystem {
        const backupSystem = new PhaseBackupSystemImpl();
        
        return {
            createBackup: backupSystem.createBackup.bind(backupSystem),
            restoreBackup: backupSystem.restoreBackup.bind(backupSystem),
            listBackups: backupSystem.listBackups.bind(backupSystem),
            deleteBackup: backupSystem.deleteBackup.bind(backupSystem),
            createRestorePoint: backupSystem.createRestorePoint.bind(backupSystem),
            listRestorePoints: backupSystem.listRestorePoints.bind(backupSystem),
            cleanupOldBackups: backupSystem.cleanupOldBackups.bind(backupSystem),
            validateBackup: backupSystem.validateBackup.bind(backupSystem),
            getBackupStats: backupSystem.getBackupStats.bind(backupSystem),
            backupEntity: backupSystem.backupEntity.bind(backupSystem) // This exists in your class
        };
    }
    private get phaseContext(): PhaseContext {
        return {
            ...this.context,
            entityAnalysis: new Map(),
            patternAnalysis: new Map(),
            testResults: new Map(),
            backupSystem: this.createBackupSystem(),
            config: {}
        };
    }



    private createPhaseDefinitions(): Map<string, PhaseDefinition> {
        const phases: PhaseDefinition[] = [
            // MAIN PHASE: DIAGNOSIS
            {
                id: 'diagnosis',
                name: 'Error Diagnosis',
                description: 'Collect and analyze TypeScript errors',
                dependencies: [],
                milestones: [
                    {
                        id: 'collect-errors',
                        name: 'Collect TypeScript Errors',
                        execute: async (ctx) => {
                            console.log('📊 Collecting TypeScript errors...');
                            // Implementation
                            return { errorCount: 100 };
                        }
                    },
                    {
                        id: 'categorize-errors',
                        name: 'Categorize Error Types',
                        execute: async (ctx) => {
                            console.log('🏷️ Categorizing error types...');
                            // Implementation
                            return { categories: ['syntax', 'type', 'import'] };
                        },
                        skipCondition: (ctx) => {
                            const errors = ctx.results.get('collect-errors');
                            return !errors || errors.errorCount === 0;
                        }
                    },
                    {
                        id: 'prioritize-errors',
                        name: 'Prioritize Error Resolution',
                        execute: async (ctx) => {
                            console.log('🎯 Prioritizing errors...');
                            // Implementation
                            return { priority: 'high', files: ['app.ts'] };
                        }
                    }
                ]
            },

            // MAIN PHASE: ANALYSIS
            {
                id: 'analysis',
                name: 'Error Analysis',
                description: 'Deep dive into error patterns',
                dependencies: ['diagnosis'],
                milestones: [
                    {
                        id: 'file-analysis',
                        name: 'File-Level Analysis',
                        execute: async (ctx) => {
                            console.log('📁 Analyzing problematic files...');
                            // Implementation
                            return { worstFile: 'app.ts', lineCount: 50 };
                        }
                    },
                    {
                        id: 'dependency-analysis',
                        name: 'Dependency Analysis',
                        execute: async (ctx) => {
                            console.log('🔗 Analyzing dependencies...');
                            // Implementation
                            return { missingImports: 5, circularDeps: 2 };
                        },
                        skipCondition: (ctx) => {
                            // Skip if no file analysis results
                            return !ctx.results.get('file-analysis');
                        }
                    },
                    {
                        id: 'pattern-detection',
                        name: 'Pattern Detection',
                        execute: async (ctx) => {
                            console.log('🎭 Detecting error patterns...');
                            // Implementation
                            return { patterns: ['missing-semicolon', 'type-mismatch'] };
                        }
                    }
                ]
            },

            // SUB-PHASE: Error Grouping (within Analysis)
            {
                id: 'error-grouping',
                name: 'Error Grouping',
                description: 'Group similar errors together',
                dependencies: ['analysis'],
                isSubPhase: true,
                parentPhaseId: 'analysis',
                milestones: [
                    {
                        id: 'group-by-type',
                        name: 'Group by Error Type',
                        execute: async (ctx) => {
                            console.log('📋 Grouping errors by type...');
                            // Implementation
                            return { groups: 5 };
                        }
                    },
                    {
                        id: 'group-by-file',
                        name: 'Group by File',
                        execute: async (ctx) => {
                            console.log('🗂️ Grouping errors by file...');
                            // Implementation
                            return { filesWithErrors: 10 };
                        }
                    }
                ]
            },

            // MAIN PHASE: RESOLUTION
            {
                id: 'resolution',
                name: 'Error Resolution',
                description: 'Apply fixes and verify',
                dependencies: ['analysis'],
                milestones: [
                    {
                        id: 'auto-fixes',
                        name: 'Apply Auto-Fixes',
                        execute: async (ctx) => {
                            console.log('⚡ Applying automatic fixes...');
                            // Implementation
                            return { fixesApplied: 15 };
                        }
                    },
                    {
                        id: 'manual-fixes',
                        name: 'Manual Fixes',
                        execute: async (ctx) => {
                            console.log('🔧 Generating manual fix guidance...');
                            // Implementation
                            return { suggestions: 20 };
                        },
                        requiredForPhaseCompletion: false // Can be skipped
                    },
                    {
                        id: 'verification',
                        name: 'Verification',
                        execute: async (ctx) => {
                            console.log('✅ Verifying fixes...');
                            // Implementation
                            return { remainingErrors: 5 };
                        }
                    }
                ]
            }
        ];

        return new Map(phases.map(p => [p.id, p]));
    }

    private calculateExecutionOrder(): void {
        // Topological sort for dependencies
        const visited = new Set<string>();
        const temp = new Set<string>();
        const order: string[] = [];

        const visit = (phaseId: string) => {
            if (temp.has(phaseId)) {
                throw new Error(`Circular dependency detected: ${phaseId}`);
            }
            if (visited.has(phaseId)) return;

            temp.add(phaseId);
            const phase = this.phaseDefinitions.get(phaseId);
            
            if (phase) {
                for (const dep of phase.dependencies) {
                    visit(dep);
                }
            }
            
            temp.delete(phaseId);
            visited.add(phaseId);
            order.push(phaseId);
        };

        for (const phaseId of this.phaseDefinitions.keys()) {
            if (!visited.has(phaseId)) {
                visit(phaseId);
            }
        }

        this.executionOrder = order;
    }

    async executeAll(): Promise<Map<string, any>> {
        console.log('🚀 Starting Hierarchical Error Resolution\n');
        
        for (const phaseId of this.executionOrder) {
            await this.executePhase(phaseId);
        }
        
        this.generateReport();
        return this.context.results;
    }

    async executePhase(phaseId: string): Promise<void> {
        const phase = this.phaseDefinitions.get(phaseId);
        if (!phase) {
            throw new Error(`Phase not found: ${phaseId}`);
        }

        // Check skip condition
        if (phase.skipCondition && phase.skipCondition(this.context)) {
            console.log(`⏭️ Skipping ${phase.name} (skip condition met)`);
            return;
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎯 ${phase.isSubPhase ? 'Sub-Phase' : 'Phase'}: ${phase.name}`);
        console.log(phase.description);
        console.log('='.repeat(60));

        const phaseResults: any = {
            startTime: new Date(),
            milestones: []
        };

        // Execute milestones
        for (const milestone of phase.milestones) {
            const milestoneResult = await this.executeMilestone(phaseId, milestone);
            phaseResults.milestones.push({
                id: milestone.id,
                name: milestone.name,
                result: milestoneResult
            });
        }

        phaseResults.endTime = new Date();
        phaseResults.duration = phaseResults.endTime.getTime() - phaseResults.startTime.getTime();

        this.context.results.set(phaseId, phaseResults);
        console.log(`✅ ${phase.name} completed in ${phaseResults.duration}ms`);
    }

    private async executeMilestone(phaseId: string, milestone: PhaseMilestoneDefinition): Promise<any> {
        // Use phaseContext instead of context
        if (milestone.skipCondition && milestone.skipCondition(this.phaseContext)) {
            console.log(`   ⏭️ Skipping ${milestone.name}`);
            return { skipped: true, reason: 'skipCondition' };
        }

        console.log(`   📍 ${milestone.name}...`);
        
        try {
            const result = await milestone.execute(this.phaseContext); // ✓ No cast needed
            console.log(`   ✅ ${milestone.name} completed`);
            return result;
        } catch (error) {
            const errorMessage = this.getErrorMessage(error);
            console.error(`   ❌ ${milestone.name} failed:`, errorMessage);
            
            if (milestone.requiredForPhaseCompletion !== false) {
                throw error;
            }
            
            return { failed: true, error: errorMessage };
        }
    }

    async executeSingle(phaseId: string, includeDependencies: boolean = true): Promise<any> {
        console.log(`🎯 Executing ${includeDependencies ? 'phase with dependencies' : 'single phase'}: ${phaseId}`);
        
        if (includeDependencies) {
            // Find all phases that need to run (including dependencies)
            const phasesToRun = this.getPhaseWithDependencies(phaseId);
            
            for (const phaseToRun of phasesToRun) {
                // Skip if already executed
                if (!this.context.results.has(phaseToRun)) {
                    await this.executePhase(phaseToRun);
                }
            }
        } else {
            await this.executePhase(phaseId);
        }
        
        return this.context.results.get(phaseId);
    }

    async executeMilestoneOnly(phaseId: string, milestoneId: string): Promise<any> {
        const phase = this.phaseDefinitions.get(phaseId);
        if (!phase) {
            throw new Error(`Phase not found: ${phaseId}`);
        }

        const milestone = phase.milestones.find(m => m.id === milestoneId);
        if (!milestone) {
            throw new Error(`Milestone not found: ${milestoneId} in phase ${phaseId}`);
        }

        console.log(`🎯 Executing single milestone: ${milestone.name}`);
        return await this.executeMilestone(phaseId, milestone);
    }

    private getPhaseWithDependencies(phaseId: string): string[] {
        const result: string[] = [];
        const visited = new Set<string>();
        
        const collectDeps = (currentPhaseId: string) => {
            if (visited.has(currentPhaseId)) return;
            visited.add(currentPhaseId);
            
            const phase = this.phaseDefinitions.get(currentPhaseId);
            if (!phase) return;
            
            // Collect dependencies first
            for (const dep of phase.dependencies) {
                collectDeps(dep);
            }
            
            // Then add current phase
            result.push(currentPhaseId);
        };
        
        collectDeps(phaseId);
        return result;
    }

    private generateReport(): void {
        console.log('\n📋 EXECUTION SUMMARY');
        console.log('='.repeat(60));
        
        for (const phaseId of this.executionOrder) {
            const result = this.context.results.get(phaseId);
            const phase = this.phaseDefinitions.get(phaseId);
            
            if (!phase || !result) continue;
            
            const statusIcon = result.milestones.every((m: any) => !m.result.failed) ? '✅' : '⚠️';
            const subPhaseIndicator = phase.isSubPhase ? '  └─ ' : '';
            
            console.log(`${statusIcon} ${subPhaseIndicator}${phase.name}`);
            
            // Show milestone status
            for (const milestone of result.milestones) {
                const milestoneStatus = milestone.result.skipped ? '⏭️' : 
                                      milestone.result.failed ? '❌' : '✅';
                console.log(`    ${milestoneStatus} ${milestone.name}`);
            }
        }
    }
}

// Factory functions for easy use
export async function runHierarchicalResolution(projectRoot?: string): Promise<Map<string, any>> {
    const executor = new HierarchicalPhaseExecutor(projectRoot);
    return await executor.executeAll();
}

export async function runPhaseWithDeps(phaseId: string, projectRoot?: string): Promise<any> {
    const executor = new HierarchicalPhaseExecutor(projectRoot);
    return await executor.executeSingle(phaseId, true);
}

export async function runMilestoneOnly(phaseId: string, milestoneId: string, projectRoot?: string): Promise<any> {
    const executor = new HierarchicalPhaseExecutor(projectRoot);
    return await executor.executeMilestoneOnly(phaseId, milestoneId);
}