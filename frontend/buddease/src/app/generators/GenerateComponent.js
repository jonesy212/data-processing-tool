import fs from "fs";
import path from "path";

function generateComponent(componentName, targetDirectory = process.cwd(), promptingContent="") {
  // Check if the component name already exists in the target directory or its subdirectories
  const existingComponentPath = findExistingComponent(componentName, targetDirectory);
  if (existingComponentPath) {
    // Component with the same name already exists
    console.error(`Component '${componentName}' already exists at ${existingComponentPath}`);
    // Prompt the user to confirm whether they want to overwrite existing files or choose a different name
    // Example: Implement a prompt or return an error message
    return;
  }

  

    // If prompting content is not provided, generate default prompting content
    if (!promptingContent) {
      promptingContent = generateDefaultPromptingContent(componentName);
    }

  // Prompt the user with the necessary content to generate the component
  console.log("Prompting content necessary to answer the prompts:");
  console.log(promptingContent);

  // Generate React component code
  const reactCode = `
    import React from 'react';

    interface ${componentName}Props {
        // Add component props here
    }

    const ${componentName}: React.FC<${componentName}Props> = (props) => {
        // Component implementation
        return <div>${componentName} Component</div>;
    };

    export default ${componentName};
    `;

  // Create a directory for the component
  const componentDir = path.join(targetDirectory, componentName);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir);
  } else {
    console.error(`Directory '${componentName}' already exists.`);
    return;
  }

  // Create a new file for the generated component
  const componentFilePath = path.join(componentDir, `${componentName}.tsx`);
  fs.writeFileSync(componentFilePath, reactCode);

  console.log(`${componentName} component generated successfully in ${targetDirectory}.`);
}

function findExistingComponent(componentName, directory) {
  // Traverse the directory and its subdirectories to find existing components
  const files = fs.readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = path.join(directory, file.name);

    if (file.isDirectory()) {
      // Recursively search subdirectories
      const existingComponentPath = findExistingComponent(componentName, filePath);
      if (existingComponentPath) {
        return existingComponentPath;
      }
    } else if (file.isFile() && file.name === `${componentName}.tsx`) {
      // Component file with the same name already exists
      return filePath;
    }
  }

  return null; // Component not found
}

// Read component name from command line arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error("Please provide a component name.");
  process.exit(1);
}

// Prompting content necessary to answer the prompts
const promptingContent = `
  // Provide the necessary content here to answer the prompts
`;

// Generate the component
generateComponent(componentName, promptingContent);
