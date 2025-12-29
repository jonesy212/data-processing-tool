// ReportTester.ts

import { CorrectionReport } from '@/core/generators/corrections/CorrectionGenerator';
import { ReportGenerators } from '@/core/generators/corrections/ReportGenerators';
import fs from 'fs';
import path from 'path';

export class ReportTester {
  static async testWithRealComponent(componentPath: string) {
    console.log(`🔍 Testing reports for: ${componentPath}`);
    
    // Create a realistic sample report for the component
    const report: CorrectionReport = {
      timestamp: new Date().toISOString(),
      corrections: [
        {
          id: 'comp-1',
          file: componentPath,
          line: 1,
          message: 'Missing type annotations',
          severity: 'medium',
          category: 'structure',
          type: 'type_annotation',
          code: `const user = { name: 'John', age: 30 };`,
          fix: `interface User { name: string; age: number; }\nconst user: User = { name: 'John', age: 30 };`
        }
      ],
      securityIssues: [],
      typeHierarchies: new Map(),
      fileAssociations: new Map(),
      circularDependencies: []
    };

    // Generate all report types
    const reports = {
      security: ReportGenerators.generateSecurityReport(report),
      critical: ReportGenerators.generateCriticalErrorsReport(report),
      structural: ReportGenerators.generateStructuralReport(report),
      types: ReportGenerators.generateTypeRelationshipsReport(report)
    };

    // Save organized by component
    const componentName = path.basename(componentPath, '.tsx');
    const outputDir = `frontend/buddease/corrections/components/${componentName}`;
    
    await fs.promises.mkdir(outputDir, { recursive: true });
    
    for (const [reportType, content] of Object.entries(reports)) {
      await fs.promises.writeFile(
        path.join(outputDir, `${reportType}-report.md`),
        content
      );
    }
    
    console.log(`✅ Reports saved to: ${outputDir}`);
    return reports;
  }
}

// Quick usage example
// ReportTester.testWithRealComponent('src/app/components/UserProfile.tsx');