// server/DocumentGenerator.ts
import fs from 'fs';
import { DocumentData } from '@/app/components/documents/DocumentBuilder';
import Docxtemplater from "docxtemplater";
import { BaseData } from "@/app/components/models/data/Data";
import PizZip from "pizzip";
import path from 'path';
import { DocumentOptions } from '@/app/components/documents/DocumentOptions'; // adjust path
import { generateFinancialReportContent } from '@/app/components/documents/documentation/report/generateFinancialReportContent'; // adjust path



enum DocumentTypeEnum {
  Text = 'text',
  Spreadsheet = 'spreadsheet',
  Diagram = 'diagram',
  CalendarEvents = 'calendarEvents',
  Drawing = 'drawing',
  Presentation = 'presentation',
  CryptoWatch = 'cryptowatch',
  Draft = 'draft',
  Document = 'document',
  Other = 'other',
  FinancialReport = 'financialReport',
  MarketAnalysis = 'marketAnalysis',
  ClientPortfolio = 'clientPortfolio',
}

enum DocumentStatusEnum {
  Draft = 'draft',
  Finalized = 'finalized',
  Archived = 'archived',
  Deleted = 'deleted'
}

export class DocumentGenerator {
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

      const generatedFilePath = path.join(__dirname, 'generated', 'textDocument.docx');
      await fs.promises.mkdir(path.dirname(generatedFilePath), { recursive: true });
      await fs.promises.writeFile(generatedFilePath, result);

      return `Text Document created successfully at ${generatedFilePath}.`;
    } catch (error: any) {
      console.error("Error creating text document:", error);
      return "Error creating text document: " + error.message;
    }
  }

  async createFinancialReport(options: DocumentOptions, documents: DocumentData<BaseData<any>>): Promise<string> {
    const financialReportContent = "Financial Report Content";
    const financialReportFileName = "financial_report.docx";

    try {
      await generateFinancialReportContent(options, documents);
      const generatedFilePath = path.join(__dirname, 'generated', financialReportFileName);
      await fs.promises.writeFile(generatedFilePath, financialReportContent);
      return `Financial Report created successfully at ${generatedFilePath}.`;
    } catch (error) {
      console.error("Error creating financial report:", error);
      return "Error creating financial report.";
    }
  }
}


export { DocumentStatusEnum, DocumentTypeEnum }