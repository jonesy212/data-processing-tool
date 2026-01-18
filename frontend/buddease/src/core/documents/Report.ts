// Report.ts
import type { BaseDataEntity } from '@/core/config/BaseConfig';
import type { BaseEntityProperties } from '@/core/documents/RelatedProps';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { TagsRecord } from '@/core/models/tracker/Tag';
import { ProjectStructure } from '@/core/scripts/generateRoadmaps';

export interface BaseReport extends BaseEntityProperties {
  id: number;
  title: string;
  description: string;
  reportContent: string;
  reportFileName: string;
  category?: Category
}


// Define the structure of a report
export interface AnalysisReport {
  userPrompt: string;
  timestamp: string;
  projectStructure: ProjectStructure;
  relevantFiles: any[];
  suggestedComponents: any[];
  suggestedInterfaces: any[];
  suggestedApis: any[];
}


interface AddReportBase<T extends BaseDataEntity> extends BaseReport {
  createdBy: string;
  content: string;
  tags?: string[] | TagsRecord<T>;
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

