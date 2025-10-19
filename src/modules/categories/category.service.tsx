import apiClient from "../../libs/axiosClient";
import type { CategoriesResponse, CategoryType } from "./category.type";

// === FETCH ALL with pagination & keyword ===
export const fetchCategories = async (
  page = 1,
  limit = 5,
  keyword = ""
): Promise<CategoriesResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (keyword.trim()) params.append("keyword", keyword.trim());

    const response = await apiClient.get(`/v1/categories?${params.toString()}`);
    const data = response?.data ?? response;

    console.log("✅ DEBUG fetched categories =>", data);

    // Nếu backend trả về mảng trực tiếp
    if (Array.isArray(data)) {
      const filtered = keyword
        ? data.filter((c: CategoryType) =>
            c.category_name.toLowerCase().includes(keyword.toLowerCase())
          )
        : data;

      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        categories: filtered.slice(start, end),
        page,
        limit,
        totalRecords: filtered.length,
      };
    }

    // Nếu backend trả object có dữ liệu phân trang sẵn
    return {
      categories: data?.categories ?? data?.data ?? [],
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      totalRecords:
        data?.totalRecords ??
        data?.total ??
        data?.data?.length ??
        data?.categories?.length ??
        0,
    };
  } catch (error) {
    console.error("❌ fetchCategories error:", error);
    return { categories: [], page, limit, totalRecords: 0 };
  }
};

// === CREATE ===
export const fetchCreateCategory = async (formData: CategoryType) => {
  const response = await apiClient.post(`/v1/categories`, formData);
  return response.data;
};

// === UPDATE ===
export const fetchUpdateCategory = async (data: { id: string; formData: CategoryType }) => {
  const { id, formData } = data;
  const response = await apiClient.put(`/v1/categories/${id}`, formData);
  return response.data;
};

// === DELETE ===
export const fetchDeleteCategory = async (id: string) => {
  const response = await apiClient.delete(`/v1/categories/${id}`);
  return response.data;
};
