import { useState } from "react";
import { Card, Typography, Space, Alert } from "antd";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { TeamOutlined } from "@ant-design/icons";
import UserSearchForm from "../components/UserSearchForm";
import UserTable from "../components/UserTable";
import { userService } from "../services/userService";
import type { GetUsersParams, UserType } from "../types/user.type";

const { Title } = Typography;

const UserListPage = () => {
  const [searchParams, setSearchParams] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
    sortField: "createdAt",
    sortOrder: "desc",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", searchParams],
    queryFn: () => userService.getUsers(searchParams),
    placeholderData: keepPreviousData,
  });

  console.log("Fetched users raw data:", data);

  // lấy mảng user theo cấu trúc API của bạn
  let users: UserType[] = data?.data ?? [];
  const totalRecords = data?.count ?? users.length;

  // === Client-side fallback sort (nếu backend không sort) ===
  if (users.length && searchParams.sortField) {
    const sortKey = searchParams.sortField as keyof UserType;
    const dir = searchParams.sortOrder === "asc" ? 1 : -1;

    users = [...users].sort((a, b) => {
      // Special-case: last_name -> compare last_name then first_name to break ties
      if (sortKey === "last_name") {
        const aLast = (a.last_name ?? "").toString();
        const bLast = (b.last_name ?? "").toString();
        const cmpLast = aLast.localeCompare(bLast, undefined, { sensitivity: "base", numeric: true });
        if (cmpLast !== 0) return cmpLast * dir;

        // tie-breaker by first_name
        const aFirst = (a.first_name ?? "").toString();
        const bFirst = (b.first_name ?? "").toString();
        return aFirst.localeCompare(bFirst, undefined, { sensitivity: "base", numeric: true }) * dir;
      }

      // Special-case: createdAt -> compare dates
      if (sortKey === "createdAt") {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (aTime - bTime) * dir;
      }

      // Generic accessors
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // If both are strings -> localeCompare
      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal, undefined, { sensitivity: "base", numeric: true }) * dir;
      }

      // If both are booleans
      if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        return (Number(aVal) - Number(bVal)) * dir;
      }

      // If both are numbers
      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * dir;
      }

      // Fallback: stringify and compare
      const aStr = aVal == null ? "" : String(aVal);
      const bStr = bVal == null ? "" : String(bVal);
      return aStr.localeCompare(bStr, undefined, { sensitivity: "base", numeric: true }) * dir;
    });
  }

  const handleSearch = (values: { role?: string; active?: string; search?: string }) => {
    setSearchParams((prev) => ({
      ...prev,
      page: 1,
      role: values.role as "staff" | "admin" | undefined,
      active: values.active ? values.active === "true" : undefined,
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

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Space align="center" size="middle">
            <TeamOutlined style={{ fontSize: 32, color: "#1890ff" }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Staff & Admin Management
              </Title>
              <Typography.Text type="secondary">
                View and manage all staff and admin users in the system
              </Typography.Text>
            </div>
          </Space>
        </Card>

        {error && (
          <Alert
            message="Error"
            description="Failed to load users. Please try again later."
            type="error"
            showIcon
          />
        )}

        <Card>
          <UserSearchForm onSearch={handleSearch} />
          <UserTable
            users={users}
            loading={isLoading}
            onTableChange={handleSort}
            currentSort={{
              field: searchParams.sortField!,
              order: searchParams.sortOrder!,
            }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default UserListPage;
