import { FinancialReport } from "../../server/DocumentGenerator";
import { AddReportType } from "../api/ApiReport";
import { ResearchReport, TechnicalReport } from "../components/documents/documentation/report/Report";

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
