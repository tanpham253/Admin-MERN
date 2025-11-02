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
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchDiscounts,
  fetchCreateDiscount,
  fetchUpdateDiscount,
  fetchDeleteDiscount,
} from "./discount.service";
import type { DiscountType } from "./discount.type";

export default function DiscountPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<DiscountType | null>(null);
  const [formData, setFormData] = useState<DiscountType>({
    code: "",
    name: "",
    discountPercent: 0,
    description: "",
    isActive: true,
  });

  // === FETCH DATA
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["discounts", page, keyword],
    queryFn: () => fetchDiscounts(page, limit, keyword),
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: fetchCreateDiscount,
    onSuccess: () => {
      message.success("Tạo mã giảm giá thành công!");
      setOpenModal(false);
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiscountType }) =>
      fetchUpdateDiscount(id, data),
    onSuccess: () => {
      message.success("Cập nhật mã giảm giá thành công!");
      setOpenModal(false);
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: fetchDeleteDiscount,
    onSuccess: () => {
      message.success("Xóa thành công!");
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });

  const handleSubmit = () => {
    if (editData?._id) {
      updateMutation.mutate({ id: editData._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa mã giảm giá này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const handleEdit = (record: DiscountType) => {
    setEditData(record);
    setFormData(record);
    setOpenModal(true);
  };

  const columns = [
    {
      title: "Mã code",
      dataIndex: "code",
      key: "code",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Tên giảm giá",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giảm (%)",
      dataIndex: "discountPercent",
      key: "discountPercent",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) =>
        active ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: DiscountType) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id!)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Flex vertical gap="middle">
      <Flex justify="space-between" align="center">
        <Input
          placeholder="Tìm kiếm..."
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={() => refetch()}
        />
        <Space>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditData(null);
              setFormData({
                code: "",
                name: "",
                discountPercent: 0,
                description: "",
                isActive: true,
              });
              setOpenModal(true);
            }}
          >
            Thêm mới
          </Button>
        </Space>
      </Flex>

      <Table
        loading={isFetching}
        rowKey="_id"
        columns={columns}
        dataSource={data?.discounts || []}
        pagination={false}
      />

      <Pagination
        current={page}
        total={data?.totalRecords || 0}
        pageSize={limit}
        onChange={(p) => setPage(p)}
      />

      <Modal
        title={editData ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá"}
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={handleSubmit}
        okText={editData ? "Cập nhật" : "Tạo mới"}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Code">
            <Input
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
            />
          </Descriptions.Item>
          <Descriptions.Item label="Tên">
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </Descriptions.Item>
          <Descriptions.Item label="Mô tả">
            <Input.TextArea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </Descriptions.Item>
          <Descriptions.Item label="Phần trăm giảm">
            <Input
              type="number"
              min={0}
              max={100}
              value={formData.discountPercent}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountPercent: Number(e.target.value),
                })
              }
            />
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </Flex>
  );
}
