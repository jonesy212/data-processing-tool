// This file should ONLY be imported by server components or API routes
// ServerDocumentGenerator.ts
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import Docxtemplater from "docxtemplater";
import { BaseData } from "@/app/components/models/data/Data";
import PizZip from "pizzip";
import { DocumentOptions } from '@/app/components/documents/DocumentOptions';
import { generateFinancialReportContent } from '@/app/components/documents/documentation/report/generateFinancialReportContent';
import { DocumentTypeEnum } from '@/typings/documments';
import { ServerFileSystem } from './serverFileSystem';

export class ServerDocumentGenerator {
  private fileSystem: ServerFileSystem;

  constructor(fileSystem?: ServerFileSystem) {
    this.fileSystem = fileSystem || new ServerFileSystem();
  }

  async createTextDocument(
    type: DocumentTypeEnum,
    options: DocumentOptions,
    fileContent: Buffer
  ): Promise<string> {
    const content = options.content || "Default Text Document Content";
    const contentData = { content };

    const zip = new PizZip(fileContent);
    const docx = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });
    docx.setData(contentData);

    try {
      docx.render();
      const result = docx.getZip().generate({ type: "nodebuffer" });

      const generatedFilePath = await this.fileSystem.writeFile('textDocument.docx', result);
      return `Text Document created successfully at ${generatedFilePath}.`;
    } catch (error: any) {
      console.error("Error creating text document:", error);
      throw new Error("Error creating text document: " + error.message);
    }
  }

  async createFinancialReport(options: DocumentOptions, documents: DocumentData<BaseData<any>>): Promise<string> {
    const financialReportContent = "Financial Report Content";
    
    try {
      await generateFinancialReportContent(options, [documents]);
      const generatedFilePath = await this.fileSystem.writeFile('financial_report.docx', financialReportContent);
      return `Financial Report created successfully at ${generatedFilePath}.`;
    } catch (error) {
      console.error("Error creating financial report:", error);
      throw new Error("Error creating financial report.");
    }
  }

  async getGeneratedDocumentsList(): Promise<string[]> {
    return await this.fileSystem.listFiles();
  }

  async deleteDocument(fileName: string): Promise<boolean> {
    return await this.fileSystem.deleteFile(fileName);
  }
}