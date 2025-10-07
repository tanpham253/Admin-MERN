import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
} from "antd";
import type { TableProps } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { useAppMessage } from "../../../stores/useAppMessage";
import { useState } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";
import type { User } from "../services/userService";

const UsersPage = () => {
  const navigate = useNavigate();
  const { sendMessage } = useAppMessage();
  const queryClient = useQueryClient();

  // Pagination
  const [params] = useSearchParams();
  const page = params.get("page");
  const limit = params.get("limit");
  const int_page = page ? parseInt(page) : 1;
  const int_limit = limit ? parseInt(limit) : 5;

  /* ---- FETCH USERS ---- */
  const queryUsers = useQuery({
    queryKey: ["users", int_page, int_limit],
    queryFn: () => fetchUsers(int_page, int_limit),
  });

  // console.log("🟡 queryUsers status:", queryUsers.status);
  // console.log("🟢 queryUsers.data:", queryUsers.data);
  // console.log("🟣 queryUsers.data?.data:", queryUsers.data?.data);
  // console.log("🔵 dataSource about to render:", queryUsers.data?.data || []);

  /* ---- DELETE USER ---- */
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      sendMessage({ msg: "User deleted successfully", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      sendMessage({ msg: "Failed to delete user", type: "error" });
    },
  });

  /* ---- ADD USER ---- */
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [formAdd] = Form.useForm();

  const mutationAddUser = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      sendMessage({ msg: "User added successfully", type: "success" });
      setIsModalAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      formAdd.resetFields();
    },
    onError: () => {
      sendMessage({ msg: "Failed to add user", type: "error" });
    },
  });

  const handleModalAddOk = () => formAdd.submit();
  const handleModalAddCancel = () => setIsModalAddOpen(false);

  const onFinishAdd = async (values: any) => {
    console.log("Adding user:", values);
    await mutationAddUser.mutateAsync(values);
  };

  /* ---- EDIT USER ---- */
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [formEdit] = Form.useForm();

  const mutationEditUser = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      updateUser(id, data),
    onSuccess: () => {
      sendMessage({ msg: "User updated successfully", type: "success" });
      setIsModalEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      sendMessage({ msg: "Failed to update user", type: "error" });
    },
  });

  const handleModalEditOk = () => formEdit.submit();
  const handleModalEditCancel = () => setIsModalEditOpen(false);

  const onFinishEdit = async (values: any) => {
    await mutationEditUser.mutateAsync({
      id: formEdit.getFieldValue("id"),
      data: values,
    });
  };

  /* ---- TABLE COLUMNS ---- */
  const columns: TableProps<User>["columns"] = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Role",
      key: "roles",
      render: (_, record) => (
        <span style={{ textTransform: "capitalize" }}>
          {record.roles?.[0] || "N/A"}
        </span>
      ),
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (value: boolean) => <Switch checked={value} disabled />,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              setIsModalEditOpen(true);
              formEdit.setFieldsValue(record);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete User"
            description="Are you sure to delete this user?"
            onConfirm={async () => {
              await deleteMutation.mutateAsync(record.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Flex justify="space-between" align="center">
        <h1>User Management</h1>
        <Button onClick={() => setIsModalAddOpen(true)} type="primary">
          Add User
        </Button>
      </Flex>

      <Table<User>
        rowKey="_id"
        loading={queryUsers.isLoading}
        columns={columns}
        dataSource={queryUsers.data?.data || []} // ✅ correct (data array)
        pagination={{
          current: int_page,
          pageSize: int_limit,
          total: queryUsers.data?.data.count || 0, // ✅ use count
          onChange: (page, pageSize) => {
            navigate(`?page=${page}&limit=${pageSize}`);
          },
        }}
      />

      {/* MODAL ADD */}
      <Modal
        title="Add User"
        open={isModalAddOpen}
        onOk={handleModalAddOk}
        onCancel={handleModalAddCancel}
      >
        <Form form={formAdd} layout="vertical" onFinish={onFinishAdd}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter an email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="First Name"
            name="first_name"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="last_name"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Input placeholder="admin or staff" />
          </Form.Item>
          <Form.Item
            label="Active"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL EDIT */}
      <Modal
        title="Edit User"
        open={isModalEditOpen}
        onOk={handleModalEditOk}
        onCancel={handleModalEditCancel}
      >
        <Form form={formEdit} layout="vertical" onFinish={onFinishEdit}>
          <Form.Item label="ID" name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="First Name" name="first_name">
            <Input />
          </Form.Item>
          <Form.Item label="Last Name" name="last_name">
            <Input />
          </Form.Item>
          <Form.Item label="Role" name="role">
            <Input placeholder="admin or staff" />
          </Form.Item>
          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UsersPage;
