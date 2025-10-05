import { Table, Tag } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { User } from '../services/userService';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onTableChange?: (sortField: string, sortOrder: 'asc' | 'desc') => void;
}

const UserTable = ({ users, loading, onTableChange }: UserTableProps) => {
  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
      sorter: true,
    },
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      width: 150,
      sorter: true,
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name',
      width: 150,
      sorter: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      sorter: true,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      sorter: true,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const handleTableChange: TableProps<User>['onChange'] = (_pagination, _filters, sorter) => {
    if (!Array.isArray(sorter) && sorter.field && sorter.order) {
      const sortField = Array.isArray(sorter.field) ? sorter.field[0] : sorter.field;
      const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
      onTableChange?.(String(sortField), sortOrder);
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={loading}
      rowKey="id"
      onChange={handleTableChange}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} users`,
      }}
      scroll={{ x: 900 }}
    />
  );
};

export default UserTable;
