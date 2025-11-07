<!-- roadmap-cli-guide.md ----->

# Overview

*The Roadmap CLI allows you to generate project roadmaps for different audiences (stakeholder, developer, community), preview them, and save them individually or as a combined file. You can optionally generate audience-specific documentation in JSON, Markdown, or text formats.*

 ## Step 0: Start the CLI

 **Command**:

node roadmapCLI.js


# Prompt:

Welcome to the Roadmap Generator CLI!
You can generate outlines for one or more audiences: stakeholder, developer, community.
Enter target audiences (comma-separated):


# Notes:

Enter one or multiple audiences separated by commas.

## Example:

-Single audience: stakeholder

- Multiple audiences: developer,community

- You can quit at any time by typing q.

## Step 1: Audience Selection

CLI generates roadmap structures in memory for the selected audiences.

- Available audiences:

- Stakeholder — simplified, non-technical view

- Developer — detailed, technical view

- Community — high-level summary with engagement points

## Step 2: Preview Option

Before saving, you may be prompted to preview the roadmap:

Do you want to preview the roadmap for [audience]? (y/n):


Yes (y) → Displays roadmap summary in console.

No (n) → Skips preview.

## Step 3: Optional File Saving

For each audience, the CLI asks:

Save roadmap for [audience]? (y/n):


Yes (y) → CLI asks for folder and filename:

Enter folder path to save the [audience] roadmap (default: ./downloads):
Enter filename for the [audience] roadmap (default: [audience]-roadmap.json):


No (n) → Roadmap is not saved to disk.

# Notes:

- Default folder is ./downloads.

- Overwrite protection: CLI will confirm if file already exists.

## Step 4: Combined Roadmap Option

After generating all selected audiences:

Combine generated roadmaps into a single file? (y/n):


Yes (y) → CLI asks for folder and filename:

Enter folder path for combined roadmap (default: ./downloads):
Enter filename for combined roadmap (default: combined-roadmap.json):


Combined roadmap includes all selected audiences as separate branches in one file.

## Step 5: Confirmation & Exit

CLI displays a summary of saved files:

✅ Roadmap generation complete.
Saved files:
- ./downloads/stakeholder-roadmap.json
- ./downloads/developer-roadmap.json
- ./downloads/combined-roadmap.json


CLI exits, returning control to the terminal.

## Step 6:Optional User Documentation & Combined Outline

You can optionally generate audience-specific documentation (Markdown or text) to describe roadmap features in a non-technical way:

Stakeholder doc — feature summary, non-technical

Developer doc — feature details, technical dependencies

Community doc — high-level summary, engagement focus

# CLI Behavior:

Generate documentation for [audience]? (y/n):

Yes (y) → CLI asks for folder, filename, and format (text/Markdown). Saves audience-specific documentation.

For multiple audiences, you can also generate a **combined outline**:

Do you want to save a combined outline for all audiences? (y/n):

Yes (y) → CLI asks for folder, filename, and format (text/Markdown).

Combined outline contains each audience's outline clearly separated for readability using headers like:

--- STAKEHOLDER OUTLINE ---
--- DEVELOPER OUTLINE ---
--- COMMUNITY OUTLINE ---

## Step 7: Quick Command Reference
| Operation                    | CLI Command / Prompt                           | Output                        |
| ---------------------------- | ---------------------------------------------- | ----------------------------- |
| 🎯 Generate roadmap          | `node roadmapCLI.js` → select audiences        | CLI in-memory roadmap         |
| 🧾 Save stakeholder roadmap  | CLI prompt → `stakeholder`                     | `stakeholder-roadmap.json`    |
| 🛠 Save developer roadmap    | CLI prompt → `developer`                       | `developer-roadmap.json`      |
| 🌐 Save community roadmap    | CLI prompt → `community`                       | `community-roadmap.json`      |
| 🔀 Save multiple audiences   | CLI prompt → `stakeholder,developer,community` | Individual files per audience |
| ✨ Combined roadmap           | CLI prompt → `y` after multiple audiences      | `combined-roadmap.json`       |
| 📄 Optional audience docs    | CLI prompt → `y` to generate docs              | Markdown/text files           |
| 📄 Optional combined outline | CLI prompt → `y` after multiple audiences → select folder, filename, format | Single Markdown/text file containing all selected audiences, separated by headers |

## Step 8: Notes

Use q to quit at any step.

Default folder for all outputs: ./downloads.

All prompts allow custom folder paths and filenames.

You can generate preview, save, or combined output in any combination.