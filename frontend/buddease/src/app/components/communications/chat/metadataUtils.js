// metadataUtils.js

import { readFileSync, writeFileSync } from 'fs';

const safeReadFileSync = (filePath) => {
  if (typeof window !== 'undefined') {
    console.error('Filesystem operations are not supported in the browser environment.');
    return null;
  }
  return readFileSync(filePath, 'utf-8');
};

const safeWriteFileSync = (filePath, data) => {
  if (typeof window !== 'undefined') {
    console.error('Filesystem operations are not supported in the browser environment.');
    return;
  }
  writeFileSync(filePath, data, 'utf-8');
};

const readMetadataFile = (filePath) => {
  try {
    const data = safeReadFileSync(filePath);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error(`Error reading metadata file: ${error.message}`);
    return {};
  }
};

const writeMetadataFile = (directory, fileName, metadata) => {
  try {
    const filePath = join(directory, fileName); // Constructing the file path using join
    const data = JSON.stringify(metadata, null, 2);
    safeWriteFileSync(filePath, data);
    console.log('Metadata file updated successfully.');
  } catch (error) {
    console.error(`Error writing metadata file: ${error.message}`);
  }
};


export default { readMetadataFile, writeMetadataFile, getStructureMetadataPath };
