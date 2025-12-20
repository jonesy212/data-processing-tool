// roadmapCLI.ts
// services/roadmapCLI.ts
import * as fs from 'fs';
import * as path from 'path';
import readline from 'readline';
import { RoadmapService } from '@/app/services/roadmapService';
import { RoadmapAudience, RoadmapNode } from '@/app/typings/roadmap';
import { buildStakeholderRoadmap } from '@/app/services/stakeholderRoadmap';
import { handleCombinedRoadmap } from '@/cli/combinedRoadmap';
import { BaseDataEntity } from '@/app/config/BaseConfig';
import { AnalysisNode } from '@/app/typings/AnalysisNode';
import { generateOutline } from '@/cli/roadmapOutline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Utility for prompting the user with quit option
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

// Utility for printing a roadmap tree to console
function printRoadmap<T extends BaseDataEntity>(
  nodes: RoadmapNode<T>[],
  level = 0
) {
  const indent = '  '.repeat(level);
  for (const node of nodes) {
    console.log(`${indent}- ${node.name} [Phase: ${node.phase || 'unassigned'}]`);
    if (node.children) printRoadmap(node.children, level + 1);
  }
}

// Main CLI function
export async function runRoadmapCLI<T extends BaseDataEntity>(analysis: AnalysisNode<T>[]) {
  console.log("Welcome to the Roadmap Generator CLI!");
  console.log("You can generate outlines for one or more audiences: stakeholder, developer, community.");
  console.log("Type 'q' at any prompt to quit.");

  // Step 1: Select audiences
  const audienceInput = await prompt("Enter audiences (comma-separated): ");
  const audiences: RoadmapAudience[] = audienceInput
    .split(',')
    .map(a => a.trim() as RoadmapAudience)
    .filter(a => ['stakeholder', 'developer', 'community'].includes(a));

  if (audiences.length === 0) {
    console.log("No valid audiences selected. Exiting.");
    rl.close();
    return;
  }

  // Step 2: Generate outlines per audience
  const outlines: Record<RoadmapAudience, RoadmapNode<T>[]> = {};
  for (const audience of audiences) {
    console.log(`\nGenerating roadmap for ${audience}...`);

    if (audience === 'stakeholder') {
      outlines[audience] = buildStakeholderRoadmap(analysis);
    } else {
      outlines[audience] = RoadmapService.buildRoadmap(analysis, audience);
    }

    // Optional preview step remains unchanged
    const previewInput = await prompt(`Preview ${audience} roadmap in console? (y/n): `);
    if (previewInput.toLowerCase() === 'y') {
      printRoadmap(outlines[audience]);
    }
  }

  // Step 4: Optional file saving
  for (const audience of audiences) {
    const saveInput = await prompt(`Save roadmap for ${audience}? (y/n): `);
    if (saveInput.toLowerCase() === 'y') {
      const folder = await prompt(`Enter folder path (default ./downloads): `);
      const filename = await prompt(`Enter filename (default ${audience}-roadmap.json): `);

      const finalFolder = folder || './downloads';
      const finalFilename = filename || `${audience}-roadmap.json`;
      const filePath = path.join(finalFolder, finalFilename);

      if (!fs.existsSync(finalFolder)) fs.mkdirSync(finalFolder, { recursive: true });

      // Avoid overwriting unless user confirms
      if (fs.existsSync(filePath)) {
        const overwrite = await prompt(`${finalFilename} exists. Overwrite? (y/n): `);
        if (overwrite.toLowerCase() !== 'y') continue;
      }

      fs.writeFileSync(filePath, JSON.stringify(outlines[audience], null, 2));
      console.log(`Saved ${audience} roadmap to ${filePath}`);
    }
  }

  // Step 4.2  Preview outlines
  for (const audience of audiences) {
    const previewInput = await prompt(`Do you want to preview the ${audience} roadmap? (y/n) `);
    if (previewInput.toLowerCase() === 'y') {
      const outlineText = generateOutline(outlines[audience], audience);
      console.log(`\n--- ${audience.toUpperCase()} OUTLINE ---\n`);
      console.log(outlineText);
      console.log('\n--- END OF OUTLINE ---\n');
    }
  }

  // Step 4.3: Optional saving of outlines as text or Markdown
  for (const audience of audiences) {
    const saveOutline = await prompt(`Do you want to save the ${audience} outline? (y/n) `);
    if (saveOutline.toLowerCase() === 'y') {
      const folder = await prompt(`Enter folder path (default: ./downloads): `);
      const filename = await prompt(`Enter filename (default: ${audience}-outline.txt): `);
      const format = await prompt(`Select format (text/markdown, default text): `);

      const finalFolder = folder || './downloads';
      const finalFilename = filename || `${audience}-outline.${format === 'markdown' ? 'md' : 'txt'}`;

      if (!fs.existsSync(finalFolder)) fs.mkdirSync(finalFolder, { recursive: true });

      const outlineText = generateOutline(outlines[audience], audience);
      fs.writeFileSync(path.join(finalFolder, finalFilename), outlineText);

      console.log(`Saved ${audience} outline to ${path.join(finalFolder, finalFilename)}`);
    }
  }

  // Step 5: Combined roadmap option
  if (audiences.length > 1) {
    const combineInput = await prompt("Combine generated roadmaps into a single file? (y/n): ");
    if (combineInput.toLowerCase() === 'y') {
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
          rl.close();
          console.log("Roadmap generation complete.");
          return;
        }
      }

      // Step 5.1: Optional combined outline saving
      if (audiences.length > 1) {
        const saveCombinedOutline = await prompt("Do you want to save a combined outline for all audiences? (y/n): ");
        if (saveCombinedOutline.toLowerCase() === 'y') {
          const combinedFolder = await prompt("Enter folder path for combined outline (default ./downloads): ");
          const combinedFilename = await prompt("Enter filename for combined outline (default combined-outline.txt): ");
          const format = await prompt("Select format (text/markdown, default text): ");

          const finalFolder = combinedFolder || './downloads';
          const finalFilename = combinedFilename || `combined-outline.${format === 'markdown' ? 'md' : 'txt'}`;
          const combinedPath = path.join(finalFolder, finalFilename);

          if (!fs.existsSync(finalFolder)) fs.mkdirSync(finalFolder, { recursive: true });

          // Avoid overwriting unless user confirms
          if (fs.existsSync(combinedPath)) {
            const overwrite = await prompt(`${finalFilename} exists. Overwrite? (y/n): `);
            if (overwrite.toLowerCase() !== 'y') {
              console.log("Skipped combined outline.");
            } else {
              const combinedText = audiences.map(aud => generateOutline(outlines[aud], aud)).join('\n\n');
              fs.writeFileSync(combinedPath, combinedText);
              console.log(`Saved combined outline to ${combinedPath}`);
            }
          } else {
            const combinedText = audiences.map(aud => generateOutline(outlines[aud], aud)).join('\n\n');
            fs.writeFileSync(combinedPath, combinedText);
            console.log(`Saved combined outline to ${combinedPath}`);
          }
        }

        // Step 6: Optional combined outline saving (text/Markdown)
        if (audiences.length > 1) {
          const saveCombinedOutline = await prompt("Do you want to save a combined outline for all audiences? (y/n): ");
          if (saveCombinedOutline.toLowerCase() === 'y') {
            const folder = await prompt("Enter folder path for combined outline (default ./downloads): ");
            const filename = await prompt("Enter filename for combined outline (default combined-outline.txt): ");
            const format = await prompt("Select format (text/markdown, default text): ");

            const finalFolder = folder || './downloads';
            const finalFilename = filename || `combined-outline.${format === 'markdown' ? 'md' : 'txt'}`;
            if (!fs.existsSync(finalFolder)) fs.mkdirSync(finalFolder, { recursive: true });

            let combinedText = '';
            for (const audience of audiences) {
              combinedText += `\n--- ${audience.toUpperCase()} OUTLINE ---\n`;
              combinedText += generateOutline(outlines[audience], audience);
              combinedText += '\n';
            }

            fs.writeFileSync(path.join(finalFolder, finalFilename), combinedText);
            console.log(`Saved combined outline to ${path.join(finalFolder, finalFilename)}`);
          }
        }

        // Combine all selected audiences
        const combinedContent: Record<RoadmapAudience, RoadmapNode<T>[]> = {};
        for (const aud of audiences) {
          if (aud === 'stakeholder') {
            combinedContent[aud] = buildStakeholderRoadmap(analysis);
          } else {
            combinedContent[aud] = RoadmapService.buildRoadmap(analysis, aud);
          }
        }

        const previewCombined = await prompt("Preview combined roadmap in console? (y/n): ");
        if (previewCombined.toLowerCase() === 'y') {
          console.log("\n--- COMBINED ROADMAP PREVIEW ---\n");
          for (const aud of audiences) {
            console.log(`\n== ${aud.toUpperCase()} ==`);
            printRoadmap(combinedContent[aud]);
          }
          console.log("\n--- END OF COMBINED ROADMAP ---\n");
        }

        fs.writeFileSync(combinedPath, JSON.stringify(combinedContent, null, 2));
        console.log(`Saved combined roadmap to ${combinedPath}`);
      }
    }
    rl.close();
    console.log("✅ Roadmap generation complete.");
  }
}

