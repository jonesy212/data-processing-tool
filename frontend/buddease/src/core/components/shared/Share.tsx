// Share.tsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface ShareProps {
  projectId: string;
  title: string;

}

const Share: React.FC<ShareProps> = ({ projectId,  title}) => {
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch project data based on projectId when the component mounts
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        setProjectData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project data:', error);
        // Handle error as needed
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleShare = async () => {
    // Implement your sharing logic here
    // You may need to send a request to the server to handle the sharing process
    // Example: await axios.post(`/api/projects/${projectId}/share`, { /* sharing data */ });

    // Display a success message or handle the response accordingly
    alert('Project shared successfully!');
  };


    // Add collaboration features
    const handleCollaborate = () => {
      // Implement collaboration logic
      // ...
    };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Share Project</h2>
      <p>Project Name: {projectData?.name}</p>
      <p>Description: {projectData?.description}</p>

      {/* Add your sharing form or UI components here */}
      <button onClick={handleShare}>Share Project</button>
      <button onClick={handleCollaborate}>Collaborate</button>

    </div>
  );
};

export default Share;
export type { ShareProps };
