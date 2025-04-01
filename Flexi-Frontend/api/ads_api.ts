import { getAxios } from "@/utils/axiosInstance";
import axios from "axios";

class CallAPIAds {
  // Get Ads
  async getAdsAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxios();
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
}

export default new CallAPIAds();
