import {
  Button,
  Input,
  message,
  Modal,
  Pagination,
  Space,
  Table,
  Image,
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
  TrademarkOutlined,
} from "@ant-design/icons";
import {
  fetchProducts,
  fetchDelete,
  fetchCreate,
  updateData,
  fetchCategories,
  fetchBrands,
} from "./product.service";
import type { ProductType, ProductsResponse } from "./product.type";
import Title from "antd/es/typography/Title";

const ProductsPage = () => {
  const queryClient = useQueryClient();

  // === STATE ===
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [keyword, setKeyword] = useState("");
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(
    null
  );
  const [formValues, setFormValues] = useState<Partial<ProductType>>({});
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );

  // === FETCH DATA ===
  const { data, isLoading } = useQuery<ProductsResponse, Error>({
    queryKey: ["products", page, keyword],
    queryFn: () => fetchProducts(page, limit, keyword),
    placeholderData: keepPreviousData,
  });

  const products = data?.products ?? [];
  const totalRecords = data?.totalRecords ?? 0;

  const queryCategories = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const queryBrands = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  // === MUTATIONS ===
  const createMutation = useMutation({
    mutationFn: fetchCreate,
    onSuccess: () => {
      message.success("✅ Product added successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalFormOpen(false);
      setFormValues({});
    },
    onError: (err: any) => message.error(err.message || "Error adding product"),
  });

  const updateMutation = useMutation({
    mutationFn: updateData,
    onSuccess: () => {
      message.success("✅ Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalFormOpen(false);
      setEditingProduct(null);
      setFormValues({});
    },
    onError: (err: any) =>
      message.error(err.message || "Error updating product"),
  });

  const deleteMutation = useMutation({
    mutationFn: fetchDelete,
    onSuccess: () => {
      message.success("🗑️ Product deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) =>
      message.error(err.message || "Error deleting product"),
  });

  // === HANDLERS ===
  const handleSearch = () => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleReload = () => {
    setKeyword("");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleViewDetail = (record: ProductType) => {
    setSelectedProduct(record);
    setIsModalDetailOpen(true);
  };

  const handleEdit = (record: ProductType) => {
    setEditingProduct(record);
    setFormValues(record);
    setIsModalFormOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Confirm deletion",
      content: "Are you sure you want to delete this product?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleSubmitForm = () => {
    if (!formValues.product_name || !formValues.price) {
      message.warning("⚠️ Please fill all required fields!");
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({
        id: editingProduct._id!,
        formData: formValues as ProductType,
      });
    } else {
      createMutation.mutate(formValues as ProductType);
    }
  };

  // === TABLE COLUMNS ===
  const columns = [
    {
      title: "Image",
      dataIndex: "thumbnail",
      key: "thumbnail",
      render: (url: string) =>
        url ? (
          <Image src={url} alt="thumbnail" width={50} />
        ) : (
          <Tag color="default">No Image</Tag>
        ),
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Category",
      dataIndex: ["category_id", "category_name"],
      key: "category_id",
      render: (name: string) => name || <Tag>No Category</Tag>,
    },
    {
      title: "Brand",
      dataIndex: ["brand_id", "brand_name"],
      key: "brand_id",
      render: (name: string) => name || <Tag>No Brand</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: ProductType) => (
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
      {/* HEADER */}
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
                Products Management
              </Title>
              <Typography.Text type="secondary">
                View and manage all products in the system
              </Typography.Text>
            </div>
          </Space>
        </Card>
        <Space>
          <Input
            placeholder="Search products..."
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
              setEditingProduct(null);
              setFormValues({});
              setIsModalFormOpen(true);
            }}
          >
            Add Product
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReload}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* TABLE */}
      <Table
        rowKey="_id"
        loading={isLoading}
        columns={columns}
        dataSource={products}
        pagination={false}
      />

      {/* PAGINATION */}
<div style={{ textAlign: "right", marginTop: 20 }}>
  <Pagination
    current={page}
    total={totalRecords}
    pageSize={limit}
    showSizeChanger={false}
    showQuickJumper   // ✅ Thêm dòng này để hiển thị ô nhập số trang
    onChange={(p) => {
      setPage(p);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }}
    showTotal={(total) => `Total ${total} products`}
  />
</div>

      {/* MODAL - DETAIL */}
      <Modal
        title={`Product Detail - ${selectedProduct?.product_name}`}
        open={isModalDetailOpen}
        onCancel={() => {
          setIsModalDetailOpen(false);
          setSelectedProduct(null);
        }}
        footer={<Button onClick={() => setIsModalDetailOpen(false)}>Close</Button>}
        width={700}
      >
        {selectedProduct && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Image
              src={selectedProduct.thumbnail}
              alt={selectedProduct.product_name}
              width={120}
            />
            <p>
              <b>Name:</b> {selectedProduct.product_name}
            </p>
            <p>
              <b>Price:</b> ${selectedProduct.price}
            </p>
            <p>
              <b>Stock:</b> {selectedProduct.stock}
            </p>
            <p>
              <b>Category:</b>{" "}
              {selectedProduct.category_id?.category_name || "No category"}
            </p>
            <p>
              <b>Brand:</b>{" "}
              {selectedProduct.brand_id?.brand_name || "No brand"}
            </p>
          </Space>
        )}
      </Modal>

      {/* MODAL - ADD/EDIT */}
      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
        open={isModalFormOpen}
        onCancel={() => {
          setIsModalFormOpen(false);
          setEditingProduct(null);
          setFormValues({});
        }}
        onOk={handleSubmitForm}
        confirmLoading={
          createMutation.isLoading || updateMutation.isLoading
        }
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            placeholder="Product name"
            value={formValues.product_name}
            onChange={(e) =>
              setFormValues({ ...formValues, product_name: e.target.value })
            }
          />
          <Input
            placeholder="Thumbnail URL"
            value={formValues.thumbnail}
            onChange={(e) =>
              setFormValues({ ...formValues, thumbnail: e.target.value })
            }
          />
          <Input
            placeholder="Price"
            type="number"
            value={formValues.price}
            onChange={(e) =>
              setFormValues({ ...formValues, price: Number(e.target.value) })
            }
          />
          <Input
            placeholder="Stock"
            type="number"
            value={formValues.stock}
            onChange={(e) =>
              setFormValues({ ...formValues, stock: Number(e.target.value) })
            }
          />
        </Space>
      </Modal>
    </>
  );
};

export default ProductsPage;
