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
  fetchCategories,
  fetchCreateCategory,
  fetchUpdateCategory,
  fetchDeleteCategory,
} from "./category.service";
import type { CategoryType, CategoriesResponse } from "./category.type";

const CategoriesPage = () => {
  const queryClient = useQueryClient();

  // === STATE ===
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [keyword, setKeyword] = useState("");
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [formValues, setFormValues] = useState<Partial<CategoryType>>({});

  // === QUERY ===
  const { data, isLoading } = useQuery<CategoriesResponse, Error>({
    queryKey: ["categories", page, keyword],
    queryFn: () => fetchCategories(page, limit, keyword),
    placeholderData: keepPreviousData,
  });

  const categories = data?.categories ?? [];
  const totalRecords = data?.totalRecords ?? 0;

  // === HANDLERS ===
  const handleSearch = () => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const handleReload = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: fetchCreateCategory,
    onSuccess: () => {
      message.success("✅ Thêm danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalFormOpen(false);
      setFormValues({});
    },
    onError: (err: any) =>
      message.error(err.message || "Lỗi khi thêm danh mục"),
  });

  const updateMutation = useMutation({
    mutationFn: fetchUpdateCategory,
    onSuccess: () => {
      message.success("✅ Cập nhật danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalFormOpen(false);
      setEditingCategory(null);
      setFormValues({});
    },
    onError: (err: any) =>
      message.error(err.message || "Lỗi khi cập nhật danh mục"),
  });

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteCategory,
    onSuccess: () => {
      message.success("🗑️ Xóa danh mục thành công!");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (err: any) =>
      message.error(err.message || "Lỗi khi xóa danh mục"),
  });

  // === CRUD Handlers ===
  const handleViewDetail = (record: CategoryType) => {
    setSelectedCategory(record);
    setIsModalDetailOpen(true);
  };

  const handleEdit = (record: CategoryType) => {
    setEditingCategory(record);
    setFormValues(record);
    setIsModalFormOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa danh mục này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmitForm = () => {
    if (!formValues.category_name) {
      message.warning("Vui lòng nhập tên danh mục!");
      return;
    }

    const slug = formValues.slug
      ? formValues.slug.trim().toLowerCase().replace(/\s+/g, "-")
      : formValues.category_name.trim().toLowerCase().replace(/\s+/g, "-");

    const finalData = { ...formValues, slug };

    if (editingCategory) {
      updateMutation.mutate({
        id: editingCategory._id!,
        formData: finalData as CategoryType,
      });
    } else {
      createMutation.mutate(finalData as CategoryType);
    }
  };

  // === COLUMNS ===
  const columns = [
    {
      title: "Category name",
      dataIndex: "category_name",
      key: "category_name",
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
      render: (_: any, record: CategoryType) => (
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
        <h1>Category</h1>
        <Space>
          <Input
            placeholder="Search categories..."
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
              setEditingCategory(null);
              setFormValues({});
              setIsModalFormOpen(true);
            }}
          >
            Add category
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
        dataSource={categories}
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
            queryClient.invalidateQueries({ queryKey: ["categories"] });
          }}
          showTotal={(total) => `Total ${total} categories`}
        />
      </div>

      {/* Modal - Detail */}
      <Modal
        title={`Chi tiết danh mục - ${selectedCategory?.category_name}`}
        open={isModalDetailOpen}
        onCancel={() => {
          setIsModalDetailOpen(false);
          setSelectedCategory(null);
        }}
        footer={<Button onClick={() => setIsModalDetailOpen(false)}>Close</Button>}
        width={700}
      >
        {selectedCategory && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Category name" span={2}>
              {selectedCategory.category_name}
            </Descriptions.Item>
            <Descriptions.Item label="Slug" span={2}>
              {selectedCategory.slug}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedCategory.description || "No description"}
            </Descriptions.Item>
            <Descriptions.Item label="Date created" span={1}>
              {selectedCategory.createdAt
                ? new Date(selectedCategory.createdAt).toLocaleDateString()
                : "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Update" span={1}>
              {selectedCategory.updatedAt
                ? new Date(selectedCategory.updatedAt).toLocaleDateString()
                : "None"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal - Add/Edit */}
      <Modal
        title={editingCategory ? "Update category" : "Add category"}
        open={isModalFormOpen}
        onCancel={() => {
          setIsModalFormOpen(false);
          setEditingCategory(null);
          setFormValues({});
        }}
        onOk={handleSubmitForm}
        confirmLoading={createMutation.isLoading || updateMutation.isLoading}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Category name"
            value={formValues.category_name}
            onChange={(e) =>
              setFormValues({ ...formValues, category_name: e.target.value })
            }
          />
          <Input
            placeholder="Slug (Automatically if left blank)"
            value={formValues.slug}
            onChange={(e) => setFormValues({ ...formValues, slug: e.target.value })}
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

export default CategoriesPage;
