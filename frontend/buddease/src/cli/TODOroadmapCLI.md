1️⃣ Initial CLI Launch

 Run pnpm ts-node src/cli/roadmapCLI.ts

 CLI displays welcome message and instructions for entering audiences.

 Verify typing q immediately quits the CLI safely.

2️⃣ Audience Selection

 Enter a single audience (stakeholder) → roadmap generated in memory.

 Enter multiple audiences (developer,community) → all selected roadmaps generated.

 Enter invalid audiences → CLI shows error/ignores invalid entries.

 Enter audiences with spaces (e.g., developer , stakeholder) → trimmed and accepted.

3️⃣ Preview Option

 Prompt: Preview [audience] roadmap in console? (y/n) appears.

 y → roadmap tree displays correctly.

 n → skips preview without error.

 Verify preview for each audience type.

4️⃣ Individual File Saving

 Prompt: Save roadmap for [audience]? (y/n) appears for each audience.

 y → CLI asks for folder and filename.

 Enter default folder/filename → file saved in ./downloads.

 Enter custom folder/filename → file saved correctly.

 n → roadmap not saved.

 Overwrite protection: saving over existing file prompts confirmation (y/n).

5️⃣ Combined Roadmap JSON

 Prompt: Combine generated roadmaps into a single file? (y/n) appears after multiple audiences.

 y → CLI asks for folder and filename.

 Default path/filename → ./downloads/combined-roadmap.json.

 Custom path/filename → file saved correctly.

 n → combined roadmap not created.

 Overwrite protection works.

 Combined file includes each audience as a separate branch.

6️⃣ Individual Audience Documentation (Text/Markdown)

 Prompt: Generate documentation for [audience]? (y/n) appears.

 y → prompts for folder, filename, and format (text/markdown).

 Default filename/format → file saved in ./downloads correctly.

 Custom folder/filename/format → file saved correctly.

 n → skips documentation generation.

7️⃣ Combined Outline (Text/Markdown)

 Prompt: Generate combined outline for all audiences? (y/n) appears.

 y → prompts for folder, filename, and format.

 Combined outline clearly separates stakeholder, developer, and community sections.

 n → combined outline not generated.

8️⃣ Stakeholder Roadmap Specifics

 Ensure only high-level, non-technical details are included.

 Phases and key milestones are displayed correctly.

 No deep technical nodes appear in stakeholder roadmap preview or saved JSON.

9️⃣ Developer & Community Roadmap Checks

 Developer roadmap includes technical dependencies, details, and subtasks.

 Community roadmap includes high-level summary, engagement points, and optional child nodes.

🔟 Miscellaneous Checks

 CLI handles invalid input gracefully at any prompt.

 Default folder ./downloads is used when no input is given.

 CLI exits cleanly with message after completion.

 All prompts accept q to quit without saving partial files.

 Preview, save, and combined operations can be executed in any combination without errors.

 Markdown formatting (headings, lists, indentation) appears correctly in generated files.

✅ Notes

Test each audience individually and in combination.

Check both text and Markdown outputs for documentation and combined outlines.

Keep an eye on overwrite prompts to avoid accidental data loss.