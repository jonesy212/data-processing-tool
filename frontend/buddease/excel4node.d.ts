declare module "excel4node" {
  export interface Workbook {
    createSheet(name: string): Worksheet;
  }

  export interface Worksheet {
    cell(row: number, col: number): Cell;
  }

  export interface Cell {
    string(value: string): void;
    number(value: number): void;
  }
}
