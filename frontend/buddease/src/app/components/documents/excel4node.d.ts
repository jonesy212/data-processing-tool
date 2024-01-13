// excel4node.d.ts

declare module 'excel4node' {
    export interface Workbook {
      // Define the properties and methods used in your code
      // Example:
      createSheet(name: string): Worksheet;
    }
  
    export interface Worksheet {
      // Define the properties and methods used in your code
      // Example:
      cell(row: number, col: number): Cell;
    }
  
    export interface Cell {
      // Define the properties and methods used in your code
      // Example:
      string(value: string): void;
      number(value: number): void;
    }
  
    // Add more interfaces as needed based on the functionality you use
  }
  