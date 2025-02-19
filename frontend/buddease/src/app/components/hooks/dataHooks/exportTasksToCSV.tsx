//exportTasksToCSV.ts
import { Task } from '@/app/components/models/tasks/Task';
import { saveAs } from 'file-saver'; // Ensure you have file-saver installed



interface ExportTasksToCSVProps {

  tasksDataSource: Task<any>[];
}

const exportTasksToCSV: React.FC<ExportTasksToCSVProps> = ({ tasksDataSource }) => {
  // Convert tasks data to CSV format
  const tasksCSV = tasksDataSourceToCSV(tasksDataSource);

  const downloadCSVFile = (data: string, filename: string) => {
    const blob = new Blob([data], { type: "text/csv" });

    // Check if the property exists before accessing it
    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveBlob(blob, filename);
    } else {
      saveAs(blob, filename);
    }
  };

  downloadCSVFile(tasksCSV, "tasks.csv");

  return null; // Add this line to return a valid ReactNode
}; 



const tasksDataSourceToCSV = (tasksDataSource: any[]) => {
    if (tasksDataSource.length === 0) {
      return '';
    }
  
    const headers = Object.keys(tasksDataSource[0]).join(',');
    const rows = tasksDataSource.map(task => 
      Object.values(task).map(value => `"${value}"`).join(',')
    ).join('\n');
  
    return `${headers}\n${rows}`;
  };
  

  export default exportTasksToCSV;