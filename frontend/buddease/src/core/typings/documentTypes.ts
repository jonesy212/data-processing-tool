documentTypes.ts
documents.ts
app/types/shared.ts (or app/types/documents.ts)
export enum DocumentTypeEnum {
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
  Template = 'template',
  PDF = 'pdf'
}

export enum DocumentStatusEnum {
  Draft = 'draft',
  Finalized = 'finalized',
  Archived = 'archived',
  Deleted = 'deleted'
}