import apiClient from "../../libs/axiosClient";

export interface BrandType {
  _id: string;
  brand_name: string;
  description: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandResponse {
  brands: BrandType[];
  page: number;
  limit: number;
  totalRecords: number;
}

export const fetchBrands = async (): Promise<BrandType[]> => {
  // apiClient returns response.data already (see interceptor)
  const data: BrandResponse = await apiClient.get("/v1/brands");

  // Always return a defined value (never undefined)
  console.log("DEBUG brands raw response =>", data?.brands);
  return data?.brands;
};

export const fetchCreateBrand = async (formData: any) => {
  const response = await apiClient.post(`/v1/brands`, formData);
  return response.data;
};

export const fetchUpdateBrand = async (data: { id: string; formData: any }) => {
  const { id, formData } = data;
  const response = await apiClient.put(`/v1/brands/${id}`, formData);
  return response.data;
};

export const fetchDeleteBrand = async (id: string) => {
  const response = await apiClient.delete(`/v1/brands/${id}`);
  return response.data;
};