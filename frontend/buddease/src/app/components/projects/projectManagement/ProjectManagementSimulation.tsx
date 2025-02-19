import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface ProjectManagementSimulationProps {}

const ProjectManagementSimulation: React.FC<ProjectManagementSimulationProps> = () => {
  const [projectTimelines, setProjectTimelines] = useState<number[]>([]);

  useEffect(() => {
    // Fetch simulated project timelines from the backend
    axios.get('/api/projectManagement/simulateProject')
      .then(response => {
        setProjectTimelines(response.data.randomWalk);
      })
      .catch(error => {
        console.error('Error fetching project timelines:', error);
      });
  }, []);

  return (
    <div>
      <h2>Project Management Simulation</h2>
      <ul>
        {projectTimelines.map((step, index) => (
          <li key={index}>{`Step ${index + 1}: ${step}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManagementSimulation;
