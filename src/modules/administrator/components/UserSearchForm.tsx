import { Form, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface UserSearchFormProps {
  onSearch: (values: { role?: string; active?: string; search?: string }) => void;
}

const UserSearchForm = ({ onSearch }: UserSearchFormProps) => {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={onSearch}
      style={{ marginBottom: 16 }}
    >
      <Form.Item name="search">
        <Input
          placeholder="Search by name or email"
          style={{ width: 250 }}
          allowClear
        />
      </Form.Item>

      <Form.Item name="role">
        <Select
          placeholder="Filter by role"
          style={{ width: 150 }}
          allowClear
        >
          <Select.Option value="staff">Staff</Select.Option>
          <Select.Option value="admin">Admin</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="active">
        <Select
          placeholder="Filter by status"
          style={{ width: 150 }}
          allowClear
        >
          <Select.Option value="true">Active</Select.Option>
          <Select.Option value="false">Inactive</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            Search
          </Button>
          <Button onClick={handleReset} icon={<ReloadOutlined />}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default UserSearchForm;
