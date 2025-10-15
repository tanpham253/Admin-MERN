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
} from "@ant-design/icons";
import {
  fetchBrands,
  fetchCreateBrand,
  fetchUpdateBrand,
  fetchDeleteBrand,
} from "./brand.service";
import type { BrandResponse, BrandType } from "./brand.type";

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
      message.success("✅ Thêm thương hiệu thành công!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsModalFormOpen(false);
      setFormValues({});
    },
    onError: (err: any) =>
      message.error(err.message || "Lỗi khi thêm thương hiệu"),
  });

  const updateMutation = useMutation({
    mutationFn: fetchUpdateBrand,
    onSuccess: () => {
      message.success("✅ Cập nhật thương hiệu thành công!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsModalFormOpen(false);
      setEditingBrand(null);
      setFormValues({});
    },
    onError: (err: any) =>
      message.error(err.message || "Lỗi khi cập nhật thương hiệu"),
  });

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteBrand,
    onSuccess: () => {
      message.success("🗑️ Xóa thương hiệu thành công!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: (err: any) =>
      message.error(err.message || "Lỗi khi xóa thương hiệu"),
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
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa thương hiệu này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmitForm = () => {
    if (!formValues.brand_name) {
      message.warning("Vui lòng nhập tên thương hiệu!");
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
      title: "Tên thương hiệu",
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
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (desc: string) =>
        desc ? desc : <Tag color="default">Không có mô tả</Tag>,
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: BrandType) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          <Button type="primary" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button danger onClick={() => handleDelete(record._id!)}>
            Xóa
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
        <h1>Thương hiệu</h1>
        <Space>
          <Input
            placeholder="Tìm kiếm thương hiệu..."
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
            Thêm thương hiệu
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReload}>
            Làm mới
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
          showTotal={(total) => `Tổng ${total} thương hiệu`}
        />
      </div>

      {/* Modal - Detail */}
      <Modal
        title={`Chi tiết thương hiệu - ${selectedBrand?.brand_name}`}
        open={isModalDetailOpen}
        onCancel={() => {
          setIsModalDetailOpen(false);
          setSelectedBrand(null);
        }}
        footer={<Button onClick={() => setIsModalDetailOpen(false)}>Đóng</Button>}
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
                "Không có hình ảnh"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Tên thương hiệu" span={2}>
              {selectedBrand.brand_name}
            </Descriptions.Item>
            <Descriptions.Item label="Slug" span={2}>
              {selectedBrand.slug}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {selectedBrand.description || "Không có mô tả"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={1}>
              {selectedBrand.createdAt
                ? new Date(selectedBrand.createdAt).toLocaleDateString()
                : "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật" span={1}>
              {selectedBrand.updatedAt
                ? new Date(selectedBrand.updatedAt).toLocaleDateString()
                : "Không có"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal - Add/Edit */}
      <Modal
        title={editingBrand ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
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
            placeholder="Tên thương hiệu"
            value={formValues.brand_name}
            onChange={(e) =>
              setFormValues({ ...formValues, brand_name: e.target.value })
            }
          />
          <Input
            placeholder="Slug (tự động nếu bỏ trống)"
            value={formValues.slug}
            onChange={(e) =>
              setFormValues({ ...formValues, slug: e.target.value })
            }
          />
          <Input.TextArea
            placeholder="Mô tả"
            rows={3}
            value={formValues.description}
            onChange={(e) =>
              setFormValues({ ...formValues, description: e.target.value })
            }
          />
          <Input
            placeholder="URL hình ảnh logo"
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
