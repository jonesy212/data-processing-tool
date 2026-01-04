ErrorTracker.ts
import { Correction, CorrectionReport } from '@/core/generators/corrections/CorrectionGenerator';
import fs from 'fs';
import path from 'path';

interface ErrorSnapshot {
  timestamp: string;
  totalErrors: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  fileBreakdown: Record<string, number>;
  currentFocusArea?: string;
  filesInProgress: string[];
}

interface ProgressMetrics {
  period: '24h' | '1week' | '2weeks' | '1month';
  startCount: number;
  currentCount: number;
  errorsResolved: number;
  resolutionRate: number; // errors per day
  estimatedCompletion: string;
  trending: 'improving' | 'stable' | 'worsening';
}

interface FileProgress {
  filePath: string;
  startErrors: number;
  currentErrors: number;
  errorsResolved: number;
  startedAt: string;
  lastUpdated: string;
}

class ErrorTracker {
  private trackingFile: string;
  private snapshots: ErrorSnapshot[] = [];

  constructor(trackingDir: string = './error-tracking') {
    if (!fs.existsSync(trackingDir)) {
      fs.mkdirSync(trackingDir, { recursive: true });
    }
    this.trackingFile = path.join(trackingDir, 'error-history.json');
    this.loadHistory();
  }

  async recordSnapshot(correctionReport: CorrectionReport, focusArea?: string): Promise<void> {
    const snapshot: ErrorSnapshot = {
      timestamp: new Date().toISOString(),
      totalErrors: correctionReport.summary.totalErrors,
      critical: correctionReport.summary.critical,
      high: correctionReport.summary.high,
      medium: correctionReport.summary.medium,
      low: correctionReport.summary.low,
      fileBreakdown: this.getFileBreakdown(correctionReport.corrections),
      currentFocusArea: focusArea,
      filesInProgress: this.getFilesInProgress(correctionReport.corrections)
    };

    this.snapshots.push(snapshot);
    await this.saveHistory();
    
    // Generate progress report
    await this.generateProgressReport();
  }

  getProgressMetrics(): ProgressMetrics[] {
    const now = new Date();
    const periods: Array<{ period: '24h' | '1week' | '2weeks' | '1month'; days: number }> = [
      { period: '24h', days: 1 },
      { period: '1week', days: 7 },
      { period: '2weeks', days: 14 },
      { period: '1month', days: 30 }
    ];

    return periods.map(({ period, days }) => {
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      const relevantSnapshots = this.snapshots.filter(s => 
        new Date(s.timestamp) >= cutoffDate
      );

      if (relevantSnapshots.length < 2) {
        return {
          period,
          startCount: 0,
          currentCount: 0,
          errorsResolved: 0,
          resolutionRate: 0,
          estimatedCompletion: 'Insufficient data',
          trending: 'stable'
        };
      }

      const startSnapshot = relevantSnapshots[0];
      const currentSnapshot = relevantSnapshots[relevantSnapshots.length - 1];
      
      const errorsResolved = startSnapshot.totalErrors - currentSnapshot.totalErrors;
      const resolutionRate = errorsResolved / days;
      const estimatedCompletion = this.calculateEstimatedCompletion(currentSnapshot.totalErrors, resolutionRate);
      const trending = this.determineTrend(relevantSnapshots);

      return {
        period,
        startCount: startSnapshot.totalErrors,
        currentCount: currentSnapshot.totalErrors,
        errorsResolved,
        resolutionRate,
        estimatedCompletion,
        trending
      };
    });
  }

