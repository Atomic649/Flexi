import { getAxios } from "@/utils/axiosInstance";
import { checkNetwork } from "@/utils/utility";
import axios from "axios";
import { getAxiosWithAuth } from '@/utils/axiosInstance';

class CallAPIMember {
  // Register Member API
  async createMemberAPI(data: {
    permission: string;
    role: string;
    userId: number;
  }) {
    if (!(await checkNetwork())) {
      return { error: "No internet connection" };
    }

    try {
      const response = await getAxios().post("/member/create", data);
      console.log("📝createMemberAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Create Member API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error("Network Error");
      }
    }
  }
}

export default new CallAPIMember();
