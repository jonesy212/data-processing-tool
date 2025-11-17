// PerformancePatternScanner.ts

import { Correction } from '@/app/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';
import { BaseAnalyzer } from '@/app/generators/corrections/analyzers/BaseAnalyzer';

export class PerformancePatternScanner extends BaseAnalyzer {
  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    // Scan for performance issues in source code
    const srcDir = path.resolve(process.cwd(), 'src');
    if (fs.existsSync(srcDir)) {
      const performancePatterns = this.scanForPerformancePatterns(srcDir);
      corrections.push(...performancePatterns);
    }

    // Scan root directory files as well
    const rootFiles = this.getSourceFiles(process.cwd());
    const rootPerformancePatterns = this.scanFilesForPerformance(rootFiles);
    corrections.push(...rootPerformancePatterns);

    // Check for project-level performance issues
    const projectLevelIssues = this.checkProjectLevelPerformance();
    corrections.push(...projectLevelIssues);

    return corrections;
  }

  public analyzePerformanceIssues(): Correction[] { 
    return this.analyzePerformanceIssuesPrivate()
  }
  
  private analyzePerformanceIssuesPrivate(): Correction[] {
    const corrections: Correction[] = [];
    
    // Get React Native source files
     const sourceFiles = this.getAllReactNativeSourceFiles();
  
  sourceFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const fileCorrections = this.analyzeFileForPerformanceIssues(content, file);
      corrections.push(...fileCorrections);
    } catch (error) {
      console.warn(`Could not analyze file for performance: ${file}`, error);
    }
  });

  return corrections;
}

