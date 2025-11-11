import { AddReportType } from "@/app/api/ApiReport";
import { ResearchReport, TechnicalReport } from "@/app/documents/Report";
import { FinancialReport } from "@/app/server/ServerDocumentGenerator";

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