  getCurrentFocusStatus(): {
    focusArea?: string;
    filesInProgress: FileProgress[];
    currentFile?: string;
    progressPercentage: number;
  } {
    if (this.snapshots.length === 0) {
      return { filesInProgress: [], progressPercentage: 0 };
    }

    const currentSnapshot = this.snapshots[this.snapshots.length - 1];
    const filesInProgress: FileProgress[] = [];

    // Calculate progress for each file
    currentSnapshot.filesInProgress.forEach(filePath => {
      const fileHistory = this.getFileHistory(filePath);
      if (fileHistory.length >= 2) {
        const start = fileHistory[0];
        const current = fileHistory[fileHistory.length - 1];
        
        filesInProgress.push({
          filePath,
          startErrors: start.errorCount,
          currentErrors: current.errorCount,
          errorsResolved: start.errorCount - current.errorCount,
          startedAt: start.timestamp,
          lastUpdated: current.timestamp
        });
      }
    });

    // Calculate overall progress percentage
    const totalStartErrors = this.snapshots[0]?.totalErrors || 0;
    const totalCurrentErrors = currentSnapshot.totalErrors;
    const progressPercentage = totalStartErrors > 0 
      ? ((totalStartErrors - totalCurrentErrors) / totalStartErrors) * 100 
      : 100;

    return {
      focusArea: currentSnapshot.currentFocusArea,
      filesInProgress,
      currentFile: filesInProgress[0]?.filePath,
      progressPercentage
    };
  }

  private calculateEstimatedCompletion(currentErrors: number, resolutionRate: number): string {
    if (resolutionRate <= 0) return 'Never (rate is zero or negative)';
    
    const daysRemaining = currentErrors / resolutionRate;
    
    if (daysRemaining < 1) return 'Less than 1 day';
    if (daysRemaining < 7) return `${Math.ceil(daysRemaining)} days`;
    if (daysRemaining < 30) return `${Math.ceil(daysRemaining / 7)} weeks`;
    return `${Math.ceil(daysRemaining / 30)} months`;
  }

  private determineTrend(snapshots: ErrorSnapshot[]): 'improving' | 'stable' | 'worsening' {
    if (snapshots.length < 3) return 'stable';
    
    const recent = snapshots.slice(-3);
    const trend = recent[2].totalErrors - recent[0].totalErrors;
    
    if (trend < -5) return 'improving';
    if (trend > 5) return 'worsening';
    return 'stable';
  }

