import { useState } from 'react';
import { Card, Typography, Space, Alert, Pagination } from 'antd';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { TeamOutlined } from '@ant-design/icons';
import UserSearchForm from '../components/UserSearchForm';
import UserTable from '../components/UserTable';
import { userService } from '../services/userService';
import type { GetUsersParams } from '../types/user.type';

const { Title } = Typography;

const UserListPage = () => {
  const [searchParams, setSearchParams] = useState<GetUsersParams>({
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', searchParams],
    queryFn: () => userService.getUsers(searchParams),
    placeholderData: keepPreviousData,
  });

  console.log('data', data);

  const handleSearch = (values: { role?: string; active?: string; search?: string }) => {
    setSearchParams((prev) => ({
      ...prev,
      page: 1,
      role: values.role as 'staff' | 'admin' | undefined,
      active: values.active ? values.active === 'true' : undefined,
      search: values.search || undefined,
    }));
  };

  const handleSort = (sortField: string, sortOrder: 'asc' | 'desc') => {
    setSearchParams((prev) => ({
      ...prev,
      sortField,
      sortOrder,
    }));
  };

  console.log('Fetching users with params:', searchParams);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Space align="center" size="middle">
            <TeamOutlined style={{ fontSize: 32, color: '#1890ff' }} />
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
            users={data ?? []}
            loading={isLoading}
            onTableChange={handleSort}
          />
        </Card>
      </Space>
    </div>
  );
};

export default UserListPage;
