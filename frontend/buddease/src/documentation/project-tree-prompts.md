<!-- project-tree-prompts.md -->

# Project Tree Query Prompts

## Finding Files by Name
- *"Show me files with 'button' in the filename from the tree"*
- *"Find files containing 'video' in their names"*
- *"List files with 'calendar' in the filename"*
- *"Show me files ending with '.d.ts'"*
- *"Find files starting with 'use' (hooks)"*

## Finding Files by Location
- *"Show me all files in src/app/components/video/"*
- *"List files in the platform/android directory"*
- *"What's in src/app/libraries/ui/buttons/"*

## Finding Files by Type
- *"Show me all TypeScript files (.ts/.tsx) in the tree"*
- *"Find all configuration files (.config.js, .config.ts)"*
- *"List all markdown documentation files"*

## Finding Related Files
- *"Show me files related to 'crypto' functionality"*
- *"Find calendar-related components"*
- *"List all API service files"*

## Quick Counts & Overview
- *"How many React components (.tsx files) are in the project?"*
- *"Show me the main entry point files"*
- *"What are the key configuration files?"*

## Platform-Specific Queries
- *"Show me files that should be moved to platform/shared/"*
- *"Find web-specific components that need platform abstraction"*
- *"List components with hardware dependencies (camera, storage, etc.)"*

These prompts work best because they're:
- Specific about what to look for
- Clear about the search criteria
- Brief and to the point
- Focused on the tree structure itself