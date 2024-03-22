// DocumentBuilderConfigComponent.tsx
import { DocumentBuilderConfig } from "@/app/configs/DocumentBuilderConfig";
import React from "react";

interface DocumentBuilderConfigProps {
  config: DocumentBuilderConfig;
}

const DocumentBuilderConfigComponent: React.FC<DocumentBuilderConfigProps> = ({
  config,
}) => {
  return (
    <div>
      <h2>Document Builder Configuration</h2>
      <p>Font Family: {config.fontFamily}</p>
      <p>Font Size: {config.fontSize}</p>
      <p>Text Color: {config.textColor}</p>
      <p>Background Color: {config.backgroundColor}</p>
      <p>Line Spacing: {config.lineSpacing}</p>
      {/* Add more properties as needed */}
    </div>
  );
};

export default DocumentBuilderConfigComponent;
