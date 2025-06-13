import { getAxiosWithAuth } from "@/utils/axiosInstance";
import axios from "axios";

class CallAPIAds {
  // Get Ads
  async getAdsAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth(); // Changed to authenticated request
      const response = await axiosInstance.get(`/ads/`);

      console.log("🚀AdsAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Ads API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
  
  // Create Ads Cost
  async createAdsCostAPI(data :
    {
      date: Date;
      memberId: string;
      adsCost: number;
      platformId: number;
      businessAcc: number;   
      product: string;
    }
  ): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth(); 
      const response = await axiosInstance.post(`/ads`, data); 
      
      console.log("🚀 Create AdsCost API Response:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("🚨 Create AdsCost API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
}

export default new CallAPIAds();
