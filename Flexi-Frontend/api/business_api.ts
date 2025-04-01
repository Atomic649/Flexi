import { getAxios } from "@/utils/axiosInstance";
import { getAxiosWithAuth } from "@/utils/axiosInstance";
import { checkNetwork } from "@/utils/utility";
import axios from "axios";

class CallAPIBusiness {
  // Register Member API
  async RegisterAPI(data: {
    businessName: string;
    vatId: string;
    businessType: string;
    taxType: string;
    userId: number;
    memberId: any;
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
        throw new Error("Network Error");
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
        throw new Error("Network Error");
      }
    }
  }
  // Create More Business Acc
  async CreateMoreBusinessAPI(data: {
    businessName: string;
    vatId: string;
    businessType: string;
    taxType: string;
    userId: number;
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
        throw new Error("Network Error");
      }
    }
  }

  // Update Business Avatar getAxiosWithAuth()
  async UpdateBusinessAvatarAPI(
    id: number,
    data: { businessAvatar: string }
  ): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.put(
        `/businessacc/avatar/${id}`,
        data
      );
      console.log("📝Update Business Avatar API:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Update Business Avatar API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
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
        throw new Error("Network Error");
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
        throw new Error("Network Error");
      }
    }
  }
}

export default new CallAPIBusiness();
