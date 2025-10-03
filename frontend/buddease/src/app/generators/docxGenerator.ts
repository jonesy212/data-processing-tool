// docxGenerator.ts - Browser compatible version
import { User, UserData } from "@/app/users/User";
import Docxtemplater from "docxtemplater";
import { saveAs } from 'file-saver'; // You'll need to install file-saver
import JSZip from "jszip";

export interface DocxGeneratorOptions {
  templateFile: File | ArrayBuffer; // Use File or ArrayBuffer instead of path
  fileName: string;
  data: Record<string, any>;
  user: User;
}

export class DocxGenerator {
  private templateFile: File | ArrayBuffer;
  private fileName: string;
  private data: Record<string, any>;
  private user: User;

  constructor(options: DocxGeneratorOptions) {
    this.templateFile = options.templateFile;
    this.fileName = options.fileName;
    this.data = options.data;
    this.user = options.user;
  }

  async generateDocument(): Promise<Blob> {
    let arrayBuffer: ArrayBuffer;
    
    if (this.templateFile instanceof File) {
      arrayBuffer = await this.templateFile.arrayBuffer();
    } else {
      arrayBuffer = this.templateFile;
    }

    const zip = new JSZip();
    await zip.loadAsync(arrayBuffer);

    const doc = new Docxtemplater();
    doc.loadZip(zip);

    // Assign data to the template
    doc.setData(this.data);

    const userData: UserData = this.user.data || { 
      id: this.user.id, 
      snapshots: [],
      username: this.user.username, 
      storeId: this.user.storeId, 
      role: this.user.role, 
      childIds: [], 
      relatedData: []
    };
    
    doc.setData({...this.user, data: userData});

    try {
      doc.render();
    } catch (error) {
      console.error("Error rendering document:", error);
      throw error;
    }

    // Generate the document as a blob
    const generatedContent = await doc.getZip().generateAsync({ 
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    return generatedContent;
  }

  async downloadDocument(): Promise<void> {
    const blob = await this.generateDocument();
    saveAs(blob, this.fileName);
  }
}

// Example usage in browser:
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.docx';

fileInput.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const options: DocxGeneratorOptions = {
    templateFile: file,
    fileName: "generated-document.docx",
    data: {
      name: "John Doe",
      date: new Date().toLocaleDateString()
    },
    user: {} as User // Provide actual user data
  };

  const docxGenerator = new DocxGenerator(options);
  await docxGenerator.downloadDocument();
};