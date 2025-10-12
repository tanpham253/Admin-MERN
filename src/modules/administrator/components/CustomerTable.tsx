import { Table, Tag } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { CustomerType } from "../types/customer.type";

interface CustomerTableProps {
  customers: CustomerType[];
  loading: boolean;
  onTableChange?: (sortField: string, sortOrder: "asc" | "desc") => void;
}

const CustomerTable = ({ customers, loading, onTableChange }: CustomerTableProps) => {
  const columns: ColumnsType<CustomerType> = [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
      sorter: true,
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
      sorter: true,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? "green" : "default"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const handleTableChange: TableProps<CustomerType>["onChange"] = (
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
      dataSource={customers}
      loading={loading}
      rowKey="_id"
      onChange={handleTableChange}
      pagination={false}
      scroll={{ x: 900 }}
    />
  );
};

export default CustomerTable;
