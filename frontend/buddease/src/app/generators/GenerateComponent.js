// generateComponent.js
import fs from "fs";
function generateComponent(componentName) {
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
  const componentDir = `src/app/components/${componentName}`;
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir);
  }

  // Create a new file for the generated component
  const componentFilePath = `${componentDir}/${componentName}.tsx`;

  // Use ComponentGenerator to generate the component code
  const componentCode = renderToStaticMarkup(
    <ComponentGenerator
      componentName={componentName}
      propNames={["prop1", "prop2"]}
      propTypes={["string", "number"]}
    />
  );

  // Write the generated component code to the file
  fs.writeFileSync(componentFilePath, componentCode);

  console.log(`${componentName} component generated successfully.`);

  // Write React component file
  const reactFilePath = `${componentDir}/${componentName}.tsx`;
  fs.writeFileSync(reactFilePath, reactCode);

  console.log(`${componentName} component generated successfully.`);
}

// Read component name from command line arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error("Please provide a component name.");
  process.exit(1);
}

// Generate the component
generateComponent(componentName);
