// TableFormatter.ts
import path from 'path';


export class TableFormatter {
  /**
   * Creates a formatted table with dynamic column widths
   */
  static createTable(
    headers: string[],
    rows: string[][],
    alignments: ('left' | 'right' | 'center')[] = []
  ): string {
    // Calculate maximum width for each column
    const colWidths = headers.map((header, colIndex) => {
      const maxContentWidth = rows.reduce((max, row) => {
        return Math.max(max, (row[colIndex] || '').length);
      }, header.length);
      return maxContentWidth + 2; // Add padding
    });

    // Create separator row
    const separator = colWidths.map(width => '-'.repeat(width)).join('  ');

    // Format header row
    const headerRow = headers
      .map((header, i) => header.padEnd(colWidths[i], ' '))
      .join('  ');

    // Format data rows
    const dataRows = rows.map(row =>
      row
        .map((cell, i) => {
          const width = colWidths[i];
          const alignment = alignments[i] || 'left';
          
          if (alignment === 'right') {
            return cell.padStart(width, ' ');
          } else if (alignment === 'center') {
            const leftPadding = Math.floor((width - cell.length) / 2);
            const rightPadding = width - cell.length - leftPadding;
            return ' '.repeat(leftPadding) + cell + ' '.repeat(rightPadding);
          } else {
            return cell.padEnd(width, ' ');
          }
        })
        .join('  ')
    );

    return [
      headerRow,
      separator,
      ...dataRows
    ].join('\n');
  }

  /**
   * Formats file paths to be consistent and aligned
   */
  static formatFilePath(filePath: string, basePath: string = process.cwd()): string {
    try {
      const relativePath = path.relative(basePath, filePath);
      // Truncate very long paths but keep them readable
      if (relativePath.length > 60) {
        const parts = relativePath.split('/');
        if (parts.length > 3) {
          return '.../' + parts.slice(-3).join('/');
        }
      }
      return relativePath;
    } catch {
      return filePath;
    }
  }
}