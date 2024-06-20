// Import necessary components and styles
import { Table } from 'antd';
import 'antd/dist/antd.css';
import React from 'react';


// Your component
const YourTableComponent = () => {
  // Sample data for the table
  const dataSource = [
    { key: '1', name: 'John Doe', age: 25, address: '123 Main St' },
    // Add more data as needed
  ];

  // Define columns for the table
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
    // Add more columns as needed
  ];

  // Render the table
  return <Table dataSource={dataSource} columns={columns} />;
};

export default YourTableComponent;
