import { useState } from 'react';
import { Card, Typography, Space, Alert } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { TeamOutlined } from '@ant-design/icons';
import UserSearchForm from '../components/UserSearchForm';
import UserTable from '../components/UserTable';
import { userService } from '../services/userService';
import type { GetUsersParams } from '../services/userService';

const { Title } = Typography;

const UserListPage = () => {
  const [searchParams, setSearchParams] = useState<GetUsersParams>({
    sortField: 'created_at',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', searchParams],
    queryFn: () => userService.getUsers(searchParams),
  });

  const handleSearch = (values: { role?: string; active?: string; search?: string }) => {
    const params: GetUsersParams = {
      sortField: searchParams.sortField,
      sortOrder: searchParams.sortOrder,
    };

    if (values.role) {
      params.role = values.role as 'staff' | 'admin';
    }

    if (values.active !== undefined && values.active !== '') {
      params.active = values.active === 'true';
    }

    if (values.search) {
      params.search = values.search;
    }

    setSearchParams(params);
  };

  const handleSort = (sortField: string, sortOrder: 'asc' | 'desc') => {
    setSearchParams({
      ...searchParams,
      sortField,
      sortOrder,
    });
  };

  return (
    <div style={{ padding: '24px' }}>
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
            users={data?.data || []}
            loading={isLoading}
            onTableChange={handleSort}
          />
        </Card>
      </Space>
    </div>
  );
};

export default UserListPage;
