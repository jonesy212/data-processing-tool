// combinedRoadmap.ts
// services/combinedRoadmap.ts
import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';
import { RoadmapAudience, RoadmapNode } from '@/app/typings/roadmap';
import { generateOutline } from '@/cli/roadmapOutline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      if (answer.trim().toLowerCase() === 'q') {
        console.log('❌ Process quit by user.');
        rl.close();
        process.exit(0);
      }
      resolve(answer);
    });
  });
}

/**
 * Handles combined roadmap preview and saving
 */
export async function handleCombinedRoadmap<T>(
  outlines: Record<RoadmapAudience, RoadmapNode<T>[]>,
  audiences: RoadmapAudience[]
) {
  const combineInput = await prompt("Combine generated roadmaps into a single file? (y/n): ");
  if (combineInput.toLowerCase() !== 'y') return;

  // Optional preview
  const previewInput = await prompt("Preview combined roadmap in console? (y/n): ");
  if (previewInput.toLowerCase() === 'y') {
    for (const aud of audiences) {
      console.log(`\n--- ${aud.toUpperCase()} OUTLINE ---\n`);
      console.log(generateOutline(outlines[aud], aud));
      console.log(`\n--- END OF ${aud.toUpperCase()} OUTLINE ---\n`);
    }
  }

  // Saving
  const combinedFolder = await prompt("Enter folder path for combined roadmap (default ./downloads): ");
  const combinedFilename = await prompt("Enter filename for combined roadmap (default combined-roadmap.json): ");
  const finalFolder = combinedFolder || './downloads';
  const finalFilename = combinedFilename || 'combined-roadmap.json';
  const combinedPath = path.join(finalFolder, finalFilename);

  if (!fs.existsSync(finalFolder)) fs.mkdirSync(finalFolder, { recursive: true });

  // Overwrite protection
  if (fs.existsSync(combinedPath)) {
    const overwrite = await prompt(`${finalFilename} exists. Overwrite? (y/n): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log("Skipped combined roadmap.");
      return;
    }
  }

  const combinedContent = audiences.reduce((acc, aud) => {
    acc[aud] = outlines[aud];
    return acc;
  }, {} as Record<RoadmapAudience, RoadmapNode<T>[]>);

  fs.writeFileSync(combinedPath, JSON.stringify(combinedContent, null, 2));
  console.log(`Saved combined roadmap to ${combinedPath}`);
}
