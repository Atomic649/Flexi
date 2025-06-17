import { getAxiosWithAuth } from "@/utils/axiosInstance";
import axios from "axios";
import Bank from '../components/shop/bank';


class CallAPIB2B {
  // Get B2B/office Data
  async getB2BOfficeDataAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/b2b/office`);

      console.log("🚀 B2B Data API:", response.data);

      return response.data;
    } catch (error: unknown) {
      console.error("🚨 Get B2B Data API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(error instanceof Error ? error.message : "Network Error");
      }
    }
  }

  // Get B2B/Bank Data
  async getB2BBankDataAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/B2B/bank`);

      console.log("🚀 B2B Bank Data API:", response.data);

      return response.data;
    } catch (error: unknown) {
      console.error("🚨 Get B2B Bank Data API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(error instanceof Error ? error.message : "Network Error");
      }
    }
  }
// get B2B/Coach Data
  async getB2BCoachDataAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/B2B/coach`);

      console.log("🚀 B2B Coach Data API:", response.data);

      return response.data;
    } catch (error: unknown) {
      console.error("🚨 Get B2B Coach Data API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(error instanceof Error ? error.message : "Network Error");
      }
    }
  }

  // get B2B/Agency Data
  async getB2BAgencyDataAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/B2B/agency`);

      console.log("🚀 B2B Agency Data API:", response.data);

      return response.data;
    } catch (error: unknown) {
      console.error("🚨 Get B2B Agency Data API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(error instanceof Error ? error.message : "Network Error");
      }
    }
  }

  // get B2B/Account Data
  async getB2BAccountDataAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/B2B/account`);

      console.log("🚀 B2B Account Data API:", response.data);

      return response.data;
    } catch (error: unknown) {
      console.error("🚨 Get B2B Account Data API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(error instanceof Error ? error.message : "Network Error");
      }
    }
  }

  // get B2B/Orm Data
  async getB2BOrmDataAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/B2B/orm`);

      console.log("🚀 B2B Orm Data API:", response.data);

      return response.data;
    } catch (error: unknown) {
      console.error("🚨 Get B2B Orm Data API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(error instanceof Error ? error.message : "Network Error");
      }
    }
  }
}
export default new CallAPIB2B();