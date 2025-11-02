import apiClient from "../../libs/axiosClient";
import type { RoleType, RoleResponse } from "./role.type";

// === FETCH ALL with pagination & keyword
export const fetchRoles = async (
  page = 1,
  limit = 5,
  keyword = ""
): Promise<RoleResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (keyword.trim()) params.append("keyword", keyword.trim());

    const response = await apiClient.get(`/v1/roles?${params.toString()}`);
    const data = response?.data ?? response;

    console.log("✅ DEBUG fetched roles =>", data);

    // Backend trả mảng trực tiếp
    if (Array.isArray(data)) {
      const filtered = keyword
        ? data.filter((r: RoleType) =>
            r.name.toLowerCase().includes(keyword.toLowerCase())
          )
        : data;

      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        roles: filtered.slice(start, end),
        page,
        limit,
        totalRecords: filtered.length,
      };
    }

    // Backend trả object có phân trang
    return {
      roles: data?.roles ?? data?.data ?? [],
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      totalRecords:
        data?.totalRecords ??
        data?.total ??
        data?.data?.length ??
        data?.roles?.length ??
        0,
    };
  } catch (error) {
    console.error("❌ fetchRoles error:", error);
    return { roles: [], page, limit, totalRecords: 0 };
  }
};

// === CREATE role
export const fetchCreateRole = async (formData: RoleType) => {
  const response = await apiClient.post(`/v1/roles`, formData);
  return response.data;
};

// === UPDATE role
export const fetchUpdateRole = async (data: { id: string; formData: RoleType }) => {
  const { id, formData } = data;
  const response = await apiClient.put(`/v1/roles/${id}`, formData);
  return response.data;
};

// === DELETE role
export const fetchDeleteRole = async (id: string) => {
  const response = await apiClient.delete(`/v1/roles/${id}`);
  return response.data;
};
