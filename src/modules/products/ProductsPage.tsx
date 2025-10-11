import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Pagination,
  Popconfirm,
  Select,
  Space,
  Table,
  Upload,
} from "antd";
import type { GetProp, TableProps, UploadFile, UploadProps } from "antd";

import {
  fetchBrands,
  fetchCategories,
  fetchCreate,
  fetchDelete,
  fetchProducts,
  updateData,
} from "./product.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ProductsResponse, ProductType } from "./product.type";
import { useNavigate, useSearchParams } from "react-router";
import { useAppMessage } from "../../stores/useAppMessage";
import { useState } from "react";
import ActionHasRoles from "../auth/components/ActionHasRoles";
import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const ProductsPage = () => {
  const navigate = useNavigate();
  const { sendMessage } = useAppMessage();
  const { Search } = Input;
  const queryClient = useQueryClient();
  /*----/ BEGIN  PRODUCT LIST  /-----*/
  const [params] = useSearchParams();
  const page = params.get("page");
  const limit = params.get("limit");
  const int_page = page ? parseInt(page) : 1;
  const int_limit = limit ? parseInt(limit) : 5;
  const keyword = params.get("keyword") || "";

  console.log("<<=== 🚀 int_page ===>>", int_page, int_limit);

  // 🔍 Search state
  const [searchKeyword, setSearchKeyword] = useState(keyword);

  // 🧭 Helper to update URL params
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

  //  const queryProducts = useQuery<ProductsResponse, Error>({
  //   queryKey: ['products', int_page, int_limit ],
  //   queryFn: ()=>fetchProducts(int_page, int_limit)
  //  })
  // ✅ Fetch product list with keyword support
  const queryProducts = useQuery<ProductsResponse, Error>({
    queryKey: ["products", page, limit, keyword],
    queryFn: () => fetchProducts(int_page, int_limit, keyword),
    placeholderData: (previousData) => previousData, // ✅ replaces keepPreviousData
  });

  console.log("<<=== 🚀 queryProducts.data ===>>", queryProducts.data);

  /*----/ END  PRODUCT LIST  /-----*/

  /*----/  BEGIN DELETE PRODUCT  /-----*/
  const deleteQuery = useMutation({
    mutationFn: fetchDelete,
    onError: (error) => {
      //Khi xu  ly thanh cong thi can lam gi
      console.log("error", error);
      sendMessage({ msg: "Delete error", type: "error" });
    },
    onSuccess: () => {
      //Khi xu  ly thanh cong thi can lam gi
      sendMessage({ msg: "Delete success", type: "success" });
      console.log("success");
      //Làm tươi lại danh sách
      queryClient.invalidateQueries({
        queryKey: ["products", int_page, int_limit],
      });
    },
  });
  /*----/  END DELETE PRODUCT  /-----*/
  /*----/  BEGIN ADD PRODUCT  /-----*/

  const queryCategories = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
  });
  console.log("<<=== 🚀 queryCategories.data ===>>", queryCategories.data);
  const queryBrands = useQuery({
    queryKey: ["brands"],
    queryFn: () => fetchBrands(),
  });

  console.log("<<=== 🚀 queryBrands.data ===>>", queryBrands.data);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [formAdd] = Form.useForm();
  const handleModalAddOk = () => {
    //Khi nhấn nút OK tren modal thì submit Form bên trong
    formAdd.submit();
  };

  const mutationAddProduct = useMutation({
    mutationFn: fetchCreate,
    onError: () => {
      sendMessage({ msg: "Add error", type: "error" });
    },
    onSuccess: () => {
      sendMessage({ msg: "Add success", type: "success" });
      //tắt modal
      setIsModalAddOpen(false);
      //Làm tươi danh sách
      queryClient.invalidateQueries({
        queryKey: ["products", int_page, int_limit],
      });
      //reset form về rỗng lại
      formAdd.resetFields();
    },
  });

  const handleModalAddCancel = () => {
    setIsModalAddOpen(false);
  };
  const onFinishAdd = async (values: any) => {
    console.log("<<=== 🚀 values ===>>", values);
    if (fileList.length === 0) {
      message.error("Vui lòng chọn file trước khi tải lên.");
      return;
    }

    const formData = new FormData();
    // Lặp qua tất cả các trường trong values và thêm chúng vào formData
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value instanceof Blob ? value : String(value));
    });

    fileList.forEach((file) => {
      formData.append("file", file as FileType);
    });

    console.log(formData);

    await mutationAddProduct.mutateAsync(formData);
  };

  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([file]); // Chỉ chọn một file, nếu cần nhiều file thì sử dụng `setFileList([...fileList, file])`
      return false; // Tắt upload tự động
    },
    fileList,
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  const mutationUpdateProduct = useMutation({
    mutationFn: updateData,
    onError: () => {
      sendMessage({ msg: "Update error", type: "error" });
    },
    onSuccess: () => {
      sendMessage({ msg: "Update success", type: "success" });
      //tắt modal
      setIsModalEditOpen(false);
      //Làm tươi danh sách
      queryClient.invalidateQueries({
        queryKey: ["products", int_page, int_limit],
      });
    },
  });

  /*----/  END ADD PRODUCT  /-----*/

  /*----/  BEGIN EDIT PRODUCT  /-----*/
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [formEdit] = Form.useForm();
  const handleModalEditOk = () => {
    formEdit.submit();
  };

  const handleModalEditCancel = () => {
    setIsModalEditOpen(false);
  };
  const onFinishEdit = async (values: ProductType) => {
    console.log("<<=== 🚀 values ===>>", values);
    await mutationUpdateProduct.mutateAsync({
      id: formEdit.getFieldValue("_id"),
      formData: values,
    });
  };
  const onFinishEditFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  /*----/  END EDIT PRODUCT  /-----*/

  const columns: TableProps<ProductType>["columns"] = [
    {
      title: "Thumbnail",
      key: "thumbnail",
      dataIndex: "thumbnail",
      render: (_, record) => {
        let thumbnailUrl = record.thumbnail;
        console.log("<<=== 🚀 thumbnailUrl ===>>", thumbnailUrl);
        // detect if backend prefix is followed by another https:// URL
        if (thumbnailUrl.startsWith("http://localhost:9000/https://")) {
          thumbnailUrl = thumbnailUrl.replace("http://localhost:9000/", "");
        }
        return (
          <img
            height={40}
            width={40}
            src={thumbnailUrl}
            alt={record.product_name}
          />
        );
      },
    },
    {
      title: "Name",
      dataIndex: "product_name",
      key: "product_name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => {
        const discountedPrice =
          record.price * (1 - (record.discount || 0) / 100);
        return (
          <div>
            <span style={{ fontWeight: 600, color: "#1890ff" }}>
              ${discountedPrice.toFixed(2)}
            </span>
            {record.discount > 0 && (
              <span
                style={{
                  textDecoration: "line-through",
                  color: "#999",
                  marginLeft: 8,
                  fontSize: 13,
                }}
              >
                ${record.price.toFixed(2)}
              </span>
            )}
            {record.discount > 0 && (
              <span
                style={{
                  color: "red",
                  marginLeft: 6,
                  fontSize: 13,
                }}
              >
                (-{record.discount}%)
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              console.log(record._id);
              setIsModalEditOpen(true);
              //Đổ dữ liệu vào form
              formEdit.setFieldsValue({
                ...record,
                category_id: record.category_id._id,
                brand_id: record.brand_id._id,
              });
            }}
          >
            Edit
          </Button>
          {/* Them phan quyen Action Xoa */}
          <ActionHasRoles requiredRoles={["admin"]}>
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this task?"
              onConfirm={async () => {
                console.log(record._id);
                await deleteQuery.mutateAsync(record._id);
              }}
              onCancel={() => {
                console.log("Huy");
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button color="danger" variant="outlined">
                Delete
              </Button>
            </Popconfirm>
          </ActionHasRoles>
        </Space>
      ),
    },
  ];

  console.log("<<=== 🚀 fileList ===>>", fileList);

  return (
    <>
      <Flex justify="space-between" align="center">
        <h1>Product List</h1>
        <Search
          placeholder="Search by product name..."
          allowClear
          enterButton={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onSearch={(value) => updateSearchParams({ page: 1, keyword: value })}
        />
        <Button onClick={() => setIsModalAddOpen(true)} type="primary">
          Thêm Product
        </Button>
      </Flex>
      <Table<ProductType>
        key="_id"
        loading={queryProducts.isLoading}
        columns={columns}
        dataSource={queryProducts.data?.products || []}
        pagination={{
          current: queryProducts.data?.page || 1,
          pageSize: 5, // ✅ Always 5 per page
          total: queryProducts.data?.totalRecords || 0,
          showSizeChanger: false, // ✅ Hide size selector
          onChange: (page) => {
            updateSearchParams({ page }); // ✅ only updates page
          },
        }}
      />
      {/* MODAL THEM MOI */}
      <Modal
        title="Basic Modal"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalAddOpen}
        onOk={handleModalAddOk}
        onCancel={handleModalAddCancel}
      >
        <div
          style={{
            maxHeight: 350,
            overflowY: "auto",
          }}
        >
          <Form
            name="formAdd"
            form={formAdd}
            layout="vertical"
            onFinish={onFinishAdd}
            onFinishFailed={onFinishFailed}
            initialValues={{}}
          >
            <Form.Item
              label="Product Name"
              name="product_name"
              rules={[
                { required: true, message: "Please input the product name!" },
                {
                  min: 3,
                  message: "Product name must be at least 3 characters!",
                },
                {
                  max: 255,
                  message: "Product name cannot exceed 255 characters!",
                },
              ]}
            >
              <Input placeholder="Enter product name" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  max: 500,
                  message: "Description cannot exceed 500 characters!",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter product description"
              />
            </Form.Item>

            <Form.Item
              label="Price"
              name="price"
              rules={[
                { required: true, message: "Please input the price!" },
                {
                  type: "number",
                  min: 0,
                  message: "Price cannot be negative!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter price"
                min={0}
              />
            </Form.Item>

            <Form.Item
              label="Discount (%)"
              name="discount"
              rules={[
                { required: true, message: "Please input the discount!" },
                {
                  type: "number",
                  min: 0,
                  message: "Discount cannot be negative!",
                },
                {
                  type: "number",
                  max: 70,
                  message: "Discount cannot exceed 70%!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter discount percentage"
                min={0}
                max={70}
              />
            </Form.Item>

            <Form.Item
              label="Stock"
              name="stock"
              rules={[
                { required: true, message: "Please input the stock quantity!" },
                {
                  type: "number",
                  min: 0,
                  message: "Stock cannot be negative!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter stock quantity"
                min={0}
              />
            </Form.Item>

            <Form.Item
              label="Model Year"
              name="model_year"
              rules={[
                { required: true, message: "Please input the model year!" },
                {
                  type: "number",
                  min: 1900,
                  message: "Year cannot be earlier than 1900!",
                },
                {
                  type: "number",
                  max: new Date().getFullYear(),
                  message: `Year cannot be later than ${new Date().getFullYear()}!`,
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter model year"
                min={1900}
                max={new Date().getFullYear()}
              />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category_id"
              rules={[
                { required: false, message: "Please select a category!" },
              ]}
            >
              <Select
                options={
                  queryCategories.data &&
                  queryCategories.data.map((c) => {
                    return {
                      value: c._id,
                      label: c.category_name,
                    };
                  })
                }
              />
            </Form.Item>

            <Form.Item
              label="Brand"
              name="brand_id"
              rules={[{ required: false, message: "Please select a brand!" }]}
            >
              <Select
                options={
                  queryBrands.data &&
                  queryBrands.data.map((b: { _id: any; brand_name: any }) => {
                    return {
                      value: b._id,
                      label: b.brand_name,
                    };
                  })
                }
              />
            </Form.Item>

            <Form.Item
              label="Slug"
              name="slug"
              rules={[
                { required: true, message: "Please input the slug!" },
                { min: 3, message: "Slug must be at least 3 characters!" },
                { max: 255, message: "Slug cannot exceed 255 characters!" },
              ]}
            >
              <Input placeholder="Enter product slug" />
            </Form.Item>

            <Form.Item
              label="Thumbnail URL"
              name="thumbnail"
              // rules={[
              //   { max: 255, message: 'Thumbnail URL cannot exceed 255 characters!' },
              // ]}
            >
              {/* <Input placeholder="Enter thumbnail URL" /> */}
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Select Thumbnail</Button>
              </Upload>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* MODAL UPDATE */}
      <Modal
        title="Update Product"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalEditOpen}
        onOk={handleModalEditOk}
        onCancel={handleModalEditCancel}
      >
        <div
          style={{
            maxHeight: 350,
            overflowY: "auto",
          }}
        >
          <Form
            name="formEdit"
            form={formEdit}
            layout="vertical"
            onFinish={onFinishEdit}
            onFinishFailed={onFinishEditFailed}
          >
            <Form.Item
              label="Product Name"
              name="product_name"
              rules={[
                { required: true, message: "Please input the product name!" },
                {
                  min: 3,
                  message: "Product name must be at least 3 characters!",
                },
                {
                  max: 255,
                  message: "Product name cannot exceed 255 characters!",
                },
              ]}
            >
              <Input placeholder="Enter product name" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  max: 500,
                  message: "Description cannot exceed 500 characters!",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter product description"
              />
            </Form.Item>

            <Form.Item
              label="Price"
              name="price"
              rules={[
                { required: true, message: "Please input the price!" },
                {
                  type: "number",
                  min: 0,
                  message: "Price cannot be negative!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter price"
                min={0}
              />
            </Form.Item>

            <Form.Item
              label="Discount (%)"
              name="discount"
              rules={[
                { required: true, message: "Please input the discount!" },
                {
                  type: "number",
                  min: 0,
                  message: "Discount cannot be negative!",
                },
                {
                  type: "number",
                  max: 70,
                  message: "Discount cannot exceed 70%!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter discount percentage"
                min={0}
                max={70}
              />
            </Form.Item>

            <Form.Item
              label="Stock"
              name="stock"
              rules={[
                { required: true, message: "Please input the stock quantity!" },
                {
                  type: "number",
                  min: 0,
                  message: "Stock cannot be negative!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter stock quantity"
                min={0}
              />
            </Form.Item>

            <Form.Item
              label="Model Year"
              name="model_year"
              rules={[
                { required: true, message: "Please input the model year!" },
                {
                  type: "number",
                  min: 1900,
                  message: "Year cannot be earlier than 1900!",
                },
                {
                  type: "number",
                  max: new Date().getFullYear(),
                  message: `Year cannot be later than ${new Date().getFullYear()}!`,
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Enter model year"
                min={1900}
                max={new Date().getFullYear()}
              />
            </Form.Item>

            <Form.Item
              label="Category"
              name="category_id"
              rules={[
                { required: false, message: "Please select a category!" },
              ]}
            >
              <Select
                options={
                  queryCategories.data &&
                  queryCategories.data.map((c) => {
                    return {
                      value: c._id,
                      label: c.category_name,
                    };
                  })
                }
              />
            </Form.Item>

            <Form.Item
              label="Brand"
              name="brand_id"
              rules={[{ required: false, message: "Please select a brand!" }]}
            >
              <Select
                options={
                  queryBrands.data &&
                  queryBrands.data.map((b: { _id: any; brand_name: any }) => {
                    return {
                      value: b._id,
                      label: b.brand_name,
                    };
                  })
                }
              />
            </Form.Item>

            <Form.Item
              label="Slug"
              name="slug"
              rules={[
                { required: true, message: "Please input the slug!" },
                { min: 3, message: "Slug must be at least 3 characters!" },
                { max: 255, message: "Slug cannot exceed 255 characters!" },
              ]}
            >
              <Input placeholder="Enter product slug" />
            </Form.Item>

            <Form.Item
              label="Thumbnail URL"
              name="thumbnail"
              rules={[
                {
                  max: 255,
                  message: "Thumbnail URL cannot exceed 255 characters!",
                },
              ]}
            >
              <Input placeholder="Enter thumbnail URL" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default ProductsPage;
