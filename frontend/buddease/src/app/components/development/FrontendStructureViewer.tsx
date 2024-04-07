// FrontendStructureViewer.tsx

import FrontendStructure from '@/app/configs/appStructure/FrontendStructureComponent';
import React from 'react';

interface FrontendStructureViewerProps {
  frontendStructure: FrontendStructure;
}

const FrontendStructureViewer: React.FC<FrontendStructureViewerProps> = ({ frontendStructure }) => {
  const structureEntries = Object.entries(frontendStructure.getStructure());

  return (
    <div>
      <h2>Frontend File Structure</h2>
      <ul>
        {structureEntries.map(([fileName, fileInfo]) => (
          <li key={fileName}>
            <strong>{fileName}</strong> - {fileInfo.path}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FrontendStructureViewer;
