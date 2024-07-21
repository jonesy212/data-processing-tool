// Report.ts
// Define the structure of a report

export interface BaseReport {
  id: number;
  title: string;
  description: string;
  reportContent: string;
  reportFileName: string;
}



interface FinancialReport extends BaseReport {
  financialMetrics: string;
  fiscalYear: number;
}

interface TechnicalReport extends BaseReport {
  technicalSpecifications: string;
  projectCode: string;
}

interface ResearchReport extends BaseReport {
  researchFindings: string;
  experimentDate: Date;
}


export type { FinancialReport, ResearchReport, TechnicalReport };
