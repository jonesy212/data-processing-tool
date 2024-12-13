// docxGenerator.ts
import Docxtemplater from "docxtemplater";
import * as fs from "fs";
import * as JSZipModule from "jszip";
import { User, UserData } from "../components/users/User";

const JSZip = JSZipModule.default;

export interface DocxGeneratorOptions {
  templatePath: string;
  outputPath: string;
    data: Record<string, any>;
  user: User
  // sections: IPropertiesOptions
}

export class DocxGenerator {
  private templatePath: string;
  private outputPath: string;
    private data: Record<string, any>;
    private user: User

  constructor(options: DocxGeneratorOptions) {
    this.templatePath = options.templatePath;
    this.outputPath = options.outputPath;
      this.data = options.data;
      this.user = options.user;
  }
 
  async generateDocument(): Promise<void> {
    const content = fs.readFileSync(this.templatePath, "binary");
    
    // Create an empty JSZip instance
    const zip = new JSZip();

    // Load the content into the JSZip instance
    await zip.loadAsync(content, { binary: true} as JSZipModule.JSZipLoadOptions);

    const doc = new Docxtemplater();
    doc.loadZip(zip);

    // Assign data to the template
    doc.setData(this.data);

    const userData: UserData = this.user.data || { id: this.user.id, snapshots: [],
      username: this.user.username, storeId: this.user.storeId, role: this.user.role, childIds: [], relatedData: []
     };
    doc.setData({...this.user, data: userData})
    try {
      // Render the document
      doc.render();
    } catch (error) {
      // Handle rendering errors
      console.error("Error rendering document:", error);
    }


    // Write the generated document to the output path
    const generatedContent = doc.getZip().generate({ type: "nodebuffer" });
    fs.writeFileSync(this.outputPath, generatedContent);

    console.log(`Document generated successfully at: ${this.outputPath}`);
  }
}

// Example usage:
const options: DocxGeneratorOptions = {
    templatePath: "path/to/your/template.docx",
    outputPath: "path/to/output/document.docx",
    data: {
        // Your data to be replaced in the template
        // Add your data properties here
    },
    user:{} as User
};

const docxGenerator = new DocxGenerator(options);
docxGenerator.generateDocument();
