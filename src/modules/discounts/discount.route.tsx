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
  Switch,
  DatePicker,
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
  GiftOutlined,
} from "@ant-design/icons";

import {
  fetchDiscounts,
  fetchCreateDiscount,
  fetchUpdateDiscount,
  fetchDeleteDiscount,
} from "./discount.service";
import type { DiscountResponse, DiscountType } from "./discount.type";
import dayjs from "dayjs";
const { Title } = Typography;

const DiscountsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [keyword, setKeyword] = useState("");
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountType | null>(
    null
  );
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountType | null>(
    null
  );
  const [formValues, setFormValues] = useState<Partial<DiscountType>>({});

  // === QUERY ===
  const { data, isLoading } = useQuery<DiscountResponse, Error>({
    queryKey: ["discounts", page, keyword],
    queryFn: () => fetchDiscounts(page, limit, keyword),
    placeholderData: keepPreviousData,
  });

  const discounts = data?.discounts ?? [];
  const totalRecords = data?.totalRecords ?? 0;

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: fetchCreateDiscount,
    onSuccess: () => {
      message.success("✅ Discount created successfully!");
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      setIsModalFormOpen(false);
      setFormValues({});
    },
    onError: (err: any) =>
      message.error(err.message || "Error creating discount"),
  });

  const updateMutation = useMutation({
    mutationFn: fetchUpdateDiscount,
    onSuccess: () => {
      message.success("✅ Discount updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
      setIsModalFormOpen(false);
      setEditingDiscount(null);
      setFormValues({});
    },
    onError: (err: any) =>
      message.error(err.message || "Error updating discount"),
  });

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteDiscount,
    onSuccess: () => {
      message.success("🗑️ Discount deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
    onError: (err: any) =>
      message.error(err.message || "Error deleting discount"),
  });

  // === HANDLERS ===
  const handleSearch = () => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["discounts"] });
  };

  const handleReload = () => {
    queryClient.invalidateQueries({ queryKey: ["discounts"] });
  };

  const handleViewDetail = (record: DiscountType) => {
    setSelectedDiscount(record);
    setIsModalDetailOpen(true);
  };

  const handleEdit = (record: DiscountType) => {
    setEditingDiscount(record);
    setFormValues(record);
    setIsModalFormOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Confirm deletion",
      content: "Are you sure you want to delete this discount?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmitForm = () => {
    if (!formValues.name || !formValues.code) {
      message.warning("Please fill all required fields!");
      return;
    }

    const finalData = { ...formValues };

    if (editingDiscount) {
      updateMutation.mutate({
        id: editingDiscount._id!,
        formData: finalData as DiscountType,
      });
    } else {
      createMutation.mutate(finalData as DiscountType);
    }
  };

  // === TABLE ===
  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Percent",
      dataIndex: "discountPercent",
      key: "discountPercent",
      render: (val: number) => `${val}%`,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (val: boolean) =>
        val ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: DiscountType) => (
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
            <GiftOutlined style={{ fontSize: 32, color: "#faad14" }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Discount Management
              </Title>
              <Typography.Text type="secondary">
                Manage discount codes and campaigns
              </Typography.Text>
            </div>
          </Space>
        </Card>
        <Space>
          <Input
            placeholder="Search discount..."
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
              setEditingDiscount(null);
              setFormValues({});
              setIsModalFormOpen(true);
            }}
          >
            Add discount
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
        dataSource={discounts}
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
            queryClient.invalidateQueries({ queryKey: ["discounts"] });
          }}
          showTotal={(total) => `Total ${total} discounts`}
        />
      </div>

      {/* Modal - Detail */}
      <Modal
        title={`Discount Detail - ${selectedDiscount?.name}`}
        open={isModalDetailOpen}
        onCancel={() => setIsModalDetailOpen(false)}
        footer={<Button onClick={() => setIsModalDetailOpen(false)}>Close</Button>}
      >
        {selectedDiscount && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Code">
              {selectedDiscount.code}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {selectedDiscount.name}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedDiscount.description || "No description"}
            </Descriptions.Item>
            <Descriptions.Item label="Discount percent">
              {selectedDiscount.discountPercent}%
            </Descriptions.Item>
            <Descriptions.Item label="Start date">
              {selectedDiscount.startDate
                ? new Date(selectedDiscount.startDate).toLocaleDateString()
                : "None"}
            </Descriptions.Item>
            <Descriptions.Item label="End date">
              {selectedDiscount.endDate
                ? new Date(selectedDiscount.endDate).toLocaleDateString()
                : "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Active">
              {selectedDiscount.isActive ? "✅ Yes" : "❌ No"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal - Add/Edit */}
      <Modal
        title={editingDiscount ? "Update discount" : "Add discount"}
        open={isModalFormOpen}
        onCancel={() => {
          setIsModalFormOpen(false);
          setEditingDiscount(null);
          setFormValues({});
        }}
        onOk={handleSubmitForm}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Discount code"
            value={formValues.code}
            onChange={(e) => setFormValues({ ...formValues, code: e.target.value })}
          />
          <Input
            placeholder="Discount name"
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
          <Input
            placeholder="Discount percent (%)"
            type="number"
            value={formValues.discountPercent}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                discountPercent: Number(e.target.value),
              })
            }
          />
          <DatePicker
            placeholder="Start date"
            style={{ width: "100%" }}
            value={formValues.startDate ? dayjs(formValues.startDate) : undefined}
            onChange={(date) =>
              setFormValues({
                ...formValues,
                startDate: date ? date.toISOString() : undefined,
              })
            }
          />
          <DatePicker
            placeholder="End date"
            style={{ width: "100%" }}
            value={formValues.endDate ? dayjs(formValues.endDate) : undefined}
            onChange={(date) =>
              setFormValues({
                ...formValues,
                endDate: date ? date.toISOString() : undefined,
              })
            }
          />
          <div>
            Active:{" "}
            <Switch
              checked={formValues.isActive}
              onChange={(val) => setFormValues({ ...formValues, isActive: val })}
            />
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default DiscountsPage;
