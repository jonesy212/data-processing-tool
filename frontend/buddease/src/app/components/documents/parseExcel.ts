// parseExcel.ts
import ExcelJS from 'exceljs';

/**
 * Parse Excel file and return an array of parsed rows.
 * @param excelBuffer The Excel file buffer to parse.
 * @returns An array of parsed rows.
 */

export async function parseExcel(excelBuffer: Buffer): Promise<any[]> {
  const workbook = new ExcelJS.Workbook();

  return new Promise((resolve, reject) => {
    workbook.xlsx.load(excelBuffer).then(() => {
      const worksheet = workbook.worksheets[0];
      const rows: any[] = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber !== 1) {
          const rowData: any = {};
            row.eachCell((cell, colNumber) => {
              const headerCell = worksheet.getRow(1).getCell(colNumber);
              const header = headerCell.value
                ? headerCell.value.toString()
                : "";
              rowData[header] = cell.value ? cell.value.toString() : "";
            });
          rows.push(rowData);
        }
      });

      resolve(rows);
    }).catch((error) => {
      reject(error);
    });
  });
}
