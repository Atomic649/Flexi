import { getAxios } from "@/utils/axiosInstance";
import { checkNetwork } from "@/utils/utility";
import axios from "axios";
import { getAxiosWithAuth } from '@/utils/axiosInstance';
import { t } from "i18next";

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
      //console.log("📝createMemberAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Create Member API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Delete member by uniqueId
  async softDeleteMemberAPI(uniqueId: string) {
    if (!(await checkNetwork())) {
      return { error: "No internet connection" };
    }
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.delete(`/member/soft/${uniqueId}`);
      //console.log("🗑️ softDeleteMemberAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Soft Delete Member API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get members by businessId
  async getMembersByBusinessIdAPI(businessId: number) {
    if (!(await checkNetwork())) {
      return { error: "No internet connection" };
    }
    try {
      const response = await getAxios().get(`/member/business/${businessId}`);
     // console.log("📝getMembersByBusinessIdAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Get Members By BusinessId API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Invite member by username
  async inviteMemberByUsernameAPI(data: { username: string; role: string; businessId: number; }) {
    if (!(await checkNetwork())) {
      return { error: "No internet connection" };
    }
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/member/invite`, data);
      //console.log("📝inviteMemberByUsernameAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Invite Member API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Accept invitation
  async acceptInvitationAPI(data: { uniqueId: string }) {
    if (!(await checkNetwork())) {
      return { error: "No internet connection" };
    }
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.post(`/member/accept`, data);
    //  console.log("📝acceptInvitationAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Accept Invitation API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get pending invitations for a user
  async getPendingInvitationsByUserAPI(userId: number) {
    if (!(await checkNetwork())) {
      return { error: "No internet connection" };
    }
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/member/pending/${userId}`);
     // console.log("📝getPendingInvitationsByUserAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Get Pending Invitations API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }
}

export default new CallAPIMember();
