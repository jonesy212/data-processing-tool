// analyzers/CSSAnalyzer.ts
import { BaseAnalyzer } from './BaseAnalyzer';
import type { Correction } from '@/core/generators/corrections/CorrectionGenerator';
import * as fs from 'fs/promises';
import * as path from 'path';

export class CSSAnalyzer extends BaseAnalyzer {
  name = 'css-coverage';
  filePatterns = ['**/*.tsx', '**/*.jsx'];
  cssExtensions = ['.css', '.scss', '.sass', '.less', '.module.css', '.module.scss'];

  async analyze(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const files = await this.getFiles(this.filePatterns);
    
    const cssStats = {
      totalFiles: files.length,
      filesWithCSS: 0,
      filesWithoutCSS: 0,
      coverageByFolder: new Map<string, { total: number; covered: number }>(),
      filesWithoutCSSList: [] as string[]
    };

    for (const file of files) {
      const hasCSS = await this.checkForCSSFile(file);
      const folder = path.dirname(file);
      
      // Update folder statistics
      const folderStats = cssStats.coverageByFolder.get(folder) || { total: 0, covered: 0 };
      folderStats.total++;
      if (hasCSS) folderStats.covered++;
      cssStats.coverageByFolder.set(folder, folderStats);

      if (hasCSS) {
        cssStats.filesWithCSS++;
      } else {
        cssStats.filesWithoutCSS++;
        cssStats.filesWithoutCSSList.push(file);
        
        // Create correction suggestion
        if (await this.shouldHaveCSS(file)) {
          corrections.push(this.createCSSCorrection(file));
        }
      }
    }

    // Add summary correction
    corrections.unshift(this.createSummaryCorrection(cssStats));
    
    return corrections;
  }

  private async checkForCSSFile(file: string): Promise<boolean> {
    const basePath = file.replace(/\.(tsx|jsx)$/, '');
    const extensions = ['.css', '.scss', '.sass', '.less', '.module.css', '.module.scss'];
    
    for (const ext of extensions) {
      try {
        await fs.access(basePath + ext);
        return true;
      } catch {
        // Continue to next extension
      }
    }
    return false;
  }

  private async shouldHaveCSS(file: string): Promise<boolean> {
    try {
      const content = await fs.readFile(file, 'utf8');
      // Check for JSX/React elements that would benefit from styling
      const hasJSX = content.includes('return') && 
                     (content.includes('jsx') || content.includes('React.createElement') || 
                      content.includes('className=') || content.includes('style='));
      const isUtility = this.isUtilityFile(file, content);
      
      return hasJSX && !isUtility;
    } catch {
      return false;
    }
  }

  private isUtilityFile(file: string, content: string): boolean {
    // Utility files (no visual elements) should not have CSS
    if (file.includes('utils/') || file.includes('helpers/') || file.includes('api/')) {
      return true;
    }
    
    // Check if file only exports functions/hooks without JSX
    const hasExport = content.includes('export');
    const hasJSXReturn = content.includes('return') && 
                        (content.includes('<') || content.includes('React.createElement'));
    
    return hasExport && !hasJSXReturn;
  }

  private createCSSCorrection(file: string): Correction {
    const filename = path.basename(file, path.extname(file));
    const suggestedCSS = this.suggestCSSFilename(file);
    
    return this.createCorrection(
      `missing-css-${this.hashPath(file)}`,
      'suggestion' as CorrectionType,
      'low' as CorrectionSeverity,
      `Missing CSS file for component: ${filename}`,
      file,
      `// Component: ${filename}\n// Missing: ${suggestedCSS}`,
      `Create ${suggestedCSS} for component styling`,
      'css' as CorrectionCategory,
      1,
      `Component ${file} would benefit from a CSS file for styling`
    );
  }

  private createSummaryCorrection(stats: any): Correction {
    const coveragePercent = Math.round((stats.filesWithCSS / stats.totalFiles) * 100);
    const snippet = this.generateCoverageSnippet(stats);
    
    return this.createCorrection(
      'css-coverage-summary',
      'info' as CorrectionType,
      coveragePercent < 50 ? 'high' : coveragePercent < 80 ? 'medium' : 'low',
      `CSS Coverage: ${coveragePercent}% (${stats.filesWithCSS}/${stats.totalFiles})`,
      './',
      snippet,
      coveragePercent < 80 ? 'Add CSS files to improve coverage' : 'Good CSS coverage',
      'css' as CorrectionCategory
    );
  }

  private suggestCSSFilename(file: string): string {
    const baseName = path.basename(file, path.extname(file));
    const dir = path.dirname(file);
    return `${dir}/${baseName}.module.css`;
  }

  private generateCoverageSnippet(stats: any): string {
    let snippet = `// CSS Coverage Summary:\n`;
    snippet += `// Total Files: ${stats.totalFiles}\n`;
    snippet += `// With CSS: ${stats.filesWithCSS}\n`;
    snippet += `// Without CSS: ${stats.filesWithoutCSS}\n\n`;
    
    snippet += `// By Folder:\n`;
    for (const [folder, data] of stats.coverageByFolder) {
      const percent = Math.round((data.covered / data.total) * 100);
      snippet += `// ${folder}: ${percent}% (${data.covered}/${data.total})\n`;
    }
    
    return snippet;
  }

  private hashPath(filePath: string): string {
    return Buffer.from(filePath).toString('base64').slice(0, 10);
  }

  private extractCodeSnippet(content: string, pattern: RegExp | string, contextLines: number = 2): string {
    const lines = content.split('\n');
    const searchPattern = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const matchIndex = lines.findIndex(line => searchPattern.test(line));
    
    if (matchIndex === -1) return '// Pattern not found';
    
    const start = Math.max(0, matchIndex - contextLines);
    const end = Math.min(lines.length, matchIndex + contextLines + 1);
    
    return lines.slice(start, end).join('\n');
  }

  private getLineNumber(content: string, search: string): number {
    const lines = content.split('\n');
    const index = lines.findIndex(line => line.includes(search));
    return index === -1 ? 1 : index + 1;
  }
}