private getAllReactNativeSourceFiles(): string[] {
  const files: string[] = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  const scanDirectory = (dir: string) => {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules and other non-source directories
          if (!['node_modules', 'dist', 'build', '.git', '.next'].includes(item)) {
            scanDirectory(fullPath);
          }
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory: ${dir}`, error);
    }
  };

  scanDirectory(process.cwd());
  return files;
}

private analyzeFileForPerformanceIssues(content: string, filePath: string): Correction[] {
  const corrections: Correction[] = [];
  const lines = content.split('\n');

  // Performance anti-patterns to detect
  const performancePatterns = [
    {
      pattern: /console\.(log|warn|error|debug)\(/g,
      id: 'console-in-production',
      message: 'Console statement in production code',
      severity: 'low' as const,
      suggestion: 'Remove console statements or use __DEV__ check: if (__DEV__) console.log(...)'
    },
    {
      pattern: /render.*=.*\(\)\s*=>\s*{/g,
      id: 'inline-render-function',
      message: 'Inline render function definition',
      severity: 'medium' as const,
      suggestion: 'Define render functions as class methods or use useCallback for functional components'
    },
    {
      pattern: /style={{\s*[^}]*\s*}}/g,
      id: 'inline-styles',
      message: 'Inline style object creation',
      severity: 'medium' as const,
      suggestion: 'Extract styles to StyleSheet.create or use styled components'
    },
    {
      pattern: /<View>.*<View>.*<View>.*<View>/g,
      id: 'deep-view-nesting',
      message: 'Deep view nesting detected',
      severity: 'medium' as const,
      suggestion: 'Flatten view hierarchy to improve rendering performance'
    },
    {
      pattern: /ScrollView.*renderItem|FlatList.*keyExtractor.*=.*\(\)\s*=>/g,
      id: 'inline-key-extractor',
      message: 'Inline keyExtractor function',
      severity: 'high' as const,
      suggestion: 'Define keyExtractor outside render to prevent unnecessary re-renders'
    },
    {
      pattern: /useEffect\(\(\)\s*=>\s*{[\s\S]*?},\s*\[\s*\]\s*\)/g,
      id: 'empty-use-effect-deps',
      message: 'useEffect with empty dependency array',
      severity: 'low' as const,
      suggestion: 'Consider if dependencies are needed or if this should run only once'
    },
    {
      pattern: /JSON\.parse\(JSON\.stringify\(/g,
      id: 'json-parse-stringify',
      message: 'Using JSON.parse(JSON.stringify()) for deep cloning',
      severity: 'medium' as const,
      suggestion: 'Use structuredClone() or libraries like lodash.cloneDeep for better performance'
    },
    {
      pattern: /\.map\(.*=>\s*<[^>]*\s*key=\{index\}/g,
      id: 'index-as-key',
      message: 'Using array index as React key',
      severity: 'medium' as const,
      suggestion: 'Use unique stable IDs instead of array indices for keys'
    },
    {
      pattern: /setState\(.*prevState.*=>/g,
      id: 'functional-setstate',
      message: 'Functional setState usage',
      severity: 'low' as const,
      suggestion: 'Ensure functional setState is used correctly for state updates'
    },
    {
      pattern: /require\(.*\.(png|jpg|jpeg|gif|svg)\)/g,
      id: 'inline-asset-require',
      message: 'Inline asset require in render',
      severity: 'medium' as const,
      suggestion: 'Move asset requires outside component or use import statements'
    },
    {
      pattern: /Animated\.timing.*useNativeDriver:\s*false/g,
      id: 'native-driver-disabled',
      message: 'Native driver disabled for animations',
      severity: 'medium' as const,
      suggestion: 'Enable useNativeDriver: true for better animation performance when possible'
    },
    {
      pattern: /onScroll={\(\)\s*=>/g,
      id: 'inline-scroll-handler',
      message: 'Inline scroll event handler',
      severity: 'high' as const,
      suggestion: 'Throttle scroll handlers and define them outside render with useCallback'
    },
    {
      pattern: /TextInput.*onChangeText={\(\)\s*=>/g,
      id: 'inline-textinput-handler',
      message: 'Inline TextInput change handler',
      severity: 'medium' as const,
      suggestion: 'Debounce TextInput handlers and define with useCallback'
    }
  ];

  lines.forEach((line, lineNumber) => {
    performancePatterns.forEach(pattern => {
      const matches = line.match(pattern.pattern);
      if (matches) {
        corrections.push(this.createCorrection(
          pattern.id,
          'suggestion',
          pattern.severity,
          pattern.message,
          filePath,
          line.trim(),
          pattern.suggestion,
          'performance',
          lineNumber + 1
        ));
      }
    });

    // Additional complex pattern checks
    this.checkForExpensiveOperations(line, lineNumber, filePath, corrections);
    this.checkForMemoryLeaks(line, lineNumber, filePath, corrections);
  });

  return corrections;
}

private checkForExpensiveOperations(line: string, lineNumber: number, filePath: string, corrections: Correction[]): void {
  // Check for expensive operations in render
  const expensiveOperations = [
    {
      pattern: /\.sort\(\)|\.filter\(\)|\.map\(\)\.map\(\)|\.reduce\(\)/g,
      id: 'expensive-array-operations',
      message: 'Expensive array operations in render',
      suggestion: 'Move expensive array operations outside render or use useMemo'
    },
    {
      pattern: /Object\.entries\(\)|Object\.keys\(\)|Object\.values\(\)/g,
      id: 'object-iteration-render',
      message: 'Object iteration in render',
      suggestion: 'Precompute object iterations or use useMemo'
    },
    {
      pattern: /new Date\(\)|Date\.now\(\)/g, 
      id: 'date-creation-render',
      message: 'Date creation in render',
      suggestion: 'Move date creation outside render or use constants'
    }
  ];

  expensiveOperations.forEach(op => {
    if (op.pattern.test(line)) {
      corrections.push(this.createCorrection(
        op.id,
        'warning',
        'medium',
        op.message,
        filePath,
        line.trim(),
        op.suggestion,
        'performance',
        lineNumber + 1
      ));
    }
  });
}

  private checkForMemoryLeaks(line: string, lineNumber: number, filePath: string, corrections: Correction[]): void {
    // Check for potential memory leaks
    const memoryLeakPatterns = [
      {
        pattern: /setInterval\(|setTimeout\(/g,
        id: 'timer-without-cleanup',
        message: 'Timer without cleanup',
        suggestion: 'Always clear timers in useEffect cleanup function'
      },
      {
        pattern: /addEventListener\(.*\)/g,
        id: 'event-listener-without-remove',
        message: 'Event listener without removal',
        suggestion: 'Remove event listeners in useEffect cleanup function'
      },
      {
        pattern: /new Image\(\)|Image\.src/g,
        id: 'image-loading-memory',
        message: 'Image loading without cleanup',
        suggestion: 'Cancel image loading on component unmount'
      }
    ];

    memoryLeakPatterns.forEach(pattern => {
      if (pattern.pattern.test(line)) {
        corrections.push(this.createCorrection(
          pattern.id,
          'warning',
          'medium',
          pattern.message,
          filePath,
          line.trim(),
          pattern.suggestion,
          'performance',
          lineNumber + 1
        ));
      }
    })
  };

  scanForPerformancePatterns(dir: string): Correction[] {
    const corrections: Correction[] = [];
    const files = this.getSourceFiles(dir);
    const fileCorrections = this.scanFilesForPerformance(files);
    corrections.push(...fileCorrections);
    return corrections;
  }

  private scanFilesForPerformance(files: string[]): Correction[] {
    const corrections: Correction[] = [];

    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileCorrections = this.analyzeFileForPerformance(content, file);
        corrections.push(...fileCorrections);
      } catch (error) {
        corrections.push(this.createCorrection(
          `file-read-error-${path.basename(file)}`,
          'error',
          'low',
          'Could not read file for performance analysis',
          file,
          `Error: ${error}`,
          'Check file permissions and try again',
          'performance'
        ));
      }
    });

    return corrections;
  }

  private analyzeFileForPerformance(content: string, filePath: string): Correction[] {
    const corrections: Correction[] = [];
    const fileName = path.basename(filePath);

    // Check for StyleSheet.create in loops
    if (content.includes('StyleSheet.create') && content.includes('.map(')) {
      corrections.push(this.createCorrection(
        `inline-styles-loop-${fileName}`,
        'warning',
        'medium',
        'Potential performance issue: StyleSheet.create in loop',
        filePath,
        'StyleSheet.create in mapping function',
        'Move StyleSheet.create outside of render methods and loops',
        'performance'
      ));
    }

    // Check for components that might have unnecessary re-renders
    if (
      content.includes('useState') &&
      content.includes('useEffect') &&
      !content.includes('React.memo') &&
      !content.includes('useMemo') &&
      !content.includes('useCallback')
    ) {
      corrections.push(this.createCorrection(
        `potential-rerender-${fileName}`,
        'suggestion',
        'low',
        'Component might have unnecessary re-renders',
        filePath,
        'State changes without optimization',
        'Consider using React.memo, useMemo, or useCallback to optimize re-renders',
        'performance'
      ));
    }

    // Check for FlatList without performance optimizations
    if (
      content.includes('FlatList') &&
      content.includes('data={') &&
      content.includes('renderItem') &&
      !content.includes('initialNumToRender')
    ) {
      corrections.push(this.createCorrection(
        `list-virtualization-${fileName}`,
        'suggestion',
        'medium',
        'Large list without virtualization optimization',
        filePath,
        'FlatList without performance props',
        'Add initialNumToRender, maxToRenderPerBatch, windowSize for better performance',
        'performance'
      ));
    }

    // Check for large images without optimization
    if (
      content.includes('<Image') &&
      content.includes('source=') &&
      !content.includes('resizeMode') &&
      !content.includes('resizeMethod')
    ) {
      corrections.push(this.createCorrection(
        `image-optimization-${fileName}`,
        'suggestion',
        'medium',
        'Image without resize mode specified',
        filePath,
        'Image component without resizeMode prop',
        'Add resizeMode prop (cover, contain, stretch, repeat, center) for better performance',
        'performance'
      ));
    }

    // Check for expensive computations in render
    const expensivePatterns = [
      /\.map\(.*=>.*\{[\s\S]*\.map/g, // Nested maps
      /\.filter\(.*=>.*\{[\s\S]*\.filter/g, // Nested filters
      /\.sort\(\)\.map/g, // Sort in render
      /JSON\.parse\(.*\)/g, // JSON parsing in render
      /\.split\(.*\)\.map/g // String splitting in render
    ];

    expensivePatterns.forEach((pattern, index) => {
      if (content.match(pattern)) {
        corrections.push(this.createCorrection(
          `expensive-computation-${index}-${fileName}`,
          'warning',
          'medium',
          'Expensive computation in render method',
          filePath,
          this.extractCodeSnippet(content, pattern),
          'Move expensive computations outside render or use useMemo',
          'performance'
        ));
      }
    });

    // Check for missing key props in lists
    const listWithoutKeyPattern = /\.map\s*\(\s*\([^)]*\)\s*=>\s*<[^>]*?(?<!key=)[^>]*>/g;
    if (content.match(listWithoutKeyPattern)) {
      corrections.push(this.createCorrection(
        `missing-key-list-${fileName}`,
        'warning',
        'high',
        'Missing key prop in list rendering',
        filePath,
        this.extractCodeSnippet(content, listWithoutKeyPattern),
        'Add unique key prop to list items for better rendering performance',
        'performance'
      ));
    }

    // Check for inline styles in loops
    const inlineStylePattern = /\.map\(.*=>.*style=\{/g;
    if (content.match(inlineStylePattern)) {
      corrections.push(this.createCorrection(
        `inline-styles-loop-${fileName}`,
        'warning',
        'medium',
        'Inline styles in loop',
        filePath,
        this.extractCodeSnippet(content, inlineStylePattern),
        'Define styles outside loop using StyleSheet.create',
        'performance'
      ));
    }

    // Check for missing shouldComponentUpdate or React.memo
    if (
      content.includes('class') &&
      content.includes('extends') &&
      content.includes('render(') &&
      !content.includes('shouldComponentUpdate') &&
      !content.includes('PureComponent')
    ) {
      corrections.push(this.createCorrection(
        `missing-should-update-${fileName}`,
        'suggestion',
        'low',
        'Class component without shouldComponentUpdate',
        filePath,
        'Class component might re-render unnecessarily',
        'Implement shouldComponentUpdate or extend PureComponent',
        'performance'
      ));
    }

    return corrections;
  }

  private checkProjectLevelPerformance(): Correction[] {
    const corrections: Correction[] = [];

    // Check bundle size indicators
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        // Check for large libraries
        const largeLibraries = ['moment', 'lodash', 'antd', 'react-native-paper'];
        largeLibraries.forEach(lib => {
          if (deps[lib]) {
            corrections.push(this.createCorrection(
              `large-library-${lib}`,
              'suggestion',
              'low',
              `Large library detected: ${lib}`,
              'package.json',
              `Dependency: ${lib}`,
              `Consider using lighter alternatives or tree-shaking for ${lib}`,
              'performance'
            ));
          }
        });

        // Check for multiple icon libraries
        const iconLibraries = ['react-native-vector-icons', '@expo/vector-icons', 'react-native-icons'];
        const foundIconLibraries = iconLibraries.filter(lib => deps[lib]);
        if (foundIconLibraries.length > 1) {
          corrections.push(this.createCorrection(
            'multiple-icon-libraries',
            'warning',
            'medium',
            'Multiple icon libraries detected',
            'package.json',
            `Found: ${foundIconLibraries.join(', ')}`,
            'Use a single icon library to reduce bundle size',
            'performance'
          ));
        }
      } catch {
        // Ignore package.json parse errors
      }
    }

    return corrections;
  }

  private getSourceFiles(dir: string): string[] {
    const files: string[] = [];

    try {
      const items = fs.readdirSync(dir);

      items.forEach(item => {
        const fullPath = path.join(dir, item);
        
        try {
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Skip common directories that don't contain source code
            if (!['node_modules', '.git', 'build', 'dist', 'coverage'].includes(item)) {
              files.push(...this.getSourceFiles(fullPath));
            }
          } else if (
            item.endsWith('.ts') ||
            item.endsWith('.tsx') ||
            item.endsWith('.js') ||
            item.endsWith('.jsx')
          ) {
            files.push(fullPath);
          }
        } catch {
          // Skip files that can't be accessed
        }
      });
    } catch (error) {
      // Ignore directory read errors
    }

    return files;
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
}