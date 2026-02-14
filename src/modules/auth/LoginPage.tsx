import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, Card, Typography } from "antd";
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
    login(values.email, values.password, () => {
      navigate("/dashboard");
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
      }}
    >
      <Card
        style={{
          width: 380,
          padding: "24px 30px",
          borderRadius: 12,
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Admin Login
          </Title>
          <Text type="secondary">Sign in to manage the dashboard</Text>
        </div>

        <Form
          name="basic"
          layout="vertical"
          initialValues={{
            email: "admin@gmail.com",
            password: "!Qaz123456",
            remember: true,
          }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter Email!" }]}
          >
            <Input size="large" placeholder="Enter your email" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter Password!" }]}
          >
            <Input.Password size="large" placeholder="Enter password" />
          </Form.Item>

          <Form.Item<FieldType> name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            style={{ marginTop: 10 }}
          >
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
