// reportTypeGuards.ts
import { AddReportType } from "@/core/api/ApiReport";
import { ResearchReport, TechnicalReport } from '@/core/documents/Report';

function isFinancialReport(report: AddReportType): report is FinancialReport {
  return report.reportType === "financial";
}

function isTechnicalReport(report: AddReportType): report is TechnicalReport {
  return report.reportType === "technical";
}

function isResearchReport(report: AddReportType): report is ResearchReport {
  return report.reportType === "research";
}

export {
    isFinancialReport, isResearchReport, isTechnicalReport
};

