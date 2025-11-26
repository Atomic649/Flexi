import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { t } from "i18next";

class CallAPIProduct {
  // Get Products
  async getProductsAPI(memberId: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/product/member/${memberId}`);

      console.log("🚀ProductAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Products API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get a Product
  async getAProductAPI(id: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/product/${id}`);
      return response.data;
    } catch (error) {
      console.error("🚨 Get Product API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Create Product
  async createProductAPI(formData: FormData): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post("/product/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("🚨 Create Product API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
    
  
  }

  // Update Product
  async updateProductAPI( id: number, data: FormData
  ): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.put(`/product/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("🚨 Update Product API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Delete Product
  async deleteProductAPI(id: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/product/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("🚨 Delete Product API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }
  // Get Product Choice
  async getProductChoiceAPI(memberId: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/product/choice/${memberId}`);
      return response.data;
    } catch (error) {
      console.error("🚨 Get Product Choice API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Product Choice with Price
  async getProductChoiceWithPriceAPI(memberId: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/product/choiceprice/${memberId}`);
      return response.data;
    } catch (error) {
      console.error("🚨 Get Product Choice with Price API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }
  
}
export default new CallAPIProduct();
