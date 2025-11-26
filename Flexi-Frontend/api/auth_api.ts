import { checkNetwork, getToken } from "@/utils/utility";
import { getAxios, getAxiosWithAuth } from "@/utils/axiosInstance";
import axios from "axios";
import { t } from "i18next";

class CallAPIUser {
  // Register API

  async registerAPI(data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    username?: string;
  }): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const response = await getAxios().post("/auth/register", data);

      console.log("📝registerAPI:", response.data);

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

  // Login API
  async loginAPI(data: { email: string; password: string }): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const response = await getAxios().post("/auth/login", data);

      console.log("🚀loginAPI:", response.data);

      return response.data;
    } catch (error) {
      console.error("🚨Login API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Session

  async getSessionAPI(): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const token = await getToken();
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/auth/session/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("🚀sessionAPI :", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Get Session API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  async updateUserAPI(data: any): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const token = await getToken();
      const axiosInstance = await getAxiosWithAuth();
      // Separate id from body to satisfy backend Joi ("id" is not allowed in body)
      const { id, ...body } = data || {};
      const response = await axiosInstance.put(
        `/auth/update/${id}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("🚨Update User API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }
  // Get User API by id
  async getUserAPI(id: number): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/user/profile/${id}`);

      console.log("🚀UserAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨 Get User API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Get Number of Registered Users
  async getRegisteredUsersAPI(): Promise<any> {
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get(`/user/users`);
      console.log("🚀RegisteredUsersAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨 Get Registered Users API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Delete User API
  async deleteUserAPI(memberId: string, data: { password: string }): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.delete(
        `/auth/permanently-delete/${memberId}`,
        {
          data: { password: data.password },
        }
      );
      console.log("🚀deleteUserAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Delete User API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Change Password API
  async changePasswordAPI(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const axiosInstance = await getAxiosWithAuth();
      // Get user ID from session
      const session = await this.getSessionAPI();
      if (!session || !session.session || !session.session.id) {
        throw new Error("User session not found");
      }
      
      // Add user ID to request data instead of in URL
      const requestData = {
        ...data,
        id: session.session.id
      };
      
      // Use POST method to match backend route
      const response = await axiosInstance.post(`/auth/change-password`, requestData);
      console.log("🚀changePasswordAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Change Password API Error:", error)
      
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Logout API
  async logoutAPI(): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const axiosInstance = await getAxiosWithAuth();
      const response = await axiosInstance.get("/auth/logout");
      console.log("🚀logoutAPI:", "signout");
      return response.data;
    } catch (error) {
      console.error("🚨Logout API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Facebook Login API
  async facebookLoginAPI(data: {
    facebookId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }): Promise<any> {
    if (!(await checkNetwork())) {
      return { error: { message: "No Network Connection" } };
    }
    try {
      const response = await getAxios().post("/auth/facebook-login", data);
      console.log("🚀facebookLoginAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Facebook Login API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        return { error: error.response.data };
      } else {
        return { error: { message: "Network Error" } };
      }
    }
  }

  // Forgot Password API
  async forgotPasswordAPI(data: { email: string }): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const response = await getAxios().post("/auth/forgot-password", data);
      console.log("🚀forgotPasswordAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Forgot Password API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // Reset Password API
  async resetPasswordAPI(data: { 
    token: string; 
    newPassword: string 
  }): Promise<any> {
    if (!(await checkNetwork())) {
      return { message: "No Network Connection" };
    }
    try {
      const response = await getAxios().post("/auth/reset-password", data);
      console.log("🚀resetPasswordAPI:", response.data);
      return response.data;
    } catch (error) {
      console.error("🚨Reset Password API Error:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw error.response.data;
      } else {
        throw new Error(t("common.networkError"));
      }
    }
  }

  // onAuthStateChange
  onAuthStateChange(_callback: (session: any) => void) {
    // Implement this method to listen to authentication state changes
  }
}

export default new CallAPIUser();
