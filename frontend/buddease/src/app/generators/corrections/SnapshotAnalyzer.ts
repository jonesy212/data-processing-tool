// SnapshotAnalyzer.ts
export class SnapshotAnalyzer {
  private snapshotFolderPath: string;

  constructor(snapshotPath: string = '/src/app/snapshots') {
    this.snapshotFolderPath = path.resolve(process.cwd(), snapshotPath);
  }

  async analyzeSnapshotIssues(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    
    if (!fs.existsSync(this.snapshotFolderPath)) {
      console.warn(`Snapshot folder not found: ${this.snapshotFolderPath}`);
      return corrections;
    }

    console.log(`🔍 Analyzing snapshot folder: ${this.snapshotFolderPath}`);

    // Check for common snapshot issues
    corrections.push(...await this.findMissingImports());
    corrections.push(...await this.findTypeMismatches());
    corrections.push(...await this.findSerializationIssues());
    corrections.push(...await this.findDataModelProblems());

    return corrections;
  }

  private async findMissingImports(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const files = this.getTypeScriptFiles(this.snapshotFolderPath);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for common import patterns that might be missing
      const importRegex = /from\s+['"]([^'"]+)['"]/g;
      let match;

      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Check if it's a relative import that might not exist
        if (importPath.startsWith('.')) {
          const fullPath = path.resolve(path.dirname(file), importPath);
          const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts'];
          
          let found = false;
          for (const ext of possibleExtensions) {
            if (fs.existsSync(fullPath + ext) || fs.existsSync(fullPath)) {
              found = true;
              break;
            }
          }

          if (!found) {
            corrections.push({
              id: `missing-import-${path.basename(file)}`,
              type: 'error',
              severity: 'critical',
              file: file,
              message: `Cannot find module '${importPath}'`,
              code: `import ... from '${importPath}';`,
              fix: `Check the import path and ensure the file exists, or install missing dependency`,
              category: 'compilation'
            });
          }
        }
      }
    }

    return corrections;
  }

  private async findTypeMismatches(): Promise<Correction[]> {
    const corrections: Correction[] = [];
    const files = this.getTypeScriptFiles(this.snapshotFolderPath);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Look for type assertions that might be problematic
      const typeAssertionRegex = /as\s+([a-zA-Z_$][\w$]*)/g;
      let match;

      while ((match = typeAssertionRegex.exec(content)) !== null) {
        const typeName = match[1];
        
        // Check if this type is defined in the project
        // This would need access to the full type graph
        corrections.push({
          id: `type-assertion-${path.basename(file)}`,
          type: 'warning',
          severity: 'high',
          file: file,
          message: `Type assertion to '${typeName}' - verify this type exists`,
          code: `... as ${typeName}`,
          fix: `Ensure '${typeName}' is properly defined and imported`,
          category: 'structure'
        });
      }
    }

    return corrections;
  }

  private getTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getTypeScriptFiles(fullPath));
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory: ${dir}`, error);
    }
    
    return files;
  }
}