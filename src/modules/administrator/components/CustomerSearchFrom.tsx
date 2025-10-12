import { Form, Input, Button, Space } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

interface CustomerSearchFormProps {
  onSearch: (values: { search?: string }) => void;
}

const CustomerSearchForm = ({ onSearch }: CustomerSearchFormProps) => {
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
          placeholder="Search by name, email, or phone"
          allowClear
          style={{ width: 300 }}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            Search
          </Button>
          <Button htmlType="button" onClick={handleReset} icon={<ReloadOutlined />}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CustomerSearchForm;
