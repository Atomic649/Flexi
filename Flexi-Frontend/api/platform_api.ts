import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";

class CallAPIPlatform {
  // Get Platforms
  async getPlatformsAPI(memberId: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/platform/member/${memberId}`);

      console.log("🚀PlatformAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Platforms API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // Get a Platform
  async getAPIaPlatformAPI(id: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/platform/${id}`);
      return response.data;
    } catch (error) {
      console.error("🚨 Get Platform API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // Create a Platform
  async createPlatformAPI(data: {
    platform: string;
    accName: string;
    accId: string;   
    memberId: string;
  }): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post("/platform/", data);
      return response.data;
    } catch (error) {
      console.error("🚨 Create Platform API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
  // Update a Platform
  async updatePlatformAPI(
    id: number,
    data: {
      platform: string;
      accName: string;
      accId: string;
      memberId: string;
    }
  ): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.put(`/platform/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("🚨 Update Platform API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }

  // Delete a Platform
  async deletePlatformAPI(id: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/platform/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error("🚨 Delete Platform API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
}

export default new CallAPIPlatform();
