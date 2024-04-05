import * as ejs from 'ejs';
let fs: any;
if (typeof window === 'undefined') {
  fs = require('fs');
}
import * as path from 'path';

interface StoreMetadata {
  name: string;
  components: string[];
}

const generateStore = (storeName: string, components: string[]): void => {
  const templatePath = path.join(__dirname, 'templates', 'store-template.ejs');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const renderedCode = ejs.render(template, { storeName, components });

  const storeFilePath = path.join(__dirname, 'src', 'stores', `${storeName}Store.ts`);
  fs.writeFileSync(storeFilePath, renderedCode);

  console.log(`Store ${storeName} generated successfully at ${storeFilePath}`);
};

const generateStores = (storeMetadata: StoreMetadata[]): void => {
  storeMetadata.forEach(({ name, components }) => {
    generateStore(name, components);
  });
};

export { generateStores };
