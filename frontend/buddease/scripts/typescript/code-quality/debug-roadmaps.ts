// debug-roadmaps.ts
import { generateRoadmaps } from '@/core/scripts/generateRoadmaps';
import type { ProjectStructure } from '@/core/scripts/generateRoadmaps';
import fs from 'fs';
import path from 'path';

// Define the return type based on what generateRoadmaps returns
interface GenerateRoadmapsResult {
  devFile: string;
  nonTechFile: string;
  projectStructure: ProjectStructure; // Use the actual ProjectStructure type
}

async function debugGenerateRoadmaps() {
  console.log('🔍 Debugging generateRoadmaps...\n');
  
  try {
    const result = await generateRoadmaps("Test", "./test-debug") as GenerateRoadmapsResult;
    
    console.log('📊 generateRoadmaps returns:', JSON.stringify(result, null, 2));
    console.log('\n📊 Type of result:', typeof result);
    console.log('📊 Is object?', typeof result === 'object' && result !== null);
    
    if (typeof result === 'object' && result !== null) {
      console.log('📊 Keys:', Object.keys(result));
      
      // Check nested structure
      for (const key in result) {
        const typedKey = key as keyof GenerateRoadmapsResult;
        console.log(`\n📊 ${key}:`);
        console.log(`   Type: ${typeof result[typedKey]}`);
        
        if (typeof result[typedKey] === 'object' && result[typedKey] !== null) {
          const value = result[typedKey];
          if (Array.isArray(value)) {
            console.log(`   Is Array: Yes, length: ${value.length}`);
            if (value.length > 0 && typeof value[0] === 'object') {
              console.log(`   First item keys:`, Object.keys(value[0]));
            }
          } else if (key === 'projectStructure') {
            // Special handling for projectStructure
            const projectStructure = value as ProjectStructure;
            console.log(`   ⭐ ProjectStructure found!`);
            console.log(`   - interfaces: ${projectStructure.interfaces.length}`);
            console.log(`   - components: ${projectStructure.components.length}`);
            console.log(`   - apis: ${projectStructure.apis.length}`);
            console.log(`   - totalFiles: ${projectStructure.totalFiles}`);
          } else {
            console.log(`   Keys:`, Object.keys(value));
          }
        }
      }
    }
    
    // Also save to file for inspection
    const debugPath = path.join(process.cwd(), 'debug-roadmaps-output.json');
    fs.writeFileSync(debugPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Full output saved to: ${debugPath}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  debugGenerateRoadmaps();
}

export { debugGenerateRoadmaps };