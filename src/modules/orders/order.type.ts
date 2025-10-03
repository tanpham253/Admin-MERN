export interface CustomerType {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface EmployeeType {
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
  order_id: number;
  order_date: string;
  required_date: string;
  shipped_date?: string;
  status: string;
  description?: string;
  shipping_address: string;
  shipping_city: string;
  payment_type: string;
  customer_id: CustomerType;
  employee_id: EmployeeType;
  order_details: ProductInOrder[];
}

export interface OrdersResponse {
  orders: OrderType[];
  limit: number;
  page: number;
  totalRecords: number;
}
