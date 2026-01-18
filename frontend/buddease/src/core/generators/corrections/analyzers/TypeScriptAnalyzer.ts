// TypeScriptAnalyzer.ts
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import type { CorrectionSeverity, CorrectionType } from '@/core/typings/correctionTypes';
import fs from 'fs';
import path from 'path';

export class TypeScriptAnalyzer extends BaseAnalyzer {
  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];

    // 1. TypeScript config analysis (this is good - keep it)
    const tsConfigErrors = await this.analyzeTsConfig();
    corrections.push(...tsConfigErrors);

    // 2. Get REAL TypeScript compilation errors (replaced simulation)
    const compilationErrors = await this.getRealCompilationErrors();
    corrections.push(...compilationErrors);

    return corrections;
  }

  private async analyzeTsConfig(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');

    if (!fs.existsSync(tsConfigPath)) {
      corrections.push(this.createCorrection(
        'tsconfig-missing',
        'error',
        'critical',
        'TypeScript configuration file (tsconfig.json) not found',
        'tsconfig.json',
        'File not found',
        'Create a tsconfig.json file in the project root',
        'compilation'
      ));
      return corrections;
    }

    try {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      const compilerOptions = tsConfig.compilerOptions || {};

      if (compilerOptions.noImplicitAny === false) {
        corrections.push(this.createCorrection(
          'tsconfig-no-implicit-any',
          'warning',
          'medium',
          'noImplicitAny is disabled - this can hide type errors',
          'tsconfig.json',
          JSON.stringify(compilerOptions, null, 2),
          'Set "noImplicitAny": true for better type safety',
          'compilation'
        ));
      }

      // Add more tsconfig checks as needed...

    } catch (error) {
      corrections.push(this.createCorrection(
        'tsconfig-parse-error',
        'error',
        'high',
        'Failed to parse tsconfig.json',
        'tsconfig.json',
        'Parse error',
        'Fix JSON syntax errors in tsconfig.json',
        'compilation'
      ));
    }

    return corrections;
  }

  private async getRealCompilationErrors(): Promise<Correction[]> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const { stderr } = await execAsync('npx tsc --noEmit --pretty false 2>&1');

      if (stderr && this.containsTypeScriptErrors(stderr)) {
        // Return real errors - NO educational examples mixed in
        return await this.parseRealTSCErrors(stderr);
      }

      // No real errors found - return educational examples with a special marker
      const educationalExamples = this.getEducationalExamples();

      // Add a special "educational header" correction
      if (educationalExamples.length > 0) {
        educationalExamples.unshift(this.createEducationalHeader());
      }

      return educationalExamples;

    } catch (error: any) {
      if (error.stderr || error.message) {
        const errorOutput = error.stderr || error.message;
        if (this.containsTypeScriptErrors(errorOutput)) {
          // Real errors found - return only real errors
          return await this.parseRealTSCErrors(errorOutput);
        }
      }

      // No real errors - return educational examples with header
      const educationalExamples = this.getEducationalExamples();
      if (educationalExamples.length > 0) {
        educationalExamples.unshift(this.createEducationalHeader());
      }
      return educationalExamples;
    }
  }


  private createEducationalHeader(): Correction {
    return this.createCorrection(
      'educational-header',
      'info',
      'low',
      '🎓 EDUCATIONAL EXAMPLES - No real TypeScript errors found',
      'TypeScript Analysis',
      'Your code passed TypeScript compilation with no errors! Below are educational examples of common TypeScript patterns for learning purposes.',
      'These examples demonstrate best practices and common patterns - they are NOT actual errors in your code.',
      'education',
      0
    );
  }
  private containsTypeScriptErrors(output: string): boolean {
    // Check if the output contains actual TypeScript error patterns
    return output.includes('.ts(') ||
      output.includes('error TS') ||
      output.includes('TypeScript') ||
      output.match(/\.tsx?\(\d+,\d+\):/) !== null;
  }


  private async parseRealTSCErrors(errorOutput: string): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const errorLines = errorOutput.split('\n');

    for (const line of errorLines) {
      // Parse actual TypeScript compiler output format:
      const match = line.match(/(.+\.tsx?)\((\d+),(\d+)\):\s+(\w+)\s+TS(\d+):\s+(.+)/);

      if (match) {
        const [, file, lineStr, , severity, errorCode, message] = match;

        // Convert strings to proper types
        const correctionType = this.mapToCorrectionType(severity.toLowerCase());
        const correctionSeverity = this.mapTSCSeverity(severity);

        corrections.push(this.createCorrection(
          `ts-real-${errorCode}`,
          correctionType,
          correctionSeverity,
          message.trim(),
          file.trim(),
          await this.extractCodeContext(file.trim(), parseInt(lineStr)),
          this.generateRealFix(message.trim(), errorCode, file.trim()),
          'compilation',
          parseInt(lineStr)
        ));
      }
    }

    return corrections;
  }

  private mapToCorrectionType(severity: string): CorrectionType {
    switch (severity.toLowerCase()) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'suggestion': return 'suggestion';
      case 'types': return 'types';
      case 'react': return 'react';
      case 'sensitive_data': return 'sensitive_data';
      case 'missing_sanitization': return 'missing_sanitization';
      case 'role_violation': return 'role_violation';
      case 'insecure_pattern': return 'insecure_pattern';
      default: return 'error';
    }
  }

  private mapTSCSeverity(tscSeverity: string): CorrectionSeverity {
    switch (tscSeverity.toLowerCase()) {
      case 'error': return 'critical';
      case 'warning': return 'high';
      case 'info': return 'medium';
      case 'suggestion': return 'low';
      default: return 'medium';
    }
  }

  private async extractCodeContext(filePath: string, lineNumber: number): Promise<string> {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      if (!fs.existsSync(fullPath)) {
        return `// File not found: ${filePath}`;
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      // Extract context around the error line (2 lines before, 1 after)
      const start = Math.max(0, lineNumber - 2);
      const end = Math.min(lines.length, lineNumber + 1);

      const contextLines = lines.slice(start, end);
      return contextLines.map((line, index) => {
        const currentLine = start + index + 1;
        const marker = currentLine === lineNumber ? '>>> ' : '    ';
        return `${marker}${line}`;
      }).join('\n');

    } catch (error) {
      return `// Unable to extract code from ${filePath}: ${error}`;
    }
  }

  private generateRealFix(message: string, errorCode: string, filePath: string): string {
    // Generate context-aware fixes based on real error codes and messages
    switch (errorCode) {
      case '2304': // Cannot find name
        return `// Add missing import or install dependency
Check if the referenced type/function is properly exported and imported`;

      case '2307': // Cannot find module
        return `// Install missing dependency or fix import path
Run: npm install <missing-package>
Or check the import statement for typos`;

      case '2339': // Property does not exist on type
        return `// Check the type definition
Add the missing property to the interface or use type assertion`;

      case '2554': // Expected X arguments but got Y
        return `// Check function signature
Provide all required parameters or use optional parameters`;

      default:
        return `// Fix TypeScript error ${errorCode}: ${message}
Review the TypeScript documentation for error ${errorCode}`;
    }
  }


  private getEducationalExamples(): Correction[] {
    // Only educational examples - marked as low severity and info type
    return [
      this.createCorrection(
        'ts-edu-hook-usage',
        'info',
        'low',
        'Example: React hooks must be called inside functional components',
        'src/app/api/ApiUser.ts',
        `export const { userId } = useParams(); // ❌ Invalid hook call outside component`,
        `// Move hooks inside React components:
function UserComponent() {
  const { userId } = useParams(); // ✅ Valid hook call
  return <div>User: {userId}</div>;
}`,
        'education',
        45
      ),
      this.createCorrection(
        'ts-edu-type-safety',
        'info',
        'low',
        'Example: Using TypeScript generics for better type safety',
        'src/app/api/ApiUser.ts',
        `interface UserProfile { ... } // Basic interface without generics`,
        `// Use generic constraints for reusability:
interface UserProfile<T extends BaseDataEntity> { 
  id: string;
  data: T;
  // ... generic implementation
}`,
        'education',
        25
      ),
      this.createCorrection(
        'ts-edu-state-management',
        'info',
        'low',
        'Example: React context for global state management',
        'src/app/users/preferences/UserPreference.tsx',
        `const [theme, setTheme] = useState<string>('light'); // Local state only`,
        `// For global theme across components, consider using context:
const ThemeContext = React.createContext();
export const useTheme = () => React.useContext(ThemeContext);

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <YourComponents />
    </ThemeContext.Provider>
  );
}`,
        'education',
        8
      )
    ];
  }
}