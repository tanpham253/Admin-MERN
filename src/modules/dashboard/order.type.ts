export interface CustomerType {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface StaffType {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface ProductInOrder {
  _id: string;
  product_name: string;
  price: number;
  discount: number;
  quantity: number;
}

export interface OrderType {
  _id: string;
  // order_id: number;
  order_date: string;
  require_date: string;
  shipping_date?: string;
  order_status: string;
  description?: string;
  street: string;
  city: string;
  payment_type: string;
  customer_id: CustomerType;
  staff_id: StaffType;
  order_details: ProductInOrder[];
}

export interface OrdersResponse {
  orders: OrderType[];
  limit: number;
  page: number;
  totalRecords: number;
}
