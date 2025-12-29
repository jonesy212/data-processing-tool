// ServerDocumentGenerator.ts
// This file should ONLY be imported by server components or API routes
import { generateFinancialReportContent } from '@/core/components/documents/documentation/report/generateFinancialReportContent';
import { DocumentOptions } from '@/core/documents/DocumentOptions';
import { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import { BaseData } from '@/core/models/data/Data';
import { ServerFileSystem } from '@/core/server/serverFileSystem';
import { DocumentTypeEnum } from '@/core/typings/documentTypes';
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

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