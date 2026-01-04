// src/app/error-analyzer/FixVerifier.ts
import type { FixPlan } from '@/core/error-analyzer/ErrorFixManager';
import type { AppliedChange, FixExecutionResult, ValidationResult } from '@/core/error-analyzer/index';
import fs from 'fs';
import path from 'path';

export class FixVerifier {
    private verificationRules: Array<{
        name: string;
        check: (plan: FixPlan) => Promise<ValidationResult>;
        weight: number;
    }>;

    constructor() {
        this.verificationRules = this.buildVerificationRules();
    }

    async verifyPlans(fixPlans: FixPlan[]): Promise<FixPlan[]> {
        const verifiedPlans: FixPlan[] = [];

        for (const plan of fixPlans) {
            const verifiedPlan = await this.verifySinglePlan(plan);
            verifiedPlans.push(verifiedPlan);
        }

        return verifiedPlans;
    }

    async verifySinglePlan(plan: FixPlan): Promise<FixPlan> {
        const validationResults = await this.runAllValidations(plan);
        const passedCount = validationResults.filter(r => r.passed).length;
        const totalCount = validationResults.length;
        const passRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 100;

        // Adjust confidence based on validation results
        let adjustedConfidence = plan.confidence;
        if (passRate < 70) {
            adjustedConfidence *= 0.7; // Reduce confidence for poor validation
        } else if (passRate > 90) {
            adjustedConfidence = Math.min(100, adjustedConfidence * 1.1); // Boost confidence
        }

        return {
            ...plan,
            confidence: Math.round(adjustedConfidence),
            requiresManualReview: plan.requiresManualReview || passRate < 60
        };
    }

    async simulateFix(plan: FixPlan): Promise<FixExecutionResult> {
        const startTime = Date.now();
        const appliedChanges: AppliedChange[] = [];
        const validationResults: ValidationResult[] = [];

        try {
            // Run pre-fix validations
            const preValidations = await this.runAllValidations(plan);
            validationResults.push(...preValidations);

            // Simulate the fix
            const changes = await this.simulateChanges(plan);
            appliedChanges.push(...changes);

            // Run post-fix validations
            const postValidations = await this.validateAfterChanges(plan, changes);
            validationResults.push(...postValidations);

            const timeTaken = Date.now() - startTime;
            const successRate = validationResults.filter(r => r.passed).length / validationResults.length;

            return {
                success: successRate >= 0.7,
                fixId: plan.id,
                strategy: this.mapFixTypeToStrategy(plan.fixType),
                appliedChanges,
                validationResults,
                confidenceAfter: successRate >= 0.8 ? Math.min(100, plan.confidence * 1.1) : plan.confidence,
                timeTaken
            };

        } catch (error) {
            const timeTaken = Date.now() - startTime;

            return {
                success: false,
                fixId: plan.id,
                strategy: this.mapFixTypeToStrategy(plan.fixType),
                appliedChanges: [],
                validationResults: [{
                    check: 'Simulation Error',
                    passed: false,
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: error instanceof Error ? error.stack : undefined
                }],
                confidenceAfter: plan.confidence * 0.5, // Halve confidence on error
                timeTaken
            };
        }
    }

