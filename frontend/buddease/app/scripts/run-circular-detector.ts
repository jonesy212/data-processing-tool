// run-circular-detector.ts
import { CircularDependencyDetector } from '@/app/generators/corrections/CircularDependencyDetector';
import { generateRoadmaps } from '@/app/scripts/generateRoadmaps';
import { EnhancedFixStrategy } from '@/app/error-analyzer/fix-strategy';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Starting Comprehensive Circular Dependency Detection\n');
  
  try {
    // STRATEGY 1: Project Structure Analysis
    console.log('📊 Strategy 1: Analyzing project structure...');
    const roadmapResult = await generateRoadmaps(
      "Comprehensive Circular Dependency Analysis",
      "./analysis-reports"
    );
    
    const projectStructure = roadmapResult.projectStructure;
    
    if (!projectStructure) {
      console.log('⚠️ Could not extract project structure, trying alternative methods...');
    }
    
    // STRATEGY 2: TypeScript Error Analysis (from fix-strategy)
    console.log('\n🔍 Strategy 2: Running TypeScript deep analysis...');
    const fixStrategy = new EnhancedFixStrategy();
    const tsAnalysis = await fixStrategy.analyzeTypeScriptErrors();
    
    // STRATEGY 3: File-based circular dependency detection
    console.log('\n📁 Strategy 3: Scanning source files for circular patterns...');
    const fileBasedCycles = await scanFilesForCircularPatterns();
    
    // Combine all results
    console.log('\n🔗 Combining detection results...');
    
    let allCycles: Array<{
      strategy: string;
      cycles: string[][];
      files: string[][];
      severity: string;
    }> = [];
    
    // Run CircularDependencyDetector if we have project structure
    if (projectStructure) {
      const detector = new CircularDependencyDetector();
      const detectorReport = await detector.detectCircularDependencies(projectStructure);
      
      // Extract cycles from the detector
      const detectorCycles = this.extractCyclesFromDetectorReport(detectorReport);
      allCycles.push({
        strategy: 'project-structure',
        cycles: detectorCycles.cycles,
        files: detectorCycles.files,
        severity: 'high'
      });
    }
    
    // Extract cycles from TypeScript analysis
    const tsCycles = extractCyclesFromTSErrors(tsAnalysis);
    allCycles.push({
      strategy: 'typescript-compiler',
      cycles: tsCycles.cycles,
      files: tsCycles.files,
      severity: 'critical' // Direct from compiler = most important
    });
    
    // Add file-based cycles
    allCycles.push({
      strategy: 'file-scan',
      cycles: fileBasedCycles.cycles,
      files: fileBasedCycles.files,
      severity: 'medium'
    });
    
    // Merge and deduplicate all cycles
    const mergedReport = mergeAllCycles(allCycles);
    
    // Generate comprehensive reports
    console.log('\n📝 Generating comprehensive reports...');
    generateComprehensiveReports(mergedReport, allCycles);
    
    // Show summary
    console.log('\n🎯 COMPREHENSIVE SUMMARY');
    console.log('────────────────────────');
    console.log(`Total Unique Cycles: ${mergedReport.totalCycles}`);
    console.log(`Critical (Compiler): ${mergedReport.bySeverity.critical}`);
    console.log(`High (Structure): ${mergedReport.bySeverity.high}`);
    console.log(`Medium (File Scan): ${mergedReport.bySeverity.medium}`);
    
    console.log('\n🔍 Detection Strategies Used:');
    allCycles.forEach(strategy => {
      console.log(`  ${strategy.strategy}: ${strategy.cycles.length} cycles`);
    });
    
    // Generate actionable fix plan
    generateActionableFixPlan(mergedReport);
    
  } catch (error) {
    console.error('❌ Error in comprehensive detection:', error);
    
    // Even if one strategy fails, try others
    console.log('\n🔄 Falling back to file-based detection...');
    await runFallbackDetection();
  }
}

