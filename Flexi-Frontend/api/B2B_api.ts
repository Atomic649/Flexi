import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { getMemberId } from "@/utils/utility";
import axios from "axios";
import { t } from "i18next";


export interface PagedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

const handleError = (error: unknown) => {
  console.error("🚨 B2B API Error:", error);
  if (axios.isAxiosError(error) && error.response) {
    throw error.response.data;
  }
  throw new Error(error instanceof Error ? error.message : t("common.networkError"));
};

class CallAPIB2B {
  private async fetchPage<T>(path: string, cursor?: string, limit = 1): Promise<PagedResponse<T>> {
    try {
      const memberId = await getMemberId();
      const viewerId = typeof memberId === "string" ? memberId : undefined;
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(path, {
        params: { cursor, limit, ...(viewerId ? { viewerId } : {}) },
      });
      console.log("🚀 B2B API Response:", response.data);
      return response.data;
    } catch (error) {
      handleError(error);
      return { items: [], nextCursor: null, hasMore: false };
    }
  }

  async getB2BOfficeDataAPI(cursor?: string, limit?: number) {
    return this.fetchPage(`/b2b/office`, cursor, limit);
  }

  async getB2BBankDataAPI(cursor?: string, limit?: number) {
    return this.fetchPage(`/B2B/bank`, cursor, limit);
  }

  async getB2BCoachDataAPI(cursor?: string, limit?: number) {
    return this.fetchPage(`/B2B/coach`, cursor, limit);
  }

  async getB2BAgencyDataAPI(cursor?: string, limit?: number) {
    return this.fetchPage(`/B2B/agency`, cursor, limit);
  }

  async getB2BAccountDataAPI(cursor?: string, limit?: number) {
    return this.fetchPage(`/B2B/account`, cursor, limit);
  }

  async getB2BOrmDataAPI(cursor?: string, limit?: number) {
    return this.fetchPage(`/B2B/orm`, cursor, limit);
  }

  // get B2B/Product Details by ID
  async getB2BProductDetailsByIdAPI(id: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/B2B/product/${id}`);

      console.log("🚀 B2B Product Details API:", response.data);

      return response.data;
    } catch (error: unknown) {
      handleError(error);
    }
  }
}
export default new CallAPIB2B();