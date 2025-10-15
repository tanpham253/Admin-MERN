import apiClient from "../../libs/axiosClient";
import type { BrandResponse, BrandType } from "./brand.type";

// === FETCH ALL with pagination & keyword
export const fetchBrands = async (
  page = 1,
  limit = 5,
  keyword = ""
): Promise<BrandResponse> => {
  try {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (keyword.trim()) params.append("keyword", keyword.trim());

    const response = await apiClient.get(`/v1/brands?${params.toString()}`);
    const data = response?.data ?? response;

    console.log("✅ DEBUG fetched brands =>", data);

    // Nếu backend trả mảng trực tiếp
    if (Array.isArray(data)) {
      const filtered = keyword
        ? data.filter((b: BrandType) =>
            b.brand_name.toLowerCase().includes(keyword.toLowerCase())
          )
        : data;

      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        brands: filtered.slice(start, end),
        page,
        limit,
        totalRecords: filtered.length,
      };
    }

    // Nếu backend trả object có dữ liệu phân trang sẵn
    return {
      brands: data?.brands ?? data?.data ?? [],
      page: data?.page ?? page,
      limit: data?.limit ?? limit,
      totalRecords:
        data?.totalRecords ??
        data?.total ??
        data?.data?.length ??
        data?.brands?.length ??
        0,
    };
  } catch (error) {
    console.error("❌ fetchBrands error:", error);
    return { brands: [], page, limit, totalRecords: 0 };
  }
};

// === CREATE brand
export const fetchCreateBrand = async (formData: BrandType) => {
  const response = await apiClient.post(`/v1/brands`, formData);
  return response.data;
};

// === UPDATE brand
export const fetchUpdateBrand = async (data: { id: string; formData: BrandType }) => {
  const { id, formData } = data;
  const response = await apiClient.put(`/v1/brands/${id}`, formData);
  return response.data;
};

// === DELETE brand
export const fetchDeleteBrand = async (id: string) => {
  const response = await apiClient.delete(`/v1/brands/${id}`);
  return response.data;
};
