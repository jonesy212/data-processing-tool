// configs/DataVersionsComponent.ts
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';

interface DataVersionsProps {
  dataPath: string; // Added a prop to pass the data path
}

interface DataVersions {
  [key: string]: number;
 
}


// config/dataVersions.ts
const dataVersions: DataVersions = {
  users: 0,
  products: 0,
  authentication: 0,
  company: 0,
  tasks: 0,
  todos: 0,
};


const DataVersionsComponent: React.FC<DataVersionsProps> = ({ dataPath }) => {
  const dataVersions: DataVersions = {};

  const traverseDirectory = (dir: string) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = fs.statSync(filePath).isDirectory();

      if (isDirectory) {
        traverseDirectory(filePath);
      } else {
        // Logic to parse file and update dataVersions accordingly
        // Example: if (file.endsWith('.json')) { /* update dataVersions */ }
        if (file.endsWith('.json')) {
          const dataKey = path.basename(file, path.extname(file));
          dataVersions[dataKey] = 0; // Initialize with 0, you can customize this based on your needs
        }
      }
    }
  };

  // Update the file path based on the provided dataPath
  traverseDirectory(dataPath);

  return (
    <div>
      {/* Render your dataVersions content here */}
      {Object.entries(dataVersions).map(([key, value]) => (
        <div key={key}>
          <strong>{key}</strong>
          <p>Version: {value}</p>
        </div>
      ))}
    </div>
  );
};

export default DataVersionsComponent;
export type { DataVersions, DataVersionsProps };
