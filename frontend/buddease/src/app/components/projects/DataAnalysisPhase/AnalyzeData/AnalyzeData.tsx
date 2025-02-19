// src/components/DataAnalysisPhase/AnalyzeData.tsx

import { DataProcessingTask } from '@/app/components/todos/tasks/DataProcessingTask';
import { DatasetModel } from '@/app/components/todos/tasks/DataSetModel';
import { dataAnalysisService } from '@/app/components/typings/dataAnalysisTypes';
import React, { useEffect, useState } from 'react';

interface AnalyzeDataProps {
  projectId: string;
}

const AnalyzeData: React.FC<AnalyzeDataProps> = ({ projectId }) => {
    const [data, setData] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [datasets, setDatasets] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
  
    useEffect(() => {
        const fetchData = async () => {
          try {
            setLoading(true);
    
            // Fetch data using the service methods
            const fetchedData: DataProcessingTask[] = await dataAnalysisService.getDataByProjectId(projectId);
            const fetchedTasks: DatasetModel[] = await dataAnalysisService.getDataProcessingTasks(projectId);
            const fetchedDatasets: any[] = await dataAnalysisService.getDatasets(projectId);
    
            setData(fetchedData);
            setTasks(fetchedTasks);
            setDatasets(fetchedDatasets);
          } catch (error) {
            console.error('Error fetching data:', error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchData();
      }, [projectId]);

  return (
    <div>
      <h1>Analyze Data Component</h1>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div>
          <h2>Data Items</h2>
          <ul>
            {data.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>

          <h2>Data Processing Tasks</h2>
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>{task.name}</li>
            ))}
          </ul>

          <h2>Datasets</h2>
          <ul>
            {datasets.map((dataset) => (
              <li key={dataset.id}>{dataset.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalyzeData;
