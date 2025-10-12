import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
} from "antd";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchOutlined } from "@ant-design/icons";
import {
  fetchBrands,
  fetchCreateBrand,
  fetchUpdateBrand,
  fetchDeleteBrand,
} from "./brand.service";
import type { BrandType, BrandsResponse } from "./brand.type";
import { useNavigate, useSearchParams } from "react-router";
import { useAppMessage } from "../../stores/useAppMessage";
import ActionHasRoles from "../auth/components/ActionHasRoles";

const BrandsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { sendMessage } = useAppMessage();
  const { Search } = Input;

  const [params] = useSearchParams();
  const page = Number(params.get("page")) || 1;
  const limit = Number(params.get("limit")) || 5;
  const keyword = params.get("keyword") || "";

  const [searchKeyword, setSearchKeyword] = useState(keyword);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const updated = new URLSearchParams(params);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === null) {
        updated.delete(key);
      } else {
        updated.set(key, String(value));
      }
    });
    navigate(`?${updated.toString()}`);
  };

  // === QUERY: Fetch brands
  // const queryBrands = useQuery<BrandsResponse, Error>({
  //   queryKey: ["brands", page, limit, keyword],
  //   queryFn: () => fetchBrands(page, limit, keyword),
  //   placeholderData: (prev) => prev,
  // });

  // === MUTATIONS
  const createBrandMutation = useMutation({
    mutationFn: fetchCreateBrand,
    onSuccess: () => {
      sendMessage({ msg: "Brand created!", type: "success" });
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      formAdd.resetFields();
    },
    onError: () => {
      sendMessage({ msg: "Create failed!", type: "error" });
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: fetchUpdateBrand,
    onSuccess: () => {
      sendMessage({ msg: "Brand updated!", type: "success" });
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: () => {
      sendMessage({ msg: "Update failed!", type: "error" });
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: fetchDeleteBrand,
    onSuccess: () => {
      sendMessage({ msg: "Brand deleted!", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
    onError: () => {
      sendMessage({ msg: "Delete failed!", type: "error" });
    },
  });

  // === ADD MODAL
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formAdd] = Form.useForm();
  const handleAddOk = () => formAdd.submit();
  const handleAddCancel = () => setIsAddOpen(false);
  const onFinishAdd = (values: any) => {
    createBrandMutation.mutate(values);
  };

  // === EDIT MODAL
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formEdit] = Form.useForm();
  const handleEditOk = () => formEdit.submit();
  const handleEditCancel = () => setIsEditOpen(false);
  const onFinishEdit = (values: any) => {
    updateBrandMutation.mutate({
      id: formEdit.getFieldValue("_id"),
      formData: values,
    });
  };

  // === TABLE COLUMNS
  const columns = [
    {
      title: "Name",
      dataIndex: "brand_name",
      key: "brand_name",
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
      render: (desc: string) => desc || "—",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: BrandType) => (
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
              title="Delete Brand"
              description="Are you sure to delete this brand?"
              onConfirm={() => deleteBrandMutation.mutate(record._id)}
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
        <h1>Brand Management</h1>
        <Search
          placeholder="Search brand..."
          allowClear
          enterButton={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={(value) => updateSearchParams({ page: 1, keyword: value })}
        />
        <Button type="primary" onClick={() => setIsAddOpen(true)}>
          Add Brand
        </Button>
      </Flex>

      {/* <Table
        key="_id"
        columns={columns}
        loading={queryBrands.isLoading}
        dataSource={queryBrands.data?.brands || []}
        pagination={{
          current: queryBrands.data?.page || 1,
          pageSize: 5,
          total: queryBrands.data?.totalRecords || 0,
          showSizeChanger: false,
          onChange: (p) => updateSearchParams({ page: p }),
        }}
      /> */}

      {/* === ADD MODAL === */}
      <Modal
        title="Add Brand"
        open={isAddOpen}
        onOk={handleAddOk}
        onCancel={handleAddCancel}
      >
        <Form form={formAdd} layout="vertical" onFinish={onFinishAdd}>
          <Form.Item
            label="Brand Name"
            name="brand_name"
            rules={[
              { required: true, message: "Please input the brand name!" },
              { min: 3, message: "At least 3 characters" },
              { max: 50, message: "Max 50 characters" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[
              { required: true, message: "Please input the slug!" },
              { min: 3 },
              { max: 255 },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* === EDIT MODAL === */}
      <Modal
        title="Edit Brand"
        open={isEditOpen}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
      >
        <Form form={formEdit} layout="vertical" onFinish={onFinishEdit}>
          <Form.Item
            label="Brand Name"
            name="brand_name"
            rules={[{ required: true, message: "Please input brand name!" }]}
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

export default BrandsPage;