// # 🛠 Roadmap CLI Command Reference

// | **Output Type / Operation**        | **Command / User Action**                                   | **File Generated / Location**                          | **Notes**                                             |
// | ---------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
// | 🎯 Generate roadmap                | `node roadmapCLI.js`                                        | CLI prompts for audiences, preview, and file saving    | Starts interactive roadmap generator                  |
// | 🧾 Generate stakeholder roadmap    | Select `stakeholder` audience at prompt                     | `stakeholder-roadmap.json` (or custom path/filename)   | Optional preview before saving                        |
// | 🛠 Generate developer roadmap      | Select `developer` audience at prompt                       | `developer-roadmap.json` (or custom path/filename)     | Optional preview before saving                        |
// | 🌐 Generate community roadmap      | Select `community` audience at prompt                       | `community-roadmap.json` (or custom path/filename)     | Optional preview before saving                        |
// | 🔀 Generate multiple audiences     | Select `stakeholder,developer,community` at prompt          | Individual files per audience + optional combined file | Preview each roadmap optional                         |
// | 🔍 Preview roadmap                 | Prompt: “Preview [audience] roadmap in console? (y/n)”      | Prints roadmap structure in terminal                   | Optional before saving                                |
// | 🔗 Combined roadmap                | Prompt after generating multiple audiences → `y` to combine | `combined-roadmap.json` (or custom path/filename)      | Uses `combinedRoadmap.ts` for preview & saving       |
// | 🔍 Preview combined roadmap        | Prompt: “Preview combined roadmap in console? (y/n)”       | Prints combined roadmap structure in terminal          | Optional, included in combined roadmap process       |
// | ✨ Save to custom folder & filename | CLI prompts for folder & filename                           | Saved at specified folder with given filename          | Defaults: `./downloads` and `[audience]-roadmap.json` |
// | 🔄 Overwrite protection            | If file exists, prompt: “Overwrite? (y/n)”                  | Prevents accidental file overwrite                     | User can skip saving if declined                      |
// | ❌ Skip saving                      | Respond `n` when prompted to save                           | No file generated                                      | Works per audience                                    |
// | 🛑 Quit process                    | Type `q` at any prompt                                      | Process exits immediately                              | Safe exit, no partial files created                   |
// | 🗂 Default download folder         | `./downloads`                                               | Used when no folder is specified                       | Works for individual or combined files                |
