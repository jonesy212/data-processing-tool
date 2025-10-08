// Report.ts
// Define the structure of a report

import { K, T } from '@/app/components/models/data/dataStoreMethods';
import { TagsRecord } from "@/app/snapshots";

export interface BaseReport {
  id: number;
  title: string;
  description: string;
  reportContent: string;
  reportFileName: string;
}


interface AddReportBase extends BaseReport {
  createdBy: string;
  content: string;
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string[] | undefined;
  createdAt: Date;
}


interface ReportOptions {
  type?: 'financial' | 'technical' | 'research';
  fiscalYear?: number;
  projectCode?: string;
  experimentDate?: Date;
  // Add more options as needed
}

// Define custom types (optional, depending on your needs)
type FinancialMetrics = string | { amount: number, currency: string };  // Example object type
type TechnicalSpecifications = string | { version: string, platform: string };  // Example object type
type ResearchFindings = string | { conclusion: string, sampleSize: number };  // Example object type


interface FinancialReport extends BaseReport {
  reportType: "financial";
  financialMetrics: FinancialMetrics;
  fiscalYear: number;
}

interface TechnicalReport extends BaseReport {
  reportType: "technical";
  technicalSpecifications: TechnicalSpecifications;
  projectCode: string;
}

interface ResearchReport extends BaseReport {
  reportType: "research";
  researchFindings: ResearchFindings;
  experimentDate: Date;
}


export type { AddReportBase, FinancialReport, ReportOptions, ResearchReport, TechnicalReport, TechnicalSpecifications };

