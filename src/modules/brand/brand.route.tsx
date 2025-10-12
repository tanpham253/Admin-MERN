import { DatabaseOutlined } from "@ant-design/icons";
import type { RouteItem } from "../../routes";
// import BrandsPage from "./BrandPage";

export const routesBrands: RouteItem[] = [
  {
    path: "/brands",
    label: "Brands",
    key: "brands",
    icon: <DatabaseOutlined />,
    element: <BrandsPage />,
    isShowMenu: true,
    isPrivate: true,
    roles: ["admin", "staff"],
    permissions: ["brand.view"],
  },
];