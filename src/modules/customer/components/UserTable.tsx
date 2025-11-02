import { Table, Tag } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { UserType } from "../types/user.type";

interface UserTableProps {
  users: UserType[];
  loading: boolean;
  onTableChange?: (sortField: string, sortOrder: "asc" | "desc") => void;
}

const UserTable = ({ users, loading, onTableChange }: UserTableProps) => {
  const columns: ColumnsType<UserType> = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      sorter: true,
    },
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
      width: 150,
      sorter: true,
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      width: 150,
      sorter: true,
    },
    {
      title: "Role",
      dataIndex: "roles",
      key: "roles",
      width: 150,
      render: (roles: string[]) => (
        <>
          {roles.map((r) => (
            <Tag key={r} color={r === "admin" ? "blue" : "green"}>
              {r.toUpperCase()}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 120,
      render: (active: boolean) => (
        <Tag color={active ? "success" : "default"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const handleTableChange: TableProps<UserType>["onChange"] = (
    _pagination,
    _filters,
    sorter
  ) => {
    if (!Array.isArray(sorter) && sorter.field && sorter.order) {
      const sortField = String(sorter.field);
      const sortOrder = sorter.order === "ascend" ? "asc" : "desc";
      onTableChange?.(sortField, sortOrder);
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={users ?? []}
      loading={loading}
      rowKey="_id"
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
