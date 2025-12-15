// run-circular-detector.ts
import { CircularDependencyDetector } from '@/app/generators/corrections/CircularDependencyDetector';
import { generateRoadmaps } from '@/app/scripts/generateRoadmaps';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Starting Circular Dependency Detection\n');
  
  try {
    // 1. Get project structure
    console.log('📊 Analyzing project structure...');
    const roadmapResult = await generateRoadmaps(
      "Circular Dependency Analysis",
      "./analysis-reports"
    );
    
    // Extract the projectStructure from the result
    // Based on the error, it looks like generateRoadmaps returns an object with projectStructure property
    const projectStructure = roadmapResult.projectStructure;
    
    if (!projectStructure) {
      throw new Error('Could not extract project structure from roadmap generation');
    }
    
    // 2. Run detector
    const detector = new CircularDependencyDetector();
    const report = await detector.detectCircularDependencies(projectStructure);
    
    // 3. Generate reports
    console.log('\n📝 Generating reports...');
    
    // Human readable report
    const humanReport = detector.generateHumanReadableReport(report);
    fs.writeFileSync(
      path.join(process.cwd(), 'circular-dependencies-report.md'),
      humanReport
    );
    
    // JSON report
    const jsonReport = detector.generateJSONReport(report);
    fs.writeFileSync(
      path.join(process.cwd(), 'circular-dependencies.json'),
      jsonReport
    );
    
    console.log('✅ Reports generated:');
    console.log('   📄 circular-dependencies-report.md');
    console.log('   📄 circular-dependencies.json');
    
    // 4. Show quick summary
    console.log('\n🎯 QUICK SUMMARY');
    console.log('────────────────');
    console.log(`Total Issues: ${report.summary.total}`);
    console.log(`Critical: ${report.summary.bySeverity.critical || 0}`);
    console.log(`High: ${report.summary.bySeverity.high || 0}`);
    console.log(`Medium: ${report.summary.bySeverity.medium || 0}`);
    console.log(`Low: ${report.summary.bySeverity.low || 0}`);
    
    if (report.quickFixes.length > 0) {
      console.log('\n🔧 START WITH THESE QUICK FIXES:');
      report.quickFixes.slice(0, 3).forEach((fix, index) => {
        console.log(`${index + 1}. ${fix.action}`);
        console.log(`   ⏱️  ${fix.estimatedTime}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error running circular dependency detection:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main };