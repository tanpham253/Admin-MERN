import { useState } from "react";
import { Card, Typography, Space, Alert, Pagination } from "antd";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { UserOutlined } from "@ant-design/icons";
import CustomerSearchForm from "../components/CustomerSearchFrom";
import CustomerTable from "../components/CustomerTable";
import { customerService } from "../services/customerService";
import type { GetCustomersParams } from "../types/customer.type";

const { Title } = Typography;

const CustomerListPage = () => {
  const [searchParams, setSearchParams] = useState<GetCustomersParams>({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["customers", searchParams],
    queryFn: () => customerService.getCustomers(searchParams),
    placeholderData: keepPreviousData,
  });

  const handleSearch = (values: { search?: string }) => {
    setSearchParams((prev) => ({
      ...prev,
      page: 1,
      search: values.search || undefined,
    }));
  };

  const handleSort = (sortField: string, sortOrder: "asc" | "desc") => {
    setSearchParams((prev) => ({
      ...prev,
      sortField,
      sortOrder,
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Space align="center" size="middle">
            <UserOutlined style={{ fontSize: 32, color: "#52c41a" }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Customer Management
              </Title>
              <Typography.Text type="secondary">
                View and manage all customers in the system
              </Typography.Text>
            </div>
          </Space>
        </Card>

        {error && (
          <Alert
            message="Error"
            description="Failed to load customers. Please try again later."
            type="error"
            showIcon
          />
        )}

        <Card>
          <CustomerSearchForm onSearch={handleSearch} />
          <CustomerTable
            customers={data?.customers || []}
            loading={isLoading}
            onTableChange={handleSort}
          />
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Pagination
              current={data?.page || 1}
              pageSize={data?.limit || 10}
              total={data?.totalRecords || 0}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total) => `Total ${total} customers`}
            />
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default CustomerListPage;
