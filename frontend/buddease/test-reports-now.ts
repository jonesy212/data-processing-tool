// buddease/test-reports-now.ts
import { ReportGenerators } from '@/app/generators/corrections/ReportGenerators';
import { CorrectionReport } from '@/app/generators/corrections/CorrectionGenerator';

async function quickTest() {
  console.log('🚀 Testing Report Generators with ABSOLUTE PATHS...\n');
  
  const sampleReport: CorrectionReport = {
    timestamp: new Date().toISOString(),
    summary: { 
      totalErrors: 3, 
      critical: 2,    
      high: 1,        
      medium: 0,      
      low: 0,         
      byCategory: {   
        compilation: 1,
        security: 2
      }
    },
    corrections: [
      {
        id: 'test-1',
        file: 'src/app/components/UserProfile.tsx',
        line: 15,
        message: 'Test critical error - missing import',
        severity: 'critical',
        category: 'compilation',
        type: 'import_error',
        code: `import { User } from './types';`,
        fix: `import { User } from '@/types/User';`
      },
      {
        id: 'test-2', 
        file: 'src/app/api/auth.ts',
        line: 42,
        message: 'Security issue - hardcoded secret',
        severity: 'high',
        category: 'security',
        type: 'sensitive_data',
        code: `const API_KEY = "sk_live_123456789";`,
        fix: `const API_KEY = process.env.API_KEY;`
      }
    ],
    securityIssues: [
      {
        id: 'sec-1',
        category: 'security',
        file: 'src/app/api/auth.ts',
        line: 42,
        message: 'Hardcoded API key detected',
        severity: 'critical',
        type: 'sensitive_data',
        code: `const API_KEY = "sk_live_123456789";`,
        fix: `const API_KEY = process.env.API_KEY;`
      }
    ],
    typeHierarchies: new Map(),
    fileAssociations: new Map(),
    circularDependencies: []
  };

  try {
    console.log('📊 Generating security report...');
    const securityReport = ReportGenerators.generateSecurityReport(sampleReport);
    
    console.log('📊 Generating critical errors report...');
    const criticalReport = ReportGenerators.generateCriticalErrorsReport(sampleReport);
    
    console.log('📊 Generating structural report...');
    const structuralReport = ReportGenerators.generateStructuralReport(sampleReport);
    
    const fs = await import('fs');
    const path = await import('path');
    
    // Save to corrections folder
    await fs.promises.writeFile('corrections/security-absolute-test.md', securityReport);
    await fs.promises.writeFile('corrections/critical-absolute-test.md', criticalReport);
    await fs.promises.writeFile('corrections/structural-absolute-test.md', structuralReport);
    
    console.log('✅ All test reports saved to corrections/ folder!');
    console.log('📁 Files created:');
    console.log('   - security-absolute-test.md');
    console.log('   - critical-absolute-test.md');
    console.log('   - structural-absolute-test.md');
    
  } catch (caughtError) {
    if (caughtError instanceof Error) {
      console.error('❌ Error with absolute paths:', caughtError.message);
    } else {
      console.error('❌ Error with absolute paths:', String(caughtError));
    }
    console.log('\n💡 Make sure your tsconfig.json has path mapping for @/*');
  }
}

quickTest().catch(caughtError => {
  if (caughtError instanceof Error) {
    console.error('❌ Unhandled error:', caughtError.message);
  } else {
    console.error('❌ Unhandled error:', String(caughtError));
  }
  process.exit(1);
});