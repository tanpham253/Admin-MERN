import { DatabaseOutlined } from "@ant-design/icons";
import type { RouteItem } from "../../routes";
import CategoriesPage from "./CategoriesPage";
// import CategoriesPage from "./BrandPage";

export const routesCategories: RouteItem[] = [
  {
    path: "/categories",
    label: "Categories",
    key: "categories",
    icon: <DatabaseOutlined />,
    element: <CategoriesPage />,
    isShowMenu: true,
    isPrivate: true,
    roles: ["admin", "staff"],
    permissions: ["category.view"],
  },
];