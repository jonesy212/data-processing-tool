// docxGenerator.ts
import { BaseDataRoot } from '@/app/config/BaseConfig';
// docxGenerator.ts - Generic version
import { User, UserData } from "@/app/users/User";
import Docxtemplater from "docxtemplater";
import { saveAs } from 'file-saver';
import JSZip from "jszip";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields } from "@/app/typings/entities/UserEntity";

// Make the interface generic
export interface DocxGeneratorOptions<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  templateFile: File | ArrayBuffer;
  fileName: string;
  data: Record<string, any>;
  user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Make the class generic
export class DocxGenerator<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  private templateFile: File | ArrayBuffer;
  private fileName: string;
  private data: Record<string, any>;
  private user: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  constructor(options: DocxGeneratorOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
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

    const userData: UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = this.user.data || { 
      id: this.user.id, 
      snapshots: [],
      username: this.user.username, 
      storeId: this.user.storeId, 
      role: this.user.role, 
      childIds: [], 
      relatedData: []
    } as UserData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
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

// Example usage with concrete types:
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.docx';

fileInput.onchange = async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const options: DocxGeneratorOptions<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields> = {
    templateFile: file,
    fileName: "generated-document.docx",
    data: {
      name: "John Doe",
      date: new Date().toLocaleDateString()
    },
    user: {} as User<UserEntity, UserK, UserMeta, UserAttachment, UserExcludedFields, UserIncludedFields>
  };

  const docxGenerator = new DocxGenerator(options);
  await docxGenerator.downloadDocument();
};