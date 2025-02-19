// generateDynamicData.tsx
import React from 'react';
import { CommonData } from '../components/models/CommonDetails';

// Define a function to generate dynamic data based on CommonData
const generateDynamicData = (data: CommonData<any>): JSX.Element => {
  // Check the type of data and return JSX accordingly
  if (data.type === 'user') {
    return (
      <div>
        <h2>User Details</h2>
        <p>Name: {data.username}</p>
        <p>Email: {data.email}</p>
        {/* Add more user details as needed */}
      </div>
    );
  } else if (data.type === 'todo') {
    return (
      <div>
        <h2>Todo Details</h2>
        <p>Title: {data.title}</p>
        <p>Description: {data.description}</p>
        {/* Add more todo details as needed */}
      </div>
    );
  }
  // Add more conditions for other data types if needed
  else {
    return <div>No data available</div>;
  }
};

export default generateDynamicData;
