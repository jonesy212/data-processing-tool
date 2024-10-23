import TableGenerator from '@/app/generators/GenerateTable';
import React from 'react';

const PaymentsTable = () => {
  // Sample data for the Payments table
  const dataSource = [
    { key: '1', date: '2024-02-22', amount: 100 },
    // Add more payment data as needed
  ];

  // Define columns for the Payments table
  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    // Add more columns as needed
  ];

  return <TableGenerator dataSource={dataSource} columns={columns} />;
};

export default PaymentsTable;
