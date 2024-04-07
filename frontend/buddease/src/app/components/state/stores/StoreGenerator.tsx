import * as ejs from 'ejs';
import * as path from 'path';

let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}

interface StoreMetadata {
  name: string;
  components: string[];
}

const generateStore = (storeName: string, components: string[]): void => {
  if (!fs) {
    console.error("File system module (fs) is not available. Unable to generate store.");
    return;
  }

  try {
    const templatePath = path.join(__dirname, 'templates', 'store-template.ejs');
    const template = fs.readFileSync(templatePath, 'utf-8');
    const renderedCode = ejs.render(template, { storeName, components });

    const storeFilePath = path.join(__dirname, 'src', 'stores', `${storeName}Store.ts`);
    fs.writeFileSync(storeFilePath, renderedCode);

    console.log(`Store ${storeName} generated successfully at ${storeFilePath}`);
  } catch (error) {
    console.error(`Error generating store ${storeName}: ${error}`);
  }
};

const generateStores = (storeMetadata: StoreMetadata[]): void => {
  if (!fs) {
    console.error("File system module (fs) is not available. Unable to generate stores.");
    return;
  }

  storeMetadata.forEach(({ name, components }) => {
    generateStore(name, components);
  });
};

export { generateStores };
