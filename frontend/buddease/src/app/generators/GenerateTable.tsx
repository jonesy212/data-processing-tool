import { Table } from 'antd';
import 'antd/dist/antd.css';

const TableGenerator = ({ dataSource, columns }) => {
  return <Table dataSource={dataSource} columns={columns} />;
};

export default TableGenerator;
