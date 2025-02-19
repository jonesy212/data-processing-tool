import { Table, TableProps } from 'antd';
import React from 'react';

interface TableGeneratorProps<T> {
  dataSource: T[]; // Define type for dataSource
  columns: TableProps<T>['columns']; // Define type for columns
}

const TableGenerator = <T extends object>({ dataSource, columns }: TableGeneratorProps<T>) => {
  return <Table dataSource={dataSource} columns={columns} />;
};

export default TableGenerator;
