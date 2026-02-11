import axios from "axios";
import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { t } from "i18next";

class CallAPICustomer {
  // Check if customer exists
  async checkCustomer(businessAcc: number, phone: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post("/customer/check", {
        businessAcc,
        phone,
      });
      return response.data;
    } catch (error) {
      console.error("🚨 Check Customer API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }
}

export default new CallAPICustomer();
