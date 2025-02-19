// models/dataAnalysis/DataAnalysis.ts

export class DataAnalysis {
    id: number;
    name: string;
    result: string;
    description: string;
    file_path: string;
  
    constructor(id: number, name: string, result: string, description: string, file_path: string) {
      this.id = id;
      this.name = name;
      this.result = result;
      this.description = description;
      this.file_path = file_path;
    }
  }
  