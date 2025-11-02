import {
  Button,
  Descriptions,
  Input,
  message,
  Modal,
  Pagination,
  Space,
  Table,
  Tag,
  Card,
  Typography,
} from "antd";
import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import {
  fetchRoles,
  fetchCreateRole,
  fetchUpdateRole,
  fetchDeleteRole,
} from "./role.service";
import type { RoleResponse, RoleType } from "./role.type";
const { Title } = Typography;

const RolesPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [keyword, setKeyword] = useState("");
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [formValues, setFormValues] = useState<Partial<RoleType>>({});

  // === QUERY ===
  const { data, isLoading } = useQuery<RoleResponse, Error>({
    queryKey: ["roles", page, keyword],
    queryFn: () => fetchRoles(page, limit, keyword),
    placeholderData: keepPreviousData,
  });

  const roles = data?.roles ?? [];
  const totalRecords = data?.totalRecords ?? 0;

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: fetchCreateRole,
    onSuccess: () => {
      message.success("✅ Role created successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsModalFormOpen(false);
      setFormValues({});
    },
    onError: (err: any) => message.error(err.message || "Error creating role"),
  });

  const updateMutation = useMutation({
    mutationFn: fetchUpdateRole,
    onSuccess: () => {
      message.success("✅ Role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setIsModalFormOpen(false);
      setEditingRole(null);
      setFormValues({});
    },
    onError: (err: any) => message.error(err.message || "Error updating role"),
  });

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteRole,
    onSuccess: () => {
      message.success("🗑️ Role deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: any) => message.error(err.message || "Error deleting role"),
  });

  // === HANDLERS ===
  const handleSearch = () => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["roles"] });
  };

  const handleReload = () => {
    queryClient.invalidateQueries({ queryKey: ["roles"] });
  };

  const handleViewDetail = (record: RoleType) => {
    setSelectedRole(record);
    setIsModalDetailOpen(true);
  };

  const handleEdit = (record: RoleType) => {
    setEditingRole(record);
    setFormValues(record);
    setIsModalFormOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Confirm deletion",
      content: "Are you sure you want to delete this role?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmitForm = () => {
    if (!formValues.name) {
      message.warning("Please enter role name!");
      return;
    }

    const finalData = { ...formValues };

    if (editingRole) {
      updateMutation.mutate({
        id: editingRole._id!,
        formData: finalData as RoleType,
      });
    } else {
      createMutation.mutate(finalData as RoleType);
    }
  };

  // === TABLE ===
  const columns = [
    {
      title: "Role name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) =>
        desc ? desc : <Tag color="default">No description</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: RoleType) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Detail
          </Button>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button danger onClick={() => handleDelete(record._id!)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Card>
          <Space align="center" size="middle">
            <TeamOutlined style={{ fontSize: 32, color: "#1890ff" }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Role Management
              </Title>
              <Typography.Text type="secondary">
                Manage user roles and permissions
              </Typography.Text>
            </div>
          </Space>
        </Card>
        <Space>
          <Input
            placeholder="Search roles..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setEditingRole(null);
              setFormValues({});
              setIsModalFormOpen(true);
            }}
          >
            Add role
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReload}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={roles}
        pagination={false}
      />

      {/* Pagination */}
      <div style={{ textAlign: "right", marginTop: 20 }}>
        <Pagination
          current={page}
          total={totalRecords}
          pageSize={limit}
          showSizeChanger={false}
          onChange={(p) => {
            setPage(p);
            queryClient.invalidateQueries({ queryKey: ["roles"] });
          }}
          showTotal={(total) => `Total ${total} roles`}
        />
      </div>

      {/* Modal - Detail */}
      <Modal
        title={`Role Detail - ${selectedRole?.name}`}
        open={isModalDetailOpen}
        onCancel={() => setIsModalDetailOpen(false)}
        footer={<Button onClick={() => setIsModalDetailOpen(false)}>Close</Button>}
      >
        {selectedRole && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Role name">{selectedRole.name}</Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedRole.description || "No description"}
            </Descriptions.Item>
            <Descriptions.Item label="Created at">
              {selectedRole.createdAt
                ? new Date(selectedRole.createdAt).toLocaleDateString()
                : "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Updated at">
              {selectedRole.updatedAt
                ? new Date(selectedRole.updatedAt).toLocaleDateString()
                : "None"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal - Add/Edit */}
      <Modal
        title={editingRole ? "Update role" : "Add role"}
        open={isModalFormOpen}
        onCancel={() => {
          setIsModalFormOpen(false);
          setEditingRole(null);
          setFormValues({});
        }}
        onOk={handleSubmitForm}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Role name"
            value={formValues.name}
            onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
          />
          <Input.TextArea
            placeholder="Description"
            rows={3}
            value={formValues.description}
            onChange={(e) =>
              setFormValues({ ...formValues, description: e.target.value })
            }
          />
        </Space>
      </Modal>
    </>
  );
};

export default RolesPage;
