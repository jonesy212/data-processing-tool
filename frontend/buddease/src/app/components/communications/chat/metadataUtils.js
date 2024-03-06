// metadataUtils.js

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';


const readMetadataFile = (filePath) => {
  try {
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading metadata file: ${error.message}`);
    return {};
  }
};

const writeMetadataFile = (filePath, metadata) => {
  try {
    const data = JSON.stringify(metadata, null, 2);
    writeFileSync(filePath, data, 'utf-8');
    console.log('Metadata file updated successfully.');
  } catch (error) {
    console.error(`Error writing metadata file: ${error.message}`);
  }
};

export default { readMetadataFile, writeMetadataFile, getStructureMetadataPath };
