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
  Image,
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
  TrademarkOutlined,
} from "@ant-design/icons";

import {
  fetchBrands,
  fetchCreateBrand,
  fetchUpdateBrand,
  fetchDeleteBrand,
} from "./brand.service";
import type { BrandResponse, BrandType } from "./brand.type";
const { Title } = Typography;

const BrandsPage = () => {
  const queryClient = useQueryClient();

  // === STATE ===
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [keyword, setKeyword] = useState("");
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandType | null>(null);
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandType | null>(null);
  const [formValues, setFormValues] = useState<Partial<BrandType>>({});

  // === QUERY ===
  const { data, isLoading } = useQuery<BrandResponse, Error>({
    queryKey: ["brands", page, keyword],
    queryFn: () => fetchBrands(page, limit, keyword),
    placeholderData: keepPreviousData,
  });

  const brands = data?.brands ?? [];
  const totalRecords = data?.totalRecords ?? 0;

  // === HANDLERS ===
  const handleSearch = () => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["brands"] });
  };

  const handleReload = () => {
    queryClient.invalidateQueries({ queryKey: ["brands"] });
  };

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: fetchCreateBrand,
    onSuccess: () => {
      message.success("✅ Add brand successfully!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsModalFormOpen(false);
      setFormValues({});
    },
    onError: (err: any) =>
      message.error(err.message || "Error adding brand"),
  });

  const updateMutation = useMutation({
    mutationFn: fetchUpdateBrand,
    onSuccess: () => {
      message.success("✅ Successful brand update!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsModalFormOpen(false);
      setEditingBrand(null);
      setFormValues({});
    },
    onError: (err: any) =>
      message.error(err.message || "Error while updating brand"),
  });

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteBrand,
    onSuccess: () => {
      message.success("🗑️ Brand removal successful!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: (err: any) =>
      message.error(err.message || "Error while deleting brand"),
  });

  // === CRUD Handlers ===
  const handleViewDetail = (record: BrandType) => {
    setSelectedBrand(record);
    setIsModalDetailOpen(true);
  };

  const handleEdit = (record: BrandType) => {
    setEditingBrand(record);
    setFormValues(record);
    setIsModalFormOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Confirm deletion",
      content: "Are you sure you want to delete this brand??",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmitForm = () => {
    if (!formValues.brand_name) {
      message.warning("Please enter brand name!");
      return;
    }

    // Sinh slug tự động
    const slug = formValues.slug
      ? formValues.slug.trim().toLowerCase().replace(/\s+/g, "-")
      : formValues.brand_name.trim().toLowerCase().replace(/\s+/g, "-");

    const finalData = { ...formValues, slug };

    if (editingBrand) {
      updateMutation.mutate({
        id: editingBrand._id!,
        formData: finalData as BrandType,
      });
    } else {
      createMutation.mutate(finalData as BrandType);
    }
  };

  // === COLUMNS ===
  const columns = [
    {
      title: "Brand name",
      dataIndex: "brand_name",
      key: "brand_name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (desc: string) =>
        desc ? desc : <Tag color="default">No description</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: BrandType) => (
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
       {/* ✅ Header fixed */}
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
            <TrademarkOutlined style={{ fontSize: 32, color: "#52c41a" }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Brand Management
              </Title>
              <Typography.Text type="secondary">
                View and manage all brands in the system
              </Typography.Text>
            </div>
          </Space>
        </Card>
        <Space>
          <Input
            placeholder="Brand Search..."
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
              setEditingBrand(null);
              setFormValues({});
              setIsModalFormOpen(true);
            }}
          >
            Add brand
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
        dataSource={brands}
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
            queryClient.invalidateQueries({ queryKey: ["brands"] });
          }}
          showTotal={(total) => `Total ${total} brand`}
        />
      </div>

      {/* Modal - Detail */}
      <Modal
        title={`Brand Detail - ${selectedBrand?.brand_name}`}
        open={isModalDetailOpen}
        onCancel={() => {
          setIsModalDetailOpen(false);
          setSelectedBrand(null);
        }}
        footer={<Button onClick={() => setIsModalDetailOpen(false)}>Close</Button>}
        width={700}
      >
        {selectedBrand && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Logo" span={2}>
              {selectedBrand.image ? (
                <Image
                  src={selectedBrand.image}
                  alt={selectedBrand.brand_name}
                  width={120}
                />
              ) : (
                "No images"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Brand" span={2}>
              {selectedBrand.brand_name}
            </Descriptions.Item>
            <Descriptions.Item label="Slug" span={2}>
              {selectedBrand.slug}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedBrand.description || "No description"}
            </Descriptions.Item>
            <Descriptions.Item label="Date created" span={1}>
              {selectedBrand.createdAt
                ? new Date(selectedBrand.createdAt).toLocaleDateString()
                : "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Update" span={1}>
              {selectedBrand.updatedAt
                ? new Date(selectedBrand.updatedAt).toLocaleDateString()
                : "None"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal - Add/Edit */}
      <Modal
        title={editingBrand ? "Brand update" : "Add brand"}
        open={isModalFormOpen}
        onCancel={() => {
          setIsModalFormOpen(false);
          setEditingBrand(null);
          setFormValues({});
        }}
        onOk={handleSubmitForm}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Brand name"
            value={formValues.brand_name}
            onChange={(e) =>
              setFormValues({ ...formValues, brand_name: e.target.value })
            }
          />
          <Input
            placeholder="Slug (automatically if left blank)"
            value={formValues.slug}
            onChange={(e) =>
              setFormValues({ ...formValues, slug: e.target.value })
            }
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
            placeholder="Logo image URL"
            value={formValues.image}
            onChange={(e) =>
              setFormValues({ ...formValues, image: e.target.value })
            }
          />
        </Space>
      </Modal>
    </>
  );
};

export default BrandsPage;
