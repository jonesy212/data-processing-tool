User Journey Scenario: Roadmap Generation CLI
Step 1: Initiate Roadmap CLI

Command:

node roadmapCLI.js


Purpose: Starts the interactive roadmap generation process.

Prompt:

Welcome to the Roadmap Generator CLI!
Enter target audiences (stakeholder, developer, community) separated by commas:

Special Input: Type q at any prompt to quit the process immediately.

Step 2: Audience Selection

Input Examples:

Single audience: stakeholder

Multiple audiences: developer,community

System Action:

Generates roadmap structures in memory for each selected audience using RoadmapService.buildRoadmap().

Prepares audience-specific outlines:

Stakeholder: simplified high-level view

Developer: detailed, technical view with metadata

Community: simplified, public-friendly view

Step 3: Preview Option (New)

Prompt:

Do you want to preview the roadmap for [audience] in the console? (y/n):

If yes:

Prints a hierarchical view of the roadmap tree in console, including phases, tags, and optional content summaries.

If no:

Moves to file saving step.

Step 4: Optional File Saving

Prompt: For each audience:

Save roadmap for [audience]? (y/n):

If yes: CLI asks for folder and filename:

Enter folder path (default: ./downloads):
Enter filename (default: [audience]-roadmap.json):

System Action:

Saves each roadmap as JSON in the specified location.

Ensures folder exists (fs.mkdirSync with recursive: true).

Does not overwrite existing files unless user explicitly specifies same name.

If no:

Roadmap is kept in memory only; not saved.

Step 5: Combined Roadmap Option

Prompt:

Combine generated roadmaps into a single file? (y/n):

If yes: CLI asks for folder and filename:

Enter folder path (default: ./downloads):
Enter filename (default: combined-roadmap.json):

System Action:

Merges all selected audience roadmap trees into a single JSON file with top-level keys per audience.

Saves in specified folder without overwriting unless user confirms.

Step 6: Confirmation & Exit

CLI Message:

✅ Roadmap generation complete.
Saved files:
- ./downloads/stakeholder-roadmap.json
- ./downloads/developer-roadmap.json
- ./downloads/combined-roadmap.json


Exit: CLI closes and user returns to terminal.
