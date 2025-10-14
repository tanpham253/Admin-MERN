import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
} from "antd";
import { useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { SearchOutlined } from "@ant-design/icons";
import {
  fetchCategories,
  fetchCreateCategory,
  fetchUpdateCategory,
  fetchDeleteCategory,
} from "./category.service";
import type { CategoryType, CategoriesResponse } from "./category.type";
import { useAppMessage } from "../../stores/useAppMessage";
import ActionHasRoles from "../auth/components/ActionHasRoles";

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const { sendMessage } = useAppMessage();
  const { Search } = Input;

  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [keyword, setKeyword] = useState("");

  // === QUERY
  const { data, isLoading } = useQuery<CategoriesResponse, Error>({
    queryKey: ["categories", page, keyword],
    queryFn: () => fetchCategories(page, limit, keyword),
    placeholderData: keepPreviousData,
  });

  const categories = data?.data?.data ?? data?.data ?? [];
  const totalRecords = data?.data?.totalRecords ?? categories.length;
  const pageSize = data?.data?.limit ?? limit;

  // === MUTATIONS
  const createCategoryMutation = useMutation({
    mutationFn: fetchCreateCategory,
    onSuccess: () => {
      sendMessage({ msg: "Category created!", type: "success" });
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      formAdd.resetFields();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: fetchUpdateCategory,
    onSuccess: () => {
      sendMessage({ msg: "Category updated!", type: "success" });
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: fetchDeleteCategory,
    onSuccess: () => {
      sendMessage({ msg: "Category deleted!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // === ADD MODAL
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formAdd] = Form.useForm();
  const handleAddOk = () => formAdd.submit();
  const handleAddCancel = () => setIsAddOpen(false);
  const onFinishAdd = (values: any) => createCategoryMutation.mutate(values);

  // === EDIT MODAL
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formEdit] = Form.useForm();
  const handleEditOk = () => formEdit.submit();
  const handleEditCancel = () => setIsEditOpen(false);
  const onFinishEdit = (values: any) =>
    updateCategoryMutation.mutate({
      id: formEdit.getFieldValue("_id"),
      formData: values,
    });

  const columns = [
    { title: "Name", dataIndex: "category_name", key: "category_name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string) => desc || "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CategoryType) => (
        <Space>
          <Button
            onClick={() => {
              formEdit.setFieldsValue(record);
              setIsEditOpen(true);
            }}
          >
            Edit
          </Button>
          <ActionHasRoles requiredRoles={["admin", "staff"]}>
            <Popconfirm
              title="Delete Category"
              description="Are you sure to delete this category?"
              onConfirm={() => deleteCategoryMutation.mutate(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          </ActionHasRoles>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
        <h1>Category Management</h1>
        <Search
          placeholder="Search category..."
          allowClear
          enterButton={<SearchOutlined />}
          style={{ width: 300 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={() => setPage(1)}
        />
        <Button type="primary" onClick={() => setIsAddOpen(true)}>
          Add Category
        </Button>
      </Flex>

      <Table
        rowKey="_id"
        columns={columns}
        loading={isLoading}
        dataSource={categories}
        pagination={{
          current: page,
          pageSize,
          total: totalRecords,
          onChange: (p) => setPage(p),
        }}
      />

      {/* === ADD MODAL === */}
      <Modal
        title="Add Category"
        open={isAddOpen}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      >
        <Form form={formAdd} layout="vertical" onFinish={onFinishAdd}>
          <Form.Item
            label="Category Name"
            name="category_name"
            rules={[{ required: true, message: "Please input category name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: "Please input slug!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* === EDIT MODAL === */}
      <Modal
        title="Edit Category"
        open={isEditOpen}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form form={formEdit} layout="vertical" onFinish={onFinishEdit}>
          <Form.Item
            label="Category Name"
            name="category_name"
            rules={[{ required: true, message: "Please input category name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: "Please input slug!" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CategoriesPage;
