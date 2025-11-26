import { getAxios } from "@/utils/axiosInstance";
import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { checkNetwork } from "@/utils/utility";
import axios from "axios";
import { t } from "i18next";

class CallAPIBusiness {
  // Register Member API
  async RegisterAPI(data: {
    businessName: string;
    taxId: string;
    businessType: string;
    taxType: string;
    userId: number;
    memberId: any;
    DocumentType?: ("Invoice" | "Receipt" | "Quotation" | "WithholdingTax")[];
  }): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const response = await getAxios().post("/businessacc/register", data);

      console.log("📝Business Register API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨Register API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // get business details with Auth
  async getBusinessDetailsAPI(memberId: string): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const response = await getAxios().get(`/businessacc/detail/${memberId}`);
      console.log("📝Business Details API:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Business Details API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }
  // Create More Business Acc
  async CreateMoreBusinessAPI(data: {
    businessName: string;
    taxId: string;
    businessType: string;
    taxType: string;
    userId: number;
    DocumentType?: ("Invoice" | "Receipt" | "Quotation" | "WithholdingTax")[];
  }): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(
        "/businessacc/AddMoreAcc",
        data
      );

      console.log("📝Business Register API:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨Register API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Update Business Avatar getAxiosWithAuth()
  async UpdateBusinessAvatarAPI(
    id: number,
    formdata: FormData
  ): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.put(
        `/businessacc/avatar/${id}`,
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure correct headers
          },
        }
      );
      console.log("📝Update Business Avatar API:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Update Business Avatar API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Update Business Details  
  async UpdateBusinessDetailsAPI(
    memberId: string,
    data: {
      businessName: string;
      businessUserName?: string;
      businessPhone?: string;
      businessAddress: string;
      taxId: string;
      businessType: string;
      taxType: string;
      vat: boolean;
      DocumentType?: ("Invoice" | "Receipt" | "Quotation" | "WithholdingTax")[];
    }
  ): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.put(
        `/businessacc/${memberId}`,
        data
      );
      console.log("📝Update Business Details API:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Update Business Details API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }


  // get business account choice
  async getBusinessAccountChoiceAPI(userId: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/businessacc/userId/${userId}`);
      console.log("📝Business Account Choice API:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Business Account Choice API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // get business Avatar by memberId
  async getBusinessAvatarAPI(memberId: string): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(
        `/businessacc/avatar/${memberId}`
      );
      // console.log("📝Business Avatar API:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Business Avatar API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }
}

export default new CallAPIBusiness();