  private getFileBreakdown(corrections: Correction[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    corrections.forEach(correction => {
      const file = path.basename(correction.file);
      breakdown[file] = (breakdown[file] || 0) + 1;
    });
    
    return breakdown;
  }

  private getFilesInProgress(corrections: Correction[]): string[] {
    // Get files with critical or high priority errors
    const priorityFiles = corrections
      .filter(c => c.severity === 'critical' || c.severity === 'high')
      .map(c => c.file);
    
    return [...new Set(priorityFiles)]; // Remove duplicates
  }

  private getFileHistory(filePath: string): Array<{ timestamp: string; errorCount: number }> {
    const history: Array<{ timestamp: string; errorCount: number }> = [];
    
    this.snapshots.forEach(snapshot => {
      const errorCount = snapshot.fileBreakdown[path.basename(filePath)] || 0;
      history.push({
        timestamp: snapshot.timestamp,
        errorCount
      });
    });
    
    return history;
  }

  private async generateProgressReport(): Promise<void> {
    const metrics = this.getProgressMetrics();
    const focusStatus = this.getCurrentFocusStatus();
    const currentSnapshot = this.snapshots[this.snapshots.length - 1];

    const report = this.formatProgressReport(metrics, focusStatus, currentSnapshot);
    
    const reportDir = path.dirname(this.trackingFile);
    const reportPath = path.join(reportDir, 'progress-report.md');
    fs.writeFileSync(reportPath, report);
  }

  private formatProgressReport(
    metrics: ProgressMetrics[], 
    focusStatus: ReturnType<typeof this.getCurrentFocusStatus>,
    currentSnapshot: ErrorSnapshot
  ): string {
    const lines: string[] = [];
    
    lines.push('# 📊 Error Resolution Progress Report');
    lines.push(`**Generated:** ${new Date().toISOString()}`);
    lines.push('');
    
    // Current Status Summary
    lines.push('## 🎯 Current Status');
    lines.push('');
    lines.push(`**Total Errors:** ${currentSnapshot.totalErrors}`);
    lines.push(`**Critical:** ${currentSnapshot.critical} | **High:** ${currentSnapshot.high} | **Medium:** ${currentSnapshot.medium} | **Low:** ${currentSnapshot.low}`);
    lines.push(`**Overall Progress:** ${focusStatus.progressPercentage.toFixed(1)}%`);
    lines.push('');
    
    if (focusStatus.focusArea) {
      lines.push(`**Current Focus:** ${focusStatus.focusArea}`);
    }
    
    if (focusStatus.currentFile) {
      lines.push(`**Active File:** ${path.basename(focusStatus.currentFile)}`);
    }
    lines.push('');
    
    // Progress Metrics
    lines.push('## 📈 Progress Over Time');
    lines.push('');
    lines.push('| Period | Start | Current | Resolved | Rate/Day | Est. Completion | Trend |');
    lines.push('|--------|-------|---------|----------|----------|-----------------|-------|');
    
    metrics.forEach(metric => {
      const trendIcon = metric.trending === 'improving' ? '📉' : metric.trending === 'worsening' ? '📈' : '➡️';
      lines.push(`| ${metric.period} | ${metric.startCount} | ${metric.currentCount} | ${metric.errorsResolved} | ${metric.resolutionRate.toFixed(1)} | ${metric.estimatedCompletion} | ${trendIcon} |`);
    });
    lines.push('');
    
    // Files in Progress
    if (focusStatus.filesInProgress.length > 0) {
      lines.push('## 🔧 Files in Progress');
      lines.push('');
      lines.push('| File | Start Errors | Current | Resolved | Progress |');
      lines.push('|------|--------------|---------|----------|----------|');
      
      focusStatus.filesInProgress.forEach(file => {
        const progress = file.startErrors > 0 
          ? ((file.errorsResolved / file.startErrors) * 100).toFixed(1) 
          : '100';
        lines.push(`| ${path.basename(file.filePath)} | ${file.startErrors} | ${file.currentErrors} | ${file.errorsResolved} | ${progress}% |`);
      });
      lines.push('');
    }
    
    // Recommendations
    lines.push('## 💡 Recommendations');
    lines.push('');
    
    const criticalMetrics = metrics.find(m => m.period === '24h');
    if (criticalMetrics && criticalMetrics.currentCount > 0) {
      lines.push('1. **Address critical errors first** - These block development');
    }
    
    if (focusStatus.filesInProgress.length > 0) {
      lines.push('2. **Continue focused work** - You\'re making progress on current files');
    }
    
    const bestPeriod = metrics.reduce((best, current) => 
      current.resolutionRate > best.resolutionRate ? current : best
    );
    
    if (bestPeriod.resolutionRate > 0) {
      lines.push(`3. **Maintain your pace** - Your best resolution rate was ${bestPeriod.resolutionRate.toFixed(1)} errors/day during ${bestPeriod.period}`);
    }
    
    lines.push('4. **Regular commits** - Track progress with frequent snapshots');
    lines.push('');
    
    return lines.join('\n');
  }

  private loadHistory(): void {
    try {
      if (fs.existsSync(this.trackingFile)) {
        const data = fs.readFileSync(this.trackingFile, 'utf8');
        this.snapshots = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not load error tracking history:', error);
      this.snapshots = [];
    }
  }

  private async saveHistory(): Promise<void> {
    try {
      fs.writeFileSync(this.trackingFile, JSON.stringify(this.snapshots, null, 2));
    } catch (error) {
      console.error('Could not save error tracking history:', error);
    }
  }
}

export { ErrorTracker };
export type { ErrorSnapshot, FileProgress, ProgressMetrics };
