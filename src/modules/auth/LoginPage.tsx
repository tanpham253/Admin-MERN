import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, Card, Typography, Space } from "antd";
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;

type FieldType = {
  email: string;
  password: string;
  remember: boolean;
};

const LoginPage = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    console.log("Success:", values);
    login(values.email, values.password, () => navigate("/dashboard"));
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ textAlign: "center" }}>
            <Title level={3} style={{ marginBottom: 4 }}>
              Welcome Back
            </Title>
            <Text type="secondary">Login to your account</Text>
          </div>

          <Form<FieldType>
            name="login"
            layout="vertical"
            initialValues={{
              email: "admin@gmail.com",
              password: "!Qaz123456",
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
              tooltip="Try admin@gmail.com"
            >
              <Input placeholder="Enter your email" size="large" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
              tooltip="Try !Qaz123456"
            >
              <Input.Password placeholder="Enter your password" size="large" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                style={{ borderRadius: 6 }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default LoginPage;
