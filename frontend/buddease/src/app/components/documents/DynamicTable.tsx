// DynamicTable.ts
import "antd/dist/antd.css";
import { Table } from "antd";

import React from "react";

interface DynamicTableProps {
  data: any[]; // Assuming data is an array of objects
}

const DynamicTable: React.FC<DynamicTableProps> = ({ data }) => {
  // Define columns for the table
  const columns = Object.keys(data[0]).map((key) => ({
    title: key,
    dataIndex: key,
    key: key,
  }));

  return <Table dataSource={data} columns={columns} />;
};

export default DynamicTable;
