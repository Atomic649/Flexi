import { getAxiosWithAuth } from "@/utils/axiosInstance";
import axios from "axios";
import { t } from "i18next";

class CallAPIAds {
  // Get Ads
  async getAdsAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth(); // Changed to authenticated request
      const response = await axiosInstance.get(`/ads/`);

    //  console.log("🚀AdsAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨 Get Ads API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
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
      product: number;
    }
  ): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth(); 
      const response = await axiosInstance.post(`/ads`, data); 
      
    //  console.log("🚀 Create AdsCost API Response:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("🚨 Create AdsCost API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  async getAdsCostById(id: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/ads/${id}`);

     // console.log("🚀 Get AdsCost By Id API Response:", response.data);
      
      return response.data;
    } catch (error) {
      console.error("🚨 Get AdsCost By Id API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  async updateAdsCostAPI(
    id: number,
    data: {
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
      const response = await axiosInstance.put(`/ads/update/${id}`, data);
   //   console.log("🚀 Update AdsCost API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨 Update AdsCost API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }
}

export default new CallAPIAds();
