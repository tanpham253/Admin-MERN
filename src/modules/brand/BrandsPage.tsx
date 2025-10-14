import {
  Button,
  Descriptions,
  Flex,
  Input,
  message,
  Modal,
  Pagination,
  Space,
  Table,
  Tag,
} from "antd";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { SearchOutlined, EyeOutlined, ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { fetchBrands, fetchCreateBrand, fetchUpdateBrand, fetchDeleteBrand } from "./brand.service";
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
  const { data, isLoading, refetch } = useQuery<BrandResponse, Error>({
    queryKey: ["brands", page, keyword],
    queryFn: () => fetchBrands(page, limit, keyword),
    placeholderData: keepPreviousData,
  });
  // === HANDLERS ===
const handleSearch = () => {
  // Khi nhấn Enter hoặc icon tìm kiếm, luôn reset về trang 1 và fetch lại dữ liệu
  setPage(1);
  refetch();
};

  const brands = Array.isArray(data) ? data : data?.brands ?? [];
  const totalRecords = Array.isArray(data) ? data.length : data?.totalRecords ?? 0;

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: fetchCreateBrand,
    onSuccess: () => {
      message.success("✅ Thêm thương hiệu thành công!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsModalFormOpen(false);
      setFormValues({});
    },
    onError: (err: any) => message.error(err.message || "Lỗi khi thêm thương hiệu"),
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
    onError: (err: any) => message.error(err.message || "Lỗi khi cập nhật thương hiệu"),
  });

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteBrand,
    onSuccess: () => {
      message.success("🗑️ Xóa thương hiệu thành công!");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: (err: any) => message.error(err.message || "Lỗi khi xóa thương hiệu"),
  });

  // === HANDLERS ===

  
  const handleSearch = () => setPage(1);

  const handleViewDetail = (record: BrandType) => {
    setSelectedBrand(record);
    setIsModalDetailOpen(true);
  };

  const handleModalDetailCancel = () => {
    setIsModalDetailOpen(false);
    setSelectedBrand(null);
  };

  const handleEdit = (record: BrandType) => {
    setEditingBrand(record);
    setFormValues(record);
    setIsModalFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmitForm = () => {
    if (!formValues.brand_name) {
      message.warning("Vui lòng nhập tên thương hiệu!");
      return;
    }
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand._id!, formData: formValues });
    } else {
      createMutation.mutate(formValues as BrandType);
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
      render: (desc: string) => desc || <Tag color="default">Không có mô tả</Tag>,
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
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <h1>Brands</h1>
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
          <Button icon={<ReloadOutlined />} onClick={() => queryClient.invalidateQueries({ queryKey: ["brands"] })}>
            Làm mới
          </Button>
        </Space>
      </Flex>

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
          onChange={(p) => setPage(p)}
          showTotal={(total) => `Tổng ${total} thương hiệu`}
        />
      </div>

      {/* Modal - Detail */}
      <Modal
        title={`Chi tiết thương hiệu - ${selectedBrand?.brand_name}`}
        open={isModalDetailOpen}
        onCancel={handleModalDetailCancel}
        footer={[
          <Button key="close" onClick={handleModalDetailCancel}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedBrand && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Tên thương hiệu" span={2}>
              {selectedBrand.brand_name}
            </Descriptions.Item>
            <Descriptions.Item label="Slug" span={2}>
              {selectedBrand.slug}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {selectedBrand.description || "Không có mô tả"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={2}>
              {selectedBrand.createdAt
                ? new Date(selectedBrand.createdAt).toLocaleDateString()
                : "Không có"}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật" span={2}>
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
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Tên thương hiệu"
            value={formValues.brand_name}
            onChange={(e) => setFormValues({ ...formValues, brand_name: e.target.value })}
          />
          <Input
            placeholder="Slug"
            value={formValues.slug}
            onChange={(e) => setFormValues({ ...formValues, slug: e.target.value })}
          />
          <Input.TextArea
            placeholder="Mô tả"
            rows={3}
            value={formValues.description}
            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
          />
        </Space>
      </Modal>
    </>
  );
};

export default BrandsPage;
