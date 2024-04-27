import * as path from "path";
import React from "react";

interface DataVersionsProps {
  dataPath: string; // Added a prop to pass the data path
}

interface DataVersions {
  [key: string]: number;
  backend: number; // Version number for backend data
  frontend: number; // Version number for frontend data
}

const DataVersionsComponent: React.FC<DataVersionsProps> = ({ dataPath: DATA_PATH}) => {
  const [dataVersions, setDataVersions] = React.useState<DataVersions>({
    backend: 0,
    frontend: 0
  });

  React.useEffect(() => {
    // Check if 'fs' is available (only in server-side)
    if (typeof window === "undefined") {
      import("fs").then((fsModule) => {
        const fs = fsModule.default;
        const versions: DataVersions = {
          backend: 0,
          frontend: 0
        };

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
              if (file.endsWith(".json")) {
                const dataKey = path.basename(file, path.extname(file));
                versions[dataKey] = 0; // Initialize with 0, you can customize this based on your needs
              }
            }
          }
        };

        // Update the file path based on the provided dataPath
        traverseDirectory(DATA_PATH);
        setDataVersions(versions);
      });
    } else {
      console.error("'fs' module can only be used in a Node.js environment.");
    }
  }, [DATA_PATH]);

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


const dataVersions: DataVersions = {
  backend: 0,
  frontend: 0
};export { dataVersions };