// Helper function to scan files for circular patterns
async function scanFilesForCircularPatterns(): Promise<{
  cycles: string[][];
  files: string[][];
}> {
  const cycles: string[][] = [];
  const files: string[][] = [];
  
  // Get all TypeScript files
  const tsFiles = getAllTypeScriptFiles(process.cwd());
  
  console.log(`📁 Scanning ${tsFiles.length} TypeScript files...`);
  
  for (const file of tsFiles) {
    try {
      const content = await fs.promises.readFile(file, 'utf8');
      const fileCycles = analyzeFileForCircularPatterns(file, content);
      
      if (fileCycles.length > 0) {
        cycles.push(...fileCycles);
        
        // Create file arrays for each cycle
        fileCycles.forEach(cycle => {
          const cycleFiles = cycle.map(type => findFileForType(type) || file);
          files.push(cycleFiles);
        });
      }
    } catch (error) {
      console.warn(`⚠️ Could not analyze ${file}:`, error.message);
    }
  }
  
  return { cycles, files };
}

// Helper to analyze a single file for circular patterns
function analyzeFileForCircularPatterns(filePath: string, content: string): string[][] {
  const cycles: string[][] = [];
  const lines = content.split('\n');
  
  const typeDefinitions = new Map<string, { line: number; type: string }>();
  
  // First pass: collect all type definitions
  lines.forEach((line, index) => {
    // Match interface definitions
    const interfaceMatch = line.match(/(interface|type|class)\s+(\w+)/);
    if (interfaceMatch) {
      const [, typeKeyword, typeName] = interfaceMatch;
      typeDefinitions.set(typeName, { line: index + 1, type: typeKeyword });
    }
  });
  
  // Second pass: check for circular references
  typeDefinitions.forEach((def, typeName) => {
    const circularRefs: string[] = [];
    
    // Check if this type references other types in the file
    const references = findTypeReferences(content, typeName);
    
    // Look for mutual references
    references.forEach(refType => {
      if (typeDefinitions.has(refType)) {
        // Check if the referenced type also references back to this type
        const refContent = content;
        const refReferences = findTypeReferences(refContent, refType);
        
        if (refReferences.includes(typeName)) {
          // Found a circular reference within the same file
          if (!cycles.some(cycle => 
            cycle.includes(typeName) && cycle.includes(refType))) {
            cycles.push([typeName, refType]);
          }
        }
      }
    });
    
    // Check for self-references
    const selfRefPattern = new RegExp(`\\b${typeName}\\s*[=:<]\\s*.*\\b${typeName}\\b`);
    if (selfRefPattern.test(content)) {
      cycles.push([typeName]);
    }
  });
  
  return cycles;
}

// Helper to find all references to a type in content
function findTypeReferences(content: string, typeName: string): string[] {
  const references: string[] = [];
  
  // Pattern to find type references (excluding the definition itself)
  const refPattern = new RegExp(`\\b(?!interface|type|class)\\s*${typeName}\\b`, 'g');
  
  // Also look in generic parameters and property types
  const patterns = [
    new RegExp(`:\\s*${typeName}\\b`), // property: TypeName
    new RegExp(`<.*${typeName}.*>`),   // GenericType<TypeName>
    new RegExp(`extends\\s+${typeName}\\b`), // extends TypeName
    new RegExp(`implements\\s+${typeName}\\b`) // implements TypeName
  ];
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      references.push(typeName);
    }
  });
  
  return [...new Set(references)];
}

// Helper to get all TypeScript files
function getAllTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  
  function scan(currentDir: string) {
    try {
      const items = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item.name);
        
        if (item.isDirectory()) {
          // Skip common directories
          if (!item.name.includes('node_modules') && 
              !item.name.startsWith('.') && 
              item.name !== 'dist' && 
              item.name !== 'build') {
            scan(fullPath);
          }
        } else if (item.isFile() && 
                  (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not scan ${currentDir}:`, error.message);
    }
  }
  
  scan(dir);
  return files;
}

// Run the enhanced detector
if (require.main === module) {
  main();
}

export { main };