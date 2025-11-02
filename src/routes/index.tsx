import type { ReactNode } from 'react';
import { routesDashboard } from '../modules/dashboard/dashboard.route';
import { routesAuth } from '../modules/auth/auth.route';
import { routesAdministrator } from '../modules/administrator/administrator.route';
import { routesProducts } from '../modules/products/product.route';
import { routesBrands } from '../modules/brand/brand.route';
import { routesOrders } from '../modules/orders/order.route';
import { routesCategories } from '../modules/categories/category.route';
import { routesCustomers } from "../modules/customer/customers.route";
import { routesRoles } from '../modules/roles/routesRoles';
import { routesDiscounts } from '../modules/discounts/routesDiscount';


export type RouteItem = {
  path?: string;
  label: string;
  layout?: () => React.JSX.Element | React.ReactNode;
  key: string;
  icon?: ReactNode;
  element?: React.ReactNode | null;
  children?: RouteItem[];
  isShowMenu: boolean; // Thêm thuộc tính này để xác định có hiển thị menu hay không
  isPrivate: boolean; // Thêm thuộc tính này để xác định có phải là route riêng tư hay không
  roles?: string[];
  permissions?: string[];
};

export const generatePath = (key: string) => {
  return key.split('-').join('/');
}

export const routes: RouteItem[] = [
  ...routesDashboard, //đăng ký route dashboard
  ...routesCustomers, 
  ...routesOrders,
  ...routesAuth,
  ...routesProducts,
  ...routesBrands,
  ...routesCategories,
  ...routesDiscounts,
  ...routesRoles,
  ...routesAdministrator,
];