    async validateFixApplication(filePath: string, changes: AppliedChange[]): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            results.push({
                check: 'File Existence',
                passed: false,
                message: `File does not exist: ${filePath}`
            });
            return results;
        }

        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            for (const change of changes) {
                const result = await this.validateSingleChange(lines, change);
                results.push(result);
            }

            // Validate overall file syntax
            const syntaxResult = await this.validateFileSyntax(filePath);
            results.push(syntaxResult);

        } catch (error) {
            results.push({
                check: 'File Read/Validation',
                passed: false,
                message: `Failed to read/validate file: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }

        return results;
    }

    private async runAllValidations(plan: FixPlan): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];

        for (const rule of this.verificationRules) {
            try {
                const result = await rule.check(plan);
                results.push(result);
            } catch (error) {
                results.push({
                    check: rule.name,
                    passed: false,
                    message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        }

        return results;
    }

    private buildVerificationRules(): Array<{
        name: string;
        check: (plan: FixPlan) => Promise<ValidationResult>;
        weight: number;
    }> {
        return [
            {
                name: 'File Existence',
                check: async (plan) => {
                    const filePath = plan.error.resource;
                    const exists = fs.existsSync(filePath);
                    return {
                        check: 'File Existence',
                        passed: exists,
                        message: exists ? 'File exists' : `File not found: ${filePath}`
                    };
                },
                weight: 10
            },
            {
                name: 'Line Number Validity',
                check: async (plan) => {
                    const filePath = plan.error.resource;
                    if (!fs.existsSync(filePath)) {
                        return {
                            check: 'Line Number Validity',
                            passed: false,
                            message: 'File does not exist'
                        };
                    }

                    const content = await fs.promises.readFile(filePath, 'utf8');
                    const lineCount = content.split('\n').length;
                    const lineNumber = plan.error.startLineNumber;

                    const isValid = lineNumber > 0 && lineNumber <= lineCount;
                    return {
                        check: 'Line Number Validity',
                        passed: isValid,
                        message: isValid
                            ? `Line ${lineNumber} is valid (file has ${lineCount} lines)`
                            : `Line ${lineNumber} is out of range (file has ${lineCount} lines)`
                    };
                },
                weight: 8
            },
            {
            name: 'Error Context Exists',
            check: async (plan) => {
                const filePath = plan.error.resource;
                if (!fs.existsSync(filePath)) {
                return {
                    check: 'Error Context Exists',
                    passed: false,
                    message: 'File does not exist'
                };
                }

                const content = await fs.promises.readFile(filePath, 'utf8');
                const lines = content.split('\n');
                const lineNumber = plan.error.startLineNumber;
                
                if (lineNumber <= 0 || lineNumber > lines.length) {
                return {
                    check: 'Error Context Exists',
                    passed: false,
                    message: 'Invalid line number'
                };
                }

                const contextLine = lines[lineNumber - 1];
                const hasContext = Boolean(contextLine && contextLine.trim().length > 0);
                // Alternative fixes:
                // const hasContext = !!(contextLine && contextLine.trim().length > 0);
                // const hasContext = contextLine ? contextLine.trim().length > 0 : false;
                
                return {
                check: 'Error Context Exists',
                passed: hasContext,
                message: hasContext 
                    ? `Context found: "${contextLine.substring(0, 50)}..."` 
                    : 'No context found at line'
                };
            },
            weight: 7
            },
            {
                name: 'Fix Syntax Validity',
                check: async (plan) => {
                    const fix = plan.suggestedFix;
                    const hasValidSyntax = this.hasValidTypeScriptSyntax(fix);

                    return {
                        check: 'Fix Syntax Validity',
                        passed: hasValidSyntax,
                        message: hasValidSyntax
                            ? 'Fix has valid TypeScript syntax'
                            : 'Fix may have syntax issues'
                    };
                },
                weight: 9
            },
            {
                name: 'Import Path Validity',
                check: async (plan) => {
                    if (plan.fixType !== 'missing_import') {
                        return {
                            check: 'Import Path Validity',
                            passed: true,
                            message: 'Not an import fix'
                        };
                    }

                    const importMatch = plan.suggestedFix.match(/from\s+['"]([^'"]+)['"]/);
                    if (!importMatch) {
                        return {
                            check: 'Import Path Validity',
                            passed: false,
                            message: 'No import path found in fix'
                        };
                    }

                    const importPath = importMatch[1];
                    const isRelative = importPath.startsWith('.');

                    if (isRelative) {
                        const fileDir = path.dirname(plan.error.resource);
                        const fullPath = path.resolve(fileDir, importPath);

                        // Check if it's a TypeScript file or directory
                        const existsAsFile = fs.existsSync(fullPath + '.ts') ||
                            fs.existsSync(fullPath + '.tsx');
                        const existsAsDir = fs.existsSync(fullPath) &&
                            fs.statSync(fullPath).isDirectory();
                        const existsAsIndex = fs.existsSync(path.join(fullPath, 'index.ts')) ||
                            fs.existsSync(path.join(fullPath, 'index.tsx'));

                        const isValid = existsAsFile || existsAsDir || existsAsIndex;

                        return {
                            check: 'Import Path Validity',
                            passed: isValid,
                            message: isValid
                                ? `Relative import path is valid: ${importPath}`
                                : `Invalid relative import path: ${importPath}`
                        };
                    }

                    // For package imports, we can't easily validate
                    return {
                        check: 'Import Path Validity',
                        passed: true,
                        message: 'Package import - validation deferred to runtime'
                    };
                },
                weight: 8
            },
            {
                name: 'Type Safety Check',
                check: async (plan) => {
                    if (plan.fixType !== 'type_mismatch' && plan.fixType !== 'missing_property') {
                        return {
                            check: 'Type Safety Check',
                            passed: true,
                            message: 'Not a type-related fix'
                        };
                    }

                    const fix = plan.suggestedFix;
                    const hasTypeAnnotations = fix.includes(':') || fix.includes('interface') || fix.includes('type ');

                    return {
                        check: 'Type Safety Check',
                        passed: hasTypeAnnotations,
                        message: hasTypeAnnotations
                            ? 'Fix includes type annotations'
                            : 'Fix missing type annotations - may cause type issues'
                    };
                },
                weight: 7
            },
            {
                name: 'Affected Files Consistency',
                check: async (plan) => {
                    if (plan.affectedFiles.length <= 1) {
                        return {
                            check: 'Affected Files Consistency',
                            passed: true,
                            message: 'Only one affected file'
                        };
                    }

                    // Check if all affected files exist
                    const allExist = plan.affectedFiles.every(file => fs.existsSync(file));

                    return {
                        check: 'Affected Files Consistency',
                        passed: allExist,
                        message: allExist
                            ? `All ${plan.affectedFiles.length} affected files exist`
                            : 'Some affected files do not exist'
                    };
                },
                weight: 6
            }
        ];
    }

    private async simulateChanges(plan: FixPlan): Promise<AppliedChange[]> {
        const changes: AppliedChange[] = [];
        const filePath = plan.error.resource;

        if (!fs.existsSync(filePath)) {
            return changes;
        }

        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const lines = content.split('\n');
            const lineNumber = plan.error.startLineNumber;

            if (lineNumber > 0 && lineNumber <= lines.length) {
                const beforeLine = lines[lineNumber - 1];

                // Create simulated "after" line
                let afterLine = beforeLine;

                switch (plan.fixType) {
                    case 'missing_import':
                        // Simulate adding import at top of file
                        changes.push({
                            file: filePath,
                            line: 1,
                            before: lines[0],
                            after: plan.suggestedFix.split('\n')[0] || '',
                            description: 'Add import statement'
                        });
                        break;

                    case 'missing_property':
                        // Simulate adding property
                        afterLine = beforeLine.replace(/{/, '{ ' + this.extractPropertyAddition(plan.suggestedFix));
                        changes.push({
                            file: filePath,
                            line: lineNumber,
                            before: beforeLine,
                            after: afterLine,
                            description: 'Add missing property'
                        });
                        break;

                    case 'type_mismatch':
                        // Simulate type fix
                        afterLine = this.applyTypeFix(beforeLine, plan.suggestedFix);
                        changes.push({
                            file: filePath,
                            line: lineNumber,
                            before: beforeLine,
                            after: afterLine,
                            description: 'Fix type mismatch'
                        });
                        break;

                    default:
                        // Generic simulation
                        changes.push({
                            file: filePath,
                            line: lineNumber,
                            before: beforeLine,
                            after: `${beforeLine} // ${plan.suggestedFix.substring(0, 50)}...`,
                            description: 'Apply fix'
                        });
                }
            }
        } catch (error) {
            // Ignore simulation errors
        }

        return changes;
    }

    private async validateAfterChanges(plan: FixPlan, changes: AppliedChange[]): Promise<ValidationResult[]> {
        const results: ValidationResult[] = [];

        if (changes.length === 0) {
            results.push({
                check: 'Change Simulation',
                passed: false,
                message: 'No changes were simulated'
            });
            return results;
        }

        // Validate that changes make sense
        for (const change of changes) {
            if (change.before === change.after) {
                results.push({
                    check: 'Change Effectiveness',
                    passed: false,
                    message: 'Change does not modify the code'
                });
            } else if (change.after.trim().length === 0) {
                results.push({
                    check: 'Change Content',
                    passed: false,
                    message: 'Change results in empty line'
                });
            } else {
                results.push({
                    check: 'Change Validity',
                    passed: true,
                    message: 'Change appears valid'
                });
            }
        }

        // Check for potential syntax issues
        const combinedFix = changes.map(c => c.after).join('\n');
        const hasSyntax = this.hasValidTypeScriptSyntax(combinedFix);

        results.push({
            check: 'Post-Change Syntax',
            passed: hasSyntax,
            message: hasSyntax ? 'Changes maintain valid syntax' : 'Changes may introduce syntax errors'
        });

        return results;
    }

    private async validateSingleChange(lines: string[], change: AppliedChange): Promise<ValidationResult> {
        const { line, before, after } = change;

        if (line <= 0 || line > lines.length) {
            return {
                check: 'Line Position',
                passed: false,
                message: `Line ${line} is out of range (1-${lines.length})`
            };
        }

        const actualLine = lines[line - 1];

        // For imports, we don't need exact match (might be adding to existing line)
        if (change.description.includes('import')) {
            return {
                check: 'Import Change',
                passed: true,
                message: 'Import change validation deferred'
            };
        }

        // Check if the "before" matches what's actually there
        const matches = actualLine.trim() === before.trim();

        return {
            check: 'Line Content Match',
            passed: matches,
            message: matches
                ? `Line ${line} matches expected content`
                : `Line ${line} does not match. Expected: "${before}", Actual: "${actualLine}"`
        };
    }

    private async validateFileSyntax(filePath: string): Promise<ValidationResult> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');

            // Basic TypeScript syntax checks
            const issues: string[] = [];

            // Check for unmatched braces
            const openBraces = (content.match(/{/g) || []).length;
            const closeBraces = (content.match(/}/g) || []).length;
            if (openBraces !== closeBraces) {
                issues.push(`Unmatched braces: ${openBraces} opening, ${closeBraces} closing`);
            }

            // Check for unmatched parentheses
            const openParens = (content.match(/\(/g) || []).length;
            const closeParens = (content.match(/\)/g) || []).length;
            if (openParens !== closeParens) {
                issues.push(`Unmatched parentheses: ${openParens} opening, ${closeParens} closing`);
            }

            // Check for common syntax errors
            if (content.includes(';;')) {
                issues.push('Double semicolon detected');
            }

            const passed = issues.length === 0;
            return {
                check: 'File Syntax',
                passed,
                message: passed ? 'File syntax appears valid' : `Syntax issues: ${issues.join(', ')}`
            };

        } catch (error) {
            return {
                check: 'File Syntax',
                passed: false,
                message: `Failed to validate syntax: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    private hasValidTypeScriptSyntax(code: string): boolean {
        // Basic TypeScript syntax validation
        // In production, use TypeScript compiler API for actual validation

        // Check for common syntax errors
        const errors = [
            /import\s+from\s+['"]$/, // Incomplete import
            /export\s+$/, // Incomplete export
            /interface\s+\w+\s+{$/, // Unclosed interface
            /type\s+\w+\s+=\s*$/, // Incomplete type alias
            /const\s+\w+\s*:\s*$/, // Incomplete const with type
            /\{[^}]*$/, // Unclosed object literal
            /\([^)]*$/, // Unclosed parentheses
        ];

        for (const errorPattern of errors) {
            if (errorPattern.test(code)) {
                return false;
            }
        }

        return true;
    }

    private extractPropertyAddition(fix: string): string {
        // Extract property from fix suggestion
        const match = fix.match(/(\w+)\s*:\s*[^;,\n]+/);
        return match ? `${match[1]}: /* type */, ` : 'property: unknown, ';
    }

    private applyTypeFix(beforeLine: string, fix: string): string {
        // Simple type fix application
        if (fix.includes(':') && beforeLine.includes(':')) {
            const typeMatch = fix.match(/:\s*([^;,\n]+)/);
            if (typeMatch) {
                return beforeLine.replace(/:\s*[^;,\n]+/, `: ${typeMatch[1].trim()}`);
            }
        }
        return beforeLine;
    }

    private mapFixTypeToStrategy(fixType: string): any {
        const mapping: Record<string, any> = {
            'missing_import': 'import_fix',
            'type_mismatch': 'type_alignment',
            'missing_property': 'property_addition',
            'circular_dependency': 'circular_break',
            'method_redefinition': 'method_implementation'
        };

        return mapping[fixType] || 'unknown';
    }

    generateVerificationReport(fixPlans: FixPlan[], simulationResults: FixExecutionResult[]): string {
        const lines: string[] = [];

        lines.push('# Fix Verification Report');
        lines.push('');
        lines.push(`**Total Fixes Verified:** ${fixPlans.length}`);
        lines.push(`**Simulations Run:** ${simulationResults.length}`);
        lines.push('');

        // Summary statistics
        const passedFixes = fixPlans.filter(p => p.confidence >= 70 && !p.requiresManualReview).length;
        const needsReview = fixPlans.filter(p => p.requiresManualReview).length;
        const failedSimulations = simulationResults.filter(r => !r.success).length;

        lines.push('## 📊 Summary Statistics');
        lines.push('');
        lines.push(`- **Passing Fixes:** ${passedFixes} (${((passedFixes / fixPlans.length) * 100).toFixed(1)}%)`);
        lines.push(`- **Needs Manual Review:** ${needsReview}`);
        lines.push(`- **Failed Simulations:** ${failedSimulations}`);
        lines.push('');

        // Confidence distribution
        const confidenceLevels = {
            high: fixPlans.filter(p => p.confidence >= 80).length,
            medium: fixPlans.filter(p => p.confidence >= 60 && p.confidence < 80).length,
            low: fixPlans.filter(p => p.confidence < 60).length
        };

        lines.push('## 🎯 Confidence Levels');
        lines.push('');
        lines.push(`- **High (80-100%):** ${confidenceLevels.high} fixes`);
        lines.push(`- **Medium (60-79%):** ${confidenceLevels.medium} fixes`);
        lines.push(`- **Low (0-59%):** ${confidenceLevels.low} fixes`);
        lines.push('');

        // Top issues
        if (needsReview > 0) {
            lines.push('## ⚠️ Fixes Needing Manual Review');
            lines.push('');

            const needsReviewPlans = fixPlans.filter(p => p.requiresManualReview).slice(0, 5);
            for (const plan of needsReviewPlans) {
                lines.push(`### ${plan.error.message.substring(0, 80)}...`);
                lines.push(`**File:** ${path.basename(plan.error.resource)}`);
                lines.push(`**Line:** ${plan.error.startLineNumber}`);
                lines.push(`**Confidence:** ${plan.confidence}%`);
                lines.push(`**Reason:** Low confidence or complex fix`);
                lines.push('');
            }
        }

        // Simulation results
        if (simulationResults.length > 0) {
            lines.push('## 🔬 Simulation Results');
            lines.push('');

            const successful = simulationResults.filter(r => r.success);
            const avgTime = simulationResults.reduce((sum, r) => sum + r.timeTaken, 0) / simulationResults.length;

            lines.push(`- **Successful Simulations:** ${successful.length}/${simulationResults.length}`);
            lines.push(`- **Average Simulation Time:** ${avgTime.toFixed(0)}ms`);
            lines.push('');

            if (failedSimulations > 0) {
                lines.push('### Failed Simulations:');
                for (const result of simulationResults.filter(r => !r.success).slice(0, 3)) {
                    const failedValidations = result.validationResults.filter(r => !r.passed);
                    lines.push(`- **${result.fixId}:** ${failedValidations.length} validation failures`);
                }
            }
        }

        // Recommendations
        lines.push('## 💡 Recommendations');
        lines.push('');
        lines.push('1. **Start with high-confidence fixes** (80%+)');
        lines.push('2. **Review manual-review fixes carefully**');
        lines.push('3. **Test each fix before applying**');
        lines.push('4. **Use the simulation results as guidance**');
        lines.push('5. **Run TypeScript compiler after each fix group**');

        return lines.join('\n');
    }
}