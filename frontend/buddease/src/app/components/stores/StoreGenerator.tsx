// store-generator.tsx

import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

// Interface for store metadata
interface StoreMetadata {
  name: string;
  components: string[];
}

// Function to generate a store file
const generateStore = (storeName: string, components: string[]): void => {
  const templatePath = path.join(__dirname, 'templates', 'store-template.ejs');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const renderedCode = ejs.render(template, { storeName, components });

  const storeFilePath = path.join(__dirname, 'src', 'stores', `${storeName}Store.tsx`);
  fs.writeFileSync(storeFilePath, renderedCode);

  console.log(`Store ${storeName} generated successfully at ${storeFilePath}`);
};

// Main function to analyze project and generate stores
const generateStores = (): void => {
  const srcPath = path.join(__dirname, 'src');

  // Analyze project structure and extract metadata
  // (This is a simplified example; you may need a more sophisticated approach)
  const storeMetadata: StoreMetadata[] = [
    { name: 'BrowserCompatibility', components: ['BrowserCompatibilityStore'] },
    // Add more metadata entries as needed
  ];

  // Generate stores based on metadata
  storeMetadata.forEach(({ name, components }) => {
    generateStore(name, components);
  });
};

// Run the store generation process
generateStores();
