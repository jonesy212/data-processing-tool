// SourceFileErrorScanner.ts
import { BaseAnalyzer } from '@/core/generators/corrections/analyzers/BaseAnalyzer';
import { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

export class SourceFileErrorScanner extends BaseAnalyzer {
  
  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Source code error scanning across files
    console.log('🔍 Scanning source files for errors and patterns...');
    
    // Scan common source directories
    const sourceDirs = [
        'src',
        'app',
        'components',
        'screens',
        'utils',
        'hooks'
    ];
    
    for (const dir of sourceDirs) {
        const dirPath = path.resolve(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
            const dirCorrections = this.scanReactNativeSourceFiles(dirPath);
            corrections.push(...dirCorrections);
        }
    }
    
    // If no specific source directories found, scan the project root
    if (corrections.length === 0) {
        const rootCorrections = this.scanReactNativeSourceFiles(process.cwd());
        corrections.push(...rootCorrections);
    }
    
    console.log(`📝 Found ${corrections.length} source file issues`);
    return corrections;
  }

  scanReactNativeSourceFiles(dir: string): Correction[] {
    const corrections: Correction[] = [];

    try {
      const files = this.getSourceFiles(dir);

      for (const file of files) {
        if (this.isReactNativeSourceFile(file)) {
          try {
            const content = fs.readFileSync(file, 'utf8');
            const fileErrors = this.analyzeReactNativeSourceFile(content, file);
            corrections.push(...fileErrors);
          } catch (error) {
            console.warn(`Could not read file ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory ${dir}:`, error);
    }

    return corrections;
  }

  isReactNativeSourceFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    const isSourceFile = ['.js', '.jsx', '.ts', '.tsx'].includes(ext);

    if (!isSourceFile) return false;

    const excludedDirs = [
      'node_modules',
      '.git',
      'build',
      'dist',
      'coverage',
      '.nyc_output'
    ];

    const normalizedPath = path.normalize(filename);
    return !excludedDirs.some(dir => normalizedPath.includes(dir));
  }

  analyzeReactNativeSourceFile(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];

    const patterns = [
      {
        pattern: /require\(['"`]react-native\/Libraries\/Components\/TextInput\/TextInput/,
        id: 'direct-textinput-import',
        type: 'warning' as const,
        severity: 'medium' as const,
        title: 'Direct TextInput internal import detected',
        suggestion: 'Use import { TextInput } from "react-native" instead of internal imports',
        category: 'structure' as const
      },
      {
        pattern: /console\.(log|warn|error)\(/g,
        id: 'console-statement',
        type: 'suggestion' as const,
        severity: 'low' as const,
        title: 'Console statement found in production code',
        suggestion: 'Remove console statements or use a logging library for production',
        category: 'performance' as const
      },
      {
        pattern: /StyleSheet\.create\(\s*\{[^}]*\}/g,
        id: 'inline-stylesheet-create',
        type: 'warning' as const,
        severity: 'medium' as const,
        title: 'Inline StyleSheet.create call detected',
        suggestion: 'Move StyleSheet.create calls outside of render functions',
        category: 'performance' as const
      },
      {
        pattern: /<View.*style=\{.*\}/g,
        id: 'inline-style-object',
        type: 'warning' as const,
        severity: 'medium' as const,
        title: 'Inline style object detected',
        suggestion: 'Use StyleSheet.create for better performance',
        category: 'performance' as const
      },
      {
        pattern: /<Text>.*<\/Text>/g,
        id: 'text-without-styling',
        type: 'suggestion' as const,
        severity: 'low' as const,
        title: 'Text component without explicit styling',
        suggestion: 'Consider adding consistent text styling',
        category: 'structure' as const
      },
      {
        pattern: /import.*from.*['"`]\.\.\/\.\.\/\.\./g,
        id: 'deep-relative-import',
        type: 'warning' as const,
        severity: 'medium' as const,
        title: 'Deep relative import detected',
        suggestion: 'Use absolute imports or module aliases',
        category: 'structure' as const
      },
      {
        pattern: /setTimeout\(.*,\s*0\)/g,
        id: 'zero-timeout',
        type: 'warning' as const,
        severity: 'medium' as const,
        title: 'setTimeout with 0 delay detected',
        suggestion: 'Consider using requestAnimationFrame or InteractionManager',
        category: 'performance' as const
      },
      {
        pattern: /JSON\.parse\(.*\)/g,
        id: 'unsafe-json-parse',
        type: 'warning' as const,
        severity: 'medium' as const,
        title: 'Unsafe JSON.parse detected',
        suggestion: 'Wrap JSON.parse in try-catch block',
        category: 'runtime' as const
      },
      {
        pattern: /<ScrollView.*>\s*<View/g,
        id: 'scrollview-direct-view',
        type: 'suggestion' as const,
        severity: 'low' as const,
        title: 'View directly inside ScrollView',
        suggestion: 'Consider using contentContainerStyle prop for ScrollView',
        category: 'performance' as const
      },
      {
        pattern: /onPress=\{\(\)\s*=>\s*\{/g,
        id: 'inline-arrow-function',
        type: 'warning' as const,
        severity: 'medium' as const,
        title: 'Inline arrow function in prop',
        suggestion: 'Define handler functions outside render to prevent re-renders',
        category: 'performance' as const
      }
    ];

    patterns.forEach(({ pattern, id, type, severity, title, suggestion, category }) => {
      const matches = content.match(pattern);
      if (matches) {
        corrections.push(this.createCorrection(
          `${id}-${path.basename(filePath)}`,
          type,
          severity,
          title,
          filePath,
          this.extractCodeSnippet(content, pattern),
          suggestion,
          category
        ));
      }
    });

    if (content.includes('.map(') && content.includes('render') && !content.includes('key={')) {
      const listPattern = /\.map\(.*\{.*=>/g;
      if (content.match(listPattern)) {
        corrections.push(this.createCorrection(
          `missing-key-prop-${path.basename(filePath)}`,
          'error',
          'high',
          'Missing key prop in list rendering',
          filePath,
          this.extractCodeSnippet(content, listPattern),
          'Add unique key prop to each list item',
          'runtime'
        ));
      }
    }

    const unsafeOptionalChaining = content.match(/(\w+)\.\?\./g);
    if (unsafeOptionalChaining) {
      corrections.push(this.createCorrection(
        `unsafe-optional-chaining-${path.basename(filePath)}`,
        'warning',
        'medium',
        'Potential unsafe optional chaining usage',
        filePath,
        unsafeOptionalChaining[0],
        'Ensure optional chaining is used safely and handle null cases',
        'runtime'
      ));
    }

    return corrections;
  }

  private extractCodeSnippet(content: string, pattern: RegExp, contextLines: number = 3): string {
    const lines = content.split('\n');
    let snippet = '';

    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        const start = Math.max(0, i - contextLines);
        const end = Math.min(lines.length, i + contextLines + 1);
        snippet = lines.slice(start, end).join('\n');
        break;
      }
    }

    return snippet.substring(0, 500);
  }

  private getSourceFiles(dir: string): string[] {
    const files: string[] = [];

    try {
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...this.getSourceFiles(fullPath));
        } else if (
          item.endsWith('.ts') ||
          item.endsWith('.tsx') ||
          item.endsWith('.js') ||
          item.endsWith('.jsx')
        ) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      console.warn(`Could not read directory ${dir}:`, error);
    }

    return files;
  }

  protected getPriority(severity: string): number {
    const priorityMap = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };
    return priorityMap[severity as keyof typeof priorityMap] || 5;
  }
}