import { lazy } from "react";
import type { RouteItem } from "../../routes"; // import kiểu RouteItem

const CustomerListPage = lazy(() => import("./pages/CustomerListPage"));

export const routesCustomers: RouteItem[] = [
  {
    key: "customers",
    path: "/customers",
    label: "Customers",
    element: <CustomerListPage />,
    icon: <i className="ri-team-line" />, 
    isShowMenu: true,
    isPrivate: true,
  },
];
