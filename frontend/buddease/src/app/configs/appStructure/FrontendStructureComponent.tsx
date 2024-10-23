// FrontendStructureComponent.tsx

let fs: any;
if (typeof window === "undefined") {
  fs = require("fs");
}
import * as path from "path";
import React from "react";
import FrontendStructure from "./FrontendStructure";

interface FrontendStructureProps {
  projectPath: string; // Added a prop to pass the project path
  frontendStructure: { [key: string]: { path: string; content: string; } };
}

const FrontendStructureComponent: React.FC<FrontendStructureProps> = ({
  projectPath,
  frontendStructure,
}) => {
  const traverseDirectory = (dir: string) => {
    const fs = require("fs");
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      if (isDirectory) {
        traverseDirectory(filePath);
      } else {
        // Logic to parse file and update frontendStructure accordingly
        // Example: if (file.endsWith('.tsx')) { /* update frontendStructure */ }
        if (file.endsWith(".tsx")) {
          frontendStructure[file] = {
            path: filePath,
            content: fs.readFileSync(filePath, "utf-8"),
          };
        }
      }
    }
  };

  // Update the file path based on the provided projectPath
  traverseDirectory(projectPath);

  return (
    <div>
      {/* Render your frontend structure content here */}
      {Object.entries(frontendStructure).map(([key, value]) => (
        <div key={key}>
          <strong>{key}</strong>
          <p>Path: {value.path}</p>
          <p>Content: {value.content}</p>
          {/* You can further customize the rendering based on your needs */}
          <RenderContent content={value.content} />
        </div>
      ))}
    </div>
  );
};

const RenderContent: React.FC<{ content: string }> = ({ content }) => {
  // You can add logic to render content based on your needs
  // For example, syntax highlighting, formatting, etc.
  return (
    <div>
      <pre>{content}</pre>
    </div>
  );
};

export default FrontendStructure;
FrontendStructureComponent;
export type { FrontendStructureProps };
