import { getAxiosWithAuth } from "@/utils/axiosInstance";
import axios from "axios";


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
}
export default new CallAPIB2B();