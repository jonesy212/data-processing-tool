#!/usr/bin/env node
import fs from "fs";
import path from "path";
import process from "process";

// -------------------- CONFIG --------------------
const IGNORE = ["node_modules", ".git", "dist", "build", ".next"];
const DEFAULT_OUTPUT_DIR = "docs"; // default folder to save the tree
// ------------------------------------------------

/**
 * @typedef {Object} TreeItem
 * @property {string} name
 * @property {string} path
 * @property {'directory'|'file'} type
 * @property {TreeItem[]} [children]
 */

/**
 * Generate a file/directory tree.
 * @param {string} dir
 * @returns {TreeItem[]}
 */
function generateTreeData(dir) {
  const result = [];
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (IGNORE.includes(file.name)) continue;

    const fullPath = path.join(dir, file.name);
    const item = {
      name: file.name,
      path: fullPath,
      type: file.isDirectory() ? "directory" : "file",
    };

    if (file.isDirectory()) {
      item.children = generateTreeData(fullPath);
    }

    result.push(item);
  }
  return result;
}

/**
 * Format tree as text.
 * @param {TreeItem[]} tree
 * @param {string} [prefix]
 * @returns {string}
 */
function formatTreeText(tree, prefix = "") {
  let output = "";
  const lastIndex = tree.length - 1;

  tree.forEach((item, index) => {
    const connector = index === lastIndex ? "└── " : "├── ";
    output += `${prefix}${connector}${item.name}\n`;

    if (item.type === "directory") {
      const newPrefix = prefix + (index === lastIndex ? "    " : "│   ");
      output += formatTreeText(item.children || [], newPrefix);
    }
  });
  return output;
}

/**
 * Format tree as markdown.
 * @param {TreeItem[]} tree
 * @param {number} [depth]
 * @returns {string}
 */
function formatTreeMarkdown(tree, depth = 0) {
  let output = "";
  for (const item of tree) {
    const indent = "  ".repeat(depth);
    const icon = item.type === "directory" ? "📁" : "📄";
    output += `${indent}- ${icon} **${item.name}**\n`;
    if (item.children) output += formatTreeMarkdown(item.children, depth + 1);
  }
  return output;
}

// -------------------- MAIN --------------------
const args = process.argv.slice(2);
const format = args[0] || "text"; // text | markdown | json
const customOutputPathIndex = args.indexOf("--output");
let outputDir = DEFAULT_OUTPUT_DIR;

// If user provided --output <path>
if (customOutputPathIndex !== -1 && args[customOutputPathIndex + 1]) {
  outputDir = args[customOutputPathIndex + 1];
}

const projectRoot = process.cwd();
const treeData = generateTreeData(projectRoot);

let outputContent;
switch (format) {
  case "markdown":
    outputContent = formatTreeMarkdown(treeData);
    break;
  case "json":
    outputContent = JSON.stringify(treeData, null, 2);
    break;
  case "text":
  default:
    outputContent = formatTreeText(treeData);
    break;
}

// Ensure output directory exists
const fullOutputDir = path.isAbsolute(outputDir)
  ? outputDir
  : path.join(projectRoot, outputDir);

if (!fs.existsSync(fullOutputDir)) {
  fs.mkdirSync(fullOutputDir, { recursive: true });
}

// Build final output file path
const outputFile = path.join(
  fullOutputDir,
  `project-tree.${format === "json" ? "json" : format === "markdown" ? "md" : "txt"}`
);

// Write to file
fs.writeFileSync(outputFile, outputContent);

console.log(`🔍 Scanning: ${projectRoot}`);
console.log(`🧾 Output format: ${format}`);
console.log(`✅ Project tree saved to ${outputFile}`);


// #NOTE
// | **Output Type**   | **Command**                                              | **File Generated**    |
// | ----------------- | -------------------------------------------------------- | --------------------- |
// | 🧱 Text (default) | `node generateTree.js text`                               | `project-tree.txt`    |
// | 📘 Markdown       | `node generateTree.js markdown`                           | `project-tree.md`     |
// | 🧮 JSON           | `node generateTree.js json`                               | `project-tree.json`   |
// | ✨ Custom Path     | `node generateTree.js text --output ./docs/my-tree.txt`    | `./docs/my-tree.txt`  |
// | ✨ Custom Path     | `node generateTree.js markdown --output ./docs/my-tree.md` | `./docs/my-tree.md`   |
// | ✨ Custom Path     | `node generateTree.js json --output ./docs/my-tree.json`   | `./docs/my-tree.json` |

// Note, whatever filename you are using, you need to create it first in the root of your folder.  Same place as the tsconfig file or package.json



// #TODO – Automate Project Tree / File Changes on Git Push

//  Set up a system to automatically update the project tree whenever code is pushed.

//  Decide whether to generate a full tree or a changes log (moved, renamed, deleted files).

//  Consider creating a dedicated folder (e.g., project_docs or project_tree) to store:

// The project tree file (.txt, .json, or .md)

// The changes log file

//  Implement a script or Git hook that:

// Runs on pre-push or post-commit

// Generates/upserts the tree or changes log automatically

// Ensures the files remain up-to-date without manual intervention

//  Decide on the format:

// Text for easy reading

// Markdown for documentation

// JSON for programmatic use

//  Optionally integrate with a CI/CD pipeline for automated updates across team pushes